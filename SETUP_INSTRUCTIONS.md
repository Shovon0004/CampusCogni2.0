# 🚀 TalentFinder Setup Instructions

## Step-by-Step Setup Guide

### 1. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

### 2. **Create Environment File**
Create `.env.local` in the root directory:
\`\`\`bash
MONGODB_URI=mongodb+srv://test1234:test1234@adhyan.xuhogvp.mongodb.net/talent_finder?retryWrites=true&w=majority&appName=aDHYAN
GOOGLE_AI_API_KEY=AIzaSyDQ3PJyvaR78neOCAtfEK78hqYAucEj4wQ
\`\`\`

### 3. **Start Development Server**
\`\`\`bash
npm run dev
\`\`\`

### 4. **Open Application**
Visit: http://localhost:3000

### 5. **Test Database Connection**
Visit: http://localhost:3000/api/test-db

### 6. **Sign In and Test**
1. Click "Get Started with Google"
2. Complete your profile
3. Try searching for candidates

## ✅ Verification Checklist

- [ ] Dependencies installed successfully
- [ ] Environment file created with correct values
- [ ] Development server starts without errors
- [ ] Database connection test passes
- [ ] Google sign-in works
- [ ] Profile creation works
- [ ] Search functionality works

## 🎯 Ready to Use!

Your application is now running with MongoDB Atlas!
