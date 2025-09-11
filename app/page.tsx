"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import TranscriptInput from "@/components/transcript-input"
import QuestionDisplay from "@/components/question-display"
import UserDashboard from "@/components/user-dashboard"
import Footer from "@/components/footer"

export default function LearningApp() {
  const [activeSection, setActiveSection] = useState("input")
  const [transcript, setTranscript] = useState("")
  const [questions, setQuestions] = useState([])

  const handleQuestionsGenerated = (generatedQuestions: any[]) => {
    setQuestions(generatedQuestions)
    setActiveSection("questions")
  }

  const handleBackToInput = () => {
    setActiveSection("input")
    setQuestions([])
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "input" && (
          <TranscriptInput
            transcript={transcript}
            setTranscript={setTranscript}
            onQuestionsGenerated={handleQuestionsGenerated}
          />
        )}

        {activeSection === "questions" && questions.length > 0 && (
          <QuestionDisplay questions={questions} onBack={handleBackToInput} />
        )}

        {activeSection === "dashboard" && <UserDashboard />}
      </main>

      <Footer />
    </div>
  )
}
