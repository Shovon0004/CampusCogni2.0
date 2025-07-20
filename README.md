# TalentFinder - AI-Powered Recruiter Search Platform

A modern job seeker search platform that allows recruiters to find candidates using natural language queries powered by Google Gemini AI and MongoDB.

## 🚀 Features

- **Natural Language Search**: Search using queries like "I want a 3 years React developer"
- **AI-Powered Analysis**: Google Gemini API analyzes search intent and extracts criteria
- **Smart Matching**: 
  - Direct matches for exact criteria
  - Indirect matches for related skills and experience
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **MongoDB Database**: Flexible NoSQL database with MongoDB Atlas
- **Firebase Authentication**: Secure Google OAuth integration

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Internet connection (for MongoDB Atlas and APIs)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

\`\`\`bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd talent-finder

# Install dependencies
npm install
\`\`\`

### 2. Environment Configuration

Create a \`.env.local\` file in the root directory:

\`\`\`bash
# .env.local
MONGODB_URI=mongodb+srv://test1234:test1234@adhyan.xuhogvp.mongodb.net/talent_finder?retryWrites=true&w=majority&appName=aDHYAN
GOOGLE_AI_API_KEY=AIzaSyDQ3PJyvaR78neOCAtfEK78hqYAucEj4wQ
\`\`\`

### 3. Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at: **http://localhost:3000**

### 4. Test the Setup

1. **Test Database Connection**: Visit http://localhost:3000/api/test-db
2. **Sign in with Google**: Click "Get Started with Google" on the homepage
3. **Complete Your Profile**: Go to Profile page and add your skills
4. **Test Search**: Use the search feature to find candidates

## 🎯 How to Use

### For Job Seekers:
1. **Sign in** with your Google account
2. **Complete your profile** with skills and experience
3. **Browse jobs** and apply to positions
4. **Track applications** in your dashboard

### For Recruiters:
1. **Sign in** with your Google account
2. **Post jobs** with required skills
3. **Search candidates** using natural language
4. **Manage applications** in your dashboard

## 🔍 Example Search Queries

- "I want a 3 years React developer"
- "Looking for senior JavaScript engineer"
- "Need Next.js developer with 2+ years experience"
- "Frontend developer with Vue.js skills"
- "Python developer with Django experience"

## 🏗️ Project Structure

\`\`\`
talent-finder/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Recruiter dashboard
│   ├── jobs/             # Job listings
│   ├── profile/          # User profile
│   ├── search/           # Candidate search
│   └── post-job/         # Job posting
├── components/           # Reusable UI components
├── contexts/            # React contexts (Auth)
├── lib/                # Utilities and database
│   ├── mongodb.ts      # MongoDB connection
│   ├── models/         # Data models
│   └── firebase.ts     # Firebase config
└── public/             # Static assets
\`\`\`

## 🗄️ Database Collections

The application uses MongoDB with these collections:

- **users**: User authentication and basic info
- **job_seekers**: Detailed job seeker profiles with embedded skills
- **jobs**: Job postings with embedded skill requirements
- **job_applications**: Application tracking and status

## 🔧 API Endpoints

- \`GET /api/test-db\` - Test database connection
- \`GET/POST /api/profile\` - User profile management
- \`POST /api/search\` - AI-powered candidate search
- \`GET/POST /api/jobs\` - Job management
- \`POST /api/jobs/apply\` - Job applications
- \`GET /api/dashboard/*\` - Dashboard data

## 🚨 Troubleshooting

### Database Connection Issues:
1. Check your internet connection
2. Verify the MongoDB URI in \`.env.local\`
3. Ensure MongoDB Atlas cluster is running

### Authentication Issues:
1. Check Firebase configuration
2. Verify Google OAuth is enabled
3. Clear browser cache and cookies

### Search Not Working:
1. Verify Google AI API key
2. Check if you have completed your profile
3. Try simpler search queries

### Build Issues:
1. Delete \`node_modules\` and \`.next\` folders
2. Run \`npm install\` again
3. Check for TypeScript errors

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- Firebase Authentication with Google OAuth
- Environment variables for sensitive data
- Input validation and sanitization
- Secure API endpoints

## 🚀 Deployment

### Vercel (Recommended):
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms:
- Netlify
- Railway
- Render
- Any Node.js hosting platform

## 📈 Performance

- MongoDB Atlas provides automatic scaling
- Next.js optimizations for fast loading
- Efficient search algorithms
- Connection pooling for database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the console for error messages
3. Test the database connection endpoint
4. Ensure all environment variables are set

## 🎉 You're Ready!

Your TalentFinder application is now ready to use with MongoDB! Start by signing in and creating your profile.
\`\`\`

## 🔥 Quick Start Commands:

\`\`\`bash
npm install
npm run dev
\`\`\`

Then visit: **http://localhost:3000**
