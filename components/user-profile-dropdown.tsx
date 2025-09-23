"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { signOutUser } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Crown, CreditCard, BarChart3, Settings, LogOut, Clock } from "lucide-react"

export function UserProfileDropdown() {
  const { user, userProfile } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (!user || !userProfile) return null

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutUser()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Calculate remaining credits (free users get 1 per day)
  const maxDailyCredits = userProfile.plan === "paid" ? Number.POSITIVE_INFINITY : 1
  const remainingCredits =
    userProfile.plan === "paid" ? "Unlimited" : Math.max(0, maxDailyCredits - userProfile.dailyGenerations)

  // Get user initials for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  const initials = getInitials(userProfile.displayName, userProfile.email)
  const displayName = userProfile.displayName || userProfile.email.split("@")[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-3 py-2">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg" alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block font-medium text-sm">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        {/* User Info Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg" alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
            </div>
          </div>
        </div>

        {/* Premium Upgrade Section */}
        {userProfile.plan === "free" && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Turn Pro</span>
              </div>
              <Button size="sm" className="h-8 px-3 text-xs">
                Upgrade
              </Button>
            </div>
          </div>
        )}

        {/* Credits Section */}
        <div className="p-4 border-b">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Credits</span>
              <span className="text-sm text-muted-foreground">
                {typeof remainingCredits === "number" ? `${remainingCredits} left` : remainingCredits}
              </span>
            </div>

            {userProfile.plan === "free" && (
              <>
                <Progress
                  value={((maxDailyCredits - userProfile.dailyGenerations) / maxDailyCredits) * 100}
                  className="h-2"
                />
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Daily credits reset at midnight UTC</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuItem className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Study Dashboard</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>

          {userProfile.plan === "free" && (
            <DropdownMenuItem className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Buy Premium</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
