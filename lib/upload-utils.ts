/**
 * Utility functions for file uploads and processing
 */

export function sanitizeFilename(filename: string): string {
  // Replace any character that's not alphanumeric, dot, underscore, or hyphen with underscore
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export function validateFileType(filename: string, mimeType?: string): boolean {
  const allowedExtensions = ["mp3", "wav", "m4a", "mp4", "mov", "avi"]
  const allowedMimeTypes = [
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

  const fileExtension = filename.toLowerCase().split(".").pop()

  // Check extension
  const hasValidExtension = fileExtension && allowedExtensions.includes(fileExtension)

  // Check MIME type if provided
  const hasValidMimeType =
    !mimeType ||
    allowedMimeTypes.some((type) => mimeType === type || filename.toLowerCase().includes(type.split("/")[1]))

  return Boolean(hasValidExtension && hasValidMimeType)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function getFileTypeFromExtension(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop()

  switch (extension) {
    case "mp3":
      return "audio/mpeg"
    case "wav":
      return "audio/wav"
    case "m4a":
      return "audio/m4a"
    case "mp4":
      return "video/mp4"
    case "mov":
      return "video/quicktime"
    case "avi":
      return "video/avi"
    default:
      return "audio/mpeg"
  }
}

export class UploadError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "UploadError"
  }
}

export async function handleApiResponse(response: Response): Promise<any> {
  if (response.ok) {
    return await response.json()
  }

  let errorMessage: string

  try {
    const errorData = await response.json()
    errorMessage = errorData.error || `Request failed with status ${response.status}`
  } catch {
    try {
      const errorText = await response.text()
      errorMessage = errorText || response.statusText || `Request failed with status ${response.status}`
    } catch {
      errorMessage = response.statusText || `Request failed with status ${response.status}`
    }
  }

  throw new UploadError(errorMessage, "API_ERROR", response.status)
}
