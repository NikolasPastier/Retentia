"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, Star } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "Easy" | "Medium" | "Hard"
  explanation: string
}

interface QuestionGeneratorProps {
  transcript: string
  questions: Question[]
  setQuestions: (questions: Question[]) => void
}

export default function QuestionGenerator({ transcript, questions, setQuestions }: QuestionGeneratorProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock question generation based on transcript
  const generateQuestions = () => {
    setIsGenerating(true)

    // Simulate API call delay
    setTimeout(() => {
      const mockQuestions: Question[] = [
        {
          id: "1",
          question: "What is the main concept discussed in the transcript?",
          options: [
            "Machine Learning algorithms",
            "Data preprocessing techniques",
            "Neural network architectures",
            "Statistical analysis methods",
          ],
          correctAnswer: 0,
          difficulty: difficulty,
          explanation: "The transcript primarily focuses on machine learning algorithms and their applications.",
        },
        {
          id: "2",
          question: "Which technique is mentioned for improving model accuracy?",
          options: ["Cross-validation", "Feature scaling", "Regularization", "All of the above"],
          correctAnswer: 3,
          difficulty: difficulty,
          explanation:
            "The transcript mentions multiple techniques including cross-validation, feature scaling, and regularization.",
        },
        {
          id: "3",
          question: "What is the recommended approach for handling overfitting?",
          options: ["Increase training data", "Reduce model complexity", "Use dropout layers", "Apply early stopping"],
          correctAnswer: 1,
          difficulty: difficulty,
          explanation: "Reducing model complexity is the primary method discussed for preventing overfitting.",
        },
      ]

      setQuestions(mockQuestions)
      setIsGenerating(false)
    }, 2000)
  }

  useEffect(() => {
    if (transcript && questions.length === 0) {
      generateQuestions()
    }
  }, [transcript])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    setShowResult(true)
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "Hard":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Brain className="h-16 w-16 text-accent mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Generating Questions...</h2>
            <p className="text-muted-foreground mb-4">
              AI is analyzing your transcript to create personalized questions
            </p>
            <Progress value={66} className="w-full max-w-md mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Questions Generated</h2>
            <p className="text-muted-foreground mb-4">Please provide a transcript to generate questions</p>
            <Button onClick={generateQuestions}>Generate Questions</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentQuestionIndex >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <div className="text-6xl font-bold text-accent mb-4">{percentage}%</div>
            <p className="text-xl text-muted-foreground mb-6">
              You scored {score} out of {questions.length} questions correctly
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-8 w-8 ${
                    i < Math.floor(percentage / 20) ? "text-yellow-500 fill-current" : "text-gray-400"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="outline" className="flex items-center gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={generateQuestions} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                New Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Practice Questions</h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="text-2xl font-bold text-accent">
              {score}/{questions.length}
            </div>
          </div>
        </div>
      </div>

      <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full" />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl text-balance">{currentQuestion.question}</CardTitle>
          <CardDescription>
            <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficulty)}>
              {currentQuestion.difficulty}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              let buttonVariant: "outline" | "default" | "destructive" = "outline"
              let iconElement = null

              if (showResult) {
                if (index === currentQuestion.correctAnswer) {
                  buttonVariant = "default"
                  iconElement = <CheckCircle className="h-4 w-4 text-green-500" />
                } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                  buttonVariant = "destructive"
                  iconElement = <XCircle className="h-4 w-4 text-red-500" />
                }
              } else if (selectedAnswer === index) {
                buttonVariant = "default"
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  onClick={() => !showResult && handleAnswerSelect(index)}
                  disabled={showResult}
                  className="justify-start text-left h-auto p-4 smooth-transition"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-pretty">{option}</span>
                    {iconElement}
                  </div>
                </Button>
              )
            })}
          </div>

          {showResult && (
            <Card className="bg-muted/20 border-accent/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-accent">Explanation:</h4>
                <p className="text-sm text-muted-foreground text-pretty">{currentQuestion.explanation}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDifficulty("Easy")}
                size="sm"
                className={difficulty === "Easy" ? "bg-green-500 text-white" : ""}
              >
                Easy
              </Button>
              <Button
                variant="outline"
                onClick={() => setDifficulty("Medium")}
                size="sm"
                className={difficulty === "Medium" ? "bg-yellow-500 text-white" : ""}
              >
                Medium
              </Button>
              <Button
                variant="outline"
                onClick={() => setDifficulty("Hard")}
                size="sm"
                className={difficulty === "Hard" ? "bg-red-500 text-white" : ""}
              >
                Hard
              </Button>
            </div>

            <div className="flex gap-2">
              {!showResult ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex items-center gap-2"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="flex items-center gap-2">
                  {currentQuestionIndex < questions.length - 1 ? "Next Question" : "View Results"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
