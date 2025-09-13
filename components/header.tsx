"use client"

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-sm border-b border-white/10">
      {/* Logo */}
      <div className="flex items-center">
        <svg
          fill="currentColor"
          viewBox="0 0 147 70"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="size-10 translate-x-[-0.5px] text-white"
        >
          <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
          <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z"></path>
        </svg>
      </div>

      <nav className="flex items-center space-x-8">
        <a href="#" className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200">
          Features
        </a>
        <a href="#" className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200">
          Pricing
        </a>
        <a href="#" className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200">
          Docs
        </a>
      </nav>

      <div className="flex items-center space-x-3">
        <button className="px-4 py-2 rounded-lg bg-transparent border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200">
          Sign In
        </button>
        <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-200">
          Sign Up
        </button>

        <div className="flex items-center space-x-2 ml-4">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              2
            </span>
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 md:hidden">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
