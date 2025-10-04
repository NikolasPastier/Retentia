"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

type TranslationKey = string
type Translations = Record<string, any>

interface I18nContextType {
  locale: string
  translations: Translations
  t: (key: TranslationKey, fallback?: string) => string
  setLocale: (locale: string) => void
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translationFiles = {
  en: () => import("./locales/en/common.json"),
  cs: () => import("./locales/cs/common.json"), // Added Czech (cs) translation loader
  sk: () => import("./locales/sk/common.json"), // Added Slovak (sk) translation loader
  es: () => import("./locales/es/common.json"),
  fr: () => import("./locales/fr/common.json"),
  de: () => import("./locales/de/common.json"),
  it: () => import("./locales/it/common.json"),
  pt: () => import("./locales/pt/common.json"),
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [locale, setLocaleState] = useState("en")
  const [translations, setTranslations] = useState<Translations>({})
  const [isLoading, setIsLoading] = useState(true)

  const getLocaleFromPath = () => {
    const segments = pathname.split("/").filter(Boolean)
    const firstSegment = segments[0]
    return Object.keys(translationFiles).includes(firstSegment) ? firstSegment : "en"
  }

  const loadTranslations = async (localeCode: string) => {
    setIsLoading(true)
    try {
      const translationModule = translationFiles[localeCode as keyof typeof translationFiles]
      if (translationModule) {
        const translations = await translationModule()
        setTranslations(translations.default || translations)
      } else {
        // Fallback to English
        const englishTranslations = await translationFiles.en()
        setTranslations(englishTranslations.default || englishTranslations)
      }
    } catch (error) {
      console.error(`Failed to load translations for ${localeCode}:`, error)
      // Fallback to English
      try {
        const englishTranslations = await translationFiles.en()
        setTranslations(englishTranslations.default || englishTranslations)
      } catch (fallbackError) {
        console.error("Failed to load fallback translations:", fallbackError)
        setTranslations({})
      }
    } finally {
      setIsLoading(false)
    }
  }

  const t = (key: TranslationKey, fallback?: string): string => {
    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }

    return typeof value === "string" ? value : fallback || key
  }

  const setLocale = (newLocale: string) => {
    const segments = pathname.split("/").filter(Boolean)

    // Remove current locale if it exists
    if (segments[0] && Object.keys(translationFiles).includes(segments[0])) {
      segments.shift()
    }

    // Build new path with new locale
    const newPath = `/${newLocale}${segments.length > 0 ? "/" + segments.join("/") : ""}`

    // Store preference
    localStorage.setItem("preferred-language", newLocale)

    // Navigate to new path
    router.push(newPath)
  }

  useEffect(() => {
    const currentLocale = getLocaleFromPath()
    setLocaleState(currentLocale)
    loadTranslations(currentLocale)
  }, [pathname])

  const contextValue: I18nContextType = {
    locale,
    translations,
    t,
    setLocale,
    isLoading,
  }

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

export function useTranslations() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useTranslations must be used within an I18nProvider")
  }
  return context
}

export const useI18n = useTranslations
