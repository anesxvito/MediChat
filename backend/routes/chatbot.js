const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const { auth, requireRole } = require('../middleware/auth');
const { prisma } = require('../config/database');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|dicom|dcm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and DICOM files are allowed'));
    }
  }
});

// Start or continue conversation
router.post('/chat', auth, requireRole('patient'), async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const patientId = req.user.id;

    let conversation;
    let messages = [];

    // Check if this is a new or existing conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          patientId: patientId
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      messages = conversation.messages;
    } else {
      // Create new conversation
      const previousConversations = await prisma.conversation.count({
        where: { patientId }
      });
      const visitNumber = previousConversations + 1;

      conversation = await prisma.conversation.create({
        data: {
          patientId,
          visitNumber,
          status: 'in_progress'
        },
        include: {
          messages: true
        }
      });
    }

    // Add user message to conversation
    const newUserMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    });
    messages.push(newUserMessage);

    // Get previous conversation for context (if return visit)
    let previousConversation = null;
    if (conversation.visitNumber > 1) {
      previousConversation = await prisma.conversation.findFirst({
        where: {
          patientId,
          visitNumber: conversation.visitNumber - 1
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Prepare context for Gemini AI
    const isFirstVisit = conversation.visitNumber === 1;
    const systemPrompt = generateSystemPrompt(isFirstVisit, conversation, previousConversation);

    // Get AI response with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt
    });

    const chatHistory = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory.slice(0, -1), // Exclude the last message we just added
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Send only the user message, not the system prompt
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // Add AI response to conversation
    const newAiMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse
      }
    });
    messages.push(newAiMessage);

    // Count user messages (patient responses) - this represents actual Q&A exchanges
    const userMessageCount = messages.filter(m => m.role === 'user').length;

    // Determine if conversation should end based on QUESTION COUNT, not total messages
    const requiredQuestions = conversation.visitNumber === 1 ? 10 : 7; // First visit: 10 questions, Return: 7 questions

    // Only end if:
    // 1. Enough questions have been asked AND
    // 2. AI explicitly signals completion in its response
    const hasEnoughQuestions = userMessageCount >= requiredQuestions;
    const aiSignalsCompletion =
      aiResponse.toLowerCase().includes('i have gathered all the information') ||
      aiResponse.toLowerCase().includes('the doctor will now review') ||
      aiResponse.toLowerCase().includes('i will now forward this information') ||
      aiResponse.toLowerCase().includes('thank you for providing all this information');

    if (hasEnoughQuestions && aiSignalsCompletion && conversation.status === 'in_progress') {
      // Generate AI summary for the doctor
      let aiSummary = '';
      try {
        const summaryPrompt = `You are a medical AI assistant. Analyze the following conversation between a patient and an AI chatbot, and provide a professional medical summary for the doctor.

CONVERSATION:
${messages.map(m => `${m.role === 'user' ? 'Patient' : 'AI'}: ${m.content}`).join('\n\n')}

Please provide a concise medical summary in the following format:

**Chief Complaint:**
[Main reason for visit]

**History of Present Illness:**
[Detailed description of symptoms including onset, duration, severity, location, quality, aggravating/relieving factors]

**Associated Symptoms:**
[Any additional symptoms mentioned]

**Past Medical History:**
[Any relevant past conditions, medications, or treatments mentioned]

**Patient's Concerns:**
[Key concerns expressed by the patient]

**Files Uploaded:**
[List any medical documents or images the patient mentioned uploading]

Be professional, concise, and medically accurate. Focus on clinically relevant information.`;

        const summaryModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp"
        });

        const summaryResult = await summaryModel.generateContent(summaryPrompt);
        aiSummary = summaryResult.response.text();
      } catch (summaryError) {
        console.error('Error generating AI summary:', summaryError);
        aiSummary = 'Summary generation failed. Please review the conversation history.';
      }

      // Update conversation status
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: 'awaiting_doctor',
          conversationEndedAt: new Date(),
          aiSummary
        }
      });

      conversation.status = 'awaiting_doctor';
    }

    res.json({
      response: aiResponse,
      conversationId: conversation.id,
      status: conversation.status,
      visitNumber: conversation.visitNumber
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Upload medical files
router.post('/upload', auth, requireRole('patient'), upload.single('file'), async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        patientId: req.user.id
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await prisma.attachment.create({
      data: {
        conversationId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSizeBytes: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id
      }
    });

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get patient's conversation history
router.get('/history', auth, requireRole('patient'), async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { patientId: req.user.id },
      select: {
        id: true,
        visitNumber: true,
        status: true,
        aiSummary: true,
        createdAt: true,
        updatedAt: true,
        conversationEndedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ conversations });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get specific conversation
router.get('/conversation/:id', auth, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        patientId: req.user.id
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        symptoms: true,
        prescriptions: true,
        attachments: true
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Helper function to generate system prompt
function generateSystemPrompt(isFirstVisit, conversation, previousConversation) {
  if (isFirstVisit) {
    return `You are Dr. MediChat, a highly professional and empathetic AI medical assistant helping patients provide detailed information about their health concerns before their consultation with a physician.

COMMUNICATION STYLE:
- Be warm, professional, and reassuring
- Use complete, well-structured sentences
- Show genuine concern and empathy
- Validate the patient's concerns
- Use medical terminology when appropriate, but explain it clearly
- Be conversational but maintain professionalism

FILE UPLOAD CAPABILITY:
- Patients CAN upload medical documents (X-rays, RTG scans, lab reports, DICOM files, PDFs, images)
- When a patient mentions they have scans, test results, or medical documents, ALWAYS encourage them to upload
- Say something like: "That's very helpful that you have those scans! Please use the upload button (📤) at the bottom of the chat to share your RTG scan with me. This will help the doctor review it along with your symptoms."
- NEVER say "I cannot view images" or refuse documents
- Files they upload will be reviewed by the doctor along with the conversation

QUESTIONING STRATEGY:
1. Start with an empathetic acknowledgment of their concern
2. Ask detailed, focused questions about the PRIMARY symptom mentioned
3. For EACH symptom, systematically gather:
   - Exact location and if it radiates anywhere
   - Severity on a scale of 1-10, with context (1=barely noticeable, 10=worst imaginable)
   - Duration (when it started, is it constant or intermittent)
   - Quality/character (sharp, dull, throbbing, burning, etc.)
   - Aggravating factors (what makes it worse)
   - Relieving factors (what makes it better)
   - Associated symptoms (anything else happening at the same time)
   - Previous occurrences (has this happened before)
   - Impact on daily activities (can you work, sleep, eat normally?)

4. DO NOT ask about unrelated body systems unless the patient mentions them
5. Ask ONE detailed question at a time
6. After 10 patient responses, provide a thoughtful summary and say: "Thank you for providing all this information. I have gathered all the information needed. The doctor will now review your case and respond shortly."

EXAMPLE RESPONSES:
- "Thank you for sharing that with me. I can understand how concerning a severe headache can be. To help the doctor provide you with the best care, could you tell me exactly where in your head you're feeling this pain? For example, is it on one side, both sides, behind your eyes, or at the back of your head?"
- "I appreciate you providing that information. On a scale of 1 to 10, where 1 is barely noticeable and 10 is the worst pain you can imagine, how would you rate this headache?"
- "That sounds quite uncomfortable. Has anything you've tried—like rest, medication, or changing your position—helped reduce the pain at all?"

IMPORTANT:
- Continue asking detailed follow-up questions until you have received 10 patient responses
- Do NOT end the conversation early
- Only after 10 responses, provide your closing statement with "I have gathered all the information needed"
- Count each patient answer as one response

Your goal is to gather comprehensive, clinically relevant information while making the patient feel heard and cared for.`;
  } else {
    // Build context from previous visit
    let previousContext = '';

    if (previousConversation && previousConversation.messages) {
      // Get the FIRST user message which contains the chief complaint
      const firstUserMessage = previousConversation.messages.find(m => m.role === 'user');
      const chiefComplaint = firstUserMessage ? firstUserMessage.content : 'unknown symptoms';

      previousContext += `\n\n========================================\n`;
      previousContext += `PREVIOUS VISIT INFORMATION (CRITICAL - READ CAREFULLY):\n`;
      previousContext += `========================================\n`;
      previousContext += `Visit Date: ${new Date(previousConversation.createdAt).toLocaleDateString()}\n\n`;

      previousContext += `PATIENT'S CHIEF COMPLAINT LAST TIME:\n`;
      previousContext += `"${chiefComplaint}"\n\n`;

      if (previousConversation.diagnosis || previousConversation.recommendations) {
        previousContext += `DOCTOR'S ASSESSMENT:\n`;
        if (previousConversation.diagnosis) previousContext += `Diagnosis: ${previousConversation.diagnosis}\n`;
        if (previousConversation.recommendations) previousContext += `Recommendations: ${previousConversation.recommendations}\n`;
        if (previousConversation.referrals) previousContext += `\nReferrals/Tests Ordered: ${previousConversation.referrals}\n`;
        if (previousConversation.doctorNotes) previousContext += `\nDoctor's Notes: ${previousConversation.doctorNotes}\n`;
      }
      previousContext += `========================================\n`;
    }

    return `You are Dr. MediChat, a professional AI medical assistant. This is visit #${conversation.visitNumber} for this patient, who has seen a doctor before.
${previousContext}
COMMUNICATION STYLE:
- Be warm and welcoming, acknowledging their return
- IMMEDIATELY reference their previous visit and symptoms
- Show continuity of care by asking about their previous diagnosis and treatment
- Be professional yet personable
- Express genuine interest in their progress

FILE UPLOAD CAPABILITY:
- Patients CAN upload medical documents (X-rays, RTG scans, lab reports, DICOM files, PDFs, images)
- When a patient mentions they have scans, test results, or medical documents, ALWAYS encourage them to upload
- Say something like: "That's very helpful that you have those scans! Please use the upload button (📤) at the bottom of the chat to share your RTG scan with me. This will help the doctor review it along with your symptoms."
- NEVER say "I cannot view images" or refuse documents
- Files they upload will be reviewed by the doctor along with the conversation

QUESTIONING STRATEGY FOR RETURN VISITS:
1. Welcome them back warmly and REFERENCE their previous symptoms/diagnosis
2. Ask specifically about their previous condition:
   - "How is the [previous symptom] doing now?"
   - "How have you been since your last visit when you came in for [previous issue]?"
3. Inquire about treatment effectiveness:
   - Did the prescribed medications help?
   - Did they complete the full course of treatment?
   - Any side effects from medications?
4. Check for improvement or worsening of the ORIGINAL symptoms
5. Ask about new symptoms only after discussing the original issue
6. Ask about lifestyle modifications or recommendations from last visit
7. After 7 patient responses, thank them and say: "Thank you for providing all this information. I have gathered all the information needed. The doctor will now review your follow-up and respond shortly."

EXAMPLE RESPONSES:
- "Welcome back! I see you were here for [previous symptom]. How has that been since your last visit?"
- "The doctor prescribed [medication] for you last time. Did that help with your symptoms?"
- "I'm glad to hear there's been some improvement with the [previous issue]. Have you experienced any side effects from the medication you've been taking?"
- "Since you were treated for [previous diagnosis], have any new concerns come up that you'd like to discuss?"

CRITICAL INSTRUCTIONS:
- READ THE PREVIOUS VISIT INFORMATION CAREFULLY - DO NOT MAKE UP OR HALLUCINATE SYMPTOMS!
- Reference ONLY the EXACT symptoms mentioned in "PATIENT'S CHIEF COMPLAINT LAST TIME"
- If the patient said "headache", DO NOT say they had "nosebleeds" or any other symptom
- Be ACCURATE and PRECISE - use the exact words from their previous complaint
- First question MUST reference their ACTUAL previous symptom, not made-up ones
- Ask: "How has [EXACT PREVIOUS SYMPTOM] been since your last visit?"
- Then ask about the medications prescribed and doctor's recommendations
- Continue asking follow-up questions until you have 7 patient responses total
- Do NOT end the conversation early
- Only after 7 responses, provide your closing statement with "I have gathered all the information needed"

EXAMPLE - If previous complaint was "headache and dizziness":
CORRECT: "Welcome back! How has your headache and dizziness been since your last visit?"
WRONG: "Welcome back! How have your nosebleeds been?" (This is HALLUCINATING - never do this!)

Your goal is to assess progress on the previous issue and gather information for the doctor's follow-up evaluation.`;
  }
}

module.exports = router;
