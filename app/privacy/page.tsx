export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-center">📄 Retentia Privacy Policy</h1>

          <p className="text-muted-foreground mb-8 text-center">
            <strong>Effective Date:</strong> [Insert Date]
          </p>

          <div className="space-y-8">
            <p className="text-lg leading-relaxed">
              Retentia ("we," "our," "us") values your privacy. This Privacy Policy explains how we collect, use, and
              protect your personal information when you use our website, mobile applications, and services
              (collectively, the "Service"). By using Retentia, you agree to the practices described in this Privacy
              Policy.
            </p>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect the following types of information when you use Retentia:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">a. Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
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
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Study sessions, questions, summaries, notes, and other content you create or upload.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">c. Technical & Usage Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Device type, browser, operating system, IP address.</li>
                    <li>Website interactions (pages visited, time spent, clicks, session progress).</li>
                    <li>Cookies and similar technologies (see Section 5).</li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Provide, operate, and improve Retentia.</li>
                <li>Generate AI-powered summaries, questions, and study tools.</li>
                <li>Save and manage your study sessions in your account dashboard.</li>
                <li>Personalize your learning experience.</li>
                <li>Communicate with you (service updates, account notifications, marketing if you consent).</li>
                <li>Process payments and manage subscriptions.</li>
                <li>Ensure security, prevent fraud, and comply with legal obligations.</li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Share Information</h2>
              <p className="mb-4">
                We do not sell your personal information. We may share information in the following cases:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
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

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>We retain personal data as long as your account is active.</li>
                <li>
                  If you delete your account, we delete or anonymize your data, except for limited legal or backup
                  purposes.
                </li>
                <li>
                  Study sessions and generated content remain available only while your account exists, unless you
                  manually delete them.
                </li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
              <p className="mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Keep you signed in.</li>
                <li>Remember preferences.</li>
                <li>Improve site performance and security.</li>
                <li>Provide analytics on how users interact with Retentia.</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                You can disable non-essential cookies in your browser settings, though this may affect functionality.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="mb-4">
                Depending on your location (e.g., EU/EEA, UK, California residents), you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
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
              <p className="mt-4 text-muted-foreground">
                To exercise these rights, contact us at [Insert Contact Email].
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
              <p className="mb-4">We take reasonable measures to protect your information, including:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Encryption in transit and at rest.</li>
                <li>Secure hosting environments.</li>
                <li>Limited employee access.</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                However, no system is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Retentia is not intended for children under 13 (or 16 where applicable). We do not knowingly collect
                information from minors. If we learn we have collected such data, we will delete it.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Our servers and third-party providers may be located outside your country. By using Retentia, you
                consent to your data being transferred and processed globally.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you via
                email or a notice on our website.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have any questions or requests regarding this Privacy Policy, please contact us:
              </p>
              <div className="text-muted-foreground">
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
      </div>
    </div>
  )
}
