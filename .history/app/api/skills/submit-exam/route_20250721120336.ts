import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { SkillExam, SkillVerificationAttempt, JobSeeker, User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { examId, answers, userEmail, timeSpent, isCanceled } = await request.json() // Get isCanceled
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!examId || !answers || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get user
    const user = await db.collection<User>("users").findOne({ email: userEmail })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get exam
    const exam = await db.collection<SkillExam>("skill_exams").findOne({ _id: new ObjectId(examId) })
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    let score = 0
    let passed = false
    let correctAnswers = 0
    const results: Array<any> = []

    if (!isCanceled) {
      // Only calculate score if exam was not canceled
      // Calculate score
      exam.questions.map((question, index) => {
        const userAnswer = answers[index]
        const isCorrect = userAnswer === question.correctAnswer
        if (isCorrect) correctAnswers++

        results.push({
          question: question.question,
          userAnswer: question.options[userAnswer] || "No answer",
          correctAnswer: question.options[question.correctAnswer],
          isCorrect,
          explanation: question.explanation,
        })
      })

      score = Math.round((correctAnswers / exam.questions.length) * 100)
      passed = score >= exam.passingScore
    } else {
      // If canceled, set score to 0 and not passed
      score = 0
      passed = false
      correctAnswers = 0
      // Optionally, you could log a specific reason for cancellation in results
      results.push({
        question: "Exam Canceled",
        userAnswer: "N/A",
        correctAnswer: "N/A",
        isCorrect: false,
        explanation: "Exam was canceled due to proctoring violation (e.g., tab switch or camera loss).",
      })
    }

    // Save verification attempt
    const attemptDoc: Omit<SkillVerificationAttempt, "_id"> = {
      userId: user._id as ObjectId,
      userEmail,
      skillName: exam.skillName,
      examId: exam._id as ObjectId,
      answers,
      score,
      passed,
      timeSpent: timeSpent || 0,
      attemptedAt: new Date(),
      // You might want to add a field like `cancellationReason` here
    }

    await db.collection<SkillVerificationAttempt>("skill_verification_attempts").insertOne(attemptDoc)

    // If passed, update the user's skill verification status
    if (passed) {
      await db.collection<JobSeeker>("job_seekers").updateOne(
        {
          email: userEmail,
          "skills.skillName": exam.skillName,
        },
        {
          $set: {
            "skills.$.isVerified": true,
            "skills.$.verificationScore": score,
            "skills.$.verifiedAt": new Date(),
          },
        },
      )
    }

    return NextResponse.json({
      success: true,
      score,
      passed,
      passingScore: exam.passingScore,
      correctAnswers,
      totalQuestions: exam.questions.length,
      results,
      isCanceled: isCanceled, // Return cancellation status
    })
  } catch (error) {
    console.error("Error submitting exam:", error)
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 })
  }
}
