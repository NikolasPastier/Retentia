export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-center">🍪 Cookie Policy</h1>

          <p className="text-muted-foreground mb-8 text-center">
            <strong>Effective Date:</strong> 13.9.2025
          </p>

          <div className="space-y-8">
            <p className="text-lg leading-relaxed">
              Retentia uses cookies and similar technologies to improve your experience.
            </p>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files stored on your device when you visit our site.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Essential cookies:</strong> Required for login, account security, and core site functionality.
                </li>
                <li>
                  <strong>Performance cookies:</strong> Help us understand how users interact with Retentia (analytics).
                </li>
                <li>
                  <strong>Preference cookies:</strong> Remember your settings and study session preferences.
                </li>
                <li>
                  <strong>Marketing cookies:</strong> Used only if you consent, for newsletters and promotional
                  material.
                </li>
              </ul>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Managing Cookies</h2>
              <p className="text-muted-foreground">
                You can control or disable cookies through your browser settings. Note that some features of Retentia
                may not work without essential cookies.
              </p>
            </section>

            <hr className="border-border/20" />

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground">
                Some cookies may come from our providers, such as Supabase (authentication/session) and Stripe
                (checkout).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
