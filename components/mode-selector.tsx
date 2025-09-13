"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, MessageSquare, FileText } from "lucide-react"
import type { StudyMode } from "./locale-page-client"

interface ModeSelectorProps {
  currentMode: StudyMode
  onModeChange: (mode: StudyMode) => void
}

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes = [
    {
      id: "study" as StudyMode,
      name: "Study",
      description: "Generate practice questions from your material",
      icon: Brain,
      color: "text-blue-500",
    },
    {
      id: "explain" as StudyMode,
      name: "Explain",
      description: "Get feedback on your explanations",
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      id: "summarise" as StudyMode,
      name: "Summarise",
      description: "Create concise summaries with key points",
      icon: FileText,
      color: "text-purple-500",
    },
  ]

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Study Mode</h2>
            <p className="text-sm text-muted-foreground">Choose how you want to interact with your material</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modes.map((mode) => {
              const Icon = mode.icon
              const isActive = currentMode === mode.id

              return (
                <Button
                  key={mode.id}
                  variant={isActive ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-3 ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-transparent"
                  }`}
                  onClick={() => onModeChange(mode.id)}
                >
                  <Icon className={`h-6 w-6 ${isActive ? "text-primary-foreground" : mode.color}`} />
                  <div className="text-center">
                    <div className="font-semibold">{mode.name}</div>
                    <div className="text-xs opacity-80 mt-1">{mode.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
