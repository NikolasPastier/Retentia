"use client"
import Image from "next/image"
import { useTranslations } from "@/lib/i18n/context"

interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
  currentMode?: string
  onModeChange?: (mode: string) => void
  currentSetting?: string
  onSettingChange?: (setting: string) => void
}

export default function Navigation({
  activeSection,
  setActiveSection,
  currentMode = "study",
  onModeChange,
  currentSetting = "adult",
  onSettingChange,
}: NavigationProps) {
  const { t } = useTranslations()

  return (
    <>
      <header className="relative z-20 mx-6 mt-6">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Retentia Logo" width={32} height={32} className="rounded-lg" />
              <h1 className="text-xl font-bold text-white">Retentia</h1>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
