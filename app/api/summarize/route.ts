import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Summarize API called")

    const { text, userId, setting = "brief" } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 })
    }

    console.log(`[v0] Generating ${setting} summary for ${text.length} characters`)

    let prompt = ""

    switch (setting) {
      case "brief":
        prompt = `Please provide a brief summary of the following text. Keep it concise (2-3 sentences) and focus on the main points only.

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "brief overview here",
  "keyPoints": ["main point 1", "main point 2", "main point 3"],
  "concepts": ["key concept 1", "key concept 2"]
}`
        break
      case "in-depth":
        prompt = `Please provide a comprehensive, in-depth summary of the following text. Include detailed explanations and context.

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "detailed overview paragraph here",
  "keyPoints": ["detailed point 1", "detailed point 2", "detailed point 3", "detailed point 4", "detailed point 5"],
  "concepts": ["concept 1", "concept 2", "concept 3", "concept 4"]
}`
        break
      case "key-points":
        prompt = `Please extract and summarize the key points from the following text. Focus on actionable insights and important takeaways.

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "overview of key themes",
  "keyPoints": ["actionable point 1", "actionable point 2", "actionable point 3", "actionable point 4", "actionable point 5", "actionable point 6"],
  "concepts": ["important concept 1", "important concept 2", "important concept 3"]
}`
        break
      default:
        prompt = `Please provide a summary of the following text.

Text to summarize:
${text}

Format your response as JSON with this structure:
{
  "summary": "overview paragraph here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "concepts": ["concept 1", "concept 2"]
}`
    }

    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.3,
      maxTokens: 2000,
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
        summary: lines[0] || response.substring(0, 300),
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
