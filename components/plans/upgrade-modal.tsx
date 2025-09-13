"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create Stripe checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Upgrade error:", error)
      toast({
        title: "Upgrade Failed",
        description: "There was an error processing your upgrade. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const features = [
    "Unlimited question generations",
    "Unlimited character input",
    "Unlimited file uploads",
    "Link input support",
    "Advanced AI models",
    "Export study sessions",
    "Priority support",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Paid Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">
              $1.99
              <span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">What you'll get:</h4>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Secure payment powered by Stripe
                <br />
                Cancel anytime from your dashboard
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
