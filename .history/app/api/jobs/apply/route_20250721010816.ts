import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { JobSeeker, JobApplication } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { jobId, userEmail } = await request.json()
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!userEmail) {
      return NextResponse.json({ error: "User email required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get job seeker
    const jobSeeker = await db.collection<JobSeeker>("job_seekers").findOne({ email: userEmail })

    if (!jobSeeker) {
      return NextResponse.json(
        {
          error: "Please complete your profile before applying to jobs",
        },
        { status: 400 },
      )
    }

    // Check if already applied
    const existingApplication = await db.collection<JobApplication>("job_applications").findOne({
      jobId: new ObjectId(jobId),
      jobSeekerId: jobSeeker._id,
    })

    if (existingApplication) {
      return NextResponse.json(
        {
          error: "You have already applied to this job",
        },
        { status: 400 },
      )
    }

    // Create application
    const applicationDoc: Omit<JobApplication, "_id"> = {
      jobId: new ObjectId(jobId),
      jobSeekerId: jobSeeker._id as ObjectId,
      applicantEmail: userEmail,
      status: "pending",
      appliedAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<JobApplication>("job_applications").insertOne(applicationDoc)

    // Update job applications count
    await db.collection("jobs").updateOne({ _id: new ObjectId(jobId) }, { $inc: { applicationsCount: 1 } })

    return NextResponse.json({ success: true, message: "Application submitted successfully" })
  } catch (error) {
    console.error("Error applying to job:", error)
    return NextResponse.json({ error: "Failed to apply to job" }, { status: 500 })
  }
}
