import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ObjectId } from "mongodb"
import type { User, JobSeeker, JobSeekerSkill } from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    console.log(`Fetching profile for email: ${email}`)
    const db = await getDatabase()

    // Get job seeker profile with better error handling
    const jobSeeker = await db.collection<JobSeeker>("job_seekers").findOne({ email })

    if (!jobSeeker) {
      console.log(`No profile found for ${email}`)
      return NextResponse.json({ profile: null })
    }

    console.log(`Profile found for ${email}:`, {
      name: jobSeeker.name,
      title: jobSeeker.title,
      skillsCount: jobSeeker.skills?.length || 0,
      skills:
        jobSeeker.skills?.map((s) => `${s.skillName} (${s.yearsOfExperience}y) ${s.isVerified ? "✓" : "○"}`) || [],
    })

    // Format the response to match what the frontend expects
    const formattedProfile = {
      title: jobSeeker.title || "",
      location: jobSeeker.location || "",
      experience_years: jobSeeker.experienceYears || 0,
      summary: jobSeeker.summary || "",
      phone: jobSeeker.phone || "",
      skills:
        jobSeeker.skills?.map((skill) => ({
          skill: skill.skillName,
          experience: skill.yearsOfExperience,
          isVerified: skill.isVerified || false,
          verificationScore: skill.verificationScore,
          category: skill.category,
        })) || [],
    }

    return NextResponse.json({ profile: formattedProfile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()
    const { name, email, title, location, experience_years, summary, skills, phone } = profileData

    console.log(`Saving profile for email: ${email}`)
    console.log(`Profile data:`, { name, title, location, experience_years, skillsCount: skills?.length })

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // First, ensure user exists in users collection
    console.log("Creating/updating user...")
    const userResult = await db.collection<User>("users").findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          email,
          userType: "job_seeker" as const,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    )

    const userId = userResult._id

    // Process skills - Fixed version with verification status
    const processedSkills: JobSeekerSkill[] = []
    if (skills && Array.isArray(skills) && skills.length > 0) {
      console.log("Processing skills:", skills)

      for (const skillData of skills) {
        let skillName: string
        let skillExperience: number
        let isVerified = false
        let verificationScore: number | undefined
        let category = "General"

        // Handle both string and object formats
        if (typeof skillData === "string") {
          skillName = skillData.trim()
          skillExperience = Math.min(experience_years || 1, 10)
        } else if (skillData && typeof skillData === "object") {
          skillName = (skillData.skill || skillData.skillName || "").trim()
          skillExperience = skillData.experience || skillData.yearsOfExperience || 1
          isVerified = skillData.isVerified || false
          verificationScore = skillData.verificationScore
          category = skillData.category || "General"
        } else {
          continue
        }

        if (!skillName || skillName.length === 0) {
          console.log("Skipping empty skill")
          continue
        }

        // Determine proficiency level based on experience
        let proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert" = "beginner"
        if (skillExperience >= 5) proficiencyLevel = "expert"
        else if (skillExperience >= 3) proficiencyLevel = "advanced"
        else if (skillExperience >= 1) proficiencyLevel = "intermediate"

        // Determine category if not provided
        if (category === "General") {
          const frontendSkills = [
            "react",
            "vue",
            "angular",
            "javascript",
            "typescript",
            "html",
            "css",
            "next.js",
            "nuxt.js",
          ]
          const backendSkills = [
            "node.js",
            "python",
            "django",
            "flask",
            "java",
            "spring",
            "c#",
            ".net",
            "php",
            "ruby",
            "go",
            "rust",
          ]
          const databaseSkills = ["mongodb", "postgresql", "mysql", "redis", "sqlite"]
          const cloudSkills = ["aws", "azure", "docker", "kubernetes", "gcp", "google cloud"]

          const skillLower = skillName.toLowerCase()
          if (frontendSkills.some((s) => skillLower.includes(s) || s.includes(skillLower))) category = "Frontend"
          else if (backendSkills.some((s) => skillLower.includes(s) || s.includes(skillLower))) category = "Backend"
          else if (databaseSkills.some((s) => skillLower.includes(s) || s.includes(skillLower))) category = "Database"
          else if (cloudSkills.some((s) => skillLower.includes(s) || s.includes(skillLower))) category = "Cloud"
        }

        const processedSkill: JobSeekerSkill = {
          skillName,
          category,
          proficiencyLevel,
          yearsOfExperience: skillExperience,
          isPrimary: false,
          isVerified,
          verificationScore,
          verifiedAt: isVerified ? new Date() : undefined,
        }

        processedSkills.push(processedSkill)
        console.log("Added skill:", processedSkill)
      }
    }

    console.log(`Processed ${processedSkills.length} skills total`)

    // Insert or update job seeker profile
    console.log("Creating/updating job seeker profile...")
    const jobSeekerData: Partial<JobSeeker> = {
      userId: userId as ObjectId,
      email,
      name,
      phone: phone || undefined,
      title: title || undefined,
      location: location || undefined,
      experienceYears: experience_years || 0,
      summary: summary || undefined,
      availability: "available",
      preferredCurrency: "USD",
      remoteWork: true,
      willingToRelocate: false,
      skills: processedSkills,
      updatedAt: new Date(),
    }

    const result = await db.collection<JobSeeker>("job_seekers").findOneAndUpdate(
      { email },
      {
        $set: jobSeekerData,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    )

    console.log("Profile saved successfully")
    return NextResponse.json({ success: true, message: "Profile saved successfully" })
  } catch (error) {
    console.error("Profile save error:", error)
    return NextResponse.json(
      {
        error: "Failed to save profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
