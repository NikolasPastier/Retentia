"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n/config"
import { LanguagePersistence } from "@/lib/i18n/language-persistence"

interface I18nProviderProps {
  children: React.ReactNode
  locale?: string
}

export default function I18nProvider({ children, locale }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeLanguage = async () => {
      if (!i18n.isInitialized) {
        await new Promise((resolve) => {
          if (i18n.isInitialized) {
            resolve(undefined)
          } else {
            i18n.on("initialized", resolve)
          }
        })
      }

      // Get the best language choice based on URL, stored preference, and browser
      const bestLanguage = LanguagePersistence.getBestLanguageChoice(locale)

      // Change language if different from current
      if (bestLanguage !== i18n.language) {
        await i18n.changeLanguage(bestLanguage)
      }

      // Store the preference if it came from URL or browser detection
      if (locale || !LanguagePersistence.getStoredPreference()) {
        LanguagePersistence.storePreference(bestLanguage)
      }

      setIsInitialized(true)
    }

    initializeLanguage()
  }, [locale])

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      LanguagePersistence.storePreference(lng)
    }

    i18n.on("languageChanged", handleLanguageChange)

    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
