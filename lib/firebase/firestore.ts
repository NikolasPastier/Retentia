import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"
import type { UserProfile } from "./auth"

// Study session interface
export interface StudySession {
  id?: string
  userId: string
  title: string
  questions: any[]
  createdAt: Date
  transcript?: string
  fileContent?: string
}

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        lastGenerationReset: data.lastGenerationReset.toDate(),
      } as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...updates,
      ...(updates.createdAt && { createdAt: Timestamp.fromDate(updates.createdAt) }),
      ...(updates.lastGenerationReset && { lastGenerationReset: Timestamp.fromDate(updates.lastGenerationReset) }),
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Save study session
export const saveStudySession = async (session: Omit<StudySession, "id">): Promise<string | null> => {
  try {
    const sessionsRef = collection(db, "studySessions")
    const docRef = await addDoc(sessionsRef, {
      ...session,
      createdAt: Timestamp.fromDate(session.createdAt),
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving study session:", error)
    return null
  }
}

// Get user's study sessions
export const getUserStudySessions = async (userId: string): Promise<StudySession[]> => {
  try {
    const sessionsRef = collection(db, "studySessions")
    const q = query(sessionsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as StudySession[]
  } catch (error) {
    console.error("Error getting study sessions:", error)
    return []
  }
}

// Check if user can generate questions (plan limits)
export const canUserGenerate = async (uid: string): Promise<{ canGenerate: boolean; reason?: string }> => {
  try {
    const userProfile = await getUserProfile(uid)
    if (!userProfile) return { canGenerate: false, reason: "User profile not found" }

    // Paid users can always generate
    if (userProfile.plan === "paid") {
      return { canGenerate: true }
    }

    // Check if it's a new day (reset daily limit)
    const now = new Date()
    const lastReset = userProfile.lastGenerationReset
    const isNewDay = now.toDateString() !== lastReset.toDateString()

    if (isNewDay) {
      // Reset daily generations
      await updateUserProfile(uid, {
        dailyGenerations: 0,
        lastGenerationReset: now,
      })
      return { canGenerate: true }
    }

    // Check daily limit for free users
    if (userProfile.dailyGenerations >= 1) {
      return { canGenerate: false, reason: "Daily limit reached. Upgrade to paid plan for unlimited generations." }
    }

    return { canGenerate: true }
  } catch (error) {
    console.error("Error checking generation limits:", error)
    return { canGenerate: false, reason: "Error checking limits" }
  }
}

// Increment user's generation count
export const incrementGenerationCount = async (uid: string) => {
  try {
    const userProfile = await getUserProfile(uid)
    if (!userProfile) return { error: "User profile not found" }

    await updateUserProfile(uid, {
      dailyGenerations: userProfile.dailyGenerations + 1,
      totalGenerations: userProfile.totalGenerations + 1,
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}
