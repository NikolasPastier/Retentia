"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Settings, Loader2, X, CheckCircle, File, Link } from "lucide-react"

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
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
      setShowUploadOptions(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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

  const handleGenerateQuestions = async () => {
    if (!transcript.trim()) return
    await generateQuestionsFromText(transcript)
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
      setYoutubeUrl(value.trim())
      setYoutubeError(null)
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

      <div className="relative">
        <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-lg">
          <div className="relative">
            <Textarea
              placeholder="Paste your transcript, notes, YouTube link, or any text you want to study from..."
              value={transcript}
              onChange={handleTextareaChange}
              className="min-h-[200px] bg-transparent border-none resize-none text-lg placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={10000}
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted border border-border/50"
                    onClick={() => setShowUploadOptions(!showUploadOptions)}
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

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-4 rounded-full bg-muted/50 hover:bg-muted border border-border/50 flex items-center gap-2"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{transcript.length}/10,000</span>

                {transcript.trim() && (
                  <Button onClick={handleGenerateQuestions} disabled={isGenerating} className="rounded-full" size="sm">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      "Generate Questions"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-foreground mb-4">Question Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Difficulty Level</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Number of Questions</label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Question Type</label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed Types</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="open-ended">Open Ended</SelectItem>
                    <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mt-4 bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleFileUpload} disabled={isUploading} size="sm" className="rounded-full">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-muted-foreground hover:text-foreground rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
          <div className="mt-4 bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">YouTube Video Detected</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">{youtubeUrl}</p>
                </div>
              </div>
              <Button
                onClick={handleYouTubeProcess}
                disabled={isProcessingYoutube || (!workerUrl && !process.env.NEXT_PUBLIC_YOUTUBE_WORKER_URL)}
                size="sm"
                className="rounded-full"
              >
                {isProcessingYoutube ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Process Video"
                )}
              </Button>
            </div>
          </div>
        )}

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
