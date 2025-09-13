"use client"
import { ShoppingCart, User, Menu } from "lucide-react"
import Image from "next/image"

interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  return (
    <header className="relative z-20 mx-6 mt-6">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-800/50 px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Retentia Logo" width={32} height={32} className="rounded-lg" />
          <h1 className="text-xl font-bold text-white">Retentia</h1>
        </div>

        <nav className="flex items-center space-x-1">
          <button
            onClick={() => setActiveSection("input")}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSection === "input" ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Features
          </button>
          <a
            href="#"
            className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            Docs
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200">
            <User className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              2
            </span>
          </button>
          <button className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium">
            Sign In
          </button>
          <button className="px-4 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 text-sm font-medium">
            Sign Up
          </button>
          <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
