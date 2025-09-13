const express = require("express")
const cors = require("cors")
const { handler } = require("./lambda-youtube-worker")

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() })
})

// YouTube download endpoint
app.post("/api/download-audio", async (req, res) => {
  try {
    // Convert Express request to Lambda event format
    const event = {
      body: JSON.stringify(req.body),
      headers: req.headers,
      httpMethod: "POST",
    }

    // Call Lambda handler
    const result = await handler(event)

    // Send response
    res.status(result.statusCode)

    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.set(key, value)
      })
    }

    if (result.body) {
      const responseData = JSON.parse(result.body)
      res.json(responseData)
    } else {
      res.end()
    }
  } catch (error) {
    console.error("[worker] Server error:", error)
    res.status(500).json({
      error: "Internal server error",
    })
  }
})

// Handle OPTIONS requests
app.options("/api/download-audio", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
  res.status(200).end()
})

app.listen(port, () => {
  console.log(`[worker] YouTube worker server running on port ${port}`)
})
