"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Users, Eye, Filter, MapPin, Calendar, User, Mail, Phone } from "lucide-react"

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
  created_at: string
  applications_count: number
  skills: string[]
}

interface Application {
  id: number
  job_id: number
  job_title: string
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  applicant_title: string
  applicant_location: string
  applicant_summary: string
  applicant_skills: Array<{ skill: string; experience: number }>
  status: string
  applied_at: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchFilter, setSearchFilter] = useState("")
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        fetch(`/api/dashboard/jobs?email=${user?.email}`, {
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }),
        fetch(`/api/dashboard/applications?email=${user?.email}`, {
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }),
      ])

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        setJobs(jobsData.jobs || [])
      }

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        setApplications(applicationsData.applications || [])
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/dashboard/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({ applicationId, status: newStatus }),
      })

      if (response.ok) {
        setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
      }
    } catch (error) {
      console.error("Error updating application status:", error)
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesSearch =
      searchFilter === "" ||
      app.applicant_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.applicant_title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.applicant_skills.some((skill) => skill.skill.toLowerCase().includes(searchFilter.toLowerCase()))
    const matchesJob = selectedJobId === null || app.job_id === selectedJobId

    return matchesStatus && matchesSearch && matchesJob
  })

  if (loading || loadingData) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and review applications</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applications.length}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter((app) => app.status === "pending").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{app.applicant_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Applied for {app.job_title} • {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={app.status === "pending" ? "secondary" : "default"}>{app.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.applications_count} applications
                          </span>
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedJobId(job.id)
                          // Switch to applications tab
                          const applicationsTab = document.querySelector('[value="applications"]') as HTMLElement
                          applicationsTab?.click()
                        }}
                      >
                        View Applications
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{job.description.substring(0, 200)}...</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {jobs.length === 0 && (
                <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground text-lg">No jobs posted yet.</p>
                    <Button className="mt-4" onClick={() => router.push("/post-job")}>
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="space-y-6">
              {/* Filters */}
              <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="text-sm font-medium">Job</label>
                      <Select
                        value={selectedJobId?.toString() || "all"}
                        onValueChange={(value) => setSelectedJobId(value === "all" ? null : Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Jobs</SelectItem>
                          {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Search</label>
                      <Input
                        placeholder="Search by name, title, or skills..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <Card key={app.id} className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{app.applicant_name}</CardTitle>
                            <CardDescription>{app.applicant_title}</CardDescription>
                            <p className="text-sm text-muted-foreground mt-1">Applied for: {app.job_title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={app.status === "pending" ? "secondary" : "default"}>{app.status}</Badge>
                          <Select value={app.status} onValueChange={(value) => updateApplicationStatus(app.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {app.applicant_location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Applied {new Date(app.applied_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {app.applicant_email}
                          </div>
                          {app.applicant_phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              {app.applicant_phone}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">{app.applicant_summary}</p>

                        <div>
                          <h4 className="font-medium text-sm text-foreground mb-2">Skills & Experience:</h4>
                          <div className="flex flex-wrap gap-2">
                            {app.applicant_skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill.skill} ({skill.experience}y)
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            View Full Profile
                          </Button>
                          <Button size="sm">Contact Applicant</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredApplications.length === 0 && (
                  <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground text-lg">No applications found matching your filters.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
