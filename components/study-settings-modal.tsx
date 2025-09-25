"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Brain, MessageSquare, FileText, Save } from "lucide-react"
import type { StudyMode } from "./locale-page-client"

interface StudySettingsModalProps {
  isOpen: boolean
  onClose: () => void
  mode: StudyMode
  // Study mode settings
  difficulty: string
  questionCount: string
  questionType: string
  onDifficultyChange: (difficulty: string) => void
  onQuestionCountChange: (count: string) => void
  onQuestionTypeChange: (type: string) => void
  // Summarize mode settings
  summarizeSetting: "brief" | "in-depth" | "key-points"
  onSummarizeSettingChange: (setting: "brief" | "in-depth" | "key-points") => void
  // Explain mode settings
  explainSetting: "child" | "teen" | "adult" | "senior"
  onExplainSettingChange: (setting: "child" | "teen" | "adult" | "senior") => void
}

export default function StudySettingsModal({
  isOpen,
  onClose,
  mode,
  difficulty,
  questionCount,
  questionType,
  onDifficultyChange,
  onQuestionCountChange,
  onQuestionTypeChange,
  summarizeSetting,
  onSummarizeSettingChange,
  explainSetting,
  onExplainSettingChange,
}: StudySettingsModalProps) {
  const [localDifficulty, setLocalDifficulty] = useState(difficulty)
  const [localQuestionCount, setLocalQuestionCount] = useState(questionCount)
  const [localQuestionType, setLocalQuestionType] = useState(questionType)
  const [localSummarizeSetting, setLocalSummarizeSetting] = useState(summarizeSetting)
  const [localExplainSetting, setLocalExplainSetting] = useState(explainSetting)

  // Update local state when props change
  useEffect(() => {
    setLocalDifficulty(difficulty)
    setLocalQuestionCount(questionCount)
    setLocalQuestionType(questionType)
    setLocalSummarizeSetting(summarizeSetting)
    setLocalExplainSetting(explainSetting)
  }, [difficulty, questionCount, questionType, summarizeSetting, explainSetting])

  const handleSave = () => {
    console.log("[v0] Saving settings:", {
      difficulty: localDifficulty,
      questionCount: localQuestionCount,
      questionType: localQuestionType,
      summarizeSetting: localSummarizeSetting,
      explainSetting: localExplainSetting,
    })

    // Apply all changes
    onDifficultyChange(localDifficulty)
    onQuestionCountChange(localQuestionCount)
    onQuestionTypeChange(localQuestionType)
    onSummarizeSettingChange(localSummarizeSetting)
    onExplainSettingChange(localExplainSetting)
    onClose()
  }

  const getModeIcon = (currentMode: StudyMode) => {
    switch (currentMode) {
      case "study":
        return <Brain className="h-5 w-5 text-blue-500" />
      case "explain":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "summarize":
        return <FileText className="h-5 w-5 text-emerald-500" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const getModeColor = (currentMode: StudyMode) => {
    switch (currentMode) {
      case "study":
        return "text-blue-500 border-blue-500/20 bg-blue-500/10"
      case "explain":
        return "text-purple-500 border-purple-500/20 bg-purple-500/10"
      case "summarize":
        return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
      default:
        return "text-muted-foreground"
    }
  }

  const getDifficultyDescription = (diff: string) => {
    switch (diff) {
      case "easy":
        return "Basic concepts and straightforward questions"
      case "medium":
        return "Moderate complexity with some analysis required"
      case "hard":
        return "Advanced concepts requiring deep understanding"
      default:
        return ""
    }
  }

  const getQuestionTypeDescription = (type: string) => {
    switch (type) {
      case "mixed":
        return "Variety of question formats for comprehensive testing"
      case "multiple-choice":
        return "Choose the best answer from given options"
      case "true-false":
        return "Simple true or false statements"
      case "open-ended":
        return "Detailed written responses required"
      case "fill-blank":
        return "Complete sentences with missing words"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Study Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Mode Display */}
          <Card className={`border ${getModeColor(mode)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getModeIcon(mode)}
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode Settings
              </CardTitle>
              <CardDescription>Customize your {mode} experience with these options</CardDescription>
            </CardHeader>
          </Card>

          {/* Study Mode Settings */}
          {mode === "study" && (
            <div className="space-y-6">
              {/* Difficulty Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Difficulty Level</CardTitle>
                  <CardDescription>Choose the complexity level for your questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={localDifficulty} onValueChange={setLocalDifficulty} className="space-y-3">
                    {[
                      { value: "easy", label: "Easy", badge: "Beginner", color: "green" },
                      { value: "medium", label: "Medium", badge: "Intermediate", color: "yellow" },
                      { value: "hard", label: "Hard", badge: "Advanced", color: "red" },
                    ].map((diff) => (
                      <div key={diff.value} className="flex items-start space-x-3">
                        <RadioGroupItem
                          value={diff.value}
                          id={diff.value}
                          className="mt-1"
                          onClick={() => console.log("[v0] Difficulty selected:", diff.value)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={diff.value} className="flex items-center gap-2 cursor-pointer">
                            <span className="font-medium capitalize">{diff.label}</span>
                            <Badge
                              variant="outline"
                              className={
                                diff.color === "green"
                                  ? "border-green-500/50 text-green-600"
                                  : diff.color === "yellow"
                                    ? "border-yellow-500/50 text-yellow-600"
                                    : "border-red-500/50 text-red-600"
                              }
                            >
                              {diff.badge}
                            </Badge>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{getDifficultyDescription(diff.value)}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Question Count */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Number of Questions</CardTitle>
                  <CardDescription>How many questions would you like to generate?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={localQuestionCount}
                    onValueChange={(value) => {
                      console.log("[v0] Question count selected:", value)
                      setLocalQuestionCount(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions (Quick Review)</SelectItem>
                      <SelectItem value="5">5 Questions (Standard)</SelectItem>
                      <SelectItem value="10">10 Questions (Comprehensive)</SelectItem>
                      <SelectItem value="15">15 Questions (Thorough)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Question Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Question Types</CardTitle>
                  <CardDescription>Select the format of questions you prefer</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={localQuestionType}
                    onValueChange={(value) => {
                      console.log("[v0] Question type selected:", value)
                      setLocalQuestionType(value)
                    }}
                    className="space-y-3"
                  >
                    {[
                      { value: "mixed", label: "Mixed Types", badge: "Recommended" },
                      { value: "multiple-choice", label: "Multiple Choice", badge: "Quick" },
                      { value: "true-false", label: "True/False", badge: "Simple" },
                      { value: "open-ended", label: "Open Ended", badge: "Detailed" },
                      { value: "fill-blank", label: "Fill in the Blank", badge: "Focused" },
                    ].map((type) => (
                      <div key={type.value} className="flex items-start space-x-3">
                        <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer">
                            <span className="font-medium">{type.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {type.badge}
                            </Badge>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{getQuestionTypeDescription(type.value)}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summarize Mode Settings */}
          {mode === "summarize" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary Style</CardTitle>
                <CardDescription>Choose how detailed you want your summary to be</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={localSummarizeSetting}
                  onValueChange={(value) => {
                    console.log("[v0] Summarize setting selected:", value)
                    setLocalSummarizeSetting(value as "brief" | "in-depth" | "key-points")
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="brief" id="brief" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="brief" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">Brief Summary</span>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-600">
                          Quick
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">Concise overview with main points only</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="key-points" id="key-points" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="key-points" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">Key Points</span>
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-600">
                          Structured
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Organized bullet points with important concepts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="in-depth" id="in-depth" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="in-depth" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">In-Depth Summary</span>
                        <Badge variant="outline" className="border-purple-500/50 text-purple-600">
                          Comprehensive
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Detailed analysis with context and explanations
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Explain Mode Settings */}
          {mode === "explain" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Target Audience</CardTitle>
                <CardDescription>Choose the audience level for feedback on your explanation</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={localExplainSetting}
                  onValueChange={(value) => {
                    console.log("[v0] Explain setting selected:", value)
                    setLocalExplainSetting(value as "child" | "teen" | "adult" | "senior")
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="child" id="child" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="child" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">Child (Ages 5-10)</span>
                        <Badge variant="outline" className="border-green-500/50 text-green-600">
                          Simple
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Very simple language, basic concepts, fun examples
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="teen" id="teen" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="teen" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">Teenager (Ages 13-17)</span>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-600">
                          Engaging
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clear explanations with relatable examples and analogies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="adult" id="adult" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="adult" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">Adult (Ages 18+)</span>
                        <Badge variant="outline" className="border-purple-500/50 text-purple-600">
                          Professional
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Technical accuracy with professional terminology
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="senior" id="senior" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="senior" className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">Senior (Ages 65+)</span>
                        <Badge variant="outline" className="border-orange-500/50 text-orange-600">
                          Patient
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clear, patient explanations with step-by-step breakdown
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
