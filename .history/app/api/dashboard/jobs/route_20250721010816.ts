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
          j.*,
          array_agg(DISTINCT s.skill_name) as skills,
          COUNT(DISTINCT ja.id) as applications_count
        FROM jobs j
        LEFT JOIN job_skills js ON j.id = js.job_id
        LEFT JOIN skills s ON js.skill_id = s.id
        LEFT JOIN job_applications ja ON j.id = ja.job_id
        WHERE j.posted_by = $1
        GROUP BY j.id, j.title, j.company, j.location, j.job_type, j.salary_min, j.salary_max, 
                 j.currency, j.description, j.requirements, j.benefits, j.posted_by, 
                 j.posted_by_name, j.status, j.created_at, j.updated_at
        ORDER BY j.created_at DESC
      `,
        [userEmail],
      )

      const jobs = result.rows.map((row) => ({
        ...row,
        skills: row.skills.filter(Boolean),
        applications_count: Number.parseInt(row.applications_count) || 0,
      }))

      return NextResponse.json({ jobs })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
