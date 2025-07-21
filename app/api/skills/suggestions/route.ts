import { type NextRequest, NextResponse } from "next/server"

// Common skills database with proper capitalization
const COMMON_SKILLS = [
  // Frontend
  "React",
  "Vue.js",
  "Angular",
  "JavaScript",
  "TypeScript",
  "HTML",
  "CSS",
  "SASS",
  "SCSS",
  "Next.js",
  "Nuxt.js",
  "Svelte",
  "jQuery",
  "Bootstrap",
  "Tailwind CSS",
  "Material-UI",
  "Styled Components",
  "Redux",
  "MobX",
  "Webpack",
  "Vite",
  "Parcel",

  // Backend
  "Node.js",
  "Python",
  "Java",
  "C#",
  ".NET",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Scala",
  "Django",
  "Flask",
  "FastAPI",
  "Spring Boot",
  "Express.js",
  "Koa.js",
  "Laravel",
  "Ruby on Rails",
  "ASP.NET",
  "Gin",
  "Echo",

  // Databases
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "Redis",
  "Elasticsearch",
  "Cassandra",
  "DynamoDB",
  "Firebase",
  "Supabase",
  "PlanetScale",
  "CockroachDB",

  // Cloud & DevOps
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "GitLab CI",
  "GitHub Actions",
  "Terraform",
  "Ansible",
  "Nginx",
  "Apache",
  "Linux",
  "Ubuntu",

  // Mobile
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "Xamarin",
  "Ionic",
  "Cordova",

  // Data & AI
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "Jupyter",
  "R",
  "Tableau",
  "Power BI",
  "Apache Spark",
  "Hadoop",

  // Testing
  "Jest",
  "Cypress",
  "Selenium",
  "Mocha",
  "Chai",
  "Puppeteer",
  "Playwright",

  // Tools
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Jira",
  "Confluence",
  "Slack",
  "Figma",
  "Adobe XD",
  "Sketch",
  "InVision",
  "Postman",
  "Insomnia",
]

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get("q")?.toLowerCase() || ""

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Filter and sort suggestions
    const suggestions = COMMON_SKILLS.filter((skill) => skill.toLowerCase().includes(query))
      .sort((a, b) => {
        // Prioritize exact matches and starts-with matches
        const aLower = a.toLowerCase()
        const bLower = b.toLowerCase()

        if (aLower.startsWith(query) && !bLower.startsWith(query)) return -1
        if (!aLower.startsWith(query) && bLower.startsWith(query)) return 1

        return a.localeCompare(b)
      })
      .slice(0, 10) // Limit to 10 suggestions

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error fetching skill suggestions:", error)
    return NextResponse.json({ suggestions: [] })
  }
}
