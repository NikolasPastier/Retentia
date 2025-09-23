"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, File, X, Loader2, FileText, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { saveStudySession } from "@/lib/firebase/firestore"
import { checkGenerationLimit, recordGeneration } from "@/lib/plans/plan-limits"

interface SummariseModeProps {
  transcript: string
  setTranscript: (transcript: string) => void
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onResult: (result: any) => void
  result: any
}

export default function SummariseMode({
  transcript,
  setTranscript,
  selectedFile,
  setSelectedFile,
  fileInputRef,
  onResult,
  result,
}: SummariseModeProps) {
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

  const handleSummariseSubmit = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide material to summarise.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the summarise feature.",
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
      const response = await fetch("/api/summarise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcript,
          userId: user.uid,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()

      await recordGeneration(user.uid)

      // Save study session
      const sessionTitle = `Summary Session - ${new Date().toLocaleDateString()}`
      await saveStudySession({
        userId: user.uid,
        title: sessionTitle,
        createdAt: new Date(),
        transcript: transcript,
        mode: "summarise",
        summary: data,
      })

      onResult(data)

      toast({
        title: "Summary Generated",
        description: "Your summary has been created and saved to your dashboard",
      })
    } catch (error) {
      console.error("Error generating summary:", error)
      toast({
        title: "Summary Failed",
        description: "There was an error generating your summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground text-balance">Summarise Mode</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Upload or paste your material to get a concise summary with key points
        </p>
      </div>

      <div className="space-y-6">
        {/* Material Input */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Material to Summarise
            </CardTitle>
            <CardDescription>Upload or paste the content you want summarised</CardDescription>
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
              placeholder="Paste your material here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[300px]"
              maxLength={15000}
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
              <span className="text-xs text-muted-foreground">{transcript.length}/15,000</span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Supported files: MP3, WAV, M4A, MP4, MOV, AVI, TXT, MD (max 100MB)
            </p>

            <Button
              onClick={handleSummariseSubmit}
              disabled={isProcessing || !transcript.trim()}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Generate Summary
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Overview</h3>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
                </div>
              </div>

              {/* Key Points */}
              {result.keyPoints && result.keyPoints.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Key Points</h3>
                  <div className="space-y-2">
                    {result.keyPoints.map((point: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Badge variant="outline" className="mt-0.5 text-xs">
                          {index + 1}
                        </Badge>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Concepts */}
              {result.concepts && result.concepts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Important Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.concepts.map((concept: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
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
