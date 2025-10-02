"use client"

import { X, Check } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface UpgradeProModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeProModal({ isOpen, onClose }: UpgradeProModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-[90vw] max-w-4xl max-h-[85vh] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <div className="h-full overflow-y-auto p-8 md:p-12">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Upgrade to Pro</h2>
          <p className="text-gray-400 text-center mb-12">Unlock unlimited learning potential</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Free Plan */}
            <div className="border border-white/10 rounded-xl p-8 bg-white/5">
              <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
              <div className="text-4xl font-bold text-white mb-4">
                $0<span className="text-lg font-normal text-gray-400">/forever</span>
              </div>
              <p className="text-gray-400 mb-6">Perfect for getting started</p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">1 generation per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Limited character input</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">1 file upload max</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Basic question types</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Community support</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-green-500 rounded-xl p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
              <div className="text-4xl font-bold text-white mb-4">
                $4.99<span className="text-lg font-normal text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-6">Unlimited learning potential</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Unlimited generations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Unlimited character input</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Unlimited file uploads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">All question types</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Link input support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Advanced AI models</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Export study sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Early access to new features</span>
                </li>
              </ul>

              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 text-lg">
                Upgrade to Pro
              </Button>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm">
            <p>Cancel anytime • Secure payment via Stripe • 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}
