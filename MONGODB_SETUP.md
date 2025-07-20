# TalentFinder MongoDB Setup

## 🍃 MongoDB Atlas Configuration

Your application is now configured to use MongoDB Atlas with the following connection:

- **URI**: `mongodb+srv://test1234:test1234@adhyan.xuhogvp.mongodb.net/talent_finder`
- **Database**: `talent_finder`
- **Username**: `test1234`
- **Password**: `test1234`

## 📊 Database Collections

The application uses the following MongoDB collections:

### 1. **users**
- Stores user authentication data
- Links to Firebase authentication
- Supports both job seekers and recruiters

### 2. **job_seekers**
- Detailed job seeker profiles
- Embedded skills with experience levels
- Salary expectations and preferences

### 3. **jobs**
- Job postings with embedded skills requirements
- Company information and job details
- Application tracking

### 4. **job_applications**
- Links job seekers to jobs
- Application status tracking
- Recruiter notes and ratings

## 🚀 Getting Started

1. **Install dependencies:**
\`\`\`bash
npm install mongodb mongoose
\`\`\`

2. **Set up environment variables:**
\`\`\`bash
# .env.local
MONGODB_URI=mongodb+srv://test1234:test1234@adhyan.xuhogvp.mongodb.net/talent_finder?retryWrites=true&w=majority&appName=aDHYAN
GOOGLE_AI_API_KEY=AIzaSyDQ3PJyvaR78neOCAtfEK78hqYAucEj4wQ
\`\`\`

3. **Start the application:**
\`\`\`bash
npm run dev
\`\`\`

4. **Test the connection:**
Visit: `http://localhost:3000/api/test-db`

## 🔧 Key Features

### **Document-Based Storage**
- No complex joins required
- Embedded skills and job requirements
- Flexible schema for future enhancements

### **Optimized Queries**
- Efficient skill-based searching
- Text search on job titles and descriptions
- Aggregation pipelines for complex matching

### **Scalable Architecture**
- MongoDB Atlas handles scaling automatically
- Connection pooling for performance
- Proper error handling and retries

## 📝 Sample Data Structure

### Job Seeker Document:
\`\`\`json
{
  "_id": "ObjectId",
  "email": "john@example.com",
  "name": "John Doe",
  "title": "React Developer",
  "experienceYears": 3,
  "skills": [
    {
      "skillName": "React",
      "category": "Frontend",
      "yearsOfExperience": 3,
      "proficiencyLevel": "advanced"
    }
  ]
}
\`\`\`

### Job Document:
\`\`\`json
{
  "_id": "ObjectId",
  "title": "Senior React Developer",
  "companyName": "TechCorp",
  "description": "We're looking for...",
  "skills": [
    {
      "skillName": "React",
      "isRequired": true,
      "minYearsRequired": 2
    }
  ]
}
\`\`\`

## 🔍 Search Capabilities

The search functionality supports:
- **Direct matches**: Exact skill and experience requirements
- **Indirect matches**: Related skills and flexible experience
- **AI-powered query parsing**: Natural language search queries
- **Aggregation pipelines**: Complex matching logic

## 🛠️ Troubleshooting

### Connection Issues:
1. Check your internet connection
2. Verify MongoDB Atlas cluster is running
3. Ensure IP address is whitelisted (or use 0.0.0.0/0 for development)

### Authentication Issues:
1. Verify username/password in connection string
2. Check database user permissions
3. Ensure database name matches in URI

### Performance Issues:
1. MongoDB Atlas provides automatic indexing
2. Consider upgrading cluster tier for production
3. Monitor query performance in Atlas dashboard

## 📈 Production Considerations

1. **Security**: Use environment variables for credentials
2. **Indexing**: MongoDB Atlas handles most indexing automatically
3. **Monitoring**: Use Atlas monitoring dashboard
4. **Backup**: Atlas provides automatic backups
5. **Scaling**: Atlas handles automatic scaling

Your application is now ready to use MongoDB! 🚀
