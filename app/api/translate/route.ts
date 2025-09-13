import { type NextRequest, NextResponse } from "next/server"
import { translateText, translateBatch } from "@/lib/i18n/google-translate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, texts, targetLanguage, sourceLanguage } = body

    // Validate required parameters
    if (!targetLanguage) {
      return NextResponse.json({ error: "Target language is required" }, { status: 400 })
    }

    // Handle batch translation
    if (texts && Array.isArray(texts)) {
      if (texts.length === 0) {
        return NextResponse.json({ error: "Texts array cannot be empty" }, { status: 400 })
      }

      const translations = await translateBatch({
        texts,
        targetLanguage,
        sourceLanguage,
      })

      return NextResponse.json({ translations })
    }

    // Handle single text translation
    if (!text) {
      return NextResponse.json({ error: "Text is required for single translation" }, { status: 400 })
    }

    const translation = await translateText({
      text,
      targetLanguage,
      sourceLanguage,
    })

    return NextResponse.json({ translation })
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json({ error: "Translation failed" }, { status: 500 })
  }
}
