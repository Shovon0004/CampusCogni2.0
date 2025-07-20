"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Briefcase, Star, CheckCircle, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>

        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 bg-muted/80 backdrop-blur-sm border rounded-full px-3 py-1.5 mb-6 sm:mb-8">
              <Star className="w-3 h-3 text-primary" />
              <span className="text-xs sm:text-sm font-medium">Introducing CampusCogni</span>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Campus Recruitment
              <br />
              <span className="text-primary">Reimagined</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Connect talented students with top recruiters through our intelligent platform designed for the modern
              recruitment landscape.
            </p>

            {/* CTA Buttons */}
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                <Button
                  onClick={signInWithGoogle}
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-transparent"
                >
                  Watch Demo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                <Link href="/search" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto">
                    <Search className="w-4 h-4 mr-2" />
                    Search Talent
                  </Button>
                </Link>
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-transparent"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>500+ companies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>10,000+ students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>95% satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Why Choose CampusCogni?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Our platform combines cutting-edge AI with intuitive design
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Matching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced algorithms match candidates with perfect opportunities based on skills and experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Skill Verification</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verified skills through comprehensive assessments, giving recruiters confidence in abilities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive insights and analytics for better hiring decisions and success tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-purple-500/5 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">10K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Active Students</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-500">5K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Jobs Posted</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-500">95%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Match Accuracy</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500">2K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Placements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Transform Your Recruitment?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of companies and students who have discovered the future of campus recruitment.
          </p>
          {!user ? (
            <Button
              onClick={signInWithGoogle}
              size="lg"
              variant="secondary"
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto"
            >
              Start Your Journey Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/search">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto"
                >
                  Find Talent Now
                </Button>
              </Link>
              <Link href="/post-job">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
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
