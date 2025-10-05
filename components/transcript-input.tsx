"use client"

import type React from "react"
import StudySettingsDropdown from "@/components/study-settings-dropdown"
import { useTranslations } from "@/lib/i18n/context"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Settings, Loader2, ChevronDown, CheckCircle, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { StudyMode } from "./locale-page-client"

const getPlaceholderText = (mode: StudyMode) => {
  switch (mode) {
    case "questions":
      return "Enter your study material here..."
    case "explain":
      return "Paste your study material here..."
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
  const [userExplanation, setUserExplanation] = useState("")
  const [result, setResult] = useState<any>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false)
  const [showCountDropdown, setShowCountDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  const { toast } = useToast()

  const [summarizeSetting, setSummarizeSetting] = useState<"brief" | "in-depth" | "key-points">("brief")
  const [explainSetting, setExplainSetting] = useState<"child" | "teen" | "adult" | "senior">("adult")

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
    setShowDifficultyDropdown(false)
    setShowCountDropdown(false)
    setShowTypeDropdown(false)
    setShowModeSelector(false)
  }

  const openDropdown = (dropdownType: string) => {
    if (dropdownType === "settings") {
      setShowSettingsDropdown(!showSettingsDropdown)
      return
    }

    if (dropdownType === "mode" && showModeSelector) return closeAllDropdowns()

    closeAllDropdowns()

    switch (dropdownType) {
      case "mode":
        setShowModeSelector(true)
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
      let apiEndpoint = "/api/generate-questions"
      let requestBody: any = {
        text: transcript,
        setting: setting,
      }

      if (mode === "questions") {
        requestBody = {
          ...requestBody,
          difficulty,
          questionCount: Number.parseInt(questionCount),
          questionType,
        }
      } else if (mode === "explain") {
        apiEndpoint = "/api/explain-feedback"
        requestBody = {
          material: transcript,
          explanation: userExplanation,
          audience: explainSetting,
        }
      } else if (mode === "summarize") {
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
            mode === "summarize" ? "generate summary" : mode === "explain" ? "get feedback" : "generate questions"
          }`,
        )
      }

      const data = await response.json()

      if (mode === "questions") {
        onQuestionsGenerated(data.questions)
      } else if (mode === "explain") {
        setResult(data)
      } else if (mode === "summarize") {
        setResult(data)
      }

      toast({
        title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Complete`,
        description: `Your ${mode} request has been processed successfully`,
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

  const getSettingsOptions = () => {
    switch (mode) {
      case "questions":
        return (
          <>
            {/* Difficulty Setting */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between gap-2 text-sm"
                onClick={() => openDropdown("difficulty")}
              >
                <span>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showDifficultyDropdown && (
                <div className="absolute left-full top-0 ml-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-30 min-w-[120px]">
                  <div className="space-y-1">
                    {["easy", "medium", "hard"].map((diff) => (
                      <Button
                        key={diff}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-sm ${
                          difficulty === diff
                            ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setDifficulty(diff)
                          setShowDifficultyDropdown(false)
                        }}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </Button>
                    ))}
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
                onClick={() => openDropdown("count")}
              >
                <span>Questions: {questionCount}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showCountDropdown && (
                <div className="absolute left-full top-0 ml-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-30 min-w-[140px]">
                  <div className="space-y-1">
                    {["3", "5", "10", "15"].map((count) => (
                      <Button
                        key={count}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-sm ${
                          questionCount === count
                            ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setQuestionCount(count)
                          setShowCountDropdown(false)
                        }}
                      >
                        {count} Questions
                      </Button>
                    ))}
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
                onClick={() => openDropdown("type")}
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
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showTypeDropdown && (
                <div className="absolute left-full top-0 ml-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg z-30 min-w-[160px]">
                  <div className="space-y-1">
                    {[
                      { value: "mixed", label: "Mixed Types" },
                      { value: "multiple-choice", label: "Multiple Choice" },
                      { value: "true-false", label: "True/False" },
                      { value: "open-ended", label: "Open Ended" },
                      { value: "fill-blank", label: "Fill in the Blank" },
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-sm ${
                          questionType === type.value
                            ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setQuestionType(type.value)
                          setShowTypeDropdown(false)
                        }}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )
      case "summarize":
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm ${
                summarizeSetting === "brief"
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setResult(null)
                setSummarizeSetting("brief")
                onModeChange("summarize")
                setShowSettingsDropdown(false)
              }}
            >
              Briefly
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm ${
                summarizeSetting === "in-depth"
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setResult(null)
                setSummarizeSetting("in-depth")
                onModeChange("summarize")
                setShowSettingsDropdown(false)
              }}
            >
              In Depth
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm ${
                summarizeSetting === "key-points"
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setResult(null)
                setSummarizeSetting("key-points")
                onModeChange("summarize")
                setShowSettingsDropdown(false)
              }}
            >
              Key Points
            </Button>
          </>
        )
      case "explain":
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm ${
                explainSetting === "child"
                  ? "bg-purple-500/30 text-purple-300 border border-purple-400/50 shadow-lg shadow-purple-500/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setResult(null)
                setExplainSetting("child")
                onModeChange("explain")
                setShowSettingsDropdown(false)
              }}
            >
              Explain to a Child
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm ${
                explainSetting === "teen"
                  ? "bg-purple-500/30 text-purple-300 border border-purple-400/50 shadow-lg shadow-purple-500/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setResult(null)
                setExplainSetting("teen")
                onModeChange("explain")
                setShowSettingsDropdown(false)
              }}
            >
              Explain to a Teenager
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm ${
                explainSetting === "adult"
                  ? "bg-purple-500/30 text-purple-300 border border-purple-400/50 shadow-lg shadow-purple-500/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setResult(null)
                setExplainSetting("adult")
                onModeChange("explain")
                setShowSettingsDropdown(false)
              }}
            >
              Explain to an Adult
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm ${
                explainSetting === "senior"
                  ? "bg-purple-500/30 text-purple-300 border border-purple-400/50 shadow-lg shadow-purple-500/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setResult(null)
                setExplainSetting("senior")
                onModeChange("explain")
                setShowSettingsDropdown(false)
              }}
            >
              Explain to a Senior
            </Button>
          </>
        )
      default:
        return null
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
              maxLength={mode === "summarize" ? 15000 : 10000}
            />

            {mode === "explain" && (
              <div className="mt-4">
                <Textarea
                  placeholder={t("transcript.explanationPlaceholder")}
                  value={userExplanation}
                  onChange={(e) => setUserExplanation(e.target.value)}
                  className="min-h-[150px] bg-white/5 border border-white/10 rounded-xl resize-none text-lg text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-cyan-500/50 caret-white"
                  maxLength={5000}
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-400">{userExplanation.length}/5,000</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3" ref={dropdownRef}>
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
                    <div className="absolute top-full mt-2 left-0 bg-gradient-to-b from-slate-800/95 via-slate-800/90 to-emerald-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl z-50 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Caret arrow */}
                      <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-800/95 rotate-45 border-l border-t border-white/10" />

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
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  {transcript.length}/{mode === "summarize" ? "15,000" : "10,000"}
                </span>

                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !transcript.trim() || (mode === "explain" && !userExplanation.trim())}
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

      <StudySettingsDropdown
        isOpen={showSettingsDropdown}
        onClose={() => setShowSettingsDropdown(false)}
        mode={mode}
        buttonRef={settingsButtonRef}
        difficulty={difficulty}
        questionCount={questionCount}
        questionType={questionType}
        onDifficultyChange={setDifficulty}
        onQuestionCountChange={setQuestionCount}
        onQuestionTypeChange={setQuestionType}
        summarizeSetting={summarizeSetting}
        onSummarizeSettingChange={setSummarizeSetting}
        explainSetting={explainSetting}
        onExplainSettingChange={setExplainSetting}
      />
    </div>
  )
}
