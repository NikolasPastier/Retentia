"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Settings, Loader2, X, File, Link, ChevronRight } from "lucide-react"

interface TranscriptInputProps {
  transcript: string
  setTranscript: (transcript: string) => void
  onQuestionsGenerated: (questions: any[]) => void
}

export default function TranscriptInput({ transcript, setTranscript, onQuestionsGenerated }: TranscriptInputProps) {
  const [difficulty, setDifficulty] = useState("medium")
  const [questionCount, setQuestionCount] = useState("5")
  const [questionType, setQuestionType] = useState("mixed")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isProcessingYoutube, setIsProcessingYoutube] = useState(false)
  const [youtubeError, setYoutubeError] = useState<string | null>(null)
  const [workerUrl, setWorkerUrl] = useState(process.env.NEXT_PUBLIC_YOUTUBE_WORKER_URL || "")
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false)
  const [showCountDropdown, setShowCountDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [detectedYoutubeUrl, setDetectedYoutubeUrl] = useState("")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeAllDropdowns()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
      setShowUploadOptions(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please choose a file to upload.")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      console.log("[v0] Starting file upload for:", selectedFile.name)

      const formData = new FormData()
      formData.append("file", selectedFile)

      console.log("[v0] FormData created, making request to /api/upload-file")

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response received:", response.status, response.statusText)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.log("[v0] Response not OK, parsing error")
        let errorMessage = "Failed to upload file"
        try {
          const errorData = await response.json()
          console.log("[v0] Error data:", errorData)
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.log("[v0] Failed to parse error response:", parseError)
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      let data
      try {
        data = await response.json()
        console.log("[v0] Success data received:", { ...data, text: `${data.text?.length || 0} chars` })
      } catch (parseError) {
        console.error("[v0] Failed to parse success response:", parseError)
        throw new Error("Invalid response format from server")
      }

      if (!data || !data.success || typeof data.text !== "string") {
        console.log("[v0] Invalid response structure:", data)
        throw new Error("Invalid response: missing text content")
      }

      console.log("[v0] Setting transcript with extracted text")
      setTranscript(data.text)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      console.log("[v0] File upload completed successfully")
    } catch (error) {
      console.error("[v0] File upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const generateQuestionsFromText = async (text: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          difficulty,
          questionCount: Number.parseInt(questionCount),
          questionType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      const data = await response.json()
      onQuestionsGenerated(data.questions)
    } catch (error) {
      console.error("Error generating questions:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConsolidatedGenerate = async () => {
    if (!hasContent) return

    try {
      // If there's a selected file, upload and process it first
      if (selectedFile) {
        setIsUploading(true)
        setUploadError(null)

        const formData = new FormData()
        formData.append("file", selectedFile)

        const response = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          let errorMessage = "Failed to upload file"
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = response.statusText || errorMessage
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        if (!data || !data.success || typeof data.text !== "string") {
          throw new Error("Invalid response: missing text content")
        }

        // Set transcript and clear file, then generate questions
        setTranscript(data.text)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        setIsUploading(false)

        // Generate questions from the uploaded file content
        await generateQuestionsFromText(data.text)
        return
      }

      // If there's a YouTube URL, process it
      if (detectedYoutubeUrl && isValidYouTubeUrl(detectedYoutubeUrl)) {
        if (!workerUrl) {
          setYoutubeError("YouTube worker service is not configured. Please contact support.")
          return
        }

        setIsProcessingYoutube(true)
        setYoutubeError(null)

        // Call worker service to download audio
        const workerResponse = await fetch(`${workerUrl}/api/download-audio`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            youtubeUrl: detectedYoutubeUrl.trim(),
          }),
        })

        const workerData = await workerResponse.json()

        if (!workerResponse.ok) {
          let errorMessage = "Failed to download YouTube audio"
          if (workerData.error) {
            errorMessage = workerData.error
          }
          throw new Error(errorMessage)
        }

        if (!workerData.success || !workerData.fileUrl) {
          throw new Error("Worker did not return a valid audio file URL")
        }

        // Process with Vercel API
        const response = await fetch("/api/youtube-to-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileUrl: workerData.fileUrl,
            difficulty,
            questionCount: Number.parseInt(questionCount),
            questionType,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          let errorMessage = "Failed to process YouTube video"
          try {
            errorMessage = data.error || errorMessage
          } catch {
            errorMessage = response.statusText || errorMessage
          }
          throw new Error(errorMessage)
        }

        if (data.success === false) {
          setYoutubeError(data.error || "Failed to process the audio file.")
          return
        }

        if (data.questions && data.questions.length > 0) {
          onQuestionsGenerated(data.questions)
          setDetectedYoutubeUrl("")
          setTranscript("")
        } else if (data.transcript) {
          setTranscript(data.transcript)
          setDetectedYoutubeUrl("")
        } else {
          throw new Error("No content received from YouTube video")
        }

        setIsProcessingYoutube(false)
        return
      }

      // If there's only text, generate questions directly
      if (transcript.trim()) {
        await generateQuestionsFromText(transcript)
      }
    } catch (error) {
      console.error("Error in consolidated generate:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process content"

      if (selectedFile) {
        setUploadError(errorMessage)
        setIsUploading(false)
      } else if (detectedYoutubeUrl) {
        setYoutubeError(errorMessage)
        setIsProcessingYoutube(false)
      }
    }
  }

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/
    return youtubeRegex.test(url)
  }

  const handleYouTubeProcess = async () => {
    if (!youtubeUrl.trim()) {
      setYoutubeError("Please provide a YouTube link.")
      return
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      setYoutubeError("Please enter a valid YouTube URL.")
      return
    }

    if (!workerUrl) {
      setYoutubeError("YouTube worker service is not configured. Please contact support.")
      return
    }

    setIsProcessingYoutube(true)
    setYoutubeError(null)

    try {
      console.log("[v0] Processing YouTube URL with worker:", youtubeUrl)

      console.log("[v0] Calling worker service to download audio")
      const workerResponse = await fetch(`${workerUrl}/api/download-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
        }),
      })

      console.log("[v0] Worker response:", workerResponse.status, workerResponse.statusText)

      const workerData = await workerResponse.json()

      if (!workerResponse.ok) {
        let errorMessage = "Failed to download YouTube audio"
        if (workerData.error) {
          errorMessage = workerData.error
        }
        throw new Error(errorMessage)
      }

      if (!workerData.success || !workerData.fileUrl) {
        throw new Error("Worker did not return a valid audio file URL")
      }

      console.log("[v0] Audio downloaded successfully, processing with Vercel API")

      const response = await fetch("/api/youtube-to-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: workerData.fileUrl,
          difficulty,
          questionCount: Number.parseInt(questionCount),
          questionType,
        }),
      })

      console.log("[v0] Vercel API response:", response.status, response.statusText)

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = "Failed to process YouTube video"
        try {
          errorMessage = data.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      if (data.success === false) {
        setYoutubeError(data.error || "Failed to process the audio file.")
        return
      }

      console.log("[v0] YouTube processing successful")

      if (data.questions && data.questions.length > 0) {
        onQuestionsGenerated(data.questions)
        setYoutubeUrl("")
      } else if (data.transcript) {
        setTranscript(data.transcript)
        setYoutubeUrl("")
      } else {
        throw new Error("No content received from YouTube video")
      }
    } catch (error) {
      console.error("[v0] YouTube processing error:", error)
      let errorMessage = error instanceof Error ? error.message : "Failed to process YouTube video"

      if (errorMessage.includes("Failed to download audio")) {
        errorMessage += ". The video may be private, age-restricted, or unavailable."
      } else if (errorMessage.includes("Audio file too large")) {
        errorMessage += ". Please try a shorter video (under 100MB audio)."
      } else if (errorMessage.includes("worker service is not configured")) {
        errorMessage += " Please check your environment configuration."
      }

      setYoutubeError(errorMessage)
    } finally {
      setIsProcessingYoutube(false)
    }
  }

  const handleMediaQuestionsGenerated = (questions: any[], transcriptText: string, filename: string) => {
    console.log(`[v0] Media questions generated from ${filename}`)
    setTranscript(transcriptText)
    onQuestionsGenerated(questions)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setTranscript(value)

    if (isValidYouTubeUrl(value.trim())) {
      setDetectedYoutubeUrl(value.trim())
      setYoutubeError(null)
    } else {
      setDetectedYoutubeUrl("")
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const hasContent = transcript.trim() || selectedFile || detectedYoutubeUrl

  const isProcessing = isGenerating || isUploading || isProcessingYoutube

  const closeAllDropdowns = () => {
    setShowSettingsDropdown(false)
    setShowDifficultyDropdown(false)
    setShowCountDropdown(false)
    setShowTypeDropdown(false)
    setShowUploadOptions(false)
  }

  const openDropdown = (dropdownType: string) => {
    if (dropdownType === "settings" && showSettingsDropdown) {
      closeAllDropdowns()
      return
    }
    if (dropdownType === "upload" && showUploadOptions) {
      closeAllDropdowns()
      return
    }

    closeAllDropdowns()

    switch (dropdownType) {
      case "settings":
        setShowSettingsDropdown(true)
        break
      case "upload":
        setShowUploadOptions(true)
        break
      case "difficulty":
        setShowDifficultyDropdown(true)
        break
      case "count":
        setShowCountDropdown(true)
        break
      case "type":
        setShowTypeDropdown(true)
        break
    }
  }

  const openSubMenu = (subMenuType: string) => {
    // Close all sub-menus first
    setShowDifficultyDropdown(false)
    setShowCountDropdown(false)
    setShowTypeDropdown(false)

    // Open the requested sub-menu
    switch (subMenuType) {
      case "difficulty":
        setShowDifficultyDropdown(true)
        break
      case "count":
        setShowCountDropdown(true)
        break
      case "type":
        setShowTypeDropdown(true)
        break
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground text-balance">Transform Your Learning Materials</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Upload transcripts, videos, or audio files to generate personalized practice questions
        </p>
      </div>

      <div
        className="relative"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAllDropdowns()
        }}
      >
        <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-lg">
          {(selectedFile || detectedYoutubeUrl) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedFile && (
                <div className="inline-flex items-center gap-2 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5 text-sm">
                  <File className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-5 w-5 p-0 hover:bg-muted-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {detectedYoutubeUrl && (
                <div className="inline-flex items-center gap-2 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5 text-sm">
                  <Link className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">YouTube Video</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDetectedYoutubeUrl("")
                      setTranscript("")
                    }}
                    className="h-5 w-5 p-0 hover:bg-muted-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <Textarea
              placeholder="Paste your transcript, notes, YouTube link, or any text you want to study from..."
              value={transcript}
              onChange={handleTextareaChange}
              className="min-h-[200px] bg-transparent border-none resize-none text-lg text-white placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 caret-white"
              maxLength={10000}
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3" ref={dropdownRef}>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted border border-border/50"
                    onClick={() => openDropdown("upload")}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>

                  {showUploadOptions && (
                    <div className="absolute bottom-12 left-0 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-10 min-w-[200px]">
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-sm"
                          onClick={() => {
                            fileInputRef.current?.click()
                            setShowUploadOptions(false)
                          }}
                        >
                          <File className="h-4 w-4" />
                          Upload File
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-sm"
                          onClick={() => {
                            const textarea = document.querySelector("textarea")
                            textarea?.focus()
                            setShowUploadOptions(false)
                          }}
                        >
                          <Link className="h-4 w-4" />
                          Paste YouTube Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-4 rounded-full bg-muted/50 hover:bg-muted border border-border/50 flex items-center gap-2"
                    onClick={() => openDropdown("settings")}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </Button>

                  {showSettingsDropdown && (
                    <div className="absolute bottom-12 left-0 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-20 min-w-[280px]">
                      <div className="space-y-1">
                        {/* Difficulty Setting */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between gap-2 text-sm"
                            onClick={() => openSubMenu("difficulty")}
                          >
                            <span>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>

                          {showDifficultyDropdown && (
                            <div className="absolute left-full top-0 ml-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-30 min-w-[120px]">
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setDifficulty("easy")
                                    closeAllDropdowns()
                                  }}
                                >
                                  Easy
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setDifficulty("medium")
                                    closeAllDropdowns()
                                  }}
                                >
                                  Medium
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setDifficulty("hard")
                                    closeAllDropdowns()
                                  }}
                                >
                                  Hard
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Question Count Setting */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between gap-2 text-sm"
                            onClick={() => openSubMenu("count")}
                          >
                            <span>Questions: {questionCount}</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>

                          {showCountDropdown && (
                            <div className="absolute left-full top-0 ml-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-30 min-w-[140px]">
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionCount("3")
                                    closeAllDropdowns()
                                  }}
                                >
                                  3 Questions
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionCount("5")
                                    closeAllDropdowns()
                                  }}
                                >
                                  5 Questions
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionCount("10")
                                    closeAllDropdowns()
                                  }}
                                >
                                  10 Questions
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionCount("15")
                                    closeAllDropdowns()
                                  }}
                                >
                                  15 Questions
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Question Type Setting */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between gap-2 text-sm"
                            onClick={() => openSubMenu("type")}
                          >
                            <span>
                              Type:{" "}
                              {questionType === "mixed"
                                ? "Mixed Types"
                                : questionType
                                    .split("-")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>

                          {showTypeDropdown && (
                            <div className="absolute left-full top-0 ml-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-30 min-w-[160px]">
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionType("mixed")
                                    closeAllDropdowns()
                                  }}
                                >
                                  Mixed Types
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionType("multiple-choice")
                                    closeAllDropdowns()
                                  }}
                                >
                                  Multiple Choice
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionType("true-false")
                                    closeAllDropdowns()
                                  }}
                                >
                                  True/False
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionType("open-ended")
                                    closeAllDropdowns()
                                  }}
                                >
                                  Open Ended
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setQuestionType("fill-blank")
                                    closeAllDropdowns()
                                  }}
                                >
                                  Fill in the Blank
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{transcript.length}/10,000</span>

                <Button
                  onClick={handleConsolidatedGenerate}
                  disabled={isProcessing || !hasContent}
                  className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted border border-border/50 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="sm"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {(uploadError || youtubeError) && (
          <div className="mt-4 bg-destructive/10 backdrop-blur-sm border border-destructive/20 rounded-2xl p-4 shadow-lg">
            <p className="text-sm text-destructive">{uploadError || youtubeError}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,audio/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
