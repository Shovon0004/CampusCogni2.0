"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Award } from "lucide-react"

interface ExamQuestion {
  id: number
  question: string
  options: string[]
}

interface ExamData {
  examId: string
  skillName: string
  questions: ExamQuestion[]
  timeLimit: number
  passingScore: number
}

interface ExamResult {
  success: boolean
  score: number
  passed: boolean
  passingScore: number
  correctAnswers: number
  totalQuestions: number
  results: Array<{
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation?: string
  }>
}

interface SkillVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  skillName: string
  userEmail: string
  onVerificationComplete: () => void
}

export function SkillVerificationModal({
  isOpen,
  onClose,
  skillName,
  userEmail,
  onVerificationComplete,
}: SkillVerificationModalProps) {
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [examStarted, setExamStarted] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && !examData) {
      loadExam()
    }
  }, [isOpen, skillName])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (examStarted && timeLeft > 0 && !examCompleted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [examStarted, timeLeft, examCompleted])

  const loadExam = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/skills/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer token`, // You might need to get actual token
        },
        body: JSON.stringify({ skillName, userEmail }),
      })

      if (response.ok) {
        const data = await response.json()
        setExamData(data.exam)
        setTimeLeft(data.exam.timeLimit * 60) // Convert minutes to seconds
        setAnswers(new Array(data.exam.questions.length).fill(-1))
      } else {
        console.error("Failed to load exam")
      }
    } catch (error) {
      console.error("Error loading exam:", error)
    } finally {
      setLoading(false)
    }
  }

  const startExam = () => {
    setExamStarted(true)
  }

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < (examData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitExam = async () => {
    if (!examData) return

    setLoading(true)
    try {
      const timeSpent = examData.timeLimit * 60 - timeLeft
      const response = await fetch("/api/skills/submit-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer token`,
        },
        body: JSON.stringify({
          examId: examData.examId,
          answers,
          userEmail,
          timeSpent,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setExamResult(result)
        setExamCompleted(true)
        if (result.passed) {
          onVerificationComplete()
        }
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClose = () => {
    setExamData(null)
    setCurrentQuestion(0)
    setAnswers([])
    setTimeLeft(0)
    setExamStarted(false)
    setExamCompleted(false)
    setExamResult(null)
    onClose()
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading exam...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (examCompleted && examResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {examResult.passed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              Exam Results
            </DialogTitle>
            <DialogDescription>
              {examResult.passed
                ? "Congratulations! You passed the exam."
                : "You didn't pass this time. Keep practicing!"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{examResult.score}%</div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{examResult.passingScore}%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Badge variant={examResult.passed ? "default" : "destructive"} className="text-sm px-4 py-2">
                {examResult.correctAnswers} out of {examResult.totalQuestions} correct
              </Badge>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {examResult.results.map((result, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${result.isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium mb-2">{result.question}</div>
                    <div className="text-xs space-y-1">
                      <div className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                        Your answer: {result.userAnswer}
                      </div>
                      {!result.isCorrect && (
                        <div className="text-green-600">Correct answer: {result.correctAnswer}</div>
                      )}
                      {result.explanation && <div className="text-gray-600 italic">{result.explanation}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!examStarted && examData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              {skillName} Skill Verification
            </DialogTitle>
            <DialogDescription>Test your knowledge and verify your {skillName} skills</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{examData.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{examData.timeLimit}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{examData.passingScore}%</div>
                <div className="text-sm text-gray-600">To Pass</div>
              </div>
            </div>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Answer all {examData.questions.length} questions</li>
                  <li>• You have {examData.timeLimit} minutes to complete</li>
                  <li>• You need {examData.passingScore}% to pass and verify your skill</li>
                  <li>• Once started, the timer cannot be paused</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={startExam} className="flex-1">
                Start Exam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (examStarted && examData) {
    const question = examData.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / examData.questions.length) * 100

    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Question {currentQuestion + 1} of {examData.questions.length}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(currentQuestion, index)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      answers[currentQuestion] === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          answers[currentQuestion] === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestion] === index && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button onClick={prevQuestion} disabled={currentQuestion === 0} variant="outline">
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion === examData.questions.length - 1 ? (
                  <Button onClick={submitExam} disabled={answers.includes(-1)}>
                    Submit Exam
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>Next</Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}
