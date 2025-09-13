"use client"

import { useTranslation } from "react-i18next"
import { useRouter, usePathname } from "next/navigation"
import { supportedLanguages } from "./config"

export function useLocale() {
  const pathname = usePathname()
  return pathname.split("/")[1] || "en"
}

export function useI18n() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()

  const changeLanguage = (newLocale: string) => {
    if (!supportedLanguages.includes(newLocale)) return

    // Update i18next language
    i18n.changeLanguage(newLocale)

    // Store in localStorage
    localStorage.setItem("i18nextLng", newLocale)

    // Navigate to new locale route
    const currentLocale = pathname.split("/")[1]
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  const getCurrentLocale = () => {
    return pathname.split("/")[1] || "en"
  }

  return {
    t,
    changeLanguage,
    currentLocale: getCurrentLocale(),
    supportedLanguages,
  }
}
