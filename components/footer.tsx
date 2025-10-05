"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "@/lib/i18n/context"

export default function Footer() {
  const [hasContent, setHasContent] = useState(false)
  const { t } = useTranslations()

  useEffect(() => {
    const checkForContent = () => {
      const main = document.querySelector("main")
      if (main) {
        const mainHeight = main.scrollHeight
        const viewportHeight = window.innerHeight
        const headerHeight = 80

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

  return (
    <footer className="relative mt-auto z-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
