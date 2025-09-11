"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileAudio, FileVideo, Loader2, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaUploadProps {
  onQuestionsGenerated: (questions: any[], transcript: string, filename: string) => void
}

export default function MediaUpload({ onQuestionsGenerated }: MediaUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedFile(file)
    setError(null)
  }

  const handleProcessFile = async () => {
    if (!selectedFile) return

    setError(null)
    setIsProcessing(true)

    try {
      console.log(`[v0] Processing file: ${selectedFile.name}`)

      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/media-to-questions", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process file")
      }

      if (result.success) {
        onQuestionsGenerated(result.questions, result.transcript, result.filename)
        setSelectedFile(null)
      } else {
        throw new Error("Failed to generate questions")
      }
    } catch (err) {
      console.error("[v0] Media upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to process file")
    } finally {
      setIsProcessing(false)
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
              <p className="text-xs text-muted-foreground">Transcribing audio and generating questions...</p>
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
              <p className="text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
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
