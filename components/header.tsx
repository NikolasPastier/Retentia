"use client"

import LanguageSwitcher from "./language-switcher"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-6 mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/90 via-slate-800/80 to-emerald-900/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              fill="currentColor"
              viewBox="0 0 147 70"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="size-8 text-white transition-transform duration-300 hover:scale-110"
            >
              <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
              <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z"></path>
            </svg>
            <h1 className="text-xl font-bold text-white tracking-tight">Pexeso.app</h1>
          </div>

          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
