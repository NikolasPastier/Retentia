"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Languages } from "lucide-react"
import { supportedLocales } from "@/lib/i18n/config"

interface TranslationResult {
  translatedText: string
  detectedSourceLanguage?: string
}

export function DynamicTranslator() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [sourceLanguage, setSourceLanguage] = useState("auto")
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState("")

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to translate")
      return
    }

    setIsTranslating(true)
    setError("")

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          targetLanguage,
          sourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      setTranslatedText(data.translation.translatedText)
    } catch (err) {
      setError("Translation failed. Please try again.")
      console.error("Translation error:", err)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Dynamic Translator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                {supportedLocales.map((locale) => (
                  <SelectItem key={locale.code} value={locale.code}>
                    {locale.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLocales.map((locale) => (
                  <SelectItem key={locale.code} value={locale.code}>
                    {locale.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Original Text</label>
            <Textarea
              placeholder="Enter text to translate..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Translation</label>
            <Textarea
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              className="min-h-[120px] bg-muted"
            />
          </div>
        </div>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        <Button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()} className="w-full md:w-auto">
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            "Translate"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
