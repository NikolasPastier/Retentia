export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-center">📜 Retentia Terms of Service</h1>

          <p className="text-muted-foreground mb-8 text-center">
            <strong>Effective Date:</strong> 13.9.2025
          </p>

          <div className="space-y-8">
            <p className="text-lg leading-relaxed">
              Welcome to Retentia! These Terms of Service ("Terms") govern your access and use of Retentia's website,
              applications, and services (collectively, the "Service"). By using Retentia, you agree to these Terms. If
              you do not agree, you must not use the Service.
            </p>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Eligibility</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You must be at least 13 years old (or 16 in some regions) to use Retentia.</li>
                <li>If you are under 18, you may only use the Service with parental or legal guardian consent.</li>
                <li>By using Retentia, you confirm that you have the legal capacity to enter into this agreement.</li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Accounts</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You must create an account to access certain features.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You agree to provide accurate and up-to-date information when registering.</li>
                <li>Retentia reserves the right to suspend or terminate accounts that violate these Terms.</li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Use of the Service</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Retentia provides AI-powered study tools, including quizzes, summaries, and explanations.</li>
                <li>You may use the Service only for personal, non-commercial educational purposes.</li>
                <li>
                  You agree not to:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Misuse or exploit the Service for illegal activity.</li>
                    <li>Attempt to reverse-engineer, copy, or resell the Service.</li>
                    <li>Upload harmful content, malware, or offensive material.</li>
                  </ul>
                </li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Subscriptions & Payments</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Retentia offers a Free Plan with limited features and a Paid Plan with additional benefits.</li>
                <li>Paid Plans are billed on a subscription basis (e.g., monthly at $1.99).</li>
                <li>Payments are processed securely by Stripe. Retentia does not store full credit card details.</li>
                <li>Subscriptions renew automatically unless canceled before the billing date.</li>
                <li>Refunds are handled in accordance with our [Refund Policy — insert if separate].</li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. AI-Generated Content</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Retentia uses AI to generate summaries, explanations, and study questions.</li>
                <li>
                  AI output may contain errors or inaccuracies. You are responsible for verifying information before
                  relying on it.
                </li>
                <li>
                  Retentia is not liable for academic, professional, or personal outcomes resulting from the use of
                  AI-generated content.
                </li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  The Retentia name, logo, and design are owned by us and protected by copyright and trademark laws.
                </li>
                <li>
                  You retain ownership of your uploaded content (e.g., study notes, input text), but you grant Retentia
                  a license to store and process it for the Service.
                </li>
                <li>You may not use Retentia branding or content without written permission.</li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p className="mb-4">We may suspend or terminate your account if:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You violate these Terms.</li>
                <li>You misuse the Service.</li>
                <li>You engage in fraudulent or illegal activity.</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                Upon termination, your access to study sessions and generated content may be permanently deleted.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Retentia is provided "as is" and "as available."</li>
                <li>We make no guarantees that the Service will always be error-free, secure, or uninterrupted.</li>
                <li>
                  AI-generated content is for educational support only and should not be treated as guaranteed factual
                  information.
                </li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">To the maximum extent permitted by law:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  Retentia is not responsible for indirect, incidental, or consequential damages arising from the use of
                  the Service.
                </li>
                <li>
                  Our total liability for any claim related to the Service will not exceed the amount paid for the
                  subscription in the last 12 months.
                </li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to These Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms at any time. If changes are material, we will notify you via email or site
                notice. Continued use of Retentia after changes means you accept the new Terms.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of [Insert Jurisdiction — e.g., Slovakia or EU law if based there].
                Any disputes will be handled in courts located in [Insert Jurisdiction].
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="mb-4">For questions about these Terms, contact us:</p>
              <div className="text-muted-foreground">
                <p>
                  <strong>Email:</strong> nikolaspastier@icloud.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
