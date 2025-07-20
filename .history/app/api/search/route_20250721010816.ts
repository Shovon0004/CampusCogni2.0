import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDatabase } from "@/lib/mongodb"
import type { JobSeeker } from "@/lib/models/User"

const genAI = new GoogleGenerativeAI("AIzaSyDQ3PJyvaR78neOCAtfEK78hqYAucEj4wQ")

interface SkillRequirement {
  skill: string
  experience_years: number
}

interface SearchCriteria {
  skill_requirements: SkillRequirement[]
  title_keywords: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({
        direct_matches: [],
        indirect_matches: [],
        query_analysis: "Please provide a valid search query",
      })
    }

    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const analysisPrompt = `
Analyze this job search query and extract structured information:
Query: "${query}"

Please provide a JSON response with:
1. skill_requirements: array of objects with {skill: string, experience_years: number} for each skill mentioned with specific experience
2. title_keywords: array of job title keywords
3. analysis: brief explanation of the search requirements

Important: Extract EACH skill with its SPECIFIC experience requirement.

Examples:
"I need 2 years React dev and 1 year Next dev":
{
  "skill_requirements": [
    {"skill": "React", "experience_years": 2},
    {"skill": "Next.js", "experience_years": 1}
  ],
  "title_keywords": ["developer"],
  "analysis": "Looking for a developer with 2 years React experience and 1 year Next.js experience"
}
`

    // Update the try-catch block around the Gemini API call
    let searchCriteria: SearchCriteria & { analysis: string }
    try {
      const result = await model.generateContent(analysisPrompt)
      const response = await result.response
      const analysisText = response.text()

      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        searchCriteria = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (geminiError) {
      console.warn("Gemini API failed, using fallback parsing:", geminiError)
      // Fallback to manual parsing when Gemini API fails
      searchCriteria = {
        skill_requirements: extractSkillRequirements(query),
        title_keywords: extractTitleKeywords(query),
        analysis: `Searching for candidates based on: ${query}`,
      }
    }

    // Search for direct matches
    const directMatches = await searchCandidates(searchCriteria, "direct")

    // Search for indirect matches (related skills)
    const indirectMatches = await searchCandidates(searchCriteria, "indirect")

    return NextResponse.json({
      direct_matches: directMatches || [],
      indirect_matches: indirectMatches || [],
      query_analysis: searchCriteria.analysis || "Search completed",
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      {
        direct_matches: [],
        indirect_matches: [],
        query_analysis: "Search failed. Please try again.",
        error: "Search failed",
      },
      { status: 500 },
    )
  }
}

async function searchCandidates(criteria: SearchCriteria, matchType: "direct" | "indirect") {
  try {
    const db = await getDatabase()

    let matchConditions: any = {}

    if (criteria.skill_requirements.length > 0) {
      if (matchType === "direct") {
        // For direct matches, all skill requirements must be met
        const skillConditions = criteria.skill_requirements.map((req) => ({
          skills: {
            $elemMatch: {
              skillName: { $regex: new RegExp(req.skill, "i") },
              yearsOfExperience: { $gte: req.experience_years },
            },
          },
        }))

        matchConditions = { $and: skillConditions }
      } else {
        // For indirect matches, use related skills with flexible experience
        const allSkills = criteria.skill_requirements.map((req) => req.skill)
        const relatedSkills = getRelatedSkills(allSkills)
        const minExperience = Math.min(...criteria.skill_requirements.map((req) => req.experience_years)) - 1

        matchConditions = {
          skills: {
            $elemMatch: {
              skillName: { $regex: new RegExp(relatedSkills.join("|"), "i") },
              yearsOfExperience: { $gte: Math.max(0, minExperience) },
            },
          },
        }
      }
    }

    // Add title keyword matching if provided
    if (criteria.title_keywords.length > 0) {
      const titleCondition = {
        $or: [
          { title: { $regex: new RegExp(criteria.title_keywords.join("|"), "i") } },
          { summary: { $regex: new RegExp(criteria.title_keywords.join("|"), "i") } },
        ],
      }

      if (Object.keys(matchConditions).length > 0) {
        matchConditions = { $and: [matchConditions, titleCondition] }
      } else {
        matchConditions = titleCondition
      }
    }

    const candidates = await db.collection<JobSeeker>("job_seekers").find(matchConditions).limit(10).toArray()

    return candidates.map((candidate) => {
      // Calculate relevant experience and primary skill
      let relevantExperience = 0
      let primarySkill = "Unknown"

      if (candidate.skills && candidate.skills.length > 0) {
        // Find the skill with highest experience
        const topSkill = candidate.skills.reduce((prev, current) =>
          prev.yearsOfExperience > current.yearsOfExperience ? prev : current,
        )
        primarySkill = topSkill.skillName
        relevantExperience = topSkill.yearsOfExperience
      }

      return {
        id: candidate._id?.toString(),
        name: candidate.name,
        title: candidate.title || "Job Seeker",
        location: candidate.location || "Not specified",
        experience_years: candidate.experienceYears,
        relevant_experience: relevantExperience,
        primary_skill: primarySkill,
        skills: candidate.skills?.map((s) => s.skillName) || [],
        email: candidate.email,
        phone: candidate.phone || "",
        summary: candidate.summary || "",
        match_type: matchType,
        match_score: matchType === "direct" ? 1.0 : 0.7,
      }
    })
  } catch (error) {
    console.error("Database search error:", error)
    return []
  }
}

