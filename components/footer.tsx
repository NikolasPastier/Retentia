import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, FileText, Shield, Heart, Github, Twitter, Linkedin } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it Works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
        { label: "API", href: "#api" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "#help", icon: MessageCircle },
        { label: "Documentation", href: "#docs", icon: FileText },
        { label: "Blog", href: "#blog" },
        { label: "Tutorials", href: "#tutorials" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Contact", href: "#contact", icon: Mail },
        { label: "Careers", href: "#careers" },
        { label: "Press Kit", href: "#press" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#privacy", icon: Shield },
        { label: "Terms of Service", href: "#terms" },
        { label: "Cookie Policy", href: "#cookies" },
        { label: "GDPR", href: "#gdpr" },
      ],
    },
  ]

  const socialLinks = [
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
    { icon: Github, href: "#github", label: "GitHub" },
  ]

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Retentia Logo" width={40} height={40} className="rounded-lg" />
              <h3 className="text-lg font-bold text-foreground">Retentia</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Transform any content into personalized learning experiences with AI-powered question generation. Study
              smarter, retain more, and track your progress.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    asChild
                  >
                    <a href={social.href} aria-label={social.label}>
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground smooth-transition flex items-center gap-2"
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 Retentia. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500" /> for learners everywhere
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="#status" className="text-muted-foreground hover:text-foreground smooth-transition">
                System Status
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#changelog" className="text-muted-foreground hover:text-foreground smooth-transition">
                Changelog
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
