// Comprehensive error handling utilities for the YouTube-to-questions feature

export interface APIError {
  message: string
  code: string
  statusCode: number
  details?: any
}

export class YouTubeProcessingError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(message: string, code: string, statusCode = 400, details?: any) {
    super(message)
    this.name = "YouTubeProcessingError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Error codes for different failure scenarios
export const ERROR_CODES = {
  INVALID_URL: "INVALID_URL",
  NO_CAPTIONS: "NO_CAPTIONS",
  TRANSCRIPT_TOO_SHORT: "TRANSCRIPT_TOO_SHORT",
  AI_GENERATION_FAILED: "AI_GENERATION_FAILED",
  INVALID_RESPONSE_FORMAT: "INVALID_RESPONSE_FORMAT",
  NETWORK_ERROR: "NETWORK_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  VIDEO_UNAVAILABLE: "VIDEO_UNAVAILABLE",
  PROCESSING_TIMEOUT: "PROCESSING_TIMEOUT",
} as const

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_URL]: "Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)",
  [ERROR_CODES.NO_CAPTIONS]:
    "This video doesn't have captions available. Please try a video with subtitles or paste the transcript manually.",
  [ERROR_CODES.TRANSCRIPT_TOO_SHORT]:
    "The video content is too short to generate meaningful questions. Please try a longer video.",
  [ERROR_CODES.AI_GENERATION_FAILED]:
    "Failed to generate questions from the video content. Please try again or use a different video.",
  [ERROR_CODES.INVALID_RESPONSE_FORMAT]: "The AI response was not in the expected format. Please try again.",
  [ERROR_CODES.NETWORK_ERROR]:
    "Network error occurred while processing the video. Please check your connection and try again.",
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "Too many requests. Please wait a moment before trying again.",
  [ERROR_CODES.VIDEO_UNAVAILABLE]: "This video is not available or may be private. Please try a different video.",
  [ERROR_CODES.PROCESSING_TIMEOUT]: "Video processing took too long. Please try a shorter video or try again later.",
} as const

export function createError(code: keyof typeof ERROR_CODES, details?: any): YouTubeProcessingError {
  const message = ERROR_MESSAGES[code]
  const statusCode = getStatusCodeForError(code)
  return new YouTubeProcessingError(message, code, statusCode, details)
}

function getStatusCodeForError(code: keyof typeof ERROR_CODES): number {
  switch (code) {
    case ERROR_CODES.INVALID_URL:
    case ERROR_CODES.NO_CAPTIONS:
    case ERROR_CODES.TRANSCRIPT_TOO_SHORT:
    case ERROR_CODES.VIDEO_UNAVAILABLE:
      return 400
    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return 429
    case ERROR_CODES.PROCESSING_TIMEOUT:
      return 408
    case ERROR_CODES.AI_GENERATION_FAILED:
    case ERROR_CODES.INVALID_RESPONSE_FORMAT:
    case ERROR_CODES.NETWORK_ERROR:
    default:
      return 500
  }
}

// Retry logic for transient errors
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Don't retry for client errors (4xx)
      if (error instanceof YouTubeProcessingError && error.statusCode < 500) {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      console.log(`[v0] Retry attempt ${attempt}/${maxRetries} failed:`, error)
      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError!
}

// Validate YouTube URL with detailed error information
export function validateYouTubeUrl(url: string): { isValid: boolean; error?: YouTubeProcessingError } {
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      error: createError(ERROR_CODES.INVALID_URL),
    }
  }

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/

  if (!youtubeRegex.test(url)) {
    return {
      isValid: false,
      error: createError(ERROR_CODES.INVALID_URL),
    }
  }

  return { isValid: true }
}

// Log errors with context for debugging
export function logError(error: Error, context: string, additionalData?: any) {
  console.error(`[v0] Error in ${context}:`, {
    message: error.message,
    name: error.name,
    stack: error.stack,
    additionalData,
  })
}
