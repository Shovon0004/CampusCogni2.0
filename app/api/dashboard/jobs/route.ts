import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Job, JobApplication } from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Extract user email from URL params
    const url = new URL(request.url)
    const userEmail = url.searchParams.get("email")

    if (!userEmail) {
      return NextResponse.json({ error: "User email required" }, { status: 400 })
    }

    const db = await getDatabase()

    try {
      // Get jobs posted by this user
      const jobs = await db.collection<Job>("jobs").find({ postedByEmail: userEmail }).sort({ createdAt: -1 }).toArray()

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        jobs.map(async (job) => {
          const applicationsCount = await db
            .collection<JobApplication>("job_applications")
            .countDocuments({ jobId: job._id })

          return {
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
            status: job.status,
            created_at: job.createdAt,
            updated_at: job.updatedAt,
            applications_count: applicationsCount,
            skills: job.skills?.map((s) => s.skillName) || [],
          }
        }),
      )

      return NextResponse.json({ jobs: jobsWithCounts })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
