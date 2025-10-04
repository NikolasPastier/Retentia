"use client"

import Image from "next/image"
import LanguageSwitcher from "./language-switcher"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-6 mt-6">
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 via-slate-800/80 to-emerald-900/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Retentia Logo"
              width={32}
              height={32}
              className="rounded-lg transition-transform duration-300 hover:scale-110"
            />
            <h1 className="text-xl font-bold text-white tracking-tight">Retentia</h1>
          </div>

          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
