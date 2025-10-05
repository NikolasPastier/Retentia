"use client"

import type React from "react"
import { useTranslations } from "@/lib/i18n/context"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Settings, Loader2, ChevronDown, CheckCircle, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import StudySettingsDropdown from "@/components/study-settings-dropdown"
import type { StudyMode } from "./locale-page-client"

const getPlaceholderText = (mode: StudyMode) => {
  switch (mode) {
    case "questions":
      return "Enter your study material here..."
    case "explain":
      return "Write your explanation here as if explaining to a 10-year-old..."
    case "summarize":
      return "Paste your material here..."
    default:
      return "Enter your study material here..."
  }
}

interface TranscriptInputProps {
  transcript: string
  setTranscript: (transcript: string) => void
  onQuestionsGenerated: (questions: any[]) => void
  mode: StudyMode
  setting?: string
  onModeChange: (mode: StudyMode) => void
}

export default function TranscriptInput({
  transcript,
  setTranscript,
  onQuestionsGenerated,
  mode,
  setting = "medium",
  onModeChange,
}: TranscriptInputProps) {
  const [difficulty, setDifficulty] = useState("medium")
  const [questionCount, setQuestionCount] = useState("5")
  const [questionType, setQuestionType] = useState("mixed")
  const [result, setResult] = useState<any>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  const { toast } = useToast()

  const [summarizeSetting, setSummarizeSetting] = useState<"brief" | "in-depth" | "key-points">("brief")
  const [explainSetting, setExplainSetting] = useState<"child" | "teen" | "adult" | "senior">("child")

  const { t } = useTranslations()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideStudySettings = (target as Element).closest?.("[data-study-settings-dropdown]")

      if (dropdownRef.current && !dropdownRef.current.contains(target) && !isInsideStudySettings) {
        closeAllDropdowns()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setTranscript(value)
  }

  const hasContent = transcript.trim()
  const isProcessing = isGenerating

  const closeAllDropdowns = () => {
    setShowSettingsDropdown(false)
    setShowModeSelector(false)
  }

  const openDropdown = (dropdownType: string) => {
    if (dropdownType === "settings") {
      setShowSettingsDropdown(!showSettingsDropdown)
      setShowModeSelector(false)
      return
    }

    if (dropdownType === "mode" && showModeSelector) return closeAllDropdowns()

    closeAllDropdowns()

    if (dropdownType === "mode") {
      setShowModeSelector(true)
    }
  }

  const getModeDisplayName = (m: StudyMode) => {
    switch (m) {
      case "questions":
        return "Questions"
      case "explain":
        return "Explain"
      case "summarize":
        return "Summarize"
      default:
        return "Questions"
    }
  }

  const handleGenerate = async () => {
    await handleSubmit()
  }

  const handleSubmit = async () => {
    setIsGenerating(true)
    try {
      const currentMode = mode || "questions"

      let apiEndpoint = "/api/generate-questions"
      let requestBody: any = {
        text: transcript,
        setting: setting,
      }

      if (currentMode === "questions") {
        requestBody = {
          ...requestBody,
          difficulty,
          questionCount: Number.parseInt(questionCount),
          questionType,
        }
      } else if (currentMode === "explain") {
        apiEndpoint = "/api/explain-feedback"
        requestBody = {
          explanation: transcript,
          audience: explainSetting,
        }
      } else if (currentMode === "summarize") {
        apiEndpoint = "/api/summarize"
        requestBody = {
          text: transcript,
          setting: summarizeSetting,
        }
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${
            currentMode === "summarize"
              ? "generate summary"
              : currentMode === "explain"
                ? "get feedback"
                : "generate questions"
          }`,
        )
      }

      const data = await response.json()

      if (currentMode === "questions") {
        onQuestionsGenerated(data.questions)
      } else if (currentMode === "explain") {
        setResult(data)
      } else if (currentMode === "summarize") {
        setResult(data)
      }

      toast({
        title: `${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Complete`,
        description: `Your ${currentMode} request has been processed successfully`,
      })
    } catch (error) {
      toast({
        title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Failed`,
        description: `There was an error processing your ${mode} request. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    setResult(null)
  }, [mode])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div
        className="relative"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAllDropdowns()
        }}
      >
        <div className="bg-gradient-to-b from-slate-800/90 via-slate-800/80 to-emerald-900/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
          <div className="relative">
            <Textarea
              placeholder={getPlaceholderText(mode)}
              value={transcript}
              onChange={handleTextareaChange}
              className="min-h-[200px] bg-transparent border-none resize-none text-lg text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 caret-white"
              maxLength={mode === "summarize" ? 15000 : mode === "explain" ? 5000 : 10000}
            />

            <div className="flex items-center justify-between mt-4">
              <div className="relative z-[100] flex items-center gap-3" ref={dropdownRef}>
                {/* Mode Selector */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center gap-2 text-white"
                    onClick={() => openDropdown("mode")}
                  >
                    <span className="text-sm">Mode</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {showModeSelector && (
                    <div className="absolute bottom-full mb-2 left-0 bg-gradient-to-b from-slate-800/95 via-slate-800/90 to-emerald-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl z-[110] min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {/* Caret arrow */}
                      <div className="absolute -bottom-2 left-4 w-4 h-4 bg-slate-800/95 rotate-45 border-r border-b border-white/10" />

                      <div className="relative space-y-1">
                        {[
                          { id: "questions", label: "Questions" },
                          { id: "explain", label: "Explain" },
                          { id: "summarize", label: "Summarize" },
                        ].map((modeOption) => (
                          <button
                            key={modeOption.id}
                            onClick={() => {
                              onModeChange(modeOption.id as StudyMode)
                              setShowModeSelector(false)
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                              mode === modeOption.id
                                ? "bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20"
                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span>{modeOption.label}</span>
                            {mode === modeOption.id && <Check className="h-4 w-4 text-cyan-300" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings Button */}
                <div className="relative">
                  <Button
                    ref={settingsButtonRef}
                    variant="ghost"
                    size="sm"
                    className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center gap-2 text-white"
                    onClick={() => openDropdown("settings")}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </Button>

                  <StudySettingsDropdown
                    isOpen={showSettingsDropdown}
                    onClose={closeAllDropdowns}
                    mode={mode}
                    buttonRef={settingsButtonRef}
                    difficulty={difficulty}
                    questionCount={questionCount}
                    questionType={questionType}
                    onDifficultyChange={setDifficulty}
                    onQuestionCountChange={setQuestionCount}
                    onQuestionTypeChange={setQuestionType}
                    summarizeSetting={summarizeSetting}
                    onSummarizeSettingChange={(setting) => {
                      setResult(null)
                      setSummarizeSetting(setting)
                    }}
                    explainSetting={explainSetting}
                    onExplainSettingChange={(setting) => {
                      setResult(null)
                      setExplainSetting(setting)
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  {transcript.length}/{mode === "summarize" ? "15,000" : mode === "explain" ? "5,000" : "10,000"}
                </span>

                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !transcript.trim()}
                  className="group relative h-12 w-12 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 disabled:from-gray-100 disabled:to-gray-200 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:shadow-sm"
                  title={t("generate")}
                  aria-label={t("generate")}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 text-gray-800 animate-spin absolute inset-0 m-auto" />
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-800 absolute inset-0 m-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {result && (mode === "explain" || mode === "summarize") && (
        <Card className="bg-gradient-to-b from-slate-800/90 via-slate-800/80 to-emerald-900/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5 text-green-400" />
              {mode === "explain" ? t("results.aiFeedback") : t("results.summary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mode === "explain" && (
              <>
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{t("results.understandingRating")}</h3>
                    <div
                      className={`text-6xl font-bold ${
                        result.rating >= 80
                          ? "text-green-400"
                          : result.rating >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {result.rating}%
                    </div>
                    <Progress value={result.rating} className="w-full max-w-md mx-auto h-3" />
                    <p className="text-sm text-gray-300">{t("results.ratingDescription")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">{t("results.detailedFeedback")}</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 whitespace-pre-wrap">{result.feedback}</p>
                  </div>
                </div>

                {result.improvements && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">{t("results.suggestedImprovements")}</h4>
                    <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-400/30">
                      <p className="text-cyan-200 text-sm">{result.improvements}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === "summarize" && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">{t("results.overview")}</h3>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 whitespace-pre-wrap">{result.summary || result?.data?.summary || ""}</p>
                  </div>
                </div>

                {(result.keyPoints?.length ? result.keyPoints : result?.data?.keyPoints) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t("results.keyPoints")}</h3>
                    <div className="space-y-2">
                      {(result.keyPoints ?? result?.data?.keyPoints).map((point: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-400/30"
                        >
                          <Badge variant="outline" className="mt-0.5 text-xs border-white/20 text-gray-300">
                            {index + 1}
                          </Badge>
                          <p className="text-emerald-200 text-sm">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(result.concepts?.length ? result.concepts : result?.data?.concepts) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t("results.importantConcepts")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(result.concepts ?? result?.data?.concepts).map((concept: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-white/10 border-white/20 text-gray-300"
                        >
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
