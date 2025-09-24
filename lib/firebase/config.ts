import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log("[v0] Firebase config check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
})

// Validate that all required config values are present
const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
const missingFields = requiredFields.filter((field) => !firebaseConfig[field as keyof typeof firebaseConfig])

if (missingFields.length > 0) {
  console.error("[v0] Missing Firebase configuration fields:", missingFields)
  throw new Error(`Missing Firebase configuration: ${missingFields.join(", ")}`)
}

// Initialize Firebase only if it hasn't been initialized already
let app
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  console.log("[v0] Firebase app initialized successfully")
} catch (error) {
  console.error("[v0] Firebase initialization error:", error)
  throw error
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

console.log("[v0] Firebase services initialized")

export default app
