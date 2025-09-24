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
import {
  Crown,
  Settings,
  UserPlus,
  Plus,
  Gift,
  HelpCircle,
  Moon,
  LogOut,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react"

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
        <Button variant="ghost" className="relative h-10 w-auto px-3 py-2 hover:bg-white/10">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg" alt={displayName} />
            <AvatarFallback className="bg-pink-600 text-white text-sm font-medium">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block font-medium text-sm text-white">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0 bg-gray-900 border-gray-700 text-white" align="end" forceMount>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg" alt={displayName} />
              <AvatarFallback className="bg-pink-600 text-white text-lg font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{displayName}</p>
              <p className="text-sm text-gray-400 truncate">{userProfile.email}</p>
            </div>
          </div>
        </div>

        {userProfile.plan === "free" && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-white">Turn Pro</span>
              </div>
              <Button size="sm" className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Upgrade
              </Button>
            </div>
          </div>
        )}

        <div className="px-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Credits</span>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-300">
                  {typeof remainingCredits === "number" ? `${remainingCredits} left` : remainingCredits}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {userProfile.plan === "free" && (
              <>
                <Progress
                  value={((maxDailyCredits - userProfile.dailyGenerations) / maxDailyCredits) * 100}
                  className="h-2 bg-gray-700"
                />
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>Daily credits reset at midnight UTC</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Workspaces (1)</h3>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-pink-600 text-white text-sm font-medium">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {userProfile.plan === "free" ? "FREE" : "PRO"}
                  </p>
                </div>
              </div>
              <Check className="h-4 w-4 text-green-500" />
            </div>

            <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors w-full text-left">
              <Plus className="h-4 w-4" />
              <span>Create new workspace</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700" />

        <div className="p-2">
          <DropdownMenuItem className="cursor-pointer text-white hover:bg-gray-800 focus:bg-gray-800">
            <Gift className="mr-3 h-4 w-4" />
            <span>Get free credits</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer text-white hover:bg-gray-800 focus:bg-gray-800">
            <HelpCircle className="mr-3 h-4 w-4" />
            <span>Help Center</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer text-white hover:bg-gray-800 focus:bg-gray-800">
            <Moon className="mr-3 h-4 w-4" />
            <span>Appearance</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-700" />

          <DropdownMenuItem
            className="cursor-pointer text-white hover:bg-gray-800 focus:bg-gray-800"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
