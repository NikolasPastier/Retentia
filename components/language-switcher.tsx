"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { useTranslations } from "@/lib/i18n/context"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageSelect = (language: (typeof languages)[0]) => {
    setIsOpen(false)
    setLocale(language.code)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-white rounded-2xl transition-all duration-200 border border-slate-700/50 shadow-lg backdrop-blur-sm"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium lowercase">{currentLanguage.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl min-w-[220px] overflow-hidden z-50">
          {languages.map((language) => {
            const isSelected = language.code === locale
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                  isSelected ? "bg-slate-700/50 text-white" : "text-slate-300 hover:bg-slate-700/30 hover:text-white"
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium flex-1">{language.name}</span>
                {isSelected && <Check className="h-4 w-4 text-white" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
