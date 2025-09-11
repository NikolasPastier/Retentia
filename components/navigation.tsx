"use client"

import { Button } from "@/components/ui/button"
import { Brain, BarChart3, Upload } from "lucide-react"
import Image from "next/image"

interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const navItems = [
    { id: "input", label: "Input", icon: Upload },
    { id: "questions", label: "Study", icon: Brain },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  ]

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Retentia Logo" width={48} height={48} className="rounded-lg" />
            <h1 className="text-xl font-bold text-foreground">Retentia</h1>
          </div>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  onClick={() => setActiveSection(item.id)}
                  className="flex items-center gap-2 smooth-transition"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
