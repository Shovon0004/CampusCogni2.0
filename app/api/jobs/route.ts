import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ObjectId } from "mongodb"
import type { User, Job, JobSkill } from "@/lib/models/User"

export async function GET() {
  try {
    const db = await getDatabase()

    const jobs = await db.collection<Job>("jobs").find({ status: "active" }).sort({ createdAt: -1 }).toArray()

    const formattedJobs = jobs.map((job) => ({
      id: job._id?.toString(),
      title: job.title,
      company: job.companyName,
      location: job.location,
      job_type: job.jobType,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      currency: job.currency,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      posted_by_name: job.postedByName,
      created_at: job.createdAt,
      skills: job.skills?.map((s) => s.skillName) || [],
    }))

    return NextResponse.json({ jobs: formattedJobs })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()
    const {
      title,
      company,
      location,
      job_type,
      salary_min,
      salary_max,
      currency,
      description,
      requirements,
      benefits,
      posted_by,
      posted_by_name,
      skills,
    } = jobData

    const db = await getDatabase()

    // Ensure user exists
    await db.collection<User>("users").findOneAndUpdate(
      { email: posted_by },
      {
        $set: {
          name: posted_by_name,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          email: posted_by,
          userType: "recruiter" as const,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
      },
      { upsert: true },
    )

    // Get user ID
    const user = await db.collection<User>("users").findOne({ email: posted_by })
    if (!user) {
      throw new Error("Failed to create/find user")
    }

    // Process job skills
    const jobSkills: JobSkill[] = skills.map((skillName: string) => ({
      skillName,
      category: "General", // You can enhance this with proper categorization
      isRequired: true,
      minYearsRequired: 0,
      proficiencyRequired: "intermediate" as const,
    }))

    // Create job
    const jobDoc: Omit<Job, "_id"> = {
      title,
      companyName: company,
      location,
      jobType: job_type,
      workArrangement: "office",
      experienceLevel: "mid",
      salaryMin: salary_min,
      salaryMax: salary_max,
      currency: currency || "USD",
      description,
      requirements,
      benefits,
      postedBy: user._id as ObjectId,
      postedByName: posted_by_name,
      postedByEmail: posted_by,
      status: "active",
      viewsCount: 0,
      applicationsCount: 0,
      skills: jobSkills,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Job>("jobs").insertOne(jobDoc)

    return NextResponse.json({
      success: true,
      jobId: result.insertedId.toString(),
      message: "Job posted successfully",
    })
  } catch (error) {
    console.error("Error posting job:", error)
    return NextResponse.json({ error: "Failed to post job" }, { status: 500 })
  }
}
