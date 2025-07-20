"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Briefcase, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Find Your Perfect Match</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a recruiter looking for top talent or a job seeker searching for your dream role, our
            AI-powered platform connects the right people at the right time.
          </p>

          {!user ? (
            <Button onClick={signInWithGoogle} size="lg" className="text-lg px-8 py-4">
              Get Started with Google
            </Button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/search">
                <Button size="lg" className="text-lg px-8 py-4">
                  Search Talent
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Search className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>AI-Powered Search</CardTitle>
              <CardDescription>Use natural language to find exactly what you're looking for</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Search with queries like "I want a 3 years React developer" and get precise matches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Job Matching</CardTitle>
              <CardDescription>Smart job recommendations based on your skills and experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get matched with opportunities that align with your expertise and career goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Dual Platform</CardTitle>
              <CardDescription>Be both a job seeker and recruiter on the same platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Switch seamlessly between finding talent for your company and exploring new opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">5K+</div>
              <div className="text-gray-600">Jobs Posted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Match Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">2K+</div>
              <div className="text-gray-600">Successful Hires</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
