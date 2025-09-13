"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Brain, Calendar, BookOpen, Zap, Crown, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getUserStudySessions, type StudySession } from "@/lib/firebase/firestore"
import AuthGuard from "@/components/auth/auth-guard"
import UpgradeModal from "@/components/plans/upgrade-modal"
import BillingPortal from "@/components/plans/billing-portal"

export default function UserDashboard() {
  const { user, userProfile } = useAuth()
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    const loadStudySessions = async () => {
      if (user) {
        const sessions = await getUserStudySessions(user.uid)
        setStudySessions(sessions)
      }
      setLoading(false)
    }

    loadStudySessions()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const userStats = {
    totalSessions: studySessions.length,
    totalQuestions: studySessions.reduce((acc, session) => acc + (session.questions?.length || 0), 0),
    dailyGenerations: userProfile?.dailyGenerations || 0,
    totalGenerations: userProfile?.totalGenerations || 0,
    plan: userProfile?.plan || "free",
    remainingGenerations:
      userProfile?.plan === "paid" ? "Unlimited" : Math.max(0, 1 - (userProfile?.dailyGenerations || 0)),
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const getPlanBadgeColor = (plan: string) => {
    return plan === "paid"
      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
  }

  return (
    <AuthGuard requireAuth>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-xl text-muted-foreground">Welcome back, {user?.displayName || "Learner"}!</p>
            </div>
            <Badge variant="outline" className={getPlanBadgeColor(userStats.plan)}>
              {userStats.plan === "paid" ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Paid Plan
                </>
              ) : (
                "Free Plan"
              )}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card smooth-transition hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Status</p>
                  <p className="text-3xl font-bold text-accent capitalize">{userStats.plan}</p>
                </div>
                {userStats.plan === "paid" ? (
                  <Crown className="h-8 w-8 text-yellow-500" />
                ) : (
                  <Target className="h-8 w-8 text-accent" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {userStats.plan === "paid" ? "Unlimited access" : "Limited features"}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card smooth-transition hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {userStats.plan === "paid" ? "Total Generations" : "Today's Generations"}
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {userStats.plan === "paid" ? userStats.totalGenerations : userStats.dailyGenerations}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {userStats.plan === "paid"
                  ? "questions generated"
                  : `${userStats.remainingGenerations} remaining today`}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card smooth-transition hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Study Sessions</p>
                  <p className="text-3xl font-bold text-green-500">{userStats.totalSessions}</p>
                </div>
                <Brain className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{userStats.totalQuestions} questions total</p>
            </CardContent>
          </Card>

          <Card className="glass-card smooth-transition hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account Since</p>
                  <p className="text-lg font-bold text-blue-500">
                    {userProfile?.createdAt ? formatDate(userProfile.createdAt) : "Recently"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">member since</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Study Sessions
                </CardTitle>
                <CardDescription>Your saved learning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {studySessions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No study sessions yet</p>
                    <p className="text-sm text-muted-foreground">
                      Generate your first set of questions to create a study session!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studySessions.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/20 smooth-transition hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <BookOpen className="h-8 w-8 text-accent" />
                          <div>
                            <h4 className="font-semibold text-pretty">{session.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {session.questions?.length || 0} questions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDate(session.createdAt)}</div>
                          <Button variant="ghost" size="sm" className="mt-1">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                    {studySessions.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          View All Sessions ({studySessions.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Plan</span>
                    <Badge variant="outline" className={getPlanBadgeColor(userStats.plan)}>
                      {userStats.plan === "paid" ? "Paid" : "Free"}
                    </Badge>
                  </div>

                  {userStats.plan === "free" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Daily Generations</span>
                        <span className="text-sm font-medium">{userStats.dailyGenerations}/1</span>
                      </div>
                      <Progress value={(userStats.dailyGenerations / 1) * 100} />
                      <p className="text-xs text-muted-foreground">
                        {userStats.remainingGenerations} generations remaining today
                      </p>
                    </>
                  )}

                  {userStats.plan === "paid" && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Generations</span>
                        <span className="text-sm font-medium">{userStats.totalGenerations}</span>
                      </div>
                      <p className="text-xs text-green-600">✓ Unlimited generations</p>
                      <p className="text-xs text-green-600">✓ Unlimited file uploads</p>
                      <p className="text-xs text-green-600">✓ Link input support</p>
                    </div>
                  )}
                </div>

                {userStats.plan === "free" && (
                  <Button className="w-full" variant="default" onClick={() => setShowUpgradeModal(true)}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Paid Plan
                  </Button>
                )}
              </CardContent>
            </Card>

            <BillingPortal />

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Questions
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Sessions
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </AuthGuard>
  )
}
