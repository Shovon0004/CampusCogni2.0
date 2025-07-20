import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { JobApplication } from "@/lib/models/User"

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
      // Get all applications for jobs posted by this user
      const applications = await db
        .collection<JobApplication>("job_applications")
        .aggregate([
          {
            $lookup: {
              from: "jobs",
              localField: "jobId",
              foreignField: "_id",
              as: "job",
            },
          },
          {
            $unwind: "$job",
          },
          {
            $match: {
              "job.postedByEmail": userEmail,
            },
          },
          {
            $lookup: {
              from: "job_seekers",
              localField: "jobSeekerId",
              foreignField: "_id",
              as: "applicant",
            },
          },
          {
            $unwind: "$applicant",
          },
          {
            $sort: { appliedAt: -1 },
          },
        ])
        .toArray()

      const formattedApplications = applications.map((app: any) => ({
        id: app._id.toString(),
        job_id: app.jobId.toString(),
        job_title: app.job.title,
        applicant_name: app.applicant.name,
        applicant_email: app.applicant.email,
        applicant_phone: app.applicant.phone,
        applicant_title: app.applicant.title || "Job Seeker",
        applicant_location: app.applicant.location || "Not specified",
        applicant_summary: app.applicant.summary || "",
        applicant_skills:
          app.applicant.skills?.map((skill: any) => ({
            skill: skill.skillName,
            experience: skill.yearsOfExperience,
            isVerified: skill.isVerified || false,
          })) || [],
        status: app.status,
        applied_at: app.appliedAt,
      }))

      return NextResponse.json({ applications: formattedApplications })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { applicationId, status } = await request.json()

    const db = await getDatabase()

    try {
      await db.collection<JobApplication>("job_applications").updateOne(
        { _id: new ObjectId(applicationId) },
        {
          $set: {
            status: status,
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({ success: true, message: "Application status updated" })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}
