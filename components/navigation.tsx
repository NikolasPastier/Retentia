"use client"
import Image from "next/image"
import { useState } from "react"
import LoginModal from "./login-modal"
import SignupModal from "./signup-modal"

interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
  currentMode?: string
  onModeChange?: (mode: string) => void
  currentSetting?: string
  onSettingChange?: (setting: string) => void
}

export default function Navigation({
  activeSection,
  setActiveSection,
  currentMode = "study",
  onModeChange,
  currentSetting = "adult",
  onSettingChange,
}: NavigationProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  const switchToSignup = () => {
    setShowLoginModal(false)
    setShowSignupModal(true)
  }

  const switchToLogin = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  return (
    <>
      <header className="relative z-20 mx-6 mt-6">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-800/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Retentia Logo" width={32} height={32} className="rounded-lg" />
              <h1 className="text-xl font-bold text-white">Retentia</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={switchToLogin}
              className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
            >
              Log In
            </button>
            <button
              onClick={switchToSignup}
              className="px-4 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 text-sm font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSwitchToSignup={switchToSignup} />
      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} onSwitchToLogin={switchToLogin} />
    </>
  )
}
