# MediChat - Intelligent Medical Consultation Platform

A professional web application that revolutionizes doctor-patient communication through AI-powered medical chatbot assistance.

## Overview

MediChat addresses the common issue of doctors being distracted by note-taking during patient consultations. The application uses an intelligent AI chatbot to conduct initial patient interviews, gathering comprehensive medical information before the doctor reviews it.

### Key Features

- **Intelligent AI Chatbot**: Uses Google Gemini AI to conduct context-aware medical interviews
- **Smart Question Flow**: Asks relevant follow-up questions based on patient symptoms
- **Return Patient Recognition**: Different questioning approach for returning patients
- **File Upload Support**: Patients can upload X-rays, ECG, and other medical documents
- **Doctor Dashboard**: Comprehensive view of pending consultations and patient history
- **Doctor Response System**: Doctors can provide diagnoses, prescriptions, and recommendations
- **Real-time Notifications**: Patients receive instant notifications when doctors respond
- **Professional UI/UX**: Clean, modern interface built with React and Tailwind CSS

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **Google Gemini AI** for intelligent chatbot
- **Multer** for file uploads
- **Bcrypt** for password hashing

### Frontend
- **React** with Hooks
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure

```
MediChat/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema (patients & doctors)
│   │   └── Conversation.js      # Conversation & message schema
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── patients.js          # Patient-specific endpoints
│   │   ├── doctors.js           # Doctor-specific endpoints
│   │   └── chatbot.js           # AI chatbot endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── uploads/                 # Uploaded medical files
│   ├── server.js                # Express server setup
│   ├── .env                     # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.js
    │   │   │   └── Register.js
    │   │   ├── patient/
    │   │   │   ├── Dashboard.js
    │   │   │   └── Chatbot.js
    │   │   └── doctor/
    │   │       ├── Dashboard.js
    │   │       └── PatientDetails.js
    │   ├── contexts/
    │   │   └── AuthContext.js   # Authentication context
    │   ├── services/
    │   │   └── api.js           # API service layer
    │   ├── App.js               # Main routing component
    │   └── index.css            # Tailwind CSS imports
    ├── .env                     # Frontend environment variables
    └── package.json
```

## Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas)
- **Gemini API Key** (provided: AIzaSyC76VRpmuKL2aFAvELePQGvamLUhQFjN4Y)

### Step 1: Clone and Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

Backend `.env` is already configured with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medichat
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GEMINI_API_KEY=AIzaSyC76VRpmuKL2aFAvELePQGvamLUhQFjN4Y
NODE_ENV=development
```

Frontend `.env` is already configured with:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

Make sure MongoDB is running locally:
```bash
# Linux/Mac
sudo systemctl start mongod

