import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      difficulty = "medium",
      questionCount = 5,
      questionType = "mixed",
      locale = "en",
    } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    const getQuestionTypePrompt = (type: string) => {
      switch (type) {
        case "multiple-choice":
          return "Generate multiple-choice questions with 4 options (A, B, C, D). Format: {question, type: 'multiple-choice', options: [array], correctAnswer: 'A'|'B'|'C'|'D', explanation}"
        case "true-false":
          return "Generate true/false questions. Format: {question, type: 'true-false', correctAnswer: 'True'|'False', explanation}"
        case "open-ended":
          return "Generate open-ended questions that require detailed answers. Format: {question, type: 'open-ended', correctAnswer: 'sample answer', explanation}"
        case "fill-blank":
          return "Generate fill-in-the-blank questions with blanks marked as ___. Format: {question, type: 'fill-blank', correctAnswer: 'answer text', explanation}"
        case "mixed":
        default:
          return "Generate a mix of question types: multiple-choice (4 options A-D), true/false, and fill-in-the-blank questions. Vary the types for engagement."
      }
    }

    const prompt = `Based on the following text, generate ${questionCount} ${difficulty} difficulty questions.

IMPORTANT: Respond in ${locale === "en" ? "English" : locale === "es" ? "Spanish" : locale === "fr" ? "French" : locale === "de" ? "German" : locale === "it" ? "Italian" : locale === "pt" ? "Portuguese" : locale === "cs" ? "Czech" : locale === "sk" ? "Slovak" : "English"}.

${getQuestionTypePrompt(questionType)}

Format your response as a JSON array where each question object has:
- question: the question text (in ${locale})
- type: the question type ("multiple-choice", "true-false", "open-ended", or "fill-blank")
- options: array of option strings (only for multiple-choice questions, in ${locale})
- correctAnswer: the correct answer (letter for multiple-choice, "True"/"False" for true-false, text for others, in ${locale})
- explanation: brief explanation of why the answer is correct (in ${locale})

Text to analyze:
${text}

Respond with only the JSON array, no additional text.`

    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the JSON response
    let questions
    try {
      questions = JSON.parse(response)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to generate valid questions" }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
