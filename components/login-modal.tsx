"use client"
import { useState } from "react"
import type React from "react"

import { X } from "lucide-react"
import { signInWithEmail } from "@/lib/firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/lib/i18n/context"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignup: () => void
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslations()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      const result = await signInWithEmail(emailOrUsername, password)

      if (result.error) {
        toast({
          title: t("auth.loginError"),
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: t("auth.welcomeBack"),
          description: t("auth.welcomeBackDesc"),
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("auth.unexpectedError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 rounded-2xl border border-gray-800 p-8 w-full max-w-md mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">{t("auth.login")}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t("auth.email")}</label>
            <input
              type="email"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("auth.enterEmail")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t("auth.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("auth.enterPassword")}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? t("auth.signingIn") : t("auth.login")}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          {t("auth.dontHaveAccount")}{" "}
          <button onClick={onSwitchToSignup} className="text-blue-400 hover:text-blue-300 font-medium">
            {t("auth.signup")}
          </button>
        </p>
      </div>
    </div>
  )
}
