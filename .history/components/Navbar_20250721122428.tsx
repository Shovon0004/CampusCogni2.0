"use client"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Briefcase, User, LogOut, Settings, BarChart3, Building, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useState } from "react"

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const NavLinks = () => (
    <>
      <Link href="/search" onClick={() => setIsOpen(false)}>
        <Button variant="ghost" size="sm" className="justify-start">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </Link>
      <Link href="/jobs" onClick={() => setIsOpen(false)}>
        <Button variant="ghost" size="sm" className="justify-start">
          <Briefcase className="w-4 h-4 mr-2" />
          Jobs
        </Button>
      </Link>
      <Link href="/post-job" onClick={() => setIsOpen(false)}>
        <Button variant="outline" size="sm" className="justify-start bg-transparent">
          <Briefcase className="w-4 h-4 mr-2" />
          Post Job
        </Button>
      </Link>
      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
        <Button variant="ghost" size="sm" className="justify-start">
          <BarChart3 className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </Link>
    </>
  )

  return (
    <nav className="bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground hidden sm:block">CampusCogni</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <ThemeToggle />
            {user ? (
              <>
                <div className="flex items-center space-x-1 mr-2">
                  <NavLinks />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} crossOrigin="anonymous" />
                        <AvatarFallback className="text-xs">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.displayName && <p className="font-medium text-sm">{user.displayName}</p>}
                        {user.email && <p className="w-[180px] truncate text-xs text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} crossOrigin="anonymous" />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <NavLinks />
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/settings" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                      <Button onClick={logout} variant="ghost" size="sm" className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Link href="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
