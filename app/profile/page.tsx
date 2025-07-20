"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { X, Save, User, Award } from "lucide-react"
import { SkillVerificationModal } from "@/components/SkillVerificationModal"
import { SkillInput } from "@/components/SkillInput"

interface SkillWithVerification {
  skill: string
  experience: number
  isVerified?: boolean
  verificationScore?: number
  category?: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState({
    title: "",
    location: "",
    experience_years: 0,
    summary: "",
    skillsWithExperience: [] as SkillWithVerification[],
    phone: "",
  })
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    skillName: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/profile?email=${user?.email}`, {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Loaded profile data:", data)

        if (data.profile) {
          setProfile({
            title: data.profile.title || "",
            location: data.profile.location || "",
            experience_years: data.profile.experience_years || 0,
            summary: data.profile.summary || "",
            phone: data.profile.phone || "",
            skillsWithExperience: data.profile.skills || [],
          })
          console.log("Profile state updated with skills:", data.profile.skills)
        }
      } else {
        console.error("Failed to load profile:", response.status)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleAddSkill = (skill: string, experience: number) => {
    if (!profile.skillsWithExperience.some((s) => s.skill.toLowerCase() === skill.toLowerCase())) {
      setProfile((prev) => ({
        ...prev,
        skillsWithExperience: [
          ...prev.skillsWithExperience,
          {
            skill: skill,
            experience: experience,
            isVerified: false,
          },
        ],
      }))
    }
  }

  const removeSkillWithExperience = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skillsWithExperience: prev.skillsWithExperience.filter((skillExp) => skillExp.skill !== skillToRemove),
    }))
  }

  const handleVerifySkill = (skillName: string) => {
    setVerificationModal({
      isOpen: true,
      skillName,
    })
  }

  const handleVerificationComplete = () => {
    // Reload profile to get updated verification status
    loadProfile()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (!user?.email || !user?.displayName) {
        throw new Error("User information is missing")
      }

      console.log("Saving profile with skills:", profile.skillsWithExperience)

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          ...profile,
          email: user.email,
          name: user.displayName,
          skills: profile.skillsWithExperience,
        }),
      })

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server response not ok:", response.status, errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      // Try to parse JSON
      let data
      try {
        const responseText = await response.text()
        console.log("Raw response:", responseText)
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("Invalid response from server")
      }

      console.log("Save response:", data)

      if (data.success) {
        alert("Profile saved successfully!")
        // Reload the profile to verify it was saved
        await loadProfile()
      } else {
        console.error("Server error:", data)
        throw new Error(data.error || data.details || "Failed to save profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert(`Failed to save profile: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingProfile) {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Complete your profile to get better job matches and be discovered by recruiters
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Profile Info */}
            <div className="md:col-span-1">
              <Card className="border-0 shadow-sm bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL || "/placeholder.svg"}
                          alt={user.displayName || ""}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{user.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="md:col-span-2">
              <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Tell us about your professional background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Senior React Developer"
                        value={profile.title}
                        onChange={(e) => setProfile((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., San Francisco, CA"
                        value={profile.location}
                        onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="5"
                        value={profile.experience_years}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, experience_years: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={profile.phone}
                        onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      placeholder="Tell us about your experience, achievements, and what you're looking for..."
                      rows={4}
                      value={profile.summary}
                      onChange={(e) => setProfile((prev) => ({ ...prev, summary: e.target.value }))}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label>Skills & Experience</Label>
                    <div className="mb-3">
                      <SkillInput onAddSkill={handleAddSkill} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsWithExperience.map((skillExp, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-2">
                          {/* Verification Status Indicator */}
                          <div
                            className={`w-3 h-3 rounded-full ${skillExp.isVerified ? "bg-blue-500" : "bg-green-500"}`}
                            title={skillExp.isVerified ? `Verified (${skillExp.verificationScore}%)` : "Not verified"}
                          />
                          <span>{skillExp.skill}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">{skillExp.experience}y</span>

                          {/* Verify Button */}
                          {!skillExp.isVerified && (
                            <button
                              onClick={() => handleVerifySkill(skillExp.skill)}
                              className="ml-1 hover:text-blue-500"
                              title="Take verification exam"
                            >
                              <Award className="w-3 h-3" />
                            </button>
                          )}

                          {/* Remove Button */}
                          <button
                            onClick={() => removeSkillWithExperience(skillExp.skill)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {profile.skillsWithExperience.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Add your skills with years of experience to get better job matches
                      </p>
                    )}

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Not verified</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Verified</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Take exam to verify</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Verification Modal */}
      <SkillVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, skillName: "" })}
        skillName={user?.email || ""}
        userEmail={user?.email || ""}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  )
}
