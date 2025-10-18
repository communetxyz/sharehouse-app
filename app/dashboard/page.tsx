"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChoreKanban } from "@/components/chore-kanban"
import { ChoreCalendar } from "@/components/chore-calendar"
import { MemberList } from "@/components/member-list"
import { CommuneInfo } from "@/components/commune-info"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { AccountButton } from "@/components/account-button"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useTaskData } from "@/hooks/use-task-data"
import { useWallet } from "@/hooks/use-wallet"
import { Loader2, Plus, Mail, CalendarPlus } from "lucide-react"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const { t } = useI18n()
  const { address, isConnected, status } = useWallet()
  const { commune, members, chores, isLoading, error, refreshData } = useCommuneData()
  const { tasks, isLoading: isLoadingTasks, refreshTasks } = useTaskData()

  // Local optimistic state for chores
  const [optimisticChores, setOptimisticChores] = useState(chores)

  // Sync fetched chores with local state
  useEffect(() => {
    setOptimisticChores(chores)
  }, [chores])

  // Optimistic chore completion
  const handleChoreCompleteOptimistic = (choreKey: string) => {
    // choreKey format is "scheduleId-periodNumber"
    console.log("[dashboard] Optimistically completing chore:", choreKey)
    setOptimisticChores(prev => {
      const updated = prev.map(chore => {
        const key = `${chore.scheduleId}-${chore.periodNumber}`
        const matches = key === choreKey
        if (matches) {
          console.log(`[dashboard] Matched chore ${chore.scheduleId}-${chore.periodNumber} (${chore.title})`)
        }
        return matches ? { ...chore, completed: true } : chore
      })
      return updated
    })
  }

  if (status === "reconnecting" || status === "connecting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">{t("dashboard.signingIn")}</p>
        </div>
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
        <header className="border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-serif">シェアハウス</div>
              <div className="text-xl font-sans tracking-wide">ShareHouse</div>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("dashboard.signIn")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">{t("dashboard.signInDesc")}</p>
              <AccountButton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">{t("dashboard.loadingSharehouse")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">{t("common.error")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-charcoal/70">{error}</p>
            <div className="flex gap-4">
              <Button onClick={refreshData} className="bg-sage hover:bg-sage/90 text-cream">
                {t("common.tryAgain")}
              </Button>
              <Link href="/join">
                <Button variant="outline" className="border-charcoal/20 bg-transparent">
                  {t("home.joinSharehouse")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
      {/* Header */}
      <header className="border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-serif">シェアハウス</div>
            <div className="text-xl font-sans tracking-wide">ShareHouse</div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            {commune && address && commune.creator.toLowerCase() === address.toLowerCase() && (
              <>
                <Link href="/dashboard/add-chores">
                  <Button variant="outline" size="sm" className="border-sage text-sage hover:bg-sage/10 bg-transparent">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    {t("addChores.button")}
                  </Button>
                </Link>
                <Link href="/dashboard/invites">
                  <Button variant="outline" size="sm" className="border-sage text-sage hover:bg-sage/10 bg-transparent">
                    <Mail className="w-4 h-4 mr-2" />
                    {t("dashboard.invites")}
                  </Button>
                </Link>
              </>
            )}
            <Link href="/create-sharehouse">
              <Button variant="outline" size="sm" className="border-sage text-sage hover:bg-sage/10 bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                {t("createSharehouse.title")}
              </Button>
            </Link>
            <Button
              onClick={() => {
                refreshData()
                refreshTasks()
              }}
              variant="ghost"
              size="sm"
              className="text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
            >
              {t("common.refresh")}
            </Button>
            <AccountButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">
            {commune?.name || t("dashboard.title")}
          </h1>
          <p className="text-charcoal/70">{t("dashboard.subtitle")}</p>
        </div>

        <Tabs defaultValue="my-chores" className="space-y-6">
          <TabsList className="bg-white/50 border border-charcoal/10">
            <TabsTrigger value="my-chores">{t("dashboard.myChores")}</TabsTrigger>
            <TabsTrigger value="all-chores">{t("dashboard.allChores")}</TabsTrigger>
            <TabsTrigger value="calendar">{t("dashboard.calendar")}</TabsTrigger>
            <TabsTrigger value="tasks">{t("dashboard.tasks")}</TabsTrigger>
            <TabsTrigger value="members">{t("dashboard.members")}</TabsTrigger>
            <TabsTrigger value="info">{t("dashboard.info")}</TabsTrigger>
          </TabsList>

          <TabsContent value="my-chores" className="space-y-6">
            <ChoreKanban
              chores={optimisticChores}
              onOptimisticComplete={handleChoreCompleteOptimistic}
              onRefresh={refreshData}
              filterMyChores
            />
          </TabsContent>

          <TabsContent value="all-chores" className="space-y-6">
            <ChoreKanban
              chores={optimisticChores}
              onOptimisticComplete={handleChoreCompleteOptimistic}
              onRefresh={refreshData}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <ChoreCalendar chores={optimisticChores} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif text-charcoal">{t("tasks.title")}</h2>
              {commune && <CreateTaskDialog
                communeId={commune.id}
                members={members}
                onSuccess={refreshTasks}
              />}
            </div>
            {isLoadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sage" />
              </div>
            ) : (
              commune && <TaskList
                tasks={tasks}
                communeId={commune.id}
                onRefresh={refreshTasks}
              />
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MemberList members={members} commune={commune} onMemberRemoved={refreshData} />
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <CommuneInfo commune={commune} members={members} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
