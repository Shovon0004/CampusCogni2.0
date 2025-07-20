#!/bin/bash

echo "🍃 Setting up TalentFinder with MongoDB..."

# Install dependencies
echo "📦 Installing MongoDB dependencies..."
npm install mongodb mongoose

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
MONGODB_URI=mongodb+srv://test1234:test1234@adhyan.xuhogvp.mongodb.net/talent_finder?retryWrites=true&w=majority&appName=aDHYAN
GOOGLE_AI_API_KEY=AIzaSyDQ3PJyvaR78neOCAtfEK78hqYAucEj4wQ
EOF
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

# Test MongoDB connection
echo "🔌 Testing MongoDB connection..."
curl -s http://localhost:3000/api/test-db > /dev/null 2>&1 || {
    echo "⚠️  Make sure your Next.js app is running first:"
    echo "   npm run dev"
    echo ""
}

echo "🎉 MongoDB setup complete!"
echo ""
echo "🌐 MongoDB Connection Details:"
echo "   URI: mongodb+srv://test1234:***@adhyan.xuhogvp.mongodb.net/talent_finder"
echo "   Database: talent_finder"
echo "   Collections: users, job_seekers, jobs, job_applications"
echo ""
echo "🔧 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Test connection: http://localhost:3000/api/test-db"
echo "   3. Create your profile to test the database"