function extractSkillRequirements(query: string): SkillRequirement[] {
  const requirements: SkillRequirement[] = []

  // Pattern: "X years SkillName" or "X year SkillName"
  const patterns = [
    /(\d+)\s+years?\s+([A-Za-z][A-Za-z0-9.+\-\s]*?)(?:\s+(?:dev|developer|engineer|programmer)|$|,|\sand\s)/gi,
    /([A-Za-z][A-Za-z0-9.+\-\s]*?)\s+(?:with\s+)?(\d+)\s+years?/gi,
  ]

  const commonSkills = [
    "React",
    "Vue.js",
    "Vue",
    "Angular",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Next.js",
    "Nuxt.js",
    "Python",
    "Django",
    "Flask",
    "FastAPI",
    "Java",
    "Spring",
    "C++",
    "C#",
    ".NET",
    "PHP",
    "Laravel",
    "Ruby",
    "Rails",
    "Go",
    "Rust",
    "HTML",
    "CSS",
    "SASS",
    "Tailwind",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(query)) !== null) {
      let skill, experience

      if (pattern.source.includes("years?\\s+([A-Za-z]")) {
        experience = Number.parseInt(match[1])
        skill = match[2].trim()
      } else {
        skill = match[1].trim()
        experience = Number.parseInt(match[2])
      }

      const matchedSkill = commonSkills.find(
        (s) => s.toLowerCase() === skill.toLowerCase() || skill.toLowerCase().includes(s.toLowerCase()),
      )

      if (matchedSkill && experience > 0) {
        requirements.push({
          skill: matchedSkill,
          experience_years: experience,
        })
      }
    }
  }

  return requirements
}

function extractTitleKeywords(query: string): string[] {
  const titles = ["developer", "engineer", "programmer", "architect", "lead", "senior", "junior"]
  return titles.filter((title) => query.toLowerCase().includes(title))
}

function getRelatedSkills(skills: string[]): string[] {
  const skillMap: Record<string, string[]> = {
    react: ["javascript", "typescript", "jsx", "redux", "next.js"],
    vue: ["javascript", "typescript", "nuxt.js"],
    angular: ["typescript", "javascript", "rxjs"],
    "next.js": ["react", "javascript", "typescript"],
    "node.js": ["javascript", "typescript", "express"],
    python: ["django", "flask", "fastapi"],
    java: ["spring", "hibernate"],
    javascript: ["react", "vue", "angular", "node.js"],
  }

  const related = new Set<string>()

  skills.forEach((skill) => {
    const key = skill.toLowerCase()
    if (skillMap[key]) {
      skillMap[key].forEach((relatedSkill) => related.add(relatedSkill))
    }
  })

  return Array.from(related)
}
