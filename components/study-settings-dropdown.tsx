"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { StudyMode } from "./locale-page-client"

interface StudySettingsDropdownProps {
  isOpen: boolean
  onClose: () => void
  mode: StudyMode
  buttonRef: React.RefObject<HTMLButtonElement>
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

export default function StudySettingsDropdown({
  isOpen,
  onClose,
  mode,
  buttonRef,
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
}: StudySettingsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      })
    }
  }, [isOpen, buttonRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Caret arrow */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-[#0b1724]/95 rotate-45 border-l border-t border-border/50" />

      <div className="relative bg-[#0b1724]/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-2xl min-w-[280px] max-w-[320px] overflow-hidden">
        <div className="p-3 space-y-1">
          {/* Study Mode Settings */}
          {mode === "study" && (
            <>
              <div className="px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Study Options</p>
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400 px-3">Difficulty</Label>
                <RadioGroup value={difficulty} onValueChange={onDifficultyChange} className="space-y-0.5">
                  {["easy", "medium", "hard"].map((diff) => (
                    <div
                      key={diff}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        difficulty === diff ? "bg-[#9be89b]/20 border border-[#9be89b]/30" : "hover:bg-white/5"
                      }`}
                      onClick={() => onDifficultyChange(diff)}
                    >
                      <RadioGroupItem value={diff} id={`diff-${diff}`} className="border-gray-600" />
                      <Label
                        htmlFor={`diff-${diff}`}
                        className={`flex-1 cursor-pointer text-sm ${
                          difficulty === diff ? "text-[#9be89b]" : "text-[#d1d5db]"
                        }`}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="h-px bg-border/30 my-2" />

              {/* Question Count */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400 px-3">Number of Questions</Label>
                <div className="space-y-0.5">
                  {["3", "5", "10", "15"].map((count) => (
                    <button
                      key={count}
                      onClick={() => onQuestionCountChange(count)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        questionCount === count
                          ? "bg-[#9be89b]/20 border border-[#9be89b]/30 text-[#9be89b]"
                          : "text-[#d1d5db] hover:bg-white/5"
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/30 my-2" />

              {/* Question Type */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400 px-3">Question Type</Label>
                <RadioGroup value={questionType} onValueChange={onQuestionTypeChange} className="space-y-0.5">
                  {[
                    { value: "mixed", label: "Mixed Types" },
                    { value: "multiple-choice", label: "Multiple Choice" },
                    { value: "true-false", label: "True/False" },
                    { value: "open-ended", label: "Open Ended" },
                    { value: "fill-blank", label: "Fill in the Blank" },
                  ].map((type) => (
                    <div
                      key={type.value}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        questionType === type.value ? "bg-[#9be89b]/20 border border-[#9be89b]/30" : "hover:bg-white/5"
                      }`}
                      onClick={() => onQuestionTypeChange(type.value)}
                    >
                      <RadioGroupItem value={type.value} id={`type-${type.value}`} className="border-gray-600" />
                      <Label
                        htmlFor={`type-${type.value}`}
                        className={`flex-1 cursor-pointer text-sm ${
                          questionType === type.value ? "text-[#9be89b]" : "text-[#d1d5db]"
                        }`}
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {/* Summarize Mode Settings */}
          {mode === "summarize" && (
            <>
              <div className="px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Summary Style</p>
              </div>

              <RadioGroup
                value={summarizeSetting}
                onValueChange={(value) => onSummarizeSettingChange(value as "brief" | "in-depth" | "key-points")}
                className="space-y-0.5"
              >
                {[
                  { value: "brief", label: "Brief Summary", desc: "Quick overview" },
                  { value: "key-points", label: "Key Points", desc: "Structured bullets" },
                  { value: "in-depth", label: "In-Depth", desc: "Comprehensive" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      summarizeSetting === option.value
                        ? "bg-[#9be89b]/20 border border-[#9be89b]/30"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => onSummarizeSettingChange(option.value as "brief" | "in-depth" | "key-points")}
                  >
                    <RadioGroupItem value={option.value} id={`sum-${option.value}`} className="border-gray-600" />
                    <div className="flex-1">
                      <Label
                        htmlFor={`sum-${option.value}`}
                        className={`cursor-pointer text-sm block ${
                          summarizeSetting === option.value ? "text-[#9be89b]" : "text-[#d1d5db]"
                        }`}
                      >
                        {option.label}
                      </Label>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {/* Explain Mode Settings */}
          {mode === "explain" && (
            <>
              <div className="px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Target Audience</p>
              </div>

              <RadioGroup
                value={explainSetting}
                onValueChange={(value) => onExplainSettingChange(value as "child" | "teen" | "adult" | "senior")}
                className="space-y-0.5"
              >
                {[
                  { value: "child", label: "Child (5-10)", desc: "Simple language" },
                  { value: "teen", label: "Teenager (13-17)", desc: "Engaging examples" },
                  { value: "adult", label: "Adult (18+)", desc: "Professional" },
                  { value: "senior", label: "Senior (65+)", desc: "Patient & clear" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      explainSetting === option.value
                        ? "bg-[#9be89b]/20 border border-[#9be89b]/30"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => onExplainSettingChange(option.value as "child" | "teen" | "adult" | "senior")}
                  >
                    <RadioGroupItem value={option.value} id={`exp-${option.value}`} className="border-gray-600" />
                    <div className="flex-1">
                      <Label
                        htmlFor={`exp-${option.value}`}
                        className={`cursor-pointer text-sm block ${
                          explainSetting === option.value ? "text-[#9be89b]" : "text-[#d1d5db]"
                        }`}
                      >
                        {option.label}
                      </Label>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
