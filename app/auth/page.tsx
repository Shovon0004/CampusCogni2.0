"use client"

import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Chrome, Mail, Github, Eye, EyeOff, GraduationCap } from 'lucide-react'
import Link from "next/link"

export default function AuthPage() {
  const { user, loading, signInWithGoogle, signInWithGitHub } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)

    setTimeout(() => {
      alert("Email/Password sign-in is not yet implemented. Please use Google or GitHub.")
      console.log("Attempting to sign in with:", email, password)
      setIsEmailLoading(false)
    }, 1000)
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Google sign-in error:", error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true)
    try {
      await signInWithGitHub()
    } catch (error) {
      console.error("GitHub sign-in error:", error)
    } finally {
      setIsGitHubLoading(false)
    }
  }

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-muted rounded-full animate-spin border-t-foreground"></div>
            <GraduationCap className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Loading CampusCogni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border shadow-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-background" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Welcome to CampusCogni</CardTitle>
              <CardDescription className="text-base">
                Sign in or create an account to get started
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Sign-in Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                variant="outline"
                className="w-full h-12 justify-center"
                size="lg"
              >
                <div className="flex items-center justify-center w-full">
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 mr-3 border-2 border-muted border-t-foreground rounded-full animate-spin"></div>
                  ) : (
                    <Chrome className="w-5 h-5 mr-3" />
                  )}
                  <span>Sign in with Google</span>
                </div>
              </Button>

              <Button
                onClick={handleGitHubSignIn}
                disabled={isGitHubLoading}
                className="w-full h-12 justify-center"
                size="lg"
              >
                <div className="flex items-center justify-center w-full">
                  {isGitHubLoading ? (
                    <div className="w-5 h-5 mr-3 border-2 border-muted-foreground border-t-background rounded-full animate-spin"></div>
                  ) : (
                    <Github className="w-5 h-5 mr-3" />
                  )}
                  <span>Sign in with GitHub</span>
                </div>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-1">
                <Separator />
              </div>
              <div className="px-4">
                <span className="text-sm text-muted-foreground bg-background">OR</span>
              </div>
              <div className="flex-1">
                <Separator />
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isEmailLoading}
                variant="outline"
                className="w-full h-12 justify-center"
              >
                <div className="flex items-center justify-center w-full">
                  {isEmailLoading ? (
                    <div className="w-5 h-5 mr-3 border-2 border-muted border-t-foreground rounded-full animate-spin"></div>
                  ) : (
                    <Mail className="w-5 h-5 mr-3" />
                  )}
                  <span>Sign in with Email</span>
                </div>
              </Button>
            </form>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Terms */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to our{" "}
                <Link
                  href="#"
                  className="underline-offset-4 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
