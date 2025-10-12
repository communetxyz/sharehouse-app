"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { useState } from "react"
import { useMarkChoreComplete } from "@/hooks/use-mark-chore-complete"
import type { ChoreInstance } from "@/types/commune"
import { useEnsNameOrAddress } from "@/hooks/use-ens-name"
import { useLanguage } from "@/lib/i18n/context"

interface ChoreKanbanProps {
  chores: ChoreInstance[]
  onRefresh: () => void
  filterMyChores?: boolean
}

function ChoreCard({
  chore,
  onComplete,
  isCompleting,
  showCompleteButton,
}: {
  chore: ChoreInstance
  onComplete?: () => void
  isCompleting?: boolean
  showCompleteButton?: boolean
}) {
  const assignedToName = useEnsNameOrAddress(chore.assignedTo)

  const getFrequencyLabel = (frequency: number) => {
    const days = frequency / (24 * 60 * 60)
    if (days === 1) return "Daily"
    if (days === 7) return "Weekly"
    if (days === 30) return "Monthly"
    return `Every ${days} days`
  }

  const formatPeriodDate = (periodStart: number) => {
    const start = new Date(periodStart * 1000)
    return start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  return (
    <Card className={`border-charcoal/10 ${chore.completed ? "border-sage/20 bg-sage/5" : "bg-white/50"}`}>
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className={`font-medium text-charcoal mb-1 ${chore.completed ? "line-through opacity-60" : ""}`}>
            {chore.title}
          </h4>
          <div className="flex flex-wrap gap-2 text-xs text-charcoal/60">
            <Badge variant="outline" className={chore.completed ? "border-sage/30 text-sage" : "border-charcoal/20"}>
              {getFrequencyLabel(chore.frequency)}
            </Badge>
            <span>{formatPeriodDate(chore.periodStart)}</span>
          </div>
        </div>
        {!showCompleteButton && (
          <p className="text-xs text-charcoal/60">
            {chore.completed ? "Completed by: " : "Assigned to: "}
            {assignedToName}
          </p>
        )}
        {showCompleteButton && onComplete && (
          <Button
            onClick={onComplete}
            disabled={isCompleting}
            size="sm"
            className="w-full bg-sage hover:bg-sage/90 text-cream"
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function ChoreKanban({ chores, onRefresh, filterMyChores = false }: ChoreKanbanProps) {
  const { markComplete, isMarking } = useMarkChoreComplete()
  const [completingId, setCompletingId] = useState<string | null>(null)
  const { t } = useLanguage()

  const sortByDate = (a: ChoreInstance, b: ChoreInstance) => a.periodStart - b.periodStart

  const now = Math.floor(Date.now() / 1000)
  const sevenDaysAgo = now - 7 * 24 * 60 * 60

  console.log("[v0] ChoreKanban received chores:", chores.length)
  console.log("[v0] Filter settings:", { filterMyChores, now, sevenDaysAgo })

  const assignedToMe = chores.filter((c) => c.isAssignedToUser && !c.completed).sort(sortByDate)
  const notStarted = chores.filter((c) => !c.isAssignedToUser && !c.completed).sort(sortByDate)
  const completed = chores.filter((c) => c.completed && c.periodStart >= sevenDaysAgo).sort(sortByDate)

  console.log("[v0] Filtered chores:", {
    assignedToMe: assignedToMe.length,
    notStarted: notStarted.length,
    completed: completed.length,
  })
  console.log(
    "[v0] Completed chores details:",
    completed.map((c) => ({
      scheduleId: c.scheduleId,
      title: c.title,
      periodNumber: c.periodNumber,
      periodStart: c.periodStart,
      completed: c.completed,
    })),
  )

  const handleComplete = async (chore: ChoreInstance) => {
    setCompletingId(chore.scheduleId.toString())
    await markComplete(chore.scheduleId)
    setCompletingId(null)
    onRefresh()
  }

  if (filterMyChores) {
    // My Chores view: Only show "Assigned to Me" and "Completed"
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {/* Assigned to Me */}
        <Card className="border-sage/30 bg-sage/5">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal flex items-center gap-2">
              <Circle className="w-5 h-5 text-sage" />
              {t("chores.assignedToMe")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedToMe.length === 0 ? (
              <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noAssignedChores")}</p>
            ) : (
              assignedToMe.map((chore) => (
                <ChoreCard
                  key={`${chore.scheduleId}-${chore.periodNumber}`}
                  chore={chore}
                  onComplete={() => handleComplete(chore)}
                  isCompleting={completingId === chore.scheduleId.toString()}
                  showCompleteButton
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-charcoal/10">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sage" />
              {t("chores.completed")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completed.length === 0 ? (
              <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noCompletedChores")}</p>
            ) : (
              completed.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />)
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // All Chores view: Only show "Not Started" and "Completed"
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Not Started */}
      <Card className="border-charcoal/10">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal flex items-center gap-2">
            <Circle className="w-5 h-5 text-charcoal/40" />
            {t("chores.notStarted")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notStarted.length === 0 ? (
            <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noPendingChores")}</p>
          ) : (
            notStarted.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />)
          )}
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="border-charcoal/10">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-sage" />
            {t("chores.completed")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completed.length === 0 ? (
            <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noCompletedChores")}</p>
          ) : (
            completed.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />)
          )}
        </CardContent>
      </Card>
    </div>
  )
}
