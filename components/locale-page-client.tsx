"use client"

import { useState } from "react"
import Header from "@/components/header"
import TranscriptInput from "@/components/transcript-input"
import QuestionDisplay from "@/components/question-display"
import Hero from "@/components/hero"

export type StudyMode = "study" | "explain" | "summarize"

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
      case "summarize":
        setCurrentSetting("brief")
        break
      default:
        setCurrentSetting("medium")
        break
    }
  }

  return (
    <>
      <Header />

      <main className="container mx-auto px-4 py-8 pt-32">
        <div className="space-y-8">
          <Hero />

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
      </main>
    </>
  )
}
