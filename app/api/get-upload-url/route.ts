import { type NextRequest, NextResponse } from "next/server"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { S3Client } from "@aws-sdk/client-s3"

export const runtime = "nodejs"

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

function sanitizeFilename(filename: string): string {
  // Replace any character that's not alphanumeric, dot, underscore, or hyphen with underscore
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Received presigned upload request")

    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 })
    }

    // Validate content type
    if (!contentType.startsWith("audio/") && !contentType.startsWith("video/")) {
      return NextResponse.json({ error: "Only audio and video files are supported" }, { status: 400 })
    }

    const sanitizedFilename = sanitizeFilename(filename)
    const key = `uploads/${Date.now()}-${sanitizedFilename}`

    console.log("[v0] Creating presigned POST for:", key)

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 100 * 1024 * 1024], // 100MB max
        ["starts-with", "$Content-Type", "audio/"],
        ["starts-with", "$Content-Type", "video/"],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: 600, // 10 minutes
    })

    const publicUrl = `${process.env.S3_PUBLIC_BASE_URL}/${key}`

    console.log("[v0] Presigned POST created successfully")

    return NextResponse.json({
      url,
      fields,
      key,
      publicUrl,
    })
  } catch (error) {
    console.error("[v0] Error creating presigned POST:", error)
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 })
  }
}
