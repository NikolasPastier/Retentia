import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { generateObject } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { questionsSchema } from "@/lib/questions-schema"

export const runtime = "nodejs"

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_")
}

async function fetchFileAsBuffer(url: string): Promise<{ buffer: Buffer; filename: string }> {
  console.log("[v0] Fetching remote file:", url)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Extract filename from URL
  const urlParts = url.split("/")
  const filename = urlParts[urlParts.length - 1] || "audio-file"

  return { buffer, filename }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let file: File | null = null
    let fileBuffer: Buffer
    let filename: string
    let difficulty = "medium"
    let questionCount = 5
    let questionType = "mixed"

    if (contentType.includes("application/json")) {
      // Handle JSON request with fileUrl (for S3 uploads)
      console.log("[v0] Processing JSON request with fileUrl")
      const body = await request.json()
      const {
        fileUrl,
        difficulty: reqDifficulty,
        questionCount: reqQuestionCount,
        questionType: reqQuestionType,
      } = body

      if (!fileUrl) {
        return NextResponse.json({ error: "No fileUrl provided" }, { status: 400 })
      }

      difficulty = reqDifficulty || difficulty
      questionCount = Number(reqQuestionCount) || questionCount
      questionType = reqQuestionType || questionType

      // Fetch the file from S3
      const { buffer, filename: fetchedFilename } = await fetchFileAsBuffer(fileUrl)
      fileBuffer = buffer
      filename = sanitizeFilename(fetchedFilename)
    } else {
      // Handle FormData request (direct upload)
      console.log("[v0] Processing FormData request")
      const formData = await request.formData()
      file = formData.get("file") as File
      difficulty = (formData.get("difficulty") as string) || difficulty
      questionCount = Number(formData.get("questionCount")) || questionCount
      questionType = (formData.get("questionType") as string) || questionType

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      filename = sanitizeFilename(file.name)
    }

    console.log(`[v0] Received file: ${filename}`)

    const allowedExtensions = ["mp3", "wav", "m4a", "mp4", "mov", "avi", "txt", "md"]
    const fileExtension = filename.toLowerCase().split(".").pop()

    if (file) {
      // Validate MIME type for direct uploads
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
        "text/plain",
        "text/markdown",
        "application/octet-stream", // for .md files sometimes
      ]

      const isValidType =
        allowedTypes.some((type) => file.type === type || file.name.toLowerCase().includes(type.split("/")[1])) ||
        fileExtension === "txt" ||
        fileExtension === "md"

      if (!isValidType) {
        return NextResponse.json(
          { error: "Unsupported file type. Please use MP3, WAV, M4A, MP4, MOV, AVI, TXT, or MD files." },
          { status: 400 },
        )
      }
    } else {
      // Validate extension for S3 uploads
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: "Unsupported file type. Please use MP3, WAV, M4A, MP4, MOV, AVI, TXT, or MD files." },
          { status: 400 },
        )
      }
    }

    if (fileBuffer.length > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 })
    }

    let transcript: string

    if (fileExtension === "txt" || fileExtension === "md") {
      console.log("[v0] Processing text file directly")
      transcript = fileBuffer.toString("utf-8").trim()

      if (!transcript || transcript.length < 10) {
        return NextResponse.json({ error: "Text file is empty or too short" }, { status: 400 })
      }
    } else {
      // For audio/video files, use transcription
      if (filename.includes("mp4") || filename.includes("mov") || filename.includes("avi")) {
        console.log("[v0] Processing video file as audio")
      }

      console.log("[v0] Starting transcription...")

      try {
        const transcription = await groqClient.audio.transcriptions.create({
          file: fileBuffer,
          model: "whisper-large-v3",
          response_format: "text",
          filename: filename,
        })

        console.log("[v0] Transcription complete")

        if (!transcription || !transcription.text || transcription.text.length < 10) {
          return NextResponse.json(
            {
              error: "Failed to transcribe file or transcript too short",
            },
            { status: 400 },
          )
        }

        transcript = transcription.text.trim()
      } catch (transcriptionError) {
        console.error("[v0] Transcription error:", transcriptionError)
        return NextResponse.json(
          {
            error:
              "Failed to transcribe audio. Please ensure the file contains clear speech and is in a supported format.",
          },
          { status: 500 },
        )
      }
    }

    // Clean and trim transcript
    const cleanTranscript = transcript.substring(0, 4000)

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
      filename: filename,
    })
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
