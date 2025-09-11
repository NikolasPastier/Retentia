import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { generateObject } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { questionsSchema } from "@/lib/questions-schema"

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const difficulty = (formData.get("difficulty") as string) || "medium"
    const questionCount = Number(formData.get("questionCount")) || 5
    const questionType = (formData.get("questionType") as string) || "mixed"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`[v0] Received file: ${file.name}`)

    // Validate file type and size
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/m4a",
      "audio/mp3",
      "audio/x-m4a",
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/quicktime",
    ]

    const isValidType = allowedTypes.some(
      (type) => file.type === type || file.name.toLowerCase().includes(type.split("/")[1]),
    )

    if (!isValidType) {
      return NextResponse.json(
        { error: "Unsupported file type. Please use MP3, WAV, M4A, MP4, or MOV files." },
        { status: 400 },
      )
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB limit
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 })
    }

    // For video files, we'll process them as audio for now
    // In a full implementation, you'd extract audio using ffmpeg
    if (file.type.includes("video")) {
      console.log("[v0] Extracting audio from video...")
    }

    // Transcribe using Groq Whisper
    console.log("[v0] Starting transcription...")

    try {
      const transcription = await groqClient.audio.transcriptions.create({
        file: file,
        model: "whisper-large-v3",
        response_format: "text",
      })

      console.log("[v0] Transcription complete.")

      if (!transcription || transcription.length < 10) {
        return NextResponse.json({ error: "Failed to transcribe file or transcript too short" }, { status: 400 })
      }

      // Clean and trim transcript
      const cleanTranscript = transcription.trim().substring(0, 4000)

      console.log("[v0] Generating questions...")

      const getQuestionTypePrompt = (type: string) => {
        switch (type) {
          case "multiple-choice":
            return "Generate multiple-choice questions with 4 options. Each question should have type: 'multiple-choice', options array, and correctAnswer as index (0-3)."
          case "true-false":
            return "Generate true/false questions. Each question should have type: 'true-false', no options array, and correctAnswer as 'True' or 'False'."
          case "open-ended":
            return "Generate open-ended questions. Each question should have type: 'open-ended', no options array, and correctAnswer as a sample answer."
          case "fill-blank":
            return "Generate fill-in-the-blank questions with ___ for blanks. Each question should have type: 'fill-blank', no options array, and correctAnswer as the missing text."
          case "mixed":
          default:
            return "Generate a mix of question types: multiple-choice (with 4 options and index 0-3), true/false (with 'True'/'False'), and fill-in-the-blank questions."
        }
      }

      let questionsResult
      try {
        console.log("[v0] Attempting structured output generation...")
        const result = await generateObject({
          model: groq("llama-3-groq-70b-8192-tool-use-preview"),
          schema: questionsSchema,
          prompt: `Based on the following transcript, generate ${questionCount} ${difficulty} difficulty questions.

${getQuestionTypePrompt(questionType)}

Requirements:
- Test understanding of main concepts
- Include specific details from the content
- Are educational and thought-provoking
- Have clear, unambiguous correct answers
- Include helpful explanations for learning

Transcript: "${cleanTranscript}"

Generate questions that help someone learn from this content.`,
        })
        questionsResult = result.object
        console.log("[v0] Structured output generation successful")
      } catch (structuredError) {
        console.log("[v0] Structured output failed, trying JSON mode...")
        console.log("[v0] Structured error:", structuredError)
        const { generateText } = await import("ai")

        const jsonResponse = await generateText({
          model: groq("llama3-70b-8192"),
          prompt: `Based on the following transcript, generate ${questionCount} ${difficulty} difficulty questions.

${getQuestionTypePrompt(questionType)}

Requirements:
- Test understanding of main concepts
- Include specific details from the content
- Are educational and thought-provoking
- Have clear, unambiguous correct answers
- Include helpful explanations for learning

Transcript: "${cleanTranscript}"

Return ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "multiple-choice" | "true-false" | "open-ended" | "fill-blank",
      "options": ["A", "B", "C", "D"] (only for multiple-choice),
      "correctAnswer": "answer here",
      "explanation": "explanation here"
    }
  ]
}`,
        })

        try {
          const cleanedResponse = jsonResponse.text.trim()
          console.log("[v0] Raw response:", cleanedResponse.substring(0, 200))

          // Remove any markdown code blocks if present
          const jsonMatch = cleanedResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
          const jsonString = jsonMatch ? jsonMatch[1] : cleanedResponse

          questionsResult = JSON.parse(jsonString)
          console.log("[v0] JSON parsing successful")
        } catch (parseError) {
          console.error("[v0] JSON parsing failed:", parseError)
          console.error("[v0] Raw response:", jsonResponse.text)
          throw new Error("Failed to parse generated questions")
        }
      }

      console.log("[v0] Questions generated successfully.")

      return NextResponse.json({
        success: true,
        transcript: cleanTranscript,
        questions: questionsResult.questions,
        filename: file.name,
      })
    } catch (transcriptionError) {
      console.error("[v0] Transcription error:", transcriptionError)
      return NextResponse.json({ error: "Failed to transcribe file." }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Media processing error:", error)

    return NextResponse.json(
      {
        error: "Failed to process media file. Please try again.",
      },
      { status: 500 },
    )
  }
}