# Or using MongoDB Community Server
mongod --dbpath /path/to/your/data
```

Or use **MongoDB Atlas** (cloud):
1. Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Update `MONGODB_URI` in backend `.env` with your connection string

### Step 4: Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## Usage Guide

### For Patients

1. **Register**: Create a patient account at `/register`
2. **Start Chat**: Begin conversation with AI medical assistant
3. **Answer Questions**: The AI will ask relevant questions about your symptoms
4. **Upload Files** (optional): Upload X-rays, ECG, or other medical documents
5. **Wait for Doctor**: Your information will be sent to a doctor
6. **Receive Response**: Get notified when the doctor responds with diagnosis/recommendations

### For Doctors

1. **Register**: Create a doctor account with specialization and license number
2. **View Pending**: See all pending patient consultations
3. **Review Patient Info**: Read conversation history, patient details, and uploaded files
4. **Provide Response**: Enter diagnosis, prescriptions, recommendations, and referrals
5. **Send to Patient**: Submit response which notifies the patient instantly

## AI Chatbot Intelligence

The chatbot uses Google Gemini AI with custom prompts to:

### First-Time Patients
- Ask focused questions based on mentioned symptoms
- Avoid irrelevant questions (e.g., won't ask about leg pain if patient has headache)
- Gather: location, severity (1-10), duration, triggers, previous occurrences
- Conclude after 6-8 relevant questions

### Returning Patients
- Ask about previous treatment effectiveness
- Check for new symptoms or side effects
- Reference previous visit information
- Conclude after 4-6 follow-up questions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Patient Routes (Protected)
- `GET /api/patients/profile` - Get patient profile
- `PATCH /api/patients/profile` - Update profile
- `GET /api/patients/conversations` - Get all conversations
- `GET /api/patients/conversations/:id` - Get specific conversation
- `GET /api/patients/notifications` - Get notifications

### Chatbot Routes (Protected - Patient)
- `POST /api/chatbot/chat` - Send message to AI
- `POST /api/chatbot/upload` - Upload medical file
- `GET /api/chatbot/history` - Get conversation history
- `GET /api/chatbot/conversation/:id` - Get specific conversation

### Doctor Routes (Protected - Doctor)
- `GET /api/doctors/pending-conversations` - Get pending consultations
- `GET /api/doctors/my-conversations` - Get doctor's patients
- `GET /api/doctors/conversation/:id` - Get conversation details
- `POST /api/doctors/conversation/:id/respond` - Send response to patient
- `GET /api/doctors/patient/:patientId/history` - Get patient history
- `GET /api/doctors/stats` - Get dashboard statistics

## Weekly Progress Demonstration

For your professor meetings, demonstrate:

### Week 1
- ✅ Project setup and architecture
- ✅ Backend API with MongoDB
- ✅ Authentication system (JWT)

### Week 2
- ✅ Gemini AI integration
- ✅ Intelligent chatbot with context-aware questioning
- ✅ First-time vs returning patient logic

### Week 3
- ✅ File upload functionality
- ✅ Patient dashboard and chat interface
- ✅ Conversation history

### Week 4
- ✅ Doctor dashboard
- ✅ Patient information review system
- ✅ Doctor response and prescription system

### Week 5
- ✅ Notification system
- ✅ Professional UI/UX polish
- ✅ Testing and bug fixes

### Week 6
- ⏳ Deployment preparation
- ⏳ Documentation completion
- ⏳ Final presentation

## Database Schema

### User Model
```javascript
{
  email: String,
  password: String (hashed),
  role: 'patient' | 'doctor',
  firstName: String,
  lastName: String,
  phone: String,
  dateOfBirth: Date,
  // Doctor-specific
  specialization: String,
  licenseNumber: String,
  // Patient-specific
  assignedDoctor: ObjectId,
  medicalHistory: Array,
  allergies: Array,
  currentMedications: Array
}
```

### Conversation Model
```javascript
{
  patient: ObjectId,
  doctor: ObjectId,
  visitNumber: Number,
  messages: [{
    role: 'user' | 'assistant' | 'system',
    content: String,
    timestamp: Date
  }],
  symptoms: Array,
  attachments: Array,
  doctorResponse: {
    diagnosis: String,
    recommendations: String,
    prescriptions: Array,
    referrals: String,
    callToOffice: Boolean,
    notes: String
  },
  status: 'in_progress' | 'awaiting_doctor' | 'doctor_responded' | 'closed',
  patientNotified: Boolean
}
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with 7-day expiration
- **Role-Based Access**: Separate patient and doctor routes
- **Input Validation**: Express-validator for all inputs
- **File Type Validation**: Only medical file types accepted
- **CORS**: Configured for local development

## Future Enhancements

- Email/SMS notifications
- Video consultation integration
- Appointment scheduling
- Medical record management
- Multi-language support
- Voice input for elderly patients
- Analytics dashboard for doctors
- Insurance integration

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or use MongoDB Atlas cloud database
```

### Port Already in Use
```bash
# Change PORT in backend/.env to 5001 or other available port
# Update REACT_APP_API_URL in frontend/.env accordingly
```

### Gemini API Error
- Verify API key is correct
- Check internet connection
- Ensure API quota hasn't been exceeded

## License

This project is created for educational purposes as part of a university project.

## Contact

For questions or issues, please contact your professor or project supervisor.

---

**Built with ❤️ for better healthcare communication**
