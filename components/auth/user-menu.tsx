"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOutUser } from "@/lib/firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import AuthModal from "./auth-modal"

interface UserMenuProps {
  onDashboardClick?: () => void
}

export default function UserMenu({ onDashboardClick }: UserMenuProps) {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    const result = await signOutUser()
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Signed Out",
        description: "You've been signed out successfully",
      })
    }
  }

  if (!user) {
    return (
      <>
        <Button onClick={() => setShowAuthModal(true)} variant="outline">
          Sign In
        </Button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    )
  }

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          {userProfile && (
            <p className="text-xs leading-none text-muted-foreground capitalize">{userProfile.plan} Plan</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDashboardClick}>Dashboard</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
