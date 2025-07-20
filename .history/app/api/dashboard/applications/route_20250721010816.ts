import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "talent_finder",
  user: "postgres",
  password: "password",
})

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

    const client = await pool.connect()

    try {
      const result = await client.query(
        `
        SELECT 
          ja.*,
          j.title as job_title,
          js.name as applicant_name,
          js.email as applicant_email,
          js.phone as applicant_phone,
          js.title as applicant_title,
          js.location as applicant_location,
          js.summary as applicant_summary,
          COALESCE(
            json_agg(
              json_build_object(
                'skill', s.skill_name, 
                'experience', jss.years_of_experience
              )
            ) FILTER (WHERE s.skill_name IS NOT NULL), 
            '[]'
          ) as applicant_skills
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        JOIN job_seekers js ON ja.job_seeker_id = js.id
        LEFT JOIN job_seeker_skills jss ON js.id = jss.job_seeker_id
        LEFT JOIN skills s ON jss.skill_id = s.id
        WHERE j.posted_by = $1
        GROUP BY ja.id, ja.job_id, ja.job_seeker_id, ja.status, ja.cover_letter, 
                 ja.applied_at, ja.updated_at, j.title, js.name, js.email, js.phone,
                 js.title, js.location, js.summary
        ORDER BY ja.applied_at DESC
      `,
        [userEmail],
      )

      const applications = result.rows.map((row) => ({
        ...row,
        applicant_skills: row.applicant_skills || [],
      }))

      return NextResponse.json({ applications })
    } finally {
      client.release()
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

    const client = await pool.connect()

    try {
      await client.query(
        `
        UPDATE job_applications 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
        [status, applicationId],
      )

      return NextResponse.json({ success: true, message: "Application status updated" })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}
