"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import TranscriptInput from "@/components/transcript-input"
import QuestionDisplay from "@/components/question-display"
import Footer from "@/components/footer"
import ShaderBackground from "@/components/shader-background"
import PulsingCircle from "@/components/pulsing-circle"
import type { StudyMode } from "@/components/locale-page-client"

export default function LearningApp() {
  const [activeSection, setActiveSection] = useState("input")
  const [transcript, setTranscript] = useState("")
  const [questions, setQuestions] = useState([])
  const [currentMode, setCurrentMode] = useState<StudyMode>("questions")
  const [currentSetting, setCurrentSetting] = useState("medium")

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    setQuestions(generatedQuestions)
  }

  const handleBackToInput = () => {
    setQuestions([])
  }

  return (
    <ShaderBackground>
      <div className="min-h-screen relative flex flex-col">
        <Header />

        <HeroSection />

        <main className="container mx-auto px-4 py-8 mb-32 flex-1">
          <div className="space-y-8">
            <TranscriptInput
              transcript={transcript}
              setTranscript={setTranscript}
              onQuestionsGenerated={handleQuestionsGenerated}
              mode={currentMode}
              setting={currentSetting}
              onModeChange={setCurrentMode}
            />

            {questions.length > 0 && (
              <div className="border-t border-border/20 pt-8">
                <QuestionDisplay questions={questions} onBack={handleBackToInput} />
              </div>
            )}
          </div>
        </main>

        <Footer />

        <PulsingCircle />
      </div>
    </ShaderBackground>
  )
}
