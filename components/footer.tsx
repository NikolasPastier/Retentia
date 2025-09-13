import { ExternalLink } from "lucide-react"

export default function Footer() {
  const footerLinks = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Help Center", href: "#help" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Contact", href: "#contact" },
    { label: "Retentia", href: "https://retentia.com", external: true },
  ]

  return (
    <footer className="border-t border-border/20 bg-background/80 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
          {footerLinks.map((link, index) => (
            <div key={link.label} className="flex items-center">
              <a
                href={link.href}
                className="hover:text-foreground transition-colors flex items-center gap-1"
                {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {link.label}
                {link.external && <ExternalLink className="h-3 w-3" />}
              </a>
              {index < footerLinks.length - 1 && <span className="mx-3 text-muted-foreground/60">|</span>}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
