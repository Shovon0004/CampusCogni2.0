"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, User, MapPin, Calendar, Star, Briefcase, CheckCircle, Sparkles, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface JobSeeker {
  id: number
  name: string
  title: string
  location: string
  experience_years: number
  relevant_experience: number
  primary_skill: string
  skills: string[]
  email: string
  phone: string
  summary: string
  match_type: "direct" | "indirect"
  match_score: number
  leetcode_url?: string
  verified_skills?: Array<{
    skill: string
    isVerified: boolean
    verificationScore?: number
  }>
}

interface SearchResults {
  direct_matches?: JobSeeker[]
  indirect_matches?: JobSeeker[]
  query_analysis?: string
}

export default function SearchPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setResults({
        direct_matches: data.direct_matches || [],
        indirect_matches: data.indirect_matches || [],
        query_analysis: data.query_analysis || "Search completed",
      })
    } catch (error) {
      console.error("Search failed:", error)
      setResults({
        direct_matches: [],
        indirect_matches: [],
        query_analysis: "Search failed. Please try again.",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Search Talent</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Find the perfect candidates with AI-powered search
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="e.g., I need 2 years React dev and 1 year Next dev..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 text-sm sm:text-base py-3 sm:py-4 border-0 bg-muted/50"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
                >
                  {searching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {results && (
          <div className="max-w-6xl mx-auto">
            {/* Query Analysis */}
            {results.query_analysis && (
              <Card className="mb-6 border-0 shadow-sm bg-primary/5 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Star className="w-4 h-4" />
                    Search Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm sm:text-base text-muted-foreground">{results.query_analysis}</p>
                </CardContent>
              </Card>
            )}

            {/* Direct Matches */}
            {results?.direct_matches && results.direct_matches.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Direct Matches ({results.direct_matches.length})
                </h2>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  {results.direct_matches.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </div>
            )}

            {/* Indirect Matches */}
            {results?.indirect_matches && results.indirect_matches.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Related Matches ({results.indirect_matches.length})
                </h2>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  {results.indirect_matches.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </div>
            )}

            {results &&
              (!results.direct_matches || results.direct_matches.length === 0) &&
              (!results.indirect_matches || results.indirect_matches.length === 0) && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-base sm:text-lg">
                      No candidates found matching your criteria.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Try adjusting your search terms or requirements.
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

function CandidateCard({ candidate }: { candidate: JobSeeker }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-background/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">{candidate.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                <Briefcase className="w-3 h-3" />
                {candidate.title}
              </CardDescription>
            </div>
          </div>
          <Badge variant={candidate.match_type === "direct" ? "default" : "secondary"} className="text-xs">
            {candidate.match_type === "direct" ? "Direct" : "Related"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {candidate.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {candidate.experience_years}y exp
            </div>
            {candidate.leetcode_url && (
              <a
                href={candidate.leetcode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                <LinkIcon className="w-3 h-3" />
                LeetCode
              </a>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{candidate.summary}</p>

          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 4).map((skill, index) => {
              const verifiedSkill = candidate.verified_skills?.find(
                (vs) => vs.skill.toLowerCase() === skill.toLowerCase(),
              )
              const isVerified = verifiedSkill?.isVerified || false

              return (
                <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                  {isVerified && <CheckCircle className="w-2.5 h-2.5 text-blue-500" />}
                  {skill}
                  {isVerified && verifiedSkill?.verificationScore && (
                    <span className="text-blue-600 font-medium">({verifiedSkill.verificationScore}%)</span>
                  )}
                </Badge>
              )
            })}
            {candidate.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 4}
              </Badge>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Match: {Math.round(candidate.match_score * 100)}%
            </div>
            <Button size="sm" className="text-xs px-3 py-1">
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
