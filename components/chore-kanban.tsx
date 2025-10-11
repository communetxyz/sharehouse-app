"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { useState } from "react"
import { useMarkChoreComplete } from "@/hooks/use-mark-chore-complete"
import type { ChoreInstance } from "@/types/commune"

interface ChoreKanbanProps {
  chores: ChoreInstance[]
  onRefresh: () => void
}

export function ChoreKanban({ chores, onRefresh }: ChoreKanbanProps) {
  const { markComplete, isMarking } = useMarkChoreComplete()
  const [completingId, setCompletingId] = useState<string | null>(null)

  const sortByDate = (a: ChoreInstance, b: ChoreInstance) => a.periodStart - b.periodStart

  const assignedToMe = chores.filter((c) => c.isAssignedToUser && !c.completed).sort(sortByDate)
  const notStarted = chores.filter((c) => !c.isAssignedToUser && !c.completed).sort(sortByDate)
  const completed = chores.filter((c) => c.completed).sort(sortByDate)

  const handleComplete = async (chore: ChoreInstance) => {
    setCompletingId(chore.scheduleId.toString())
    await markComplete(chore.scheduleId)
    setCompletingId(null)
    onRefresh()
  }

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
    <div className="grid md:grid-cols-3 gap-6">
      {/* Assigned to Me */}
      <Card className="border-sage/30 bg-sage/5">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal flex items-center gap-2">
            <Circle className="w-5 h-5 text-sage" />
            Assigned to Me
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedToMe.length === 0 ? (
            <p className="text-sm text-charcoal/60 text-center py-8">No chores assigned to you right now</p>
          ) : (
            assignedToMe.map((chore) => (
              <Card key={`${chore.scheduleId}-${chore.periodNumber}`} className="border-charcoal/10">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-charcoal mb-1">{chore.title}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-charcoal/60">
                      <Badge variant="outline" className="border-sage/30 text-sage">
                        {getFrequencyLabel(chore.frequency)}
                      </Badge>
                      <span>{formatPeriodDate(chore.periodStart)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleComplete(chore)}
                    disabled={isMarking || completingId === chore.scheduleId.toString()}
                    size="sm"
                    className="w-full bg-sage hover:bg-sage/90 text-cream"
                  >
                    {completingId === chore.scheduleId.toString() ? (
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
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Not Started */}
      <Card className="border-charcoal/10">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal flex items-center gap-2">
            <Circle className="w-5 h-5 text-charcoal/40" />
            Not Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notStarted.length === 0 ? (
            <p className="text-sm text-charcoal/60 text-center py-8">No pending chores</p>
          ) : (
            notStarted.map((chore) => (
              <Card key={`${chore.scheduleId}-${chore.periodNumber}`} className="border-charcoal/10 bg-white/50">
                <CardContent className="p-4 space-y-2">
                  <div>
                    <h4 className="font-medium text-charcoal mb-1">{chore.title}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-charcoal/60">
                      <Badge variant="outline" className="border-charcoal/20">
                        {getFrequencyLabel(chore.frequency)}
                      </Badge>
                      <span>{formatPeriodDate(chore.periodStart)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-charcoal/60">
                    Assigned to: {chore.assignedTo.slice(0, 6)}...{chore.assignedTo.slice(-4)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="border-charcoal/10">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-sage" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completed.length === 0 ? (
            <p className="text-sm text-charcoal/60 text-center py-8">No completed chores yet</p>
          ) : (
            completed.map((chore) => (
              <Card key={`${chore.scheduleId}-${chore.periodNumber}`} className="border-sage/20 bg-sage/5">
                <CardContent className="p-4 space-y-2">
                  <div>
                    <h4 className="font-medium text-charcoal mb-1 line-through opacity-60">{chore.title}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-charcoal/60">
                      <Badge variant="outline" className="border-sage/30 text-sage">
                        {getFrequencyLabel(chore.frequency)}
                      </Badge>
                      <span>{formatPeriodDate(chore.periodStart)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-charcoal/60">
                    Completed by: {chore.assignedTo.slice(0, 6)}...{chore.assignedTo.slice(-4)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
