import type React from "react"
import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Instrument_Serif } from "next/font/google"
import "../globals.css"
import I18nProvider from "@/components/i18n-provider"
import { supportedLanguages } from "@/lib/i18n/config"

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Retentia - AI-Powered Learning Platform",
  description: "Transform your content into interactive learning experiences with AI-generated questions",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateStaticParams() {
  return supportedLanguages.map((locale) => ({ locale }))
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  return (
    <html lang={locale}>
      <head>
        <style>{`
html {
  font-family: ${figtree.style.fontFamily};
  --font-sans: ${figtree.variable};
  --font-mono: ${GeistMono.variable};
  --font-instrument-serif: ${instrumentSerif.variable};
}
        `}</style>
      </head>
      <body className={`${figtree.variable} ${instrumentSerif.variable}`}>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  )
}
