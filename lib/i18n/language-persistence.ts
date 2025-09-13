"use client"

import { supportedLocales, defaultLocale } from "./config"

export interface LanguagePreference {
  locale: string
  timestamp: number
}

export class LanguagePersistence {
  private static readonly STORAGE_KEY = "retentia-language-preference"
  private static readonly COOKIE_NAME = "retentia-locale"

  // Get language preference from localStorage
  static getStoredPreference(): string | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const preference: LanguagePreference = JSON.parse(stored)
        // Check if preference is valid and not too old (30 days)
        const isValid = supportedLocales.includes(preference.locale)
        const isRecent = Date.now() - preference.timestamp < 30 * 24 * 60 * 60 * 1000

        if (isValid && isRecent) {
          return preference.locale
        }
      }
    } catch (error) {
      console.warn("Failed to parse stored language preference:", error)
    }

    return null
  }

  // Store language preference in localStorage
  static storePreference(locale: string): void {
    if (typeof window === "undefined") return

    try {
      const preference: LanguagePreference = {
        locale,
        timestamp: Date.now(),
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preference))

      // Also set a cookie for server-side access
      document.cookie = `${this.COOKIE_NAME}=${locale}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
    } catch (error) {
      console.warn("Failed to store language preference:", error)
    }
  }

  // Get browser language preference
  static getBrowserLanguage(): string {
    if (typeof window === "undefined") return defaultLocale

    const browserLang = navigator.language.toLowerCase()

    // Check for exact match first
    if (supportedLocales.includes(browserLang)) {
      return browserLang
    }

    // Check for language code match (e.g., 'en-US' -> 'en')
    const langCode = browserLang.split("-")[0]
    if (supportedLocales.includes(langCode)) {
      return langCode
    }

    return defaultLocale
  }

  // Get the best language choice based on all available sources
  static getBestLanguageChoice(urlLocale?: string): string {
    // Priority order:
    // 1. URL locale (if valid)
    // 2. Stored preference
    // 3. Browser language
    // 4. Default locale

    if (urlLocale && supportedLocales.includes(urlLocale)) {
      return urlLocale
    }

    const storedPreference = this.getStoredPreference()
    if (storedPreference) {
      return storedPreference
    }

    return this.getBrowserLanguage()
  }

  // Clear stored preference
  static clearPreference(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
      document.cookie = `${this.COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    } catch (error) {
      console.warn("Failed to clear language preference:", error)
    }
  }
}
