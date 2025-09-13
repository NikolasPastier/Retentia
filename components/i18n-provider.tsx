import type React from "react"

interface I18nProviderProps {
  children: React.ReactNode
  locale?: string
}

export default function I18nProvider({ children }: I18nProviderProps) {
  // Simple passthrough provider - no complex i18n logic
  return <>{children}</>
}
