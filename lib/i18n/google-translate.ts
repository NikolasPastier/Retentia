import { Translate } from "@google-cloud/translate/build/src/v2"

// Initialize Google Translate client
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: "./lib/google-cloud-key.json",
})

export interface TranslationRequest {
  text: string
  targetLanguage: string
  sourceLanguage?: string
}

export interface TranslationResponse {
  translatedText: string
  detectedSourceLanguage?: string
}

/**
 * Translate text using Google Translate API
 */
export async function translateText({
  text,
  targetLanguage,
  sourceLanguage = "auto",
}: TranslationRequest): Promise<TranslationResponse> {
  try {
    const [translation] = await translate.translate(text, {
      from: sourceLanguage === "auto" ? undefined : sourceLanguage,
      to: targetLanguage,
    })

    return {
      translatedText: Array.isArray(translation) ? translation[0] : translation,
      detectedSourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
    }
  } catch (error) {
    console.error("Google Translate API error:", error)
    throw new Error("Translation failed")
  }
}

/**
 * Translate multiple texts in batch
 */
export async function translateBatch({
  texts,
  targetLanguage,
  sourceLanguage = "auto",
}: {
  texts: string[]
  targetLanguage: string
  sourceLanguage?: string
}): Promise<TranslationResponse[]> {
  try {
    const [translations] = await translate.translate(texts, {
      from: sourceLanguage === "auto" ? undefined : sourceLanguage,
      to: targetLanguage,
    })

    return translations.map((translation: string) => ({
      translatedText: translation,
      detectedSourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
    }))
  } catch (error) {
    console.error("Google Translate batch API error:", error)
    throw new Error("Batch translation failed")
  }
}

/**
 * Get supported languages from Google Translate
 */
export async function getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
  try {
    const [languages] = await translate.getLanguages()
    return languages.map((lang) => ({
      code: lang.code,
      name: lang.name,
    }))
  } catch (error) {
    console.error("Error fetching supported languages:", error)
    throw new Error("Failed to fetch supported languages")
  }
}
