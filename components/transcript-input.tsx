"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Settings, Loader2, X, File, Link, ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { saveStudySession } from "@/lib/firebase/firestore"
import { checkGenerationLimit, recordGeneration, checkInputLimits } from "@/lib/plans/plan-limits"
import { useToast } from "@/hooks/use-toast"
import AuthModal from "@/components/auth/auth-modal"
import UsageLimitModal from "@/components/plans/usage-limit-modal"
import ExplainMode from "@/components/explain-mode"
import SummariseMode from "@/components/summarise-mode"
import type { StudyMode } from "./locale-page-client"

interface TranscriptInputProps {
  transcript: string
  setTranscript: (transcript: string) => void
  onQuestionsGenerated: (questions: any[]) => void
  mode: StudyMode // Added mode prop
  setting?: string
}

export default function TranscriptInput({
  transcript,
  setTranscript,
  onQuestionsGenerated,
  mode,
  setting = "medium",
}: TranscriptInputProps) {
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

  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitMessage, setLimitMessage] = useState("")

  const [explainResult, setExplainResult] = useState<any>(null)
  const [summariseResult, setSummariseResult] = useState<any>(null)

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
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Check plan limits
    const planLimits = checkInputLimits(userProfile?.plan || "free", text, selectedFile ? 1 : 0)
    if (!planLimits.valid) {
      setLimitMessage(planLimits.reason || "Plan limit exceeded")
      setShowLimitModal(true)
      return
    }

    // Check generation limits
    const canGenerate = await checkGenerationLimit(user.uid)
    if (!canGenerate.allowed) {
      setLimitMessage(canGenerate.reason || "Generation limit reached")
      setShowLimitModal(true)
      return
    }

    setIsGenerating(true)
    try {
      let apiEndpoint = "/api/generate-questions"
      let requestBody: any = {
        text: text,
        userId: user.uid,
        setting: setting,
      }

      if (mode === "study") {
        requestBody = {
          ...requestBody,
          difficulty,
          questionCount: Number.parseInt(questionCount),
          questionType,
        }
      } else if (mode === "explain") {
        apiEndpoint = "/api/explain-feedback"
        return
      } else if (mode === "summarise") {
        apiEndpoint = "/api/summarise"
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${mode === "summarise" ? "generate summary" : "generate questions"}`)
      }

      const data = await response.json()

      await recordGeneration(user.uid)

      const sessionTitle = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Session - ${new Date().toLocaleDateString()}`
      const sessionData: any = {
        userId: user.uid,
        title: sessionTitle,
        createdAt: new Date(),
        transcript: text,
        mode: mode,
        setting: setting,
      }

      if (mode === "study") {
        sessionData.questions = data.questions
        onQuestionsGenerated(data.questions)
      } else if (mode === "summarise") {
        sessionData.summary = data.summary
        setSummariseResult(data)
      }

      const sessionId = await saveStudySession(sessionData)

      if (sessionId) {
        toast({
          title: "Study Session Saved",
          description: `Your ${mode} session has been saved to your dashboard`,
        })
      }
    } catch (error) {
      console.error(`Error in ${mode} mode:`, error)
      toast({
        title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Failed`,
        description: `There was an error processing your ${mode} request. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleYouTubeProcess = async () => {
    if (!youtubeUrl.trim()) {
      setYoutubeError("Please provide a YouTube link.")
      return
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/
    if (!youtubeRegex.test(youtubeUrl)) {
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setTranscript(value)

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/
    if (youtubeRegex.test(value.trim())) {
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
    setShowDifficultyDropdown(false)
    setShowCountDropdown(false)
    setShowTypeDropdown(false)

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

  const getPlaceholderText = () => {
    switch (mode) {
      case "explain":
        return "Write your explanation of the material here. The AI will provide feedback based on your selected audience level..."
      case "summarise":
        return "Paste your content here to generate a summary. The AI will create a summary based on your selected style..."
      default:
        return "Paste your transcript, notes, or any text you want to study from..."
    }
  }

  if (mode === "explain") {
    return (
      <ExplainMode
        transcript={transcript}
        setTranscript={setTranscript}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        fileInputRef={fileInputRef}
        onResult={setExplainResult}
        result={explainResult}
        setting={setting}
      />
    )
  }

  if (mode === "summarise") {
    return (
      <SummariseMode
        transcript={transcript}
        setTranscript={setTranscript}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        fileInputRef={fileInputRef}
        onResult={setSummariseResult}
        result={summariseResult}
        setting={setting}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground text-balance">Transform Your Learning Materials</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Upload transcripts, videos, or audio files to generate personalized practice questions
        </p>
        {!user && (
          <p className="text-sm text-muted-foreground">
            <Button variant="link" className="p-0 h-auto text-accent" onClick={() => setShowAuthModal(true)}>
              Sign in
            </Button>{" "}
            to save your study sessions and track your progress
          </p>
        )}
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
              placeholder={getPlaceholderText()}
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
                                    setShowDifficultyDropdown(false)
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
                                    setShowDifficultyDropdown(false)
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
                                    setShowDifficultyDropdown(false)
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
                                    setShowCountDropdown(false)
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
                                    setShowCountDropdown(false)
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
                                    setShowCountDropdown(false)
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
                                    setShowCountDropdown(false)
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
                                    setShowTypeDropdown(false)
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
                                    setShowTypeDropdown(false)
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
                                    setShowTypeDropdown(false)
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
                                    setShowTypeDropdown(false)
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
                                    setShowTypeDropdown(false)
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
                  onClick={handleYouTubeProcess}
                  disabled={isProcessing || !detectedYoutubeUrl}
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          toast({
            title: "Welcome!",
            description: "You can now generate and save study sessions",
          })
        }}
      />

      <UsageLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} message={limitMessage} />
    </div>
  )
}
