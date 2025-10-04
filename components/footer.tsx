"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "@/lib/i18n/context"
import FooterModal from "./footer-modal"

export default function Footer() {
  const { t } = useTranslations()

  const [modalType, setModalType] = useState<"pricing" | "privacy" | "terms" | "cookies" | null>(null)
  const [hasContent, setHasContent] = useState(false)

  const footerLinks = [
    { label: t("footer.howItWorks"), href: "#how-it-works", type: null },
    { label: t("footer.pricing"), type: "pricing" as const },
    { label: t("footer.privacyPolicy"), type: "privacy" as const },
    { label: t("footer.termsOfService"), type: "terms" as const },
    { label: t("footer.cookies"), type: "cookies" as const },
  ]

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

  const handleLinkClick = (e: React.MouseEvent, link: (typeof footerLinks)[0]) => {
    if (link.type) {
      e.preventDefault()
      setModalType(link.type)
    }
  }

  return (
    <>
      <footer className={`${hasContent ? "relative mt-8" : "fixed bottom-0 left-0 right-0"} z-10`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 whitespace-nowrap">
              {footerLinks.map((link, index) => (
                <div key={link.label} className="flex items-center">
                  {link.type ? (
                    <button
                      onClick={(e) => handleLinkClick(e, link)}
                      className="hover:text-gray-400 transition-colors duration-200 px-1 cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.href} className="hover:text-gray-400 transition-colors duration-200 px-1">
                      {link.label}
                    </a>
                  )}
                  {index < footerLinks.length - 1 && <span className="mx-2 text-muted-foreground/60">|</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <FooterModal isOpen={modalType !== null} onClose={() => setModalType(null)} type={modalType || "pricing"} />
    </>
  )
}
