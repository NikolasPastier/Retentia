"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Zap, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import UpgradeModal from "./upgrade-modal"

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export default function UsageLimitModal({ isOpen, onClose, message }: UsageLimitModalProps) {
  const { userProfile } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleUpgrade = () => {
    setShowUpgradeModal(true)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Daily Limit Reached
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>

              <div>
                <p className="text-foreground mb-2">{message || "You've reached your daily limit of 1 generation."}</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to the Paid Plan for unlimited generations and more features!
                </p>
              </div>
            </div>

            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Paid Plan Benefits:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited question generations</li>
                <li>• Unlimited file uploads</li>
                <li>• Link input support</li>
                <li>• Advanced AI models</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={handleUpgrade}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade for $1.99/month
              </Button>

              <Button className="w-full bg-transparent" variant="outline" onClick={onClose}>
                Maybe Later
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Your daily limit resets at midnight
                <br />
                Current plan: {userProfile?.plan === "free" ? "Free Tier" : "Paid Plan"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}
