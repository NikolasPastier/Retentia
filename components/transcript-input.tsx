"use client"

import type React from "react"
import MediaUpload from "@/components/media-upload"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Video, Mic, ArrowRight, File, Link, Loader2, X, CheckCircle } from "lucide-react"

interface TranscriptInputProps {
  transcript: string
  setTranscript: (transcript: string) => void
  onQuestionsGenerated: (questions: any[]) => void
}

export default function TranscriptInput({ transcript, setTranscript, onQuestionsGenerated }: TranscriptInputProps) {
  const [uploadType, setUploadType] = useState<"text" | "video" | "audio" | "file" | "link">("text")
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground text-balance">Transform Your Learning Materials</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Upload transcripts, videos, or audio files to generate personalized practice questions
        </p>
      </div>

      <Card className="glass-card smooth-transition hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-accent" />
            Upload Learning Material
          </CardTitle>
          <CardDescription>Choose how you'd like to input your learning content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant={uploadType === "text" ? "default" : "outline"}
              onClick={() => setUploadType("text")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Text
            </Button>
            <Button
              variant={uploadType === "file" ? "default" : "outline"}
              onClick={() => setUploadType("file")}
              className="flex items-center gap-2"
            >
              <File className="h-4 w-4" />
              File
            </Button>
            <Button
              variant={uploadType === "link" ? "default" : "outline"}
              onClick={() => setUploadType("link")}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Link
            </Button>
            <Button
              variant={uploadType === "video" ? "default" : "outline"}
              onClick={() => setUploadType("video")}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Video
            </Button>
            <Button
              variant={uploadType === "audio" ? "default" : "outline"}
              onClick={() => setUploadType("audio")}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Audio
            </Button>
          </div>

          {uploadType === "text" && (
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Paste your transcript, notes, or any text you want to study from..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[300px] pr-20"
                  maxLength={10000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded border">
                  {transcript.length}/10,000
                </div>
              </div>
            </div>
          )}

          {uploadType === "file" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Upload text files</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: TXT, MD (PDF and DOCX support coming soon)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  Choose File
                </Button>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {uploadError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              {selectedFile && (
                <div className="flex justify-center">
                  <Button onClick={handleFileUpload} disabled={isUploading} className="flex items-center gap-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing File...
                      </>
                    ) : (
                      <>
                        Upload File
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {uploadType === "link" && (
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold">YouTube Video Link</h3>
                </div>
                <div className="space-y-4">
                  {!process.env.NEXT_PUBLIC_YOUTUBE_WORKER_URL && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 mb-2">
                        <strong>Worker Service Configuration Required</strong>
                      </p>
                      <p className="text-xs text-amber-700 mb-3">
                        Enter your deployed YouTube worker service URL to enable YouTube processing.
                      </p>
                      <Input
                        placeholder="https://your-worker.execute-api.region.amazonaws.com/dev"
                        value={workerUrl}
                        onChange={(e) => setWorkerUrl(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )}

                  <Input
                    placeholder="Paste YouTube video URL here (e.g., https://youtube.com/watch?v=...)"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value)
                      setYoutubeError(null)
                    }}
                    className={youtubeError ? "border-destructive" : ""}
                  />

                  {youtubeError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{youtubeError}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Try using the "Text" tab to paste a transcript manually, or upload an audio/video file instead.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      onClick={handleYouTubeProcess}
                      disabled={
                        !youtubeUrl.trim() ||
                        isProcessingYoutube ||
                        (!workerUrl && !process.env.NEXT_PUBLIC_YOUTUBE_WORKER_URL)
                      }
                      className="flex items-center gap-2"
                    >
                      {isProcessingYoutube ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing Video...
                        </>
                      ) : (
                        <>
                          Process YouTube Video
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  We'll download the video's audio using our worker service, then transcribe it to generate study
                  questions. This works with any public YouTube video.
                </p>
              </div>
            </div>
          )}

          {(uploadType === "video" || uploadType === "audio") && (
            <MediaUpload onQuestionsGenerated={handleMediaQuestionsGenerated} />
          )}

          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="font-semibold text-foreground">Question Settings</h3>
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

          <div className="flex justify-end">
            <Button
              onClick={handleGenerateQuestions}
              disabled={!transcript.trim() || isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  Generate Questions
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
