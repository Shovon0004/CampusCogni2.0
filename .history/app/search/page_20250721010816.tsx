"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, User, MapPin, Calendar, Star, Briefcase } from "lucide-react"
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Talent</h1>
          <p className="text-lg text-gray-600">Find the perfect candidates with AI-powered search</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="e.g., I need 2 years React dev and 1 year Next dev, 3 years Python with 2 years Django..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 text-lg py-6"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching} className="px-8 py-6 text-lg">
                  {searching ? "Searching..." : "Search"}
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
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Search Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{results.query_analysis}</p>
                </CardContent>
              </Card>
            )}

            {/* Direct Matches */}
            {results?.direct_matches && results.direct_matches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Direct Matches ({results.direct_matches.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.direct_matches.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </div>
            )}

            {/* Indirect Matches */}
            {results?.indirect_matches && results.indirect_matches.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Related Matches ({results.indirect_matches.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.indirect_matches.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </div>
            )}

            {results &&
              (!results.direct_matches || results.direct_matches.length === 0) &&
              (!results.indirect_matches || results.indirect_matches.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 text-lg">No candidates found matching your criteria.</p>
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{candidate.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {candidate.title}
              </CardDescription>
            </div>
          </div>
          <Badge variant={candidate.match_type === "direct" ? "default" : "secondary"}>
            {candidate.match_type === "direct" ? "Direct Match" : "Related Match"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {candidate.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {candidate.experience_years} years total experience
            </div>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">{candidate.summary}</p>

          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 4} more
              </Badge>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Match Score: {Math.round(candidate.match_score * 100)}%</div>
            <Button size="sm">Contact</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
