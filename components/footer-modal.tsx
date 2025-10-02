"use client"

import { X } from "lucide-react"
import { useEffect } from "react"
import { useTranslations } from "@/lib/i18n/context"

interface FooterModalProps {
  isOpen: boolean
  onClose: () => void
  type: "pricing" | "privacy" | "terms" | "cookies"
}

export default function FooterModal({ isOpen, onClose, type }: FooterModalProps) {
  const { t } = useTranslations()

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

      // Focus trap
      const modal = document.getElementById("footer-modal")
      if (modal) {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        const handleTab = (e: KeyboardEvent) => {
          if (e.key === "Tab") {
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }

        modal.addEventListener("keydown", handleTab as any)
        firstElement?.focus()

        return () => {
          modal.removeEventListener("keydown", handleTab as any)
        }
      }
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const getContent = () => {
    switch (type) {
      case "pricing":
        return <PricingContent />
      case "privacy":
        return <PrivacyContent />
      case "terms":
        return <TermsContent />
      case "cookies":
        return <CookiesContent />
      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        id="footer-modal"
        className="relative w-[90vw] h-[85vh] max-w-5xl bg-background border border-border/20 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background border border-border/20 transition-all duration-200 hover:scale-110"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        <div className="h-full overflow-y-auto p-8 md:p-12">{getContent()}</div>
      </div>
    </div>
  )
}

function PricingContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Pricing Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        {/* Free Plan */}
        <div className="border border-border/20 rounded-lg p-8 bg-background/50">
          <h2 className="text-3xl font-bold mb-4">Free</h2>
          <div className="text-4xl font-bold text-accent mb-4">
            $0<span className="text-lg font-normal text-muted-foreground">/forever</span>
          </div>
          <p className="text-muted-foreground mb-6">Perfect for getting started with your learning journey</p>

          <ul className="space-y-3 text-base">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>1 generation per day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Limited character input</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>1 file upload max</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Basic question types</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Community support</span>
            </li>
          </ul>
        </div>

        {/* Premium Plan */}
        <div className="border-2 border-accent rounded-lg p-8 bg-accent/5 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
          <h2 className="text-3xl font-bold mb-4">Premium</h2>
          <div className="text-4xl font-bold text-accent mb-4">
            $4.99<span className="text-lg font-normal text-muted-foreground">/month</span>
          </div>
          <p className="text-muted-foreground mb-6">Unlock unlimited learning potential with advanced features</p>

          <ul className="space-y-3 text-base">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Unlimited generations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Unlimited character input</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Unlimited file uploads</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>All question types</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Link input support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Advanced AI models</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Export study sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Priority support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Early access to new features</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground text-base">
              Yes, you can cancel your subscription at any time from your account settings.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-muted-foreground text-base">
              Our Free plan gives you access to core features. Upgrade when you're ready for more.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground text-base">
              We accept all major credit cards and PayPal through our secure payment processor.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Do you offer student discounts?</h3>
            <p className="text-muted-foreground text-base">
              Contact our support team with your student ID for special pricing options.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Privacy Policy</h1>

      <p className="text-muted-foreground mb-8 text-center text-base">
        <strong>Effective Date:</strong> [Insert Date]
      </p>

      <div className="space-y-8 text-base leading-relaxed">
        <p>
          Retentia ("we," "our," "us") values your privacy. This Privacy Policy explains how we collect, use, and
          protect your personal information when you use our website, mobile applications, and services (collectively,
          the "Service"). By using Retentia, you agree to the practices described in this Privacy Policy.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect the following types of information when you use Retentia:</p>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">a. Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Account details: name, email, password, login provider (e.g., Google, Apple, Facebook).</li>
                <li>
                  Payment details: processed securely by third-party providers (e.g., Stripe). We do not store full
                  credit card numbers.
                </li>
                <li>Contact details: if you reach out to us directly (support requests, feedback).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">b. User-Generated Content</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Study sessions, questions, summaries, notes, and other content you create or upload.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">c. Technical & Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Device type, browser, operating system, IP address.</li>
                <li>Website interactions (pages visited, time spent, clicks, session progress).</li>
                <li>Cookies and similar technologies (see Section 5).</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Provide, operate, and improve Retentia.</li>
            <li>Generate AI-powered summaries, questions, and study tools.</li>
            <li>Save and manage your study sessions in your account dashboard.</li>
            <li>Personalize your learning experience.</li>
            <li>Communicate with you (service updates, account notifications, marketing if you consent).</li>
            <li>Process payments and manage subscriptions.</li>
            <li>Ensure security, prevent fraud, and comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. How We Share Information</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share information in the following cases:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Service Providers:</strong> With third parties such as Supabase (authentication, database,
              storage), Stripe (payment processing), and hosting providers (e.g., Vercel).
            </li>
            <li>
              <strong>Analytics:</strong> With trusted analytics providers to understand usage patterns.
            </li>
            <li>
              <strong>Legal Compliance:</strong> When required by law, legal process, or to protect the rights and
              safety of Retentia and its users.
            </li>
            <li>
              <strong>Business Transfers:</strong> If Retentia is merged, acquired, or sold, your data may be
              transferred to the new entity.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>We retain personal data as long as your account is active.</li>
            <li>
              If you delete your account, we delete or anonymize your data, except for limited legal or backup purposes.
            </li>
            <li>
              Study sessions and generated content remain available only while your account exists, unless you manually
              delete them.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
          <p className="mb-4">We use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Keep you signed in.</li>
            <li>Remember preferences.</li>
            <li>Improve site performance and security.</li>
            <li>Provide analytics on how users interact with Retentia.</li>
          </ul>
          <p className="mt-4">
            You can disable non-essential cookies in your browser settings, though this may affect functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p className="mb-4">
            Depending on your location (e.g., EU/EEA, UK, California residents), you may have the following rights:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Access:</strong> Request a copy of your personal data.
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate data.
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your data ("Right to be Forgotten").
            </li>
            <li>
              <strong>Restriction:</strong> Limit how we process your data.
            </li>
            <li>
              <strong>Portability:</strong> Request your data in a machine-readable format.
            </li>
            <li>
              <strong>Opt-Out:</strong> Withdraw consent for marketing emails or cookie tracking.
            </li>
          </ul>
          <p className="mt-4">To exercise these rights, contact us at [Insert Contact Email].</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
          <p className="mb-4">We take reasonable measures to protect your information, including:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Encryption in transit and at rest.</li>
            <li>Secure hosting environments.</li>
            <li>Limited employee access.</li>
          </ul>
          <p className="mt-4">However, no system is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions or requests regarding this Privacy Policy, please contact us:
          </p>
          <div className="text-muted-foreground ml-4">
            <p>
              <strong>Email:</strong> [Insert Contact Email]
            </p>
            <p>
              <strong>Address:</strong> [Insert Business Address]
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function TermsContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Terms of Service</h1>

      <p className="text-muted-foreground mb-8 text-center text-base">
        <strong>Effective Date:</strong> 13.9.2025
      </p>

      <div className="space-y-8 text-base leading-relaxed">
        <p>
          Welcome to Retentia! These Terms of Service ("Terms") govern your access and use of Retentia's website,
          applications, and services (collectively, the "Service"). By using Retentia, you agree to these Terms. If you
          do not agree, you must not use the Service.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Eligibility</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>You must be at least 13 years old (or 16 in some regions) to use Retentia.</li>
            <li>If you are under 18, you may only use the Service with parental or legal guardian consent.</li>
            <li>By using Retentia, you confirm that you have the legal capacity to enter into this agreement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Accounts</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>You must create an account to access certain features.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree to provide accurate and up-to-date information when registering.</li>
            <li>Retentia reserves the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Use of the Service</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Retentia provides AI-powered study tools, including quizzes, summaries, and explanations.</li>
            <li>You may use the Service only for personal, non-commercial educational purposes.</li>
            <li>
              You agree not to:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Misuse or exploit the Service for illegal activity.</li>
                <li>Attempt to reverse-engineer, copy, or resell the Service.</li>
                <li>Upload harmful content, malware, or offensive material.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Subscriptions & Payments</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Retentia offers a Free Plan with limited features and a Paid Plan with additional benefits.</li>
            <li>Paid Plans are billed on a subscription basis (e.g., monthly at $4.99).</li>
            <li>Payments are processed securely by Stripe. Retentia does not store full credit card details.</li>
            <li>Subscriptions renew automatically unless canceled before the billing date.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. AI-Generated Content</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Retentia uses AI to generate summaries, explanations, and study questions.</li>
            <li>
              AI output may contain errors or inaccuracies. You are responsible for verifying information before relying
              on it.
            </li>
            <li>
              Retentia is not liable for academic, professional, or personal outcomes resulting from the use of
              AI-generated content.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>The Retentia name, logo, and design are owned by us and protected by copyright and trademark laws.</li>
            <li>
              You retain ownership of your uploaded content (e.g., study notes, input text), but you grant Retentia a
              license to store and process it for the Service.
            </li>
            <li>You may not use Retentia branding or content without written permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p className="mb-4">We may suspend or terminate your account if:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>You violate these Terms.</li>
            <li>You misuse the Service.</li>
            <li>You engage in fraudulent or illegal activity.</li>
          </ul>
          <p className="mt-4">
            Upon termination, your access to study sessions and generated content may be permanently deleted.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="mb-4">For questions about these Terms, contact us:</p>
          <div className="text-muted-foreground ml-4">
            <p>
              <strong>Email:</strong> nikolaspastier@icloud.com
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function CookiesContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Cookie Policy</h1>

      <p className="text-muted-foreground mb-8 text-center text-base">
        <strong>Effective Date:</strong> 13.9.2025
      </p>

      <div className="space-y-8 text-base leading-relaxed">
        <p>Retentia uses cookies and similar technologies to improve your experience.</p>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
          <p className="text-muted-foreground">
            Cookies are small text files stored on your device when you visit our site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4">
            <li>
              <strong className="text-foreground">Essential cookies:</strong> Required for login, account security, and
              core site functionality.
            </li>
            <li>
              <strong className="text-foreground">Performance cookies:</strong> Help us understand how users interact
              with Retentia (analytics).
            </li>
            <li>
              <strong className="text-foreground">Preference cookies:</strong> Remember your settings and study session
              preferences.
            </li>
            <li>
              <strong className="text-foreground">Marketing cookies:</strong> Used only if you consent, for newsletters
              and promotional material.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Managing Cookies</h2>
          <p className="text-muted-foreground">
            You can control or disable cookies through your browser settings. Note that some features of Retentia may
            not work without essential cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
          <p className="text-muted-foreground">
            Some cookies may come from our providers, such as Supabase (authentication/session) and Stripe (checkout).
          </p>
        </section>
      </div>
    </div>
  )
}
