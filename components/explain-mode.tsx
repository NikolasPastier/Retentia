"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, File, X, Loader2, MessageSquare, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { saveStudySession } from "@/lib/firebase/firestore"
import { checkGenerationLimit, recordGeneration } from "@/lib/plans/plan-limits"

interface ExplainModeProps {
  transcript: string
  setTranscript: (transcript: string) => void
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onResult: (result: any) => void
  result: any
}

export default function ExplainMode({
  transcript,
  setTranscript,
  selectedFile,
  setSelectedFile,
  fileInputRef,
  onResult,
  result,
}: ExplainModeProps) {
  const [userExplanation, setUserExplanation] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUploadOptions, setShowUploadOptions] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowUploadOptions(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExplainSubmit = async () => {
    if (!transcript.trim() || !userExplanation.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide both material to study and your explanation.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the explain feature.",
        variant: "destructive",
      })
      return
    }

    const canGenerate = await checkGenerationLimit(user.uid)
    if (!canGenerate.allowed) {
      toast({
        title: "Limit Reached",
        description: canGenerate.reason || "Generation limit reached",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/explain-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material: transcript,
          explanation: userExplanation,
          userId: user.uid,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get explanation feedback")
      }

      const data = await response.json()

      await recordGeneration(user.uid)

      // Save study session
      const sessionTitle = `Explain Session - ${new Date().toLocaleDateString()}`
      await saveStudySession({
        userId: user.uid,
        title: sessionTitle,
        createdAt: new Date(),
        transcript: transcript,
        mode: "explain",
        explanation: userExplanation,
        feedback: data,
      })

      onResult(data)

      toast({
        title: "Feedback Generated",
        description: "Your explanation has been reviewed and saved to your dashboard",
      })
    } catch (error) {
      console.error("Error getting explanation feedback:", error)
      toast({
        title: "Feedback Failed",
        description: "There was an error reviewing your explanation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return "text-green-500"
    if (rating >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getRatingBgColor = (rating: number) => {
    if (rating >= 80) return "bg-green-500"
    if (rating >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground text-balance">Explain Mode</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Upload your study material and write your explanation to get AI feedback
        </p>
      </div>

      <div className="space-y-6">
        {/* Material Input */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Study Material
            </CardTitle>
            <CardDescription>Upload or paste the material you want to explain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedFile && (
              <div className="flex items-center gap-2 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5 text-sm w-fit">
                <File className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-5 w-5 p-0 hover:bg-muted-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <Textarea
              placeholder="Paste your study material here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[150px]"
              maxLength={10000}
            />

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Upload File
              </Button>
              <span className="text-xs text-muted-foreground">{transcript.length}/10,000</span>
            </div>
          </CardContent>
        </Card>

        {/* User Explanation Input */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Explanation
            </CardTitle>
            <CardDescription>Write your explanation of the material as if explaining to a 10-year-old</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your explanation here..."
              value={userExplanation}
              onChange={(e) => setUserExplanation(e.target.value)}
              className="min-h-[200px]"
              maxLength={5000}
            />

            <div className="flex items-center justify-between">
              <Button
                onClick={handleExplainSubmit}
                disabled={isProcessing || !transcript.trim() || !userExplanation.trim()}
                className="flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Get Feedback
              </Button>
              <span className="text-xs text-muted-foreground">{userExplanation.length}/5,000</span>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating */}
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Understanding Rating</h3>
                  <div className={`text-6xl font-bold ${getRatingColor(result.rating)}`}>{result.rating}%</div>
                  <Progress value={result.rating} className="w-full max-w-md mx-auto h-3" />
                  <p className="text-sm text-muted-foreground">
                    How well a 10-year-old would understand your explanation
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Detailed Feedback</h4>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.feedback}</p>
                </div>
              </div>

              {/* Improvements */}
              {result.improvements && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Suggested Improvements</h4>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{result.improvements}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,audio/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
