"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, DollarSign, Building, Clock } from "lucide-react"

interface Job {
  id: number
  title: string
  company: string
  location: string
  job_type: string
  salary_min?: number
  salary_max?: number
  currency: string
  description: string
  requirements?: string
  benefits?: string
  posted_by_name: string
  created_at: string
  skills: string[]
}

export default function JobsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleApply = async (jobId: number) => {
    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          jobId,
          userEmail: user?.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Application submitted successfully!")
      } else {
        alert(data.error || "Failed to apply")
      }
    } catch (error) {
      console.error("Error applying to job:", error)
      alert("Failed to apply. Please try again.")
    }
  }

  if (loading || loadingJobs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">Discover opportunities that match your skills and experience</p>
        </div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={handleApply} />
          ))}

          {jobs.length === 0 && (
            <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-lg">No jobs available at the moment.</p>
                <p className="text-muted-foreground mt-2">Check back later for new opportunities!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, onApply }: { job: Job; onApply: (jobId: number) => void }) {
  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return null
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    return formatter.format(min || max || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-sm bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 text-base text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {job.company}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {job.job_type}
              </div>
            </CardDescription>
          </div>
          <div className="text-right">
            {formatSalary(job.salary_min, job.salary_max, job.currency) && (
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                {formatSalary(job.salary_min, job.salary_max, job.currency)}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              {formatDate(job.created_at)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground line-clamp-3">{job.description}</p>

          {job.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-2">Required Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Posted by {job.posted_by_name}</div>
            <Button onClick={() => onApply(job.id)}>Apply Now</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
