import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

const requiredFields = [
  { key: "apiKey", env: "NEXT_PUBLIC_FIREBASE_API_KEY" },
  { key: "authDomain", env: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" },
  { key: "projectId", env: "NEXT_PUBLIC_FIREBASE_PROJECT_ID" },
  { key: "storageBucket", env: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" },
  { key: "messagingSenderId", env: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" },
  { key: "appId", env: "NEXT_PUBLIC_FIREBASE_APP_ID" },
]

const missingFields = requiredFields.filter((field) => !firebaseConfig[field.key as keyof typeof firebaseConfig])

if (missingFields.length > 0) {
  const missingEnvVars = missingFields.map((field) => field.env).join(", ")
  console.error("[v0] Missing Firebase environment variables:", missingEnvVars)
  console.error("[v0] Please add these environment variables to your project settings")

  console.warn("[v0] Using mock Firebase configuration for development")
}

// Initialize Firebase only if it hasn't been initialized already
let app
let auth
let db

try {
  if (missingFields.length === 0) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    console.log("[v0] Firebase initialized successfully")
  } else {
    console.warn("[v0] Firebase services not available - missing environment variables")
    // These will be undefined, but won't crash the app
    app = null
    auth = null as any
    db = null as any
  }
} catch (error) {
  console.error("[v0] Firebase initialization error:", error)
  app = null
  auth = null as any
  db = null as any
}

export { auth, db }
export default app
