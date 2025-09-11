import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] File upload request received")
    console.log("[v0] Request method:", request.method)
    console.log("[v0] Request URL:", request.url)

    const contentType = request.headers.get("content-type")
    console.log("[v0] Content type:", contentType)

    // Next.js automatically parses FormData even when content-type header is null or missing boundary

    let formData
    try {
      formData = await request.formData()
      console.log("[v0] FormData parsed successfully")
    } catch (formError) {
      console.error("[v0] Failed to parse form data:", formError)
      return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 })
    }

    const file = formData.get("file") as File
    console.log("[v0] File from form data:", file ? `${file.name} (${file.size} bytes)` : "No file")

    if (!file) {
      console.log("[v0] No file provided in form data")
      return NextResponse.json({ error: "Please upload a file." }, { status: 400 })
    }

    if (!(file instanceof File)) {
      console.log("[v0] Invalid file object type:", typeof file)
      return NextResponse.json({ error: "Invalid file object." }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const allowedExtensions = [".txt", ".md"]
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext))

    console.log("[v0] File name:", fileName)
    console.log("[v0] Has valid extension:", hasValidExtension)

    if (!hasValidExtension) {
      return NextResponse.json(
        { error: "Currently only .txt and .md files are supported. PDF and DOCX support coming soon." },
        { status: 400 },
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log("[v0] File too large:", file.size)
      return NextResponse.json({ error: "File too large. Please upload files smaller than 10MB." }, { status: 400 })
    }

    console.log(`[v0] Processing file: ${file.name} (${file.size} bytes)`)

    let extractedText = ""

    try {
      const arrayBuffer = await file.arrayBuffer()
      console.log("[v0] ArrayBuffer created, size:", arrayBuffer.byteLength)

      const buffer = Buffer.from(arrayBuffer)
      console.log("[v0] Buffer created, size:", buffer.length)

      try {
        extractedText = buffer.toString("utf8")
        console.log("[v0] Text decoded with UTF-8")
      } catch (decodeError) {
        console.log("[v0] UTF-8 decode failed, trying latin1")
        extractedText = buffer.toString("latin1")
      }

      // Clean up extracted text
      extractedText = extractedText.trim()
      console.log(`[v0] Extracted text length: ${extractedText.length} characters`)
      console.log(`[v0] First 100 chars: ${extractedText.substring(0, 100)}`)

      if (!extractedText) {
        console.log("[v0] No text content found after processing")
        return NextResponse.json({ error: "No text content found in the file." }, { status: 400 })
      }

      console.log("[v0] File processed successfully")
      const response = {
        success: true,
        text: extractedText,
        filename: file.name,
        fileSize: file.size,
      }
      console.log("[v0] Returning response:", { ...response, text: `${extractedText.length} chars` })

      return NextResponse.json(response)
    } catch (extractionError) {
      console.error("[v0] Text extraction error:", extractionError)
      return NextResponse.json(
        {
          error: `Failed to process file: ${extractionError instanceof Error ? extractionError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] File upload error:", error)
    return NextResponse.json(
      {
        error: `Failed to process file upload: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
