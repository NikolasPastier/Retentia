import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./config"

// User profile interface
export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  plan: "free" | "paid"
  createdAt: Date
  dailyGenerations: number
  lastGenerationReset: Date
  totalGenerations: number
}

// Create user profile in Firestore
export const createUserProfile = async (user: User): Promise<void> => {
  const userRef = doc(db, "users", user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      plan: "free",
      createdAt: new Date(),
      dailyGenerations: 0,
      lastGenerationReset: new Date(),
      totalGenerations: 0,
    }

    await setDoc(userRef, userProfile)
  }
}

const checkFirebaseAvailability = () => {
  if (!auth || !db) {
    return { user: null, error: "Firebase is not properly configured. Please check your environment variables." }
  }
  return null
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  const availabilityCheck = checkFirebaseAvailability()
  if (availabilityCheck) return availabilityCheck

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await createUserProfile(result.user)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  const availabilityCheck = checkFirebaseAvailability()
  if (availabilityCheck) return availabilityCheck

  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  const availabilityCheck = checkFirebaseAvailability()
  if (availabilityCheck) return availabilityCheck

  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await createUserProfile(result.user)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with Apple
export const signInWithApple = async () => {
  const availabilityCheck = checkFirebaseAvailability()
  if (availabilityCheck) return availabilityCheck

  try {
    const provider = new OAuthProvider("apple.com")
    const result = await signInWithPopup(auth, provider)
    await createUserProfile(result.user)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign out
export const signOutUser = async () => {
  const availabilityCheck = checkFirebaseAvailability()
  if (availabilityCheck) return availabilityCheck

  try {
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
