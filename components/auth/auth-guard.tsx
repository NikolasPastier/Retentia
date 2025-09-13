"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import AuthModal from "./auth-modal"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, fallback, requireAuth = false }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <>
        {fallback || (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Please sign in to continue</p>
            <button onClick={() => setShowAuthModal(true)} className="text-primary hover:underline">
              Sign In
            </button>
          </div>
        )}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    )
  }

  return <>{children}</>
}
