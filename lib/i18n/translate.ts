import { Translate } from "@google-cloud/translate/build/src/v2"

// Initialize Google Translate client
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
})

export interface TranslationCache {
  id: string
  original_text: string
  translated_text: string
  source_language: string
  target_language: string
  created_at: string
}

export async function translateText(text: string, targetLanguage: string, sourceLanguage = "en"): Promise<string> {
  try {
    // Check cache first (will implement Supabase caching in next task)

    // Translate using Google Cloud Translation API
    const [translation] = await translate.translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    })

    // Cache the result (will implement in next task)

    return translation
  } catch (error) {
    console.error("Translation error:", error)
    return text // Return original text if translation fails
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const [detection] = await translate.detect(text)
    return detection.language || "en"
  } catch (error) {
    console.error("Language detection error:", error)
    return "en"
  }
}
