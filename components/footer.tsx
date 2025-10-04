"use client"

import { useState, useEffect } from "react"

export default function Footer() {
  const [hasContent, setHasContent] = useState(false)

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
    <footer className={`${hasContent ? "relative mt-8" : "fixed bottom-0 left-0 right-0"} z-10`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 Retentia.app All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}
