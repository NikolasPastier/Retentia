"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import TranscriptInput from "@/components/transcript-input"
import QuestionDisplay from "@/components/question-display"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth/auth-modal"
import BlueShaderBackground from "@/components/blue-shader-background"

export default function LearningApp() {
  const [activeSection, setActiveSection] = useState("input")
  const [transcript, setTranscript] = useState("")
  const [questions, setQuestions] = useState([])

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    setQuestions(generatedQuestions)
  }

  const handleBackToInput = () => {
    setQuestions([])
  }

  return (
    <div className="min-h-screen relative">
      <BlueShaderBackground />

      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <TranscriptInput
            transcript={transcript}
            setTranscript={setTranscript}
            onQuestionsGenerated={handleQuestionsGenerated}
          />

          {questions.length > 0 && (
            <div className="border-t border-border/20 pt-8">
              <QuestionDisplay questions={questions} onBack={handleBackToInput} />
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthModal />
    </div>
  )
}
