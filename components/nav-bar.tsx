"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/hooks/use-auth"
import { UserAccountDropdown } from "./user-account-dropdown"
import { AuthModal } from "./auth/auth-modal"

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const { t } = useI18n()
  const { user, loading } = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                {t("nav.logo")}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("nav.home")}
                </Link>
                <Link
                  href="/features"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("nav.features")}
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("nav.pricing")}
                </Link>
                <Link
                  href="/about"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("nav.about")}
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("nav.contact")}
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              {loading ? (
                <div className="h-10 w-10 animate-pulse bg-gray-200 rounded-full" />
              ) : user ? (
                <UserAccountDropdown />
              ) : (
                <div className="ml-4 flex items-center space-x-4">
                  <Button variant="ghost" size="sm" onClick={() => handleAuthClick("signin")}>
                    {t("nav.signIn")}
                  </Button>
                  <Button size="sm" onClick={() => handleAuthClick("signup")}>
                    {t("nav.getStarted")}
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="/"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link
                href="/features"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.features")}
              </Link>
              <Link
                href="/pricing"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.pricing")}
              </Link>
              <Link
                href="/about"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/contact"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.contact")}
              </Link>
              <div className="pt-4 pb-3 border-t border-gray-200">
                {loading ? (
                  <div className="h-10 animate-pulse bg-gray-200 rounded mx-3" />
                ) : user ? (
                  <div className="px-3">
                    <UserAccountDropdown />
                  </div>
                ) : (
                  <div className="flex items-center px-3 space-x-3">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => handleAuthClick("signin")}>
                      {t("nav.signIn")}
                    </Button>
                    <Button size="sm" className="w-full" onClick={() => handleAuthClick("signup")}>
                      {t("nav.getStarted")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
    </>
  )
}
