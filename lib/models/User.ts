import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  name: string
  photoUrl?: string
  firebaseUid?: string
  userType: "job_seeker" | "recruiter" | "both"
  createdAt: Date
  updatedAt: Date
  lastLogin: Date
}

export interface JobSeeker {
  _id?: ObjectId
  userId: ObjectId
  email: string
  name: string
  phone?: string
  title?: string
  location?: string
  experienceYears: number
  summary?: string
  resumeUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  leetcodeUrl?: string // New field for LeetCode profile URL
  availability: "available" | "not_available" | "open_to_offers"
  salaryExpectationMin?: number
  salaryExpectationMax?: number
  preferredCurrency: string
  remoteWork: boolean
  willingToRelocate: boolean
  skills: JobSeekerSkill[]
  createdAt: Date
  updatedAt: Date
}

export interface JobSeekerSkill {
  skillName: string
  category: string
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert"
  yearsOfExperience: number
  isPrimary?: boolean
  isVerified: boolean // New field for verification status
  verificationScore?: number // Score from the exam (0-100)
  verifiedAt?: Date // When the skill was verified
}

export interface Job {
  _id?: ObjectId
  title: string
  companyName: string
  location?: string
  jobType: "full-time" | "part-time" | "contract" | "remote" | "hybrid"
  workArrangement: "office" | "remote" | "hybrid"
  experienceLevel: "entry" | "junior" | "mid" | "senior" | "lead" | "executive"
  salaryMin?: number
  salaryMax?: number
  currency: string
  description: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  applicationDeadline?: Date
  postedBy: ObjectId
  postedByName: string
  postedByEmail: string
  status: "active" | "paused" | "closed" | "draft"
  viewsCount: number
  applicationsCount: number
  skills: JobSkill[]
  createdAt: Date
  updatedAt: Date
}

export interface JobSkill {
  skillName: string
  category: string
  isRequired: boolean
  minYearsRequired: number
  proficiencyRequired: "beginner" | "intermediate" | "advanced" | "expert"
}

export interface JobApplication {
  _id?: ObjectId
  jobId: ObjectId
  jobSeekerId: ObjectId
  applicantEmail: string
  status:
    | "pending"
    | "reviewed"
    | "shortlisted"
    | "interview_scheduled"
    | "interview_completed"
    | "rejected"
    | "hired"
    | "withdrawn"
  coverLetter?: string
  resumeUrl?: string
  expectedSalary?: number
  availableFrom?: Date
  notes?: string
  rating?: number
  appliedAt: Date
  updatedAt: Date
  reviewedAt?: Date
  reviewedBy?: ObjectId
}

export interface Skill {
  _id?: ObjectId
  skillName: string
  category: string
  createdAt: Date
}

// New interfaces for skill verification
export interface SkillExam {
  _id?: ObjectId
  skillName: string
  category: string
  questions: ExamQuestion[]
  passingScore: number
  timeLimit: number // in minutes
  createdAt: Date
  updatedAt: Date
}

export interface ExamQuestion {
  question: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation?: string
}

export interface SkillVerificationAttempt {
  _id?: ObjectId
  userId: ObjectId
  userEmail: string
  skillName: string
  examId: ObjectId
  answers: number[] // user's answers (indices)
  score: number // percentage score
  passed: boolean
  timeSpent: number // in seconds
  attemptedAt: Date
}
