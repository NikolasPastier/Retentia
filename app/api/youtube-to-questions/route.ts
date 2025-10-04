export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { questionsSchema } from "@/lib/questions-schema"
import { Buffer } from "buffer"

const groqClient = groq({
  apiKey: process.env.GROQ_API_KEY!,
})

function sanitizeFilename(url: string): string {
  // Extract a clean filename from URL or create a default one
  const urlParts = url.split("/")
  const lastPart = urlParts[urlParts.length - 1]
  const cleanName = lastPart.replace(/[^a-zA-Z0-9.-]/g, "_")
  return cleanName || "audio_file.mp3"
}

function createErrorResponse(error: string, statusCode = 500, errorType?: string) {
  console.log(`[v0] API Error (${errorType || "unknown"}):`, error)
  return NextResponse.json(
    {
      success: false,
      error,
      errorType: errorType || "unknown",
    },
    { status: statusCode },
  )
}

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, difficulty = "medium", questionCount = 5, questionType = "mixed" } = await request.json()

    console.log("[v0] Processing audio file URL:", fileUrl)

    if (!fileUrl) {
      return createErrorResponse("Please provide a valid audio file URL for transcription.", 400, "missing_file_url")
    }

    try {
      new URL(fileUrl)
    } catch {
      return createErrorResponse(
        "Invalid file URL format. Please provide a valid HTTP/HTTPS URL.",
        400,
        "invalid_url_format",
      )
    }

    let transcript = ""

    try {
      console.log("[v0] Fetching remote audio file...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const audioResponse = await fetch(fileUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; QuestionGenerator/1.0)",
        },
      })

      clearTimeout(timeoutId)

      if (!audioResponse.ok) {
        if (audioResponse.status === 404) {
          throw new Error("Audio file not found. The file may have been deleted or moved.")
        } else if (audioResponse.status === 403) {
          throw new Error("Access denied to audio file. Please check file permissions.")
        } else if (audioResponse.status >= 500) {
          throw new Error("Server error while downloading audio file. Please try again later.")
        } else {
          throw new Error(`Failed to download audio file: ${audioResponse.statusText}`)
        }
      }

      const contentType = audioResponse.headers.get("content-type")
      const contentLength = audioResponse.headers.get("content-length")

      if (contentLength) {
        const fileSizeInMB = Number.parseInt(contentLength) / (1024 * 1024)
        if (fileSizeInMB > 100) {
          throw new Error(`Audio file too large (${fileSizeInMB.toFixed(1)}MB). Maximum size is 100MB.`)
        }
      }

      if (contentType && !contentType.includes("audio") && !contentType.includes("video")) {
        console.log("[v0] Warning: Unexpected content type:", contentType)
      }

      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())

      if (audioBuffer.length === 0) {
        throw new Error("Downloaded audio file is empty.")
      }

      const filename = sanitizeFilename(fileUrl)

      console.log("[v0] Transcribing audio with Groq Whisper...")

      try {
        const transcription = await groqClient.audio.transcriptions.create({
          file: audioBuffer,
          filename: filename,
          model: "whisper-large-v3",
        })

        if (!transcription || !transcription.text) {
          throw new Error("Empty transcription result")
        }

        transcript = transcription.text.trim()
        console.log("[v0] Transcription completed successfully, length:", transcript.length)

        if (transcript.length < 10) {
          throw new Error("Transcription too short or empty")
        }
      } catch (transcriptionError) {
        console.log("[v0] Transcription error:", transcriptionError)

        let errorMessage = "Audio transcription failed."

        if (transcriptionError instanceof Error) {
          if (transcriptionError.message.includes("rate limit")) {
            errorMessage = "Transcription service is temporarily busy. Please try again in a few minutes."
          } else if (transcriptionError.message.includes("invalid file")) {
            errorMessage = "Invalid audio file format. Please ensure the file is a valid audio file."
          } else if (transcriptionError.message.includes("too large")) {
            errorMessage = "Audio file is too large for transcription. Please use a smaller file."
          } else if (transcriptionError.message.includes("Empty transcription")) {
            errorMessage = "No speech detected in the audio file. Please check that the audio contains spoken content."
          }
        }

        return createErrorResponse(errorMessage, 500, "transcription_failed")
      }
    } catch (error) {
      console.log("[v0] Audio processing error:", error)

      let errorMessage = "Failed to process audio file."
      let errorType = "audio_processing_failed"

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Audio download timed out. Please try again with a smaller file."
          errorType = "download_timeout"
        } else if (error.message.includes("not found")) {
          errorMessage = error.message
          errorType = "file_not_found"
        } else if (error.message.includes("Access denied")) {
          errorMessage = error.message
          errorType = "access_denied"
        } else if (error.message.includes("too large")) {
          errorMessage = error.message
          errorType = "file_too_large"
        } else if (error.message.includes("empty")) {
          errorMessage = error.message
          errorType = "empty_file"
        } else {
          errorMessage = error.message
        }
      }

      return createErrorResponse(errorMessage, 500, errorType)
    }

    console.log("[v0] Generating questions from transcript...")

    try {
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

      const result = await generateObject({
        model: groq("llama-4-scout-17b-16e-instruct"),
        schema: questionsSchema,
        prompt: `You are an expert educator creating assessment questions. Based on the following audio transcript, generate ${questionCount} ${difficulty} difficulty questions.

${getQuestionTypePrompt(questionType)}

Requirements:
- Questions should test understanding, analysis, and application of concepts
- Include clear, educational explanations for correct answers
- Make questions engaging and thought-provoking
- Vary difficulty levels from basic comprehension to analytical thinking

Audio Transcript:
${transcript}

Generate educational questions that would help someone learn about this subject matter.`,
      })

      console.log("[v0] Questions generated successfully.")

      return NextResponse.json({
        success: true,
        transcript,
        questions: result.object.questions,
      })
    } catch (questionError) {
      console.log("[v0] Question generation error:", questionError)

      let errorMessage = "Failed to generate questions from the transcript."

      if (questionError instanceof Error) {
        if (questionError.message.includes("rate limit")) {
          errorMessage = "Question generation service is temporarily busy. Please try again in a few minutes."
        } else if (questionError.message.includes("content")) {
          errorMessage =
            "The transcript content could not be processed for question generation. Please try with different content."
        }
      }

      return createErrorResponse(errorMessage, 500, "question_generation_failed")
    }
  } catch (error) {
    console.log("[v0] Unexpected API error:", error)

    let errorMessage = "An unexpected error occurred while processing your request."

    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        errorMessage = "Invalid request format. Please check your request data."
      }
    }

    return createErrorResponse(errorMessage, 500, "unexpected_error")
  }
}
