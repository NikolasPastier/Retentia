import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
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

    console.log(`[v0] Generating summary for ${text.length} characters`)

    const prompt = `Please provide a comprehensive summary of the following text. Structure your response as follows:

IMPORTANT: Respond in ${locale === "en" ? "English" : locale === "es" ? "Spanish" : locale === "fr" ? "French" : locale === "de" ? "German" : locale === "it" ? "Italian" : locale === "pt" ? "Portuguese" : locale === "cs" ? "Czech" : locale === "sk" ? "Slovak" : "English"}.

1. A concise overview paragraph (2-3 sentences, in ${locale})
2. Key points (3-5 main points as bullet points, in ${locale})
3. Important concepts or terms mentioned (in ${locale})

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "overview paragraph here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "concepts": ["concept 1", "concept 2", "concept 3"]
}`

    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.3,
      maxTokens: 1500,
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
      // Fallback: create structured response from plain text
      const lines = response.split("\n").filter((line) => line.trim())
      summaryResult = {
        summary: lines[0] || response.substring(0, 200),
        keyPoints: lines.slice(1, 6).map((line) => line.replace(/^[-•*]\s*/, "")),
        concepts: [],
      }
    }

    return NextResponse.json(summaryResult)
  } catch (error) {
    console.error("[v0] Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
