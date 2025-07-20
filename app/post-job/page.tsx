"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Save } from "lucide-react"

export default function PostJobPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "full-time",
    salary_min: "",
    salary_max: "",
    currency: "USD",
    description: "",
    requirements: "",
    benefits: "",
    skills: [] as string[],
  })
  const [newSkill, setNewSkill] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  const addSkill = () => {
    if (newSkill.trim() && !job.skills.includes(newSkill.trim())) {
      setJob((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setJob((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPosting(true)

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          ...job,
          salary_min: job.salary_min ? Number.parseInt(job.salary_min) : null,
          salary_max: job.salary_max ? Number.parseInt(job.salary_max) : null,
          posted_by: user?.email,
          posted_by_name: user?.displayName,
        }),
      })

      if (response.ok) {
        alert("Job posted successfully!")
        router.push("/jobs")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to post job")
      }
    } catch (error) {
      console.error("Error posting job:", error)
      alert("Failed to post job. Please try again.")
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Post a Job</h1>
            <p className="text-muted-foreground">Find the perfect candidate for your open position</p>
          </div>

          <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Provide detailed information about the position</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      required
                      placeholder="e.g., Senior React Developer"
                      value={job.title}
                      onChange={(e) => setJob((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      required
                      placeholder="e.g., TechCorp Inc."
                      value={job.company}
                      onChange={(e) => setJob((prev) => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      required
                      placeholder="e.g., San Francisco, CA or Remote"
                      value={job.location}
                      onChange={(e) => setJob((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={job.job_type}
                      onValueChange={(value) => setJob((prev) => ({ ...prev, job_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="salary_min">Min Salary</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      placeholder="50000"
                      value={job.salary_min}
                      onChange={(e) => setJob((prev) => ({ ...prev, salary_min: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary_max">Max Salary</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      placeholder="80000"
                      value={job.salary_max}
                      onChange={(e) => setJob((prev) => ({ ...prev, salary_max: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={job.currency}
                      onValueChange={(value) => setJob((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    required
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={6}
                    value={job.description}
                    onChange={(e) => setJob((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the required qualifications, experience, and skills..."
                    rows={4}
                    value={job.requirements}
                    onChange={(e) => setJob((prev) => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Describe the benefits, perks, and compensation package..."
                    rows={3}
                    value={job.benefits}
                    onChange={(e) => setJob((prev) => ({ ...prev, benefits: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Required Skills</Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add a required skill (e.g., React, Python, AWS)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={posting} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {posting ? "Posting..." : "Post Job"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
