import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { validateGroqApiKey } from "@/lib/utils"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  const apiKeyError = validateGroqApiKey()
  if (apiKeyError) return apiKeyError

  try {
    console.log("[v0] Summarize API called")

    const { text, userId, setting = "brief", locale = "en" } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    // Log userId if present for analytics, but don't require it
    if (userId) {
      console.log(`[v0] Request from user: ${userId}`)
    } else {
      console.log("[v0] Anonymous request")
    }

    console.log(`[v0] Generating ${setting} summary for ${text.length} characters`)

    const languageName =
      locale === "en"
        ? "English"
        : locale === "es"
          ? "Spanish"
          : locale === "fr"
            ? "French"
            : locale === "de"
              ? "German"
              : locale === "it"
                ? "Italian"
                : locale === "pt"
                  ? "Portuguese"
                  : locale === "cs"
                    ? "Czech"
                    : locale === "sk"
                      ? "Slovak"
                      : "English"

    let prompt = ""
    let maxTokens = 1500

    if (setting === "brief") {
      // Brief: 1-2 sentence summary only
      prompt = `Please provide a very brief summary of the following text in just 1-2 sentences.

IMPORTANT: Respond in ${languageName}.

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "1-2 sentence summary here in ${languageName}",
  "keyPoints": [],
  "concepts": []
}`
      maxTokens = 500
    } else if (setting === "key-points") {
      // Key Points: Bullet points only
      prompt = `Please extract the key points from the following text as a bullet-point list. Provide 5-8 main points.

IMPORTANT: Respond in ${languageName}.

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "",
  "keyPoints": ["point 1 in ${languageName}", "point 2 in ${languageName}", "point 3 in ${languageName}", "..."],
  "concepts": []
}`
      maxTokens = 1000
    } else {
      // In-depth: Multi-paragraph detailed summary
      prompt = `Please provide a comprehensive, in-depth summary of the following text. Write 3-5 detailed paragraphs that thoroughly cover all major themes, arguments, and important details.

IMPORTANT: Respond in ${languageName}.

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "detailed multi-paragraph summary here in ${languageName}",
  "keyPoints": [],
  "concepts": []
}`
      maxTokens = 2000
    }

    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.3,
      maxTokens,
    })

    console.log("[v0] Summary generated successfully")

    // Parse the JSON response
    let summaryResult
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : response
      summaryResult = JSON.parse(jsonString)
    } catch (parseError) {
      console.log("[v0] JSON parsing failed, creating structured response")
      if (setting === "brief") {
        // For brief, extract first 1-2 sentences
        const sentences = response.split(/[.!?]+/).filter((s) => s.trim())
        const briefSummary = sentences.slice(0, 2).join(". ") + "."
        summaryResult = {
          summary: briefSummary,
          keyPoints: [],
          concepts: [],
        }
      } else if (setting === "key-points") {
        // For key-points, extract bullet points
        const lines = response.split("\n").filter((line) => line.trim())
        const points = lines
          .filter((line) => line.match(/^[-•*]\s/) || line.match(/^\d+\./))
          .map((line) => line.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, ""))
          .slice(0, 8)
        summaryResult = {
          summary: "",
          keyPoints: points.length > 0 ? points : lines.slice(0, 5),
          concepts: [],
        }
      } else {
        // For in-depth, use the full response as summary
        summaryResult = {
          summary: response,
          keyPoints: [],
          concepts: [],
        }
      }
    }

    if (setting === "brief") {
      summaryResult.keyPoints = []
      summaryResult.concepts = []
    } else if (setting === "key-points") {
      summaryResult.summary = ""
      summaryResult.concepts = []
    } else {
      summaryResult.keyPoints = []
      summaryResult.concepts = []
    }

    return NextResponse.json(summaryResult)
  } catch (error) {
    console.error("[v0] Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
