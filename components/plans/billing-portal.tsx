"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Loader2, ExternalLink } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function BillingPortal() {
  const [loading, setLoading] = useState(false)
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  const handleManageBilling = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your billing",
        variant: "destructive",
      })
      return
    }

    if (userProfile?.plan !== "paid") {
      toast({
        title: "No Active Subscription",
        description: "You don't have an active subscription to manage",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error("Failed to create portal session")
      }
    } catch (error) {
      console.error("Billing portal error:", error)
      toast({
        title: "Error",
        description: "There was an error accessing the billing portal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (userProfile?.plan !== "paid") {
    return null
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-accent" />
          Billing Management
        </CardTitle>
        <CardDescription>Manage your subscription and billing information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              Current plan: <span className="font-medium text-foreground">Paid Plan ($1.99/month)</span>
            </p>
            <p>Manage your subscription, update payment methods, and view billing history.</p>
          </div>

          <Button onClick={handleManageBilling} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Billing
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
