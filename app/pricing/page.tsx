"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Shield, Star } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function PricingPage() {
  const { userProfile } = useAuth()

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with your learning journey",
      features: [
        "1 generation per day",
        "Limited character input",
        "1 file upload max",
        "Basic question types",
        "Community support",
      ],
      current: userProfile?.plan === "free" || !userProfile?.plan,
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Premium",
      price: "$4.99",
      period: "per month",
      description: "Unlock unlimited learning potential with advanced features",
      features: [
        "Unlimited generations",
        "Unlimited character input",
        "Unlimited file uploads",
        "All question types",
        "Link input support",
        "Advanced AI models",
        "Export study sessions",
        "Priority support",
        "Early access to new features",
      ],
      current: userProfile?.plan === "premium",
      popular: true,
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/20">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-foreground hover:text-accent transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Star className="h-4 w-4 text-accent mr-2" />
              <span className="text-sm font-medium text-accent">Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                {" "}
                Learning Plan
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start free and upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative glass-card smooth-transition hover:shadow-xl ${
                  plan.popular ? "border-accent shadow-lg scale-105 lg:scale-110" : "hover:scale-105"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium">
                      <Crown className="h-4 w-4 mr-2" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{plan.description}</CardDescription>

                  <div className="pt-6">
                    <div className="text-5xl font-bold text-accent mb-2">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    {plan.current ? (
                      <Button className="w-full bg-transparent" variant="outline" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${plan.popular ? "bg-accent hover:bg-accent/90" : ""}`}
                        variant={plan.buttonVariant}
                      >
                        {plan.popular && <Crown className="h-4 w-4 mr-2" />}
                        {plan.buttonText}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Section */}
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Premium?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Unlimited Access</h3>
                <p className="text-muted-foreground">
                  Generate unlimited questions and study materials without daily limits.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Advanced Features</h3>
                <p className="text-muted-foreground">Access to advanced AI models and premium question types.</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Priority Support</h3>
                <p className="text-muted-foreground">Get priority customer support and early access to new features.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time from your account settings.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Our Free plan gives you access to core features. Upgrade when you're ready for more.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards and PayPal through our secure payment processor.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Do you offer student discounts?</h3>
                <p className="text-muted-foreground">
                  Contact our support team with your student ID for special pricing options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
