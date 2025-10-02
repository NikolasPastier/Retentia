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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, Crown, BookOpen, Heart, Settings, LogOut } from "lucide-react"
import { AccountSettingsModal } from "./account-settings-modal"
import { UpgradeProModal } from "./upgrade-pro-modal"

export function UserAccountDropdown() {
  const { user, userProfile } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

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

  // Calculate remaining generations
  const maxDailyCredits = userProfile.plan === "paid" ? Number.POSITIVE_INFINITY : 1
  const remainingGenerations =
    userProfile.plan === "paid" ? "Unlimited" : Math.max(0, maxDailyCredits - userProfile.dailyGenerations)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 px-3 py-2 hover:bg-white/10 flex items-center gap-2 border border-white/20"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-white" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-72 p-0 bg-gray-900/95 backdrop-blur-xl border-white/10 text-white shadow-2xl"
          align="end"
          forceMount
        >
          {/* Plan & Generation Counter */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">
                {userProfile.plan === "paid" ? "Pro Plan" : "Free Plan"}
              </span>
              {userProfile.plan === "free" && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="text-xs text-gray-400">
              Daily: {userProfile.dailyGenerations}/{typeof remainingGenerations === "number" ? 1 : "∞"} generations
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {userProfile.plan === "free" && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:from-green-700 focus:to-emerald-700 mb-2 font-medium"
                  onClick={() => setShowUpgrade(true)}
                >
                  <Crown className="mr-3 h-4 w-4" />
                  <span>Upgrade to Pro</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
              </>
            )}

            <DropdownMenuItem className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10">
              <BookOpen className="mr-3 h-4 w-4" />
              <span>My Decks</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10">
              <Heart className="mr-3 h-4 w-4" />
              <span>Favourites</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="mr-3 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem
              className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 hover:text-red-300 focus:text-red-300"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <AccountSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <UpgradeProModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  )
}
