"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileAudio, FileVideo, Loader2, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaUploadProps {
  onQuestionsGenerated: (questions: any[], transcript: string, filename: string) => void
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export default function MediaUpload({ onQuestionsGenerated }: MediaUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const FILE_SIZE_THRESHOLD = 8 * 1024 * 1024 // 8MB

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedFile(file)
    setError(null)
  }

  const handleApiError = async (response: Response): Promise<string> => {
    if (response.ok) return ""

    try {
      const errorData = await response.json()
      return errorData.error || `Request failed with status ${response.status}`
    } catch {
      try {
        const errorText = await response.text()
        return errorText || response.statusText || `Request failed with status ${response.status}`
      } catch {
        return response.statusText || `Request failed with status ${response.status}`
      }
    }
  }

  const uploadToS3 = async (file: File): Promise<string> => {
    console.log("[v0] Using S3 presigned upload for large file")
    setUploadProgress("Getting upload URL...")

    const sanitizedFilename = sanitizeFilename(file.name)

    const urlResponse = await fetch("/api/get-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: sanitizedFilename,
        contentType: file.type,
      }),
    })

    if (!urlResponse.ok) {
      const errorMsg = await handleApiError(urlResponse)
      throw new Error(`Failed to get upload URL: ${errorMsg}`)
    }

    const { url, fields, publicUrl } = await urlResponse.json()

    setUploadProgress("Uploading to S3...")

    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string)
    })
    formData.append("file", file)

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorMsg = await handleApiError(uploadResponse)
      throw new Error(`S3 upload failed: ${errorMsg}`)
    }

    console.log("[v0] S3 upload successful")
    return publicUrl
  }

  const handleProcessFile = async () => {
    if (!selectedFile) return

    setError(null)
    setIsProcessing(true)
    setUploadProgress("")

    try {
      console.log(`[v0] Processing file: ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB)`)

      let response: Response

      if (selectedFile.size > FILE_SIZE_THRESHOLD) {
        const fileUrl = await uploadToS3(selectedFile)

        setUploadProgress("Processing with AI...")

        response = await fetch("/api/media-to-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl,
            difficulty: "medium",
            questionCount: 5,
            questionType: "mixed",
          }),
        })
      } else {
        console.log("[v0] Using direct FormData upload for small file")
        setUploadProgress("Uploading and processing...")

        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("difficulty", "medium")
        formData.append("questionCount", "5")
        formData.append("questionType", "mixed")

        response = await fetch("/api/media-to-questions", {
          method: "POST",
          body: formData,
        })
      }

      if (!response.ok) {
        const errorMsg = await handleApiError(response)
        throw new Error(errorMsg)
      }

      const result = await response.json()

      if (result.success) {
        console.log("[v0] Questions generated successfully")
        onQuestionsGenerated(result.questions, result.transcript, result.filename)
        setSelectedFile(null)
        setUploadProgress("")
      } else {
        throw new Error(result.error || "Failed to generate questions")
      }
    } catch (err) {
      console.error("[v0] Media upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to process file")
    } finally {
      setIsProcessing(false)
      setUploadProgress("")
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    setUploadProgress("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isProcessing && "opacity-50 pointer-events-none",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Processing your file...</p>
              <p className="text-xs text-muted-foreground">
                {uploadProgress || "Transcribing audio and generating questions..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <FileAudio className="h-8 w-8 text-muted-foreground" />
              <FileVideo className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Drag and drop your file here, or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports: MP3, WAV, M4A, MP4, MOV (max 100MB)</p>
            </div>
            <Button onClick={handleFileSelect} variant="outline">
              Choose File
            </Button>
          </div>
        )}
      </div>

      {selectedFile && !isProcessing && (
        <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                {selectedFile.size > FILE_SIZE_THRESHOLD && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Large file - S3 upload
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleProcessFile} size="sm">
              Process File
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  )
}
