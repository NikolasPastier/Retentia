"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Upload, Link, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface PlanComparisonProps {
  onUpgrade?: () => void
}

export default function PlanComparison({ onUpgrade }: PlanComparisonProps) {
  const { userProfile } = useAuth()

  const plans = [
    {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        { name: "1 generation per day", included: true },
        { name: "Limited character input", included: true },
        { name: "1 file upload max", included: true },
        { name: "Basic question types", included: true },
        { name: "Link input support", included: false },
        { name: "Unlimited generations", included: false },
        { name: "Unlimited file uploads", included: false },
        { name: "Priority support", included: false },
      ],
      current: userProfile?.plan === "free",
      popular: false,
    },
    {
      name: "Paid Plan",
      price: "$1.99",
      period: "per month",
      description: "Unlimited learning potential",
      features: [
        { name: "Unlimited generations", included: true },
        { name: "Unlimited character input", included: true },
        { name: "Unlimited file uploads", included: true },
        { name: "All question types", included: true },
        { name: "Link input support", included: true },
        { name: "Advanced AI models", included: true },
        { name: "Export study sessions", included: true },
        { name: "Priority support", included: true },
      ],
      current: userProfile?.plan === "paid",
      popular: true,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Choose Your Plan</h2>
        <p className="text-xl text-muted-foreground">Unlock your learning potential with unlimited access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`glass-card smooth-transition hover:shadow-lg relative ${
              plan.popular ? "border-accent shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-3 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">{plan.description}</CardDescription>
              <div className="pt-4">
                <div className="text-4xl font-bold text-accent">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-foreground" : "text-muted-foreground line-through"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                {plan.current ? (
                  <Button className="w-full bg-transparent" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : plan.name === "Paid Plan" ? (
                  <Button className="w-full" onClick={onUpgrade}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                ) : (
                  <Button className="w-full bg-transparent" variant="outline" disabled>
                    Current Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">Instant activation</span>
          </div>
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">Cancel anytime</span>
          </div>
          <div className="flex items-center gap-3">
            <Link className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">Secure payments</span>
          </div>
        </div>
      </div>
    </div>
  )
}
