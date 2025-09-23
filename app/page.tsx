"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import TranscriptInput from "@/components/transcript-input"
import QuestionDisplay from "@/components/question-display"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth/auth-modal"
import ShaderBackground from "@/components/shader-background"
import PulsingCircle from "@/components/pulsing-circle"
import { useAuth } from "@/hooks/use-auth"
import type { StudyMode } from "@/components/locale-page-client"

export default function LearningApp() {
  const [activeSection, setActiveSection] = useState("input")
  const [transcript, setTranscript] = useState("")
  const [questions, setQuestions] = useState([])
  const [currentMode, setCurrentMode] = useState<StudyMode>("study")
  const [currentSetting, setCurrentSetting] = useState("medium")

  const { user, loading } = useAuth()

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    setQuestions(generatedQuestions)
  }

  const handleBackToInput = () => {
    setQuestions([])
  }

  return (
    <ShaderBackground>
      <div className="min-h-screen relative">
        <Navigation
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          currentSetting={currentSetting}
          onSettingChange={setCurrentSetting}
        />

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {!loading && !user && (
              <div className="text-center bg-background/60 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Learning Tools</h2>
                <p className="text-white/80 mb-4">
                  Sign in to unlock AI question generation, explanations, and summaries
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                  <span>✨ Generate study questions</span>
                  <span>🧠 Get AI explanations</span>
                  <span>📝 Create summaries</span>
                  <span>🎯 Track your progress</span>
                </div>
              </div>
            )}

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

        <AuthModal />

        <PulsingCircle />
      </div>
    </ShaderBackground>
  )
}
