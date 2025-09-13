"use client"
import { ShoppingCart, User, Menu, ChevronDown, Settings } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
  currentMode?: string
  onModeChange?: (mode: string) => void
  currentSetting?: string
  onSettingChange?: (setting: string) => void
}

export default function Navigation({
  activeSection,
  setActiveSection,
  currentMode = "study",
  onModeChange,
  currentSetting = "adult",
  onSettingChange,
}: NavigationProps) {
  const modes = [
    { id: "study", name: "Study", description: "Generate practice questions" },
    { id: "explain", name: "Explain", description: "Get feedback on explanations" },
    { id: "summarise", name: "Summarise", description: "Create concise summaries" },
  ]

  const getSettingsForMode = (mode: string) => {
    switch (mode) {
      case "explain":
        return [
          { id: "child", name: "Child", description: "Simple explanations for children" },
          { id: "teenager", name: "Teenager", description: "Age-appropriate for teens" },
          { id: "adult", name: "Adult", description: "Standard adult level" },
          { id: "senior", name: "Senior", description: "Clear, detailed explanations" },
        ]
      case "summarise":
        return [
          { id: "briefly", name: "Briefly", description: "Quick overview" },
          { id: "in-depth", name: "In Depth", description: "Detailed summary" },
          { id: "key-points", name: "Key Points", description: "Main takeaways only" },
        ]
      default:
        return [
          { id: "easy", name: "Easy", description: "Basic difficulty" },
          { id: "medium", name: "Medium", description: "Moderate difficulty" },
          { id: "hard", name: "Hard", description: "Advanced difficulty" },
        ]
    }
  }

  const currentModeData = modes.find((m) => m.id === currentMode)
  const currentSettings = getSettingsForMode(currentMode)
  const currentSettingData = currentSettings.find((s) => s.id === currentSetting)

  return (
    <header className="relative z-20 mx-6 mt-6">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Retentia Logo" width={32} height={32} className="rounded-lg" />
            <h1 className="text-xl font-bold text-white">Retentia</h1>
          </div>

          {activeSection === "input" && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    {currentModeData?.name || "Study"}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {modes.map((mode) => (
                    <DropdownMenuItem
                      key={mode.id}
                      onClick={() => onModeChange?.(mode.id)}
                      className={currentMode === mode.id ? "bg-accent" : ""}
                    >
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-xs text-muted-foreground">{mode.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {currentSettings.map((setting) => (
                    <DropdownMenuItem
                      key={setting.id}
                      onClick={() => onSettingChange?.(setting.id)}
                      className={currentSetting === setting.id ? "bg-accent" : ""}
                    >
                      <div>
                        <div className="font-medium">{setting.name}</div>
                        <div className="text-xs text-muted-foreground">{setting.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <nav className="flex items-center space-x-1">
          <button
            onClick={() => setActiveSection("input")}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSection === "input" ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Features
          </button>
          <a
            href="#"
            className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            Docs
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200">
            <User className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              2
            </span>
          </button>
          <button className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium">
            Sign In
          </button>
          <button className="px-4 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 text-sm font-medium">
            Sign Up
          </button>
          <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
