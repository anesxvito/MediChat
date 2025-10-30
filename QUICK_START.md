# MediChat - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Start MongoDB

**Option A: Local MongoDB**
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl status mongod

# macOS
brew services start mongodb-community

# Windows
# MongoDB should start automatically, or run:
net start MongoDB
```

**Option B: MongoDB Atlas (Recommended for quick start)**
- Already configured! No need to install MongoDB locally
- The connection string is already set in `.env`
- Just make sure you have internet connection

### 2. Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
✓ MongoDB connected successfully
✓ Server running on port 5000
```

### 3. Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

Browser will automatically open at `http://localhost:3000`

## 🎯 Quick Test

### Register as a Patient
1. Click "Sign up"
2. Fill in details, select "Patient"
3. Click "Create Account"

### Test the AI Chatbot
1. You'll see the chat interface
2. Type: "I have a headache"
3. The AI will intelligently ask follow-up questions about:
   - Which part of the head
   - Severity (1-10)
   - Duration
   - Triggers
   - Previous occurrences

### Register as a Doctor (New Browser/Incognito)
1. Go to `http://localhost:3000`
2. Register with:
   - Role: Doctor
   - Specialization: e.g., "General Medicine"
   - License Number: e.g., "MD123456"

### View Patient Data (Doctor Dashboard)
1. Login as doctor
2. See pending patient consultations
3. Click on a patient to view conversation history
4. Fill in diagnosis and recommendations
5. Send response to patient

### Check Notifications (Patient)
1. Switch back to patient account
2. Click "Notifications" in sidebar
3. See doctor's response
4. View diagnosis and prescriptions

## 📊 Weekly Demo Checklist

### Show Professor:

**Backend Demo:**
- ✅ RESTful API structure
- ✅ MongoDB models and relationships
- ✅ JWT authentication
- ✅ Gemini AI integration

**Frontend Demo:**
- ✅ Professional UI/UX
- ✅ Patient chatbot interface
- ✅ Doctor dashboard
- ✅ Real-time updates

**AI Intelligence Demo:**
- ✅ Context-aware questions
- ✅ First-time patient flow
- ✅ Returning patient flow
- ✅ Relevant symptom questioning

**Core Features:**
- ✅ User authentication (patient/doctor)
- ✅ Intelligent medical chatbot
- ✅ File upload capability
- ✅ Doctor response system
- ✅ Notification system

## 🔧 Common Issues

**"Module not found" error:**
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

**MongoDB connection failed:**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Or use MongoDB Atlas (cloud) - no installation needed
```

**Port 3000 already in use:**
```bash
# Frontend will prompt to use different port (Y/n)
# Or kill the process using port 3000
```

**Port 5000 already in use:**
```bash
# Change in backend/.env
PORT=5001

# Update frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

## 💡 Demo Tips

1. **Prepare Sample Data**: Register 2-3 test patients before the demo
2. **Show AI Intelligence**: Demonstrate how AI asks relevant follow-up questions
3. **Highlight Return Patients**: Show different questioning for returning patients
4. **Upload Files**: Have a sample X-ray/PDF ready to demonstrate file upload
5. **Doctor Workflow**: Show complete flow from patient chat → doctor review → response

## 📝 Testing Scenarios

### Scenario 1: First-time Patient with Headache
```
Patient: "I have a severe headache"
AI: "I'm sorry to hear that. Can you tell me which part of your head hurts?"
Patient: "The right side, near my temple"
AI: "On a scale of 1-10, how severe is the pain?"
... (continues with relevant questions)
```

### Scenario 2: Returning Patient
```
AI: "Welcome back! I see this is your second visit. How are you feeling now compared to your last visit?"
Patient: "The headache is better but I still have some pain"
AI: "Did the medication prescribed last time help reduce the pain?"
... (continues with follow-up questions)
```

### Scenario 3: Doctor Response
```
Doctor reviews:
- Patient: John Doe
- Complaint: Migraine, right temple, severity 8/10
- Duration: 3 days

Doctor provides:
- Diagnosis: "Cluster migraine"
- Recommendations: "Rest, avoid bright lights, stay hydrated"
- Prescription: "Sumatriptan 50mg, twice daily for 5 days"
- Action: "Follow-up in 1 week if symptoms persist"
```

## 🎓 For Your Professor

### Architecture Highlights
- **MERN Stack**: MongoDB, Express, React, Node.js
- **AI Integration**: Google Gemini API for intelligent conversations
- **RESTful API**: Clean, organized endpoints with proper HTTP methods
- **Authentication**: JWT-based secure authentication
- **Role-Based Access**: Separate patient and doctor functionalities
- **Responsive Design**: Professional UI with Tailwind CSS

### Code Quality
- **Modular Structure**: Separated routes, models, controllers
- **Error Handling**: Comprehensive error handling throughout
- **Input Validation**: Express-validator for all inputs
- **Security**: Password hashing, JWT tokens, CORS configuration
- **Scalability**: Easy to extend with new features

### Real-World Application
- Solves actual healthcare problem (doctor note-taking distraction)
- Improves patient care quality
- Saves doctor time
- Better medical record keeping
- Enables telemedicine

---

**Ready to impress your professor! 🎉**
