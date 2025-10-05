import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Explain feedback API called")

    const { explanation, userId, audience = "child", locale = "en" } = await request.json()

    if (!explanation || explanation.trim().length === 0) {
      return NextResponse.json({ error: "Your explanation is required" }, { status: 400 })
    }

    // Log userId if present for analytics, but don't require it
    if (userId) {
      console.log(`[v0] Request from user: ${userId}`)
    } else {
      console.log("[v0] Anonymous request")
    }

    console.log(`[v0] Generating feedback for ${audience} audience`)

    const audienceContext = {
      child: "a 10-year-old child with basic vocabulary and simple concepts",
      teen: "a teenager with moderate knowledge and attention span",
      adult: "an adult with good comprehension and focus",
      senior: "a senior with life experience but may prefer clear, well-structured explanations",
    }

    const prompt = `You are an expert educator evaluating how well someone explained a topic to ${audienceContext[audience as keyof typeof audienceContext]}.

IMPORTANT: Provide your feedback in ${locale === "en" ? "English" : locale === "es" ? "Spanish" : locale === "fr" ? "French" : locale === "de" ? "German" : locale === "it" ? "Italian" : locale === "pt" ? "Portuguese" : locale === "cs" ? "Czech" : locale === "sk" ? "Slovak" : "English"}.

STUDENT'S EXPLANATION:
${explanation}

Please evaluate this explanation and provide (in ${locale}):
1. A rating from 0-100 on how well ${audienceContext[audience as keyof typeof audienceContext]} would understand this explanation
2. Detailed feedback on what works well and what could be improved
3. Specific suggestions for making the explanation clearer and more appropriate for the target audience

Consider:
- Vocabulary level appropriate for ${audience}
- Clarity and structure
- Use of examples and analogies
- Completeness and logical flow
- Engagement level for the target audience

Format your response as JSON:
{
  "rating": 85,
  "feedback": "detailed feedback paragraph here",
  "improvements": "specific suggestions for improvement"
}`

    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.4,
      maxTokens: 2000,
    })

    console.log("[v0] Feedback generated successfully")

    // Parse the JSON response
    let feedbackResult
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : response
      feedbackResult = JSON.parse(jsonString)
    } catch (parseError) {
      console.log("[v0] JSON parsing failed, creating structured response")
      // Fallback: create structured response
      feedbackResult = {
        rating: 75,
        feedback: response.substring(0, 500),
        improvements: "Focus on using simpler language and more examples appropriate for the target audience.",
      }
    }

    return NextResponse.json(feedbackResult)
  } catch (error) {
    console.error("[v0] Error generating feedback:", error)
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
