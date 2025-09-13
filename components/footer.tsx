"use client"

import { ChevronDown, Globe } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter, usePathname } from "next/navigation"
import { useLocale } from "@/lib/i18n/hooks"

export default function Footer() {
  const { t } = useTranslation("common")
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const footerLinks = [
    { label: t("footer.howItWorks"), href: "#how-it-works" },
    { label: t("footer.pricing"), href: "#pricing" },
    { label: t("footer.helpCenter"), href: "#help" },
    { label: t("footer.privacyPolicy"), href: "#privacy" },
    { label: t("footer.termsOfService"), href: "#terms" },
    { label: t("footer.contact"), href: "#contact" },
  ]

  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "en", name: "English", display: "EN" },
    { code: "es", name: "Español", display: "ES" },
    { code: "fr", name: "Français", display: "FR" },
    { code: "de", name: "Deutsch", display: "DE" },
    { code: "it", name: "Italiano", display: "IT" },
    { code: "pt", name: "Português", display: "PT" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]

  useEffect(() => {
    const checkForContent = () => {
      const main = document.querySelector("main")
      if (main) {
        const mainHeight = main.scrollHeight
        const viewportHeight = window.innerHeight
        const headerHeight = 80 // Approximate header height

        setHasContent(mainHeight > viewportHeight - headerHeight - 100)
      }
    }

    checkForContent()

    const observer = new MutationObserver(checkForContent)
    const main = document.querySelector("main")
    if (main) {
      observer.observe(main, { childList: true, subtree: true })
    }

    window.addEventListener("resize", checkForContent)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", checkForContent)
    }
  }, [])

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
    setIsLanguageOpen(false)

    localStorage.setItem("preferred-language", language.code)

    const segments = pathname.split("/").filter(Boolean)
    if (segments[0] && languages.some((lang) => lang.code === segments[0])) {
      segments.shift()
    }

    const newPath = `/${language.code}${segments.length > 0 ? "/" + segments.join("/") : ""}`
    router.push(newPath)
  }

  return (
    <footer className={`${hasContent ? "relative mt-8" : "fixed bottom-0 left-0 right-0"} z-10`}>
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
              <span>{currentLanguage.display}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
            </button>

            {isLanguageOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-border/20 rounded-md shadow-lg min-w-[120px]">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
                      language.code === locale
                        ? "text-foreground bg-background/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    <span className="font-medium">{language.display}</span>
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
