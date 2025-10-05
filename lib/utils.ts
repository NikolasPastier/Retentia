import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates that the GROQ_API_KEY environment variable is configured.
 * Returns an error response if missing, otherwise returns null.
 */
export function validateGroqApiKey(): NextResponse | null {
  if (!process.env.GROQ_API_KEY) {
    console.error(
      "[v0] GROQ_API_KEY is not configured. Please add it to your environment variables.\n" +
        "To fix this:\n" +
        "1. Go to https://console.groq.com/keys to get your API key\n" +
        "2. Add GROQ_API_KEY=your_key_here to your .env.local file\n" +
        "3. Restart your development server",
    )

    return NextResponse.json(
      {
        error: "API key not configured",
        message: "GROQ_API_KEY environment variable is missing. Please configure it in your environment variables.",
      },
      { status: 500 },
    )
  }

  return null
}
