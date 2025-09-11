"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Clock, Brain, TrendingUp, Calendar, BookOpen, Award, Zap } from "lucide-react"

interface StudySession {
  id: string
  date: string
  topic: string
  score: number
  questionsAnswered: number
  difficulty: "Easy" | "Medium" | "Hard"
  timeSpent: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

export default function UserDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week")

  // Mock user data
  const userStats = {
    totalQuestions: 247,
    correctAnswers: 189,
    accuracy: 76,
    streak: 12,
    totalStudyTime: 1440, // minutes
    level: 8,
    xp: 2340,
    xpToNext: 660,
  }

  const recentSessions: StudySession[] = [
    {
      id: "1",
      date: "2024-01-15",
      topic: "Machine Learning Basics",
      score: 85,
      questionsAnswered: 12,
      difficulty: "Medium",
      timeSpent: 25,
    },
    {
      id: "2",
      date: "2024-01-14",
      topic: "Neural Networks",
      score: 92,
      questionsAnswered: 15,
      difficulty: "Hard",
      timeSpent: 35,
    },
    {
      id: "3",
      date: "2024-01-13",
      topic: "Data Preprocessing",
      score: 78,
      questionsAnswered: 10,
      difficulty: "Easy",
      timeSpent: 18,
    },
  ]

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your first quiz",
      icon: "🎯",
      unlocked: true,
    },
    {
      id: "2",
      title: "Streak Master",
      description: "Maintain a 7-day study streak",
      icon: "🔥",
      unlocked: true,
    },
    {
      id: "3",
      title: "Perfect Score",
      description: "Get 100% on any quiz",
      icon: "⭐",
      unlocked: false,
      progress: 92,
      maxProgress: 100,
    },
    {
      id: "4",
      title: "Knowledge Seeker",
      description: "Answer 100 questions correctly",
      icon: "🧠",
      unlocked: true,
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xl text-muted-foreground">Track your learning progress and achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card smooth-transition hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold text-accent">{userStats.accuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
            <Progress value={userStats.accuracy} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="glass-card smooth-transition hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-3xl font-bold text-orange-500">{userStats.streak}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">days in a row</p>
          </CardContent>
        </Card>

        <Card className="glass-card smooth-transition hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
                <p className="text-3xl font-bold text-green-500">{userStats.totalQuestions}</p>
              </div>
              <Brain className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{userStats.correctAnswers} correct</p>
          </CardContent>
        </Card>

        <Card className="glass-card smooth-transition hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-3xl font-bold text-blue-500">{formatTime(userStats.totalStudyTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">total time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Level */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Learning Progress
              </CardTitle>
              <CardDescription>Your current level and experience points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent-foreground">{userStats.level}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Level {userStats.level}</h3>
                    <p className="text-muted-foreground">Knowledge Seeker</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">XP</p>
                  <p className="text-2xl font-bold text-accent">{userStats.xp}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {userStats.level + 1}</span>
                  <span>
                    {userStats.xp}/{userStats.xp + userStats.xpToNext}
                  </span>
                </div>
                <Progress value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} />
                <p className="text-xs text-muted-foreground">{userStats.xpToNext} XP needed for next level</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Recent Study Sessions
              </CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 smooth-transition hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <BookOpen className="h-8 w-8 text-accent" />
                      <div>
                        <h4 className="font-semibold text-pretty">{session.topic}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                            {session.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {session.questionsAnswered} questions • {formatTime(session.timeSpent)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">{session.score}%</div>
                      <div className="text-xs text-muted-foreground">{session.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>Your learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border smooth-transition ${
                      achievement.unlocked ? "bg-accent/10 border-accent/20" : "bg-muted/10 border-muted/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground text-pretty">{achievement.description}</p>

                        {!achievement.unlocked && achievement.progress && achievement.maxProgress && (
                          <div className="mt-2 space-y-1">
                            <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                            <p className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </p>
                          </div>
                        )}

                        {achievement.unlocked && (
                          <Badge variant="outline" className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">
                            <Award className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                Start New Quiz
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Review Mistakes
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Set Study Goal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
