"use client"

import { ChevronDown, Globe } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const translations = {
  en: {
    howItWorks: "How It Works",
    pricing: "Pricing",
    helpCenter: "Help Center",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    contact: "Contact",
  },
  es: {
    howItWorks: "Cómo Funciona",
    pricing: "Precios",
    helpCenter: "Centro de Ayuda",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos de Servicio",
    contact: "Contacto",
  },
  fr: {
    howItWorks: "Comment Ça Marche",
    pricing: "Tarifs",
    helpCenter: "Centre d'Aide",
    privacyPolicy: "Politique de Confidentialité",
    termsOfService: "Conditions d'Utilisation",
    contact: "Contact",
  },
  de: {
    howItWorks: "Wie Es Funktioniert",
    pricing: "Preise",
    helpCenter: "Hilfezentrum",
    privacyPolicy: "Datenschutzrichtlinie",
    termsOfService: "Nutzungsbedingungen",
    contact: "Kontakt",
  },
  it: {
    howItWorks: "Come Funziona",
    pricing: "Prezzi",
    helpCenter: "Centro Assistenza",
    privacyPolicy: "Informativa sulla Privacy",
    termsOfService: "Termini di Servizio",
    contact: "Contatto",
  },
  pt: {
    howItWorks: "Como Funciona",
    pricing: "Preços",
    helpCenter: "Central de Ajuda",
    privacyPolicy: "Política de Privacidade",
    termsOfService: "Termos de Serviço",
    contact: "Contato",
  },
}

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()

  const getLocaleFromPath = () => {
    const segments = pathname.split("/").filter(Boolean)
    const firstSegment = segments[0]
    return Object.keys(translations).includes(firstSegment) ? firstSegment : "en"
  }

  const locale = getLocaleFromPath()
  const t = translations[locale as keyof typeof translations] || translations.en

  const footerLinks = [
    { label: t.howItWorks, href: "#how-it-works" },
    { label: t.pricing, href: "#pricing" },
    { label: t.helpCenter, href: "#help" },
    { label: t.privacyPolicy, href: "/privacy" },
    { label: t.termsOfService, href: "#terms" },
    { label: t.contact, href: "#contact" },
  ]

  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "en", name: "English", display: "EN" },
    { code: "zh", name: "中文", display: "ZH" },
    { code: "hi", name: "हिन्दी", display: "HI" },
    { code: "es", name: "Español", display: "ES" },
    { code: "fr", name: "Français", display: "FR" },
    { code: "ar", name: "العربية", display: "AR" },
    { code: "bn", name: "বাংলা", display: "BN" },
    { code: "ru", name: "Русский", display: "RU" },
    { code: "pt", name: "Português", display: "PT" },
    { code: "id", name: "Bahasa Indonesia", display: "ID" },
    { code: "ur", name: "اردو", display: "UR" },
    { code: "de", name: "Deutsch", display: "DE" },
    { code: "ja", name: "日本語", display: "JA" },
    { code: "sw", name: "Kiswahili", display: "SW" },
    { code: "mr", name: "मराठी", display: "MR" },
    { code: "te", name: "తెలుగు", display: "TE" },
    { code: "tr", name: "Türkçe", display: "TR" },
    { code: "ta", name: "தமிழ்", display: "TA" },
    { code: "vi", name: "Tiếng Việt", display: "VI" },
    { code: "ko", name: "한국어", display: "KO" },
    { code: "it", name: "Italiano", display: "IT" },
    { code: "th", name: "ไทย", display: "TH" },
    { code: "gu", name: "ગુજરાતી", display: "GU" },
    { code: "pl", name: "Polski", display: "PL" },
    { code: "uk", name: "Українська", display: "UK" },
    { code: "fa", name: "فارسی", display: "FA" },
    { code: "ml", name: "മലയാളം", display: "ML" },
    { code: "kn", name: "ಕನ್ನಡ", display: "KN" },
    { code: "or", name: "ଓଡ଼ିଆ", display: "OR" },
    { code: "pa", name: "ਪੰਜਾਬੀ", display: "PA" },
    { code: "as", name: "অসমীয়া", display: "AS" },
    { code: "mai", name: "मैथिली", display: "MAI" },
    { code: "bho", name: "भोजपुरी", display: "BHO" },
    { code: "nl", name: "Nederlands", display: "NL" },
    { code: "yo", name: "Yorùbá", display: "YO" },
    { code: "uz", name: "O'zbek", display: "UZ" },
    { code: "ms", name: "Bahasa Melayu", display: "MS" },
    { code: "ro", name: "Română", display: "RO" },
    { code: "my", name: "မြန်မာ", display: "MY" },
    { code: "cs", name: "Čeština", display: "CS" },
    { code: "hu", name: "Magyar", display: "HU" },
    { code: "el", name: "Ελληνικά", display: "EL" },
    { code: "bg", name: "Български", display: "BG" },
    { code: "be", name: "Беларуская", display: "BE" },
    { code: "sv", name: "Svenska", display: "SV" },
    { code: "az", name: "Azərbaycan", display: "AZ" },
    { code: "kk", name: "Қазақша", display: "KK" },
    { code: "sr", name: "Српски", display: "SR" },
    { code: "am", name: "አማርኛ", display: "AM" },
    { code: "ne", name: "नेपाली", display: "NE" },
    { code: "si", name: "සිංහල", display: "SI" },
    { code: "km", name: "ខ្មែរ", display: "KM" },
    { code: "tg", name: "Тоҷикӣ", display: "TG" },
    { code: "he", name: "עברית", display: "HE" },
    { code: "fi", name: "Suomi", display: "FI" },
    { code: "sk", name: "Slovenčina", display: "SK" },
    { code: "da", name: "Dansk", display: "DA" },
    { code: "no", name: "Norsk", display: "NO" },
    { code: "hr", name: "Hrvatski", display: "HR" },
    { code: "lt", name: "Lietuvių", display: "LT" },
    { code: "sl", name: "Slovenščina", display: "SL" },
    { code: "lv", name: "Latviešu", display: "LV" },
    { code: "et", name: "Eesti", display: "ET" },
    { code: "mk", name: "Македонски", display: "MK" },
    { code: "sq", name: "Shqip", display: "SQ" },
    { code: "is", name: "Íslenska", display: "IS" },
    { code: "mt", name: "Malti", display: "MT" },
    { code: "ga", name: "Gaeilge", display: "GA" },
    { code: "cy", name: "Cymraeg", display: "CY" },
    { code: "eu", name: "Euskera", display: "EU" },
    { code: "ca", name: "Català", display: "CA" },
    { code: "gl", name: "Galego", display: "GL" },
    { code: "af", name: "Afrikaans", display: "AF" },
    { code: "zu", name: "isiZulu", display: "ZU" },
    { code: "xh", name: "isiXhosa", display: "XH" },
    { code: "st", name: "Sesotho", display: "ST" },
    { code: "tn", name: "Setswana", display: "TN" },
    { code: "ss", name: "siSwati", display: "SS" },
    { code: "ve", name: "Tshivenḓa", display: "VE" },
    { code: "ts", name: "Xitsonga", display: "TS" },
    { code: "nr", name: "isiNdebele", display: "NR" },
    { code: "nso", name: "Sepedi", display: "NSO" },
    { code: "ig", name: "Igbo", display: "IG" },
    { code: "ha", name: "Hausa", display: "HA" },
    { code: "ff", name: "Fulfulde", display: "FF" },
    { code: "wo", name: "Wolof", display: "WO" },
    { code: "sn", name: "chiShona", display: "SN" },
    { code: "rw", name: "Kinyarwanda", display: "RW" },
    { code: "rn", name: "Kirundi", display: "RN" },
    { code: "ny", name: "Chichewa", display: "NY" },
    { code: "mg", name: "Malagasy", display: "MG" },
    { code: "so", name: "Soomaali", display: "SO" },
    { code: "om", name: "Afaan Oromoo", display: "OM" },
    { code: "ti", name: "ትግርኛ", display: "TI" },
    { code: "lg", name: "Luganda", display: "LG" },
    { code: "ak", name: "Akan", display: "AK" },
    { code: "tw", name: "Twi", display: "TW" },
    { code: "ee", name: "Eʋegbe", display: "EE" },
    { code: "bm", name: "Bamanankan", display: "BM" },
    { code: "mn", name: "Монгол", display: "MN" },
    { code: "ky", name: "Кыргызча", display: "KY" },
    { code: "tk", name: "Türkmen", display: "TK" },
    { code: "ps", name: "پښتو", display: "PS" },
    { code: "sd", name: "سنڌي", display: "SD" },
    { code: "dv", name: "ދިވެހި", display: "DV" },
    { code: "lo", name: "ລາວ", display: "LO" },
    { code: "ka", name: "ქართული", display: "KA" },
    { code: "hy", name: "Հայերեն", display: "HY" },
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
              <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-border/20 rounded-md shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50">
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
