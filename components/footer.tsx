"use client"

import { ChevronDown, Globe } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function Footer() {
  const footerLinks = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Help Center", href: "#help" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Contact", href: "#contact" },
  ]

  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("EN")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "EN", name: "English" },
    { code: "ES", name: "Español" },
    { code: "FR", name: "Français" },
    { code: "DE", name: "Deutsch" },
    { code: "IT", name: "Italiano" },
    { code: "PT", name: "Português" },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageSelect = (language: (typeof languages)[0]) => {
    setSelectedLanguage(language.code)
    setIsLanguageOpen(false)
    // Here you would implement actual language switching logic
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 whitespace-nowrap">
              {footerLinks.map((link, index) => (
                <div key={link.label} className="flex items-center">
                  <a href={link.href} className="hover:text-foreground transition-colors px-1">
                    {link.label}
                  </a>
                  {index < footerLinks.length - 1 && <span className="mx-2 text-muted-foreground/60">|</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-background/20"
            >
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{selectedLanguage}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
            </button>

            {isLanguageOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-border/20 rounded-md shadow-lg min-w-[120px]">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    <span className="font-medium">{language.code}</span>
                    <span className="ml-2 opacity-70">{language.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
