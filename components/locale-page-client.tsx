"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import TranscriptInput from "@/components/transcript-input"
import QuestionDisplay from "@/components/question-display"
import UserDashboard from "@/components/user-dashboard"
import ModeSelector from "@/components/mode-selector"

export type StudyMode = "study" | "explain" | "summarise"

export default function LocalePageClient() {
  const [activeSection, setActiveSection] = useState("input")
  const [transcript, setTranscript] = useState("")
  const [questions, setQuestions] = useState([])
  const [currentMode, setCurrentMode] = useState<StudyMode>("study")

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    setQuestions(generatedQuestions)
  }

  const handleBackToInput = () => {
    setQuestions([])
  }

  return (
    <>
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "input" && (
          <div className="space-y-8">
            <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />

            <TranscriptInput
              transcript={transcript}
              setTranscript={setTranscript}
              onQuestionsGenerated={handleQuestionsGenerated}
              mode={currentMode}
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
