"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import TranscriptInput from "@/components/transcript-input"
import QuestionDisplay from "@/components/question-display"
import UserDashboard from "@/components/user-dashboard"

export type StudyMode = "study" | "explain" | "summarise"

export default function LocalePageClient() {
  const [activeSection, setActiveSection] = useState("input")
  const [transcript, setTranscript] = useState("")
  const [questions, setQuestions] = useState([])
  const [currentMode, setCurrentMode] = useState<StudyMode>("study")
  const [currentSetting, setCurrentSetting] = useState("adult")

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    setQuestions(generatedQuestions)
  }

  const handleBackToInput = () => {
    setQuestions([])
  }

  const handleModeChange = (mode: StudyMode) => {
    setCurrentMode(mode)
    // Set appropriate default setting for each mode
    switch (mode) {
      case "explain":
        setCurrentSetting("adult")
        break
      case "summarise":
        setCurrentSetting("briefly")
        break
      default:
        setCurrentSetting("medium")
        break
    }
  }

  return (
    <>
      <Navigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        currentSetting={currentSetting}
        onSettingChange={setCurrentSetting}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "input" && (
          <div className="space-y-8">
            <TranscriptInput
              transcript={transcript}
              setTranscript={setTranscript}
              onQuestionsGenerated={handleQuestionsGenerated}
              mode={currentMode}
              setting={currentSetting}
              onModeChange={handleModeChange}
            />

            {questions.length > 0 && (
              <div className="border-t border-border/20 pt-8">
                <QuestionDisplay questions={questions} onBack={handleBackToInput} />
              </div>
            )}
          </div>
        )}

        {activeSection === "dashboard" && <UserDashboard />}
      </main>
    </>
  )
}
