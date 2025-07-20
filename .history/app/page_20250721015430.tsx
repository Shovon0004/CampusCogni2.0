"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Briefcase, Star, CheckCircle, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 bg-muted/50 backdrop-blur-sm border rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Introducing CampusCogni</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Campus Recruitment
              <br />
              <span className="text-primary">Reimagined</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect talented students with top recruiters through our intelligent platform designed for the modern
              recruitment landscape.
            </p>

            {/* CTA Buttons */}
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button onClick={signInWithGoogle} size="lg" className="text-lg px-8 py-6 h-auto">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto bg-transparent">
                  Watch Demo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/search">
                  <Button size="lg" className="text-lg px-8 py-6 h-auto">
                    <Search className="w-5 h-5 mr-2" />
                    Search Talent
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto bg-transparent">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Trusted by 500+ companies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>10,000+ students placed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>95% satisfaction rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose CampusCogni?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with intuitive design to revolutionize campus recruitment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">AI-Powered Matching</CardTitle>
                <CardDescription className="text-base">
                  Advanced algorithms match candidates with perfect opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Our intelligent system analyzes skills, experience, and preferences to create perfect matches between
                  students and recruiters.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle className="text-xl">Skill Verification</CardTitle>
                <CardDescription className="text-base">
                  Verified skills with AI-powered assessments and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Students can verify their skills through comprehensive assessments, giving recruiters confidence in
                  their abilities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl">Smart Analytics</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive insights and analytics for better hiring decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Get detailed analytics on your recruitment process, candidate quality, and hiring success rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-primary">10K+</div>
                  <div className="text-muted-foreground font-medium">Active Students</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-green-500">5K+</div>
                  <div className="text-muted-foreground font-medium">Jobs Posted</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-purple-500">95%</div>
                  <div className="text-muted-foreground font-medium">Match Accuracy</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-orange-500">2K+</div>
                  <div className="text-muted-foreground font-medium">Successful Placements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Recruitment?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of companies and students who have already discovered the future of campus recruitment.
          </p>
          {!user ? (
            <Button onClick={signInWithGoogle} size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
              Start Your Journey Today
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/search">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
                  Find Talent Now
                </Button>
              </Link>
              <Link href="/post-job">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                >
                  Post Your First Job
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
