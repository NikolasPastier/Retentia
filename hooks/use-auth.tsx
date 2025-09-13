"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChange } from "@/lib/firebase/auth"
import { getUserProfile, type UserProfile } from "@/lib/firebase/firestore"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid)
      setUserProfile(profile)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user)
      if (user) {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}
