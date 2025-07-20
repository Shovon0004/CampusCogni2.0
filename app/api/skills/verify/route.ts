import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDatabase } from "@/lib/mongodb"
import type { SkillExam, User } from "@/lib/models/User"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { skillName, userEmail } = await request.json()
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!skillName || !userEmail) {
      return NextResponse.json({ error: "Skill name and user email required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user exists
    const user = await db.collection<User>("users").findOne({ email: userEmail })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if exam already exists for this skill
    let exam = await db.collection<SkillExam>("skill_exams").findOne({ skillName })

    if (!exam) {
      // Generate new exam using Gemini AI
      console.log(`Generating exam for skill: ${skillName}`)

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const examPrompt = `
Create a technical skill assessment for "${skillName}" with exactly 5 multiple choice questions.
Each question should test practical knowledge and real-world application.

Please provide a JSON response with this exact structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Requirements:
- 5 questions total
- Each question has exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Questions should be practical and test real understanding
- Difficulty should be appropriate for someone claiming experience in ${skillName}
- Include brief explanations

Example topics for ${skillName}:
- Core concepts and fundamentals
- Best practices and common patterns
- Problem-solving scenarios
- Tool usage and configuration
- Performance and optimization
`

      try {
        const result = await model.generateContent(examPrompt)
        const response = await result.response
        const examText = response.text()

        // Extract JSON from the response
        const jsonMatch = examText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error("No JSON found in Gemini response")
        }

        const examData = JSON.parse(jsonMatch[0])

        if (!examData.questions || !Array.isArray(examData.questions) || examData.questions.length !== 5) {
          throw new Error("Invalid exam format from Gemini")
        }

        // Validate question format
        for (const q of examData.questions) {
          if (
            !q.question ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            typeof q.correctAnswer !== "number"
          ) {
            throw new Error("Invalid question format")
          }
        }

        // Create exam document
        const examDoc: Omit<SkillExam, "_id"> = {
          skillName,
          category: getSkillCategory(skillName),
          questions: examData.questions,
          passingScore: 60, // 60% to pass
          timeLimit: 15, // 15 minutes
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const examResult = await db.collection<SkillExam>("skill_exams").insertOne(examDoc)
        exam = { ...examDoc, _id: examResult.insertedId }
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError)
        return NextResponse.json({ error: "Failed to generate exam questions" }, { status: 500 })
      }
    }

    // Return exam questions (without correct answers)
    const examForUser = {
      examId: exam._id,
      skillName: exam.skillName,
      questions: exam.questions.map((q, index) => ({
        id: index,
        question: q.question,
        options: q.options,
      })),
      timeLimit: exam.timeLimit,
      passingScore: exam.passingScore,
    }

    return NextResponse.json({ exam: examForUser })
  } catch (error) {
    console.error("Error creating skill verification exam:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}

function getSkillCategory(skillName: string): string {
  const frontendSkills = ["react", "vue", "angular", "javascript", "typescript", "html", "css", "next.js"]
  const backendSkills = ["node.js", "python", "django", "flask", "java", "spring", "c#", ".net", "php", "ruby"]
  const databaseSkills = ["mongodb", "postgresql", "mysql", "redis"]
  const cloudSkills = ["aws", "azure", "docker", "kubernetes"]

  const skillLower = skillName.toLowerCase()
  if (frontendSkills.some((s) => skillLower.includes(s))) return "Frontend"
  if (backendSkills.some((s) => skillLower.includes(s))) return "Backend"
  if (databaseSkills.some((s) => skillLower.includes(s))) return "Database"
  if (cloudSkills.some((s) => skillLower.includes(s))) return "Cloud"
  return "General"
}
