const AWS = require("aws-sdk")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Initialize S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || "us-east-1",
})

exports.handler = async (event) => {
  console.log("[worker] YouTube worker started")

  try {
    // Parse request body
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body
    const { youtubeUrl } = body

    // Validate YouTube URL
    if (!youtubeUrl) {
      console.log("[worker] YouTube worker error: Missing YouTube URL")
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
          error: "Invalid YouTube URL",
        }),
      }
    }

    // Extract video ID for filename
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (!videoIdMatch) {
      console.log("[worker] YouTube worker error: Invalid YouTube URL format")
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Invalid YouTube URL format",
        }),
      }
    }

    const videoId = videoIdMatch[1]
    const timestamp = Date.now()
    const filename = `youtube/${videoId}-${timestamp}.mp3`
    const tempFile = `/tmp/audio.mp3`

    console.log(`[worker] Downloading audio for video ID: ${videoId}`)

    // Download audio using yt-dlp
    try {
      execSync(`yt-dlp -x --audio-format mp3 -o "${tempFile}" "${youtubeUrl}"`, {
        stdio: "pipe",
        timeout: 300000, // 5 minute timeout
      })
    } catch (downloadError) {
      console.log("[worker] YouTube worker error: yt-dlp failed:", downloadError.message)
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Failed to download audio",
        }),
      }
    }

    // Check if file exists and get size
    if (!fs.existsSync(tempFile)) {
      console.log("[worker] YouTube worker error: Audio file not created")
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Failed to download audio",
        }),
      }
    }

    const fileStats = fs.statSync(tempFile)
    const fileSizeInMB = fileStats.size / (1024 * 1024)

    // Check file size limit (100MB)
    if (fileSizeInMB > 100) {
      console.log(`[worker] YouTube worker error: File too large (${fileSizeInMB.toFixed(2)}MB)`)
      fs.unlinkSync(tempFile) // Clean up
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Audio file too large (>100MB)",
        }),
      }
    }

    console.log(`[worker] Uploading ${fileSizeInMB.toFixed(2)}MB file to S3`)

    // Upload to S3
    try {
      const fileBuffer = fs.readFileSync(tempFile)

      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: filename,
        Body: fileBuffer,
        ContentType: "audio/mpeg",
        ACL: "public-read",
      }

      const uploadResult = await s3.upload(uploadParams).promise()

      // Clean up temp file
      fs.unlinkSync(tempFile)

      console.log(`[worker] Successfully uploaded to S3: ${uploadResult.Location}`)

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: true,
          fileUrl: uploadResult.Location,
        }),
      }
    } catch (uploadError) {
      console.log("[worker] YouTube worker error: S3 upload failed:", uploadError.message)

      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Failed to upload audio",
        }),
      }
    }
  } catch (error) {
    console.log("[worker] YouTube worker error: Unexpected error:", error.message)

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
      }),
    }
  }
}
/*
// Handle OPTIONS requests for CORS
exports.handler.options = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: "",
  }
}
