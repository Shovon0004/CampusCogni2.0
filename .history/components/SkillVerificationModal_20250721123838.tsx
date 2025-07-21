"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Award, Video, CameraOff, AlertTriangle } from "lucide-react"

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
  userToken: string | null // Added userToken prop
  onVerificationComplete: () => void
}

export function SkillVerificationModal({
  isOpen,
  onClose,
  skillName,
  userEmail,
  userToken, // Destructure userToken
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
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [examCanceled, setExamCanceled] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasLoadedExamRef = useRef(false) // New ref to prevent multiple loads

  const stopCamera = useCallback(() => {
    console.log("Stopping camera stream...")
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
      console.log("Camera stream stopped.")
    }
  }, [cameraStream])

  const handleClose = useCallback(() => {
    console.log("Handling modal close. Resetting states.")
    stopCamera()
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setExamData(null)
    setCurrentQuestion(0)
    setAnswers([])
    setTimeLeft(0)
    setExamStarted(false)
    setExamCompleted(false)
    setExamResult(null)
    setCameraError(null)
    setExamCanceled(false)
    hasLoadedExamRef.current = false // Reset ref when closing
    onClose()
  }, [onClose, stopCamera])

  const submitExam = useCallback(async () => {
    if (!examData || examCompleted || examCanceled) {
      console.log("Submit exam called but conditions not met:", { examData, examCompleted, examCanceled })
      return
    }

    setLoading(true)
    stopCamera() // Stop camera when exam is submitted or canceled

    console.log("Submitting exam to backend...")
    try {
      const timeSpent = examData.timeLimit * 60 - timeLeft
      const response = await fetch("/api/skills/submit-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`, // Use actual user token
        },
        body: JSON.stringify({
          examId: examData.examId,
          answers,
          userEmail,
          timeSpent,
          isCanceled: examCanceled, // Pass cancellation status to backend
        }),
      })

      console.log("API response received for submit-exam, status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("Exam submission successful:", result)
        setExamResult(result)
        setExamCompleted(true)
        if (result.passed) {
          onVerificationComplete()
        }
      } else {
        const errorBody = await response.text() // Get raw text to debug
        console.error("Failed to submit exam:", response.status, errorBody)
        setExamResult({
          success: false,
          score: 0,
          passed: false,
          passingScore: examData.passingScore,
          correctAnswers: 0,
          totalQuestions: examData.questions.length,
          results: [],
        })
        setExamCompleted(true)
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
      setExamResult({
        success: false,
        score: 0,
        passed: false,
        passingScore: examData.passingScore,
        correctAnswers: 0,
        totalQuestions: examData.questions.length,
        results: [],
      })
      setExamCompleted(true)
    } finally {
      setLoading(false)
    }
  }, [examData, examCompleted, examCanceled, timeLeft, userEmail, onVerificationComplete, stopCamera, userToken])

  const handleVisibilityChange = useCallback(() => {
    console.log("Visibility change detected. Current state:", document.visibilityState)
    console.log(
      "Exam states: examStarted=",
      examStarted,
      "examCompleted=",
      examCompleted,
      "examCanceled=",
      examCanceled,
    )

    if (document.visibilityState === "hidden" && examStarted && !examCompleted && !examCanceled) {
      console.log("Tab switched to hidden AND exam is active. Attempting to cancel exam.")
      setExamCanceled(true)
      submitExam() // Submit with cancellation status
    } else if (document.visibilityState === "visible") {
      console.log("Tab switched to visible.")
    }
  }, [examStarted, examCompleted, examCanceled, submitExam])

  useEffect(() => {
    if (isOpen && !hasLoadedExamRef.current) {
      console.log("Modal opened and exam not yet loaded. Loading exam...")
      loadExam()
      hasLoadedExamRef.current = true // Mark as loaded
      document.addEventListener("visibilitychange", handleVisibilityChange)
      // Disable context menu and selection
      document.addEventListener("contextmenu", preventDefaults)
      document.addEventListener("selectstart", preventDefaults)
      document.addEventListener("copy", preventDefaults)
      document.addEventListener("cut", preventDefaults)
      document.addEventListener("paste", preventDefaults)
    } else if (!isOpen) {
      console.log("Modal closed. Cleaning up event listeners and resetting ref.")
      // Reset ref and remove listeners when modal closes
      hasLoadedExamRef.current = false
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("contextmenu", preventDefaults)
      document.removeEventListener("selectstart", preventDefaults)
      document.removeEventListener("copy", preventDefaults)
      document.removeEventListener("cut", preventDefaults)
      document.removeEventListener("paste", preventDefaults)
      setCameraError(null) // Clear camera error on close
    }
    return () => {
      console.log("Cleaning up visibilitychange listener on unmount/re-render.")
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("contextmenu", preventDefaults)
      document.removeEventListener("selectstart", preventDefaults)
      document.removeEventListener("copy", preventDefaults)
      document.removeEventListener("cut", preventDefaults)
      document.removeEventListener("paste", preventDefaults)
    }
  }, [isOpen, handleVisibilityChange])

  const preventDefaults = (e: Event) => {
    e.preventDefault()
  }

  const requestCameraAccess = async () => {
    setCameraError(null)
    console.log("Requesting camera access...")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log("Camera stream successfully attached to video element.")
      } else {
        console.warn("videoRef.current is null when trying to attach stream.")
      }
      console.log("Camera access granted.")
      return true
    } catch (err) {
      console.error("Error accessing camera:", err)
      let errorMessage = "Camera access denied or not available."
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Camera access was denied by the user or browser settings. Please allow camera access."
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found on this device."
        } else if (err.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application."
        }
      }
      setCameraError(`${errorMessage} Please allow camera access to start the exam.`)
      console.log("Camera access denied or failed.")
      return false
    }
  }

  const loadExam = async () => {
    setLoading(true)
    console.log("Attempting to load exam for skill:", skillName, "user:", userEmail)

    if (!userToken) {
      console.error("User token is null, cannot load exam.")
      setCameraError("Authentication token missing. Please sign in again.")
      setExamCanceled(true)
      setLoading(false)
      return
    }

    try {
      console.log("Making API call to /api/skills/verify with token:", userToken ? "present" : "missing")
      const response = await fetch("/api/skills/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ skillName, userEmail }),
      })

      console.log("API response received, status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Exam data loaded successfully:", data)
        setExamData(data.exam)
        setTimeLeft(data.exam.timeLimit * 60) // Convert minutes to seconds
        setAnswers(new Array(data.exam.questions.length).fill(-1))
      } else {
        const errorBody = await response.text() // Get raw text to debug
        console.error("Failed to load exam:", response.status, errorBody)
        setCameraError(
          `Failed to load exam: ${response.status}. Please try again. (Details: ${errorBody.substring(0, 100)}...)`,
        ) // Show a more specific error
        setExamCanceled(true) // Still cancel, but with a better message
      }
    } catch (error) {
      console.error("Error loading exam:", error)
      setCameraError(`Network error or invalid response: ${error instanceof Error ? error.message : String(error)}`) // Show network error
      setExamCanceled(true) // Still cancel
    } finally {
      setLoading(false)
    }
  }

  const startExam = async () => {
    console.log("Attempting to start exam and request camera access.")
    const hasCameraAccess = await requestCameraAccess()
    if (hasCameraAccess) {
      console.log("Camera access confirmed, starting exam timer.")
      setExamStarted(true)
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log("Time ran out. Submitting exam.")
            submitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      console.log("Camera access denied, exam not started.")
    }
  }

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    if (examCanceled || examCompleted) return
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (examCanceled || examCompleted) return
    if (currentQuestion < (examData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (examCanceled || examCompleted) return
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Loading Exam</DialogTitle>
            <DialogDescription>Please wait while we prepare your skill verification test.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading exam...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (examCanceled) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Exam Canceled
            </DialogTitle>
            <DialogDescription>
              {cameraError || "Your exam was canceled because you switched tabs or lost camera access."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Please ensure you stay on the exam tab and maintain camera access throughout the test.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (examCompleted && examResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-background/80 backdrop-blur-sm">
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
              <Card className="bg-background/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{examResult.score}%</div>
                  <div className="text-sm text-muted-foreground">Your Score</div>
                </CardContent>
              </Card>
              <Card className="bg-background/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{examResult.passingScore}%</div>
                  <div className="text-sm text-muted-foreground">Passing Score</div>
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
                  className={`border-l-4 ${result.isCorrect ? "border-l-green-500" : "border-l-red-500"} bg-background/80 backdrop-blur-sm`}
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
                      {result.explanation && <div className="text-muted-foreground italic">{result.explanation}</div>}
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
        <DialogContent className="max-w-2xl bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              {examData.skillName} Skill Verification
            </DialogTitle>
            <DialogDescription>Test your knowledge and verify your {examData.skillName} skills</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{examData.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{examData.timeLimit}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{examData.passingScore}%</div>
                <div className="text-sm text-muted-foreground">To Pass</div>
              </div>
            </div>

            <Card className="bg-primary/5 border-0 shadow-sm">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Answer all {examData.questions.length} questions</li>
                  <li>• You have {examData.timeLimit} minutes to complete</li>
                  <li>• You need {examData.passingScore}% to pass and verify your skill</li>
                  <li>• Once started, the timer cannot be paused</li>
                  <li>• Do not switch tabs or minimize the window during the exam</li>
                  <li>• Camera access is required for proctoring</li>
                </ul>
              </CardContent>
            </Card>

            {cameraError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {cameraError}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={startExam} className="flex-1" disabled={!!cameraError}>
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
        <DialogContent
          className="max-w-2xl bg-background/80 backdrop-blur-sm"
          // Disable text selection and copying for proctoring
          onCopy={preventDefaults}
          onCut={preventDefaults}
          onPaste={preventDefaults}
          onContextMenu={preventDefaults}
          style={{ userSelect: "none" }}
        >
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
            {/* Camera Feed */}
            <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {!cameraStream && ( // Overlay if no stream
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/80">
                  <CameraOff className="w-8 h-8 mb-2" />
                  <span>Camera not active</span>
                </div>
              )}
              <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1">
                <Video className="w-3 h-3" />
                Live Proctoring
              </Badge>
              {/* Visual confirmation that exam has started */}
              <Badge
                variant="default"
                className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white"
              >
                <CheckCircle className="w-3 h-3" />
                Exam Active
              </Badge>
            </div>

            <Card className="bg-background/80 backdrop-blur-sm">
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
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          answers[currentQuestion] === index ? "border-primary bg-primary" : "border-border"
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
