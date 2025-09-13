"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, RotateCcw, Eye, EyeOff, Bookmark, BookmarkCheck, X } from "lucide-react"

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
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(new Array(questions.length).fill(""))
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [revealedAnswers, setRevealedAnswers] = useState<boolean[]>(new Array(questions.length).fill(false))
  const [savedQuestions, setSavedQuestions] = useState<boolean[]>(new Array(questions.length).fill(false))

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizCompleted(true)
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const toggleAnswerReveal = (questionIndex: number) => {
    const newRevealed = [...revealedAnswers]
    newRevealed[questionIndex] = !newRevealed[questionIndex]
    setRevealedAnswers(newRevealed)
  }

  const toggleSaveQuestion = (questionIndex: number) => {
    const newSaved = [...savedQuestions]
    newSaved[questionIndex] = !newSaved[questionIndex]
    setSavedQuestions(newSaved)

    // In a real app, this would save to a database
    console.log(`Question ${questionIndex + 1} ${newSaved[questionIndex] ? "saved" : "unsaved"} for later`)
  }

  const getCorrectAnswer = (question: Question) => {
    if (question.type === "multiple-choice" && typeof question.correctAnswer === "number") {
      return String.fromCharCode(65 + question.correctAnswer) // Convert index to letter
    }
    return String(question.correctAnswer)
  }

  const isAnswerCorrect = (question: Question, userAnswer: string) => {
    const correctAnswer = getCorrectAnswer(question)
    if (question.type === "open-ended") {
      // For open-ended questions, we'll consider any non-empty answer as "attempted"
      return userAnswer.trim().length > 0
    }
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
  }

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (isAnswerCorrect(questions[index], answer) ? 1 : 0)
    }, 0)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers(new Array(questions.length).fill(""))
    setShowResults(false)
    setQuizCompleted(false)
    setRevealedAnswers(new Array(questions.length).fill(false))
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Quiz Results</h1>
          <p className="text-xl text-muted-foreground">
            You scored {score} out of {questions.length} ({percentage}%)
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
            </CardTitle>
            <CardDescription>
              {percentage >= 80
                ? "You have a strong understanding of the material!"
                : percentage >= 60
                  ? "You're on the right track. Review the explanations below."
                  : "Consider reviewing the material and trying again."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index]
              const correctAnswer = getCorrectAnswer(question)
              const isCorrect = isAnswerCorrect(question, userAnswer)

              return (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          Question {index + 1}: {question.question}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {question.type.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Your answer:</span>{" "}
                          <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {userAnswer || "Not answered"}
                          </span>
                        </p>
                        {question.type !== "open-ended" && (
                          <p>
                            <span className="font-medium">Correct answer:</span>{" "}
                            <span className="text-green-600">{correctAnswer}</span>
                          </p>
                        )}
                        <p className="text-muted-foreground mt-2">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={resetQuiz} variant="outline" className="flex items-center gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
              <Button onClick={onBack} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isAnswerRevealed = revealedAnswers[currentQuestion]
  const isQuestionSaved = savedQuestions[currentQuestion]

  const renderQuestionInput = () => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="grid gap-3">
            {question.options?.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
              const isSelected = selectedAnswers[currentQuestion] === optionLetter
              const correctAnswer = getCorrectAnswer(question)
              const isCorrectOption = optionLetter === correctAnswer

              let buttonVariant: "default" | "outline" | "secondary" = "outline"
              let buttonClass = "justify-start text-left h-auto p-4 whitespace-normal"

              if (isAnswerRevealed && isCorrectOption) {
                buttonVariant = "default"
                buttonClass += " bg-green-600 hover:bg-green-700 text-white border-green-600"
              } else if (isSelected) {
                buttonVariant = "secondary"
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(optionLetter)}
                >
                  <span className="font-semibold mr-3">{optionLetter}.</span>
                  <span>{option}</span>
                  {isAnswerRevealed && isCorrectOption && <CheckCircle className="h-4 w-4 ml-auto text-white" />}
                </Button>
              )
            })}
          </div>
        )

      case "true-false":
        return (
          <div className="grid gap-3">
            {["True", "False"].map((option) => {
              const isSelected = selectedAnswers[currentQuestion] === option
              const correctAnswer = getCorrectAnswer(question)
              const isCorrectOption = option === correctAnswer

              let buttonVariant: "default" | "outline" | "secondary" = "outline"
              let buttonClass = "justify-center h-auto p-4"

              if (isAnswerRevealed && isCorrectOption) {
                buttonVariant = "default"
                buttonClass += " bg-green-600 hover:bg-green-700 text-white border-green-600"
              } else if (isSelected) {
                buttonVariant = "secondary"
              }

              return (
                <Button
                  key={option}
                  variant={buttonVariant}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                  {isAnswerRevealed && isCorrectOption && <CheckCircle className="h-4 w-4 ml-2 text-white" />}
                </Button>
              )
            })}
          </div>
        )

      case "fill-blank":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Enter your answer..."
              value={selectedAnswers[currentQuestion]}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              className="text-lg p-4"
            />
            {isAnswerRevealed && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <span className="font-semibold">Correct answer:</span> {getCorrectAnswer(question)}
                </p>
              </div>
            )}
          </div>
        )

      case "open-ended":
        return (
          <div className="space-y-3">
            <Textarea
              placeholder="Write your detailed answer here..."
              value={selectedAnswers[currentQuestion]}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              className="min-h-[120px] text-base"
            />
            {isAnswerRevealed && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  <span className="font-semibold">Sample answer:</span> {getCorrectAnswer(question)}
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <Badge variant="secondary" className="capitalize">
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
              >
                {question.difficulty}
              </Badge>
            )}
          </div>
          <Button onClick={onBack} variant="ghost" size="sm" className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Clear Questions
          </Button>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl flex-1">{question.question}</CardTitle>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAnswerReveal(currentQuestion)}
                className="flex items-center gap-2"
              >
                {isAnswerRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {isAnswerRevealed ? "Hide Answer" : "Show Answer"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSaveQuestion(currentQuestion)}
                className="flex items-center gap-2"
              >
                {isQuestionSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {isQuestionSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderQuestionInput()}

          {isAnswerRevealed && question.explanation && (
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">Explanation:</h4>
              <p className="text-muted-foreground">{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion] && !isAnswerRevealed}>
              {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
