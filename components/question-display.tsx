"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, RotateCcw, X } from "lucide-react"
import { useTranslations } from "@/lib/i18n/context"

interface Question {
  question: string
  type: "multiple-choice" | "true-false" | "open-ended" | "fill-blank"
  options?: string[]
  correctAnswer: number | string
  explanation: string
  difficulty?: string
}

interface QuestionDisplayProps {
  questions: Question[]
  onBack: () => void
}

export default function QuestionDisplay({ questions, onBack }: QuestionDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(new Array(questions.length).fill(""))
  const [showResults, setShowResults] = useState(false)
  const { t } = useTranslations()

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleSubmitAnswers = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (isAnswerCorrect(questions[index], answer) ? 1 : 0)
    }, 0)
  }

  const resetQuiz = () => {
    setSelectedAnswers(new Array(questions.length).fill(""))
    setShowResults(false)
  }

  const isAnswerCorrect = (question: Question, userAnswer: string) => {
    const correctAnswer = getCorrectAnswer(question)
    if (question.type === "open-ended") {
      return userAnswer.trim().length > 0
    }
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
  }

  const getCorrectAnswer = (question: Question) => {
    if (question.type === "multiple-choice" && typeof question.correctAnswer === "number") {
      return String.fromCharCode(65 + question.correctAnswer)
    }
    return String(question.correctAnswer)
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">{t("questions.title")}</h1>
          <p className="text-xl text-gray-300">
            {t("questions.score", { score, total: questions.length, percentage })}
          </p>
        </div>

        <Card className="bg-gradient-to-b from-slate-800/90 via-slate-800/80 to-emerald-900/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {percentage >= 80
                ? t("questions.excellent")
                : percentage >= 60
                  ? t("questions.goodJob")
                  : t("questions.keepPracticing")}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {percentage >= 80
                ? t("questions.excellentDesc")
                : percentage >= 60
                  ? t("questions.goodJobDesc")
                  : t("questions.keepPracticingDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index]
              const correctAnswer = getCorrectAnswer(question)
              const isCorrect = isAnswerCorrect(question, userAnswer)

              return (
                <div
                  key={index}
                  className="border border-white/10 rounded-xl p-4 space-y-3 bg-slate-900/40 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">
                          {t("questions.questionNumber", { number: index + 1, total: questions.length })}:{" "}
                          {question.question}
                        </h3>
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                          {question.type.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-300">
                          <span className="font-medium">{t("questions.yourAnswer")}</span>{" "}
                          <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                            {userAnswer || t("questions.notAnswered")}
                          </span>
                        </p>
                        {question.type !== "open-ended" && (
                          <p className="text-gray-300">
                            <span className="font-medium">{t("questions.correctAnswer")}</span>{" "}
                            <span className="text-green-400">{correctAnswer}</span>
                          </p>
                        )}
                        <p className="text-gray-400 mt-2">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex gap-4 justify-center pt-4">
              <Button
                onClick={resetQuiz}
                variant="outline"
                className="flex items-center gap-2 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                {t("questions.retakeQuiz")}
              </Button>
              <Button
                onClick={onBack}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
              >
                <X className="h-4 w-4" />
                {t("questions.clearQuestions")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-white/20 text-gray-300">
              {questions.length} {questions.length === 1 ? "Question" : "Questions"}
            </Badge>
          </div>
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
            {t("questions.clearQuestions")}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card
            key={index}
            className="bg-gradient-to-b from-slate-800/90 via-slate-800/80 to-emerald-900/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-white/20 text-gray-300">
                      {t("questions.questionNumber", { number: index + 1, total: questions.length })}
                    </Badge>
                    <Badge variant="secondary" className="capitalize bg-white/10 text-gray-300 border-white/20">
                      {question.type.replace("-", " ")}
                    </Badge>
                    {question.difficulty && (
                      <Badge
                        variant={
                          question.difficulty === "hard"
                            ? "destructive"
                            : question.difficulty === "medium"
                              ? "secondary"
                              : "default"
                        }
                        className="bg-white/10 border-white/20"
                      >
                        {question.difficulty}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl text-white">{question.question}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.type === "multiple-choice" && (
                <div className="grid gap-3">
                  {question.options?.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex)
                    const isSelected = selectedAnswers[index] === optionLetter

                    return (
                      <Button
                        key={optionIndex}
                        variant={isSelected ? "secondary" : "outline"}
                        className={`justify-start text-left h-auto p-4 whitespace-normal ${
                          isSelected
                            ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                        onClick={() => handleAnswerSelect(index, optionLetter)}
                      >
                        <span className="font-semibold mr-3">{optionLetter}.</span>
                        <span>{option}</span>
                      </Button>
                    )
                  })}
                </div>
              )}

              {question.type === "true-false" && (
                <div className="grid gap-3">
                  {["True", "False"].map((option) => {
                    const isSelected = selectedAnswers[index] === option

                    return (
                      <Button
                        key={option}
                        variant={isSelected ? "secondary" : "outline"}
                        className={`justify-center h-auto p-4 ${
                          isSelected
                            ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                        onClick={() => handleAnswerSelect(index, option)}
                      >
                        {option}
                      </Button>
                    )
                  })}
                </div>
              )}

              {question.type === "fill-blank" && (
                <Input
                  placeholder="Enter your answer..."
                  value={selectedAnswers[index]}
                  onChange={(e) => handleAnswerSelect(index, e.target.value)}
                  className="text-lg p-4 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              )}

              {question.type === "open-ended" && (
                <Textarea
                  placeholder="Write your detailed answer here..."
                  value={selectedAnswers[index]}
                  onChange={(e) => handleAnswerSelect(index, e.target.value)}
                  className="min-h-[120px] text-base bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmitAnswers}
          disabled={selectedAnswers.some((answer) => !answer.trim())}
          className="px-8 py-6 text-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Submit Answers
        </Button>
      </div>
    </div>
  )
}
