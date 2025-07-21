"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth" // Import GithubAuthProvider
import { auth, googleProvider, githubProvider } from "@/lib/firebase" // Import githubProvider

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void> // Add GitHub sign-in to type
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  const signInWithGitHub = async () => {
    // Implement GitHub sign-in
    try {
      await signInWithPopup(auth, githubProvider)
    } catch (error) {
      console.error("Error signing in with GitHub:", error)
      // Handle specific GitHub errors, e.g., account-exists-with-different-credential
      if ((error as any).code === "auth/account-exists-with-different-credential") {
        alert(
          "An account with this email already exists using a different sign-in method. Please sign in with your existing method.",
        )
      }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithGitHub, // Provide GitHub sign-in function
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
