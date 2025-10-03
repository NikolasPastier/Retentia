"use client"

import { useTranslations } from "@/lib/i18n/context"

export default function Hero() {
  const { t } = useTranslations()

  return (
    <div className="text-center space-y-4 mb-8">
      <h1 className="text-5xl md:text-6xl font-bold text-white text-balance tracking-tight">
        {t("hero.title")}{" "}
        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {t("hero.titleHighlight")}
        </span>
      </h1>
      <p className="text-xl text-white/80 text-pretty max-w-2xl mx-auto">{t("hero.subtitle")}</p>
    </div>
  )
}
