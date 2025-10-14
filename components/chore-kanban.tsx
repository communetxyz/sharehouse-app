"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useMarkChoreComplete } from "@/hooks/use-mark-chore-complete"
import type { ChoreInstance } from "@/types/commune"
import { useLanguage } from "@/lib/i18n/context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

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
  isSuccess,
}: {
  chore: ChoreInstance
  onComplete?: () => void
  isCompleting?: boolean
  showCompleteButton?: boolean
  isSuccess?: boolean
}) {
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`border-charcoal/10 ${chore.completed ? "border-sage/20 bg-sage/5" : "bg-white/50"} ${isSuccess ? "ring-2 ring-sage/50" : ""}`}
      >
        <CardContent className="p-4 space-y-3">
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-sage/10 rounded-lg z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <Sparkles className="w-12 h-12 text-sage" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
              {chore.assignedToUsername}
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
    </motion.div>
  )
}

export function ChoreKanban({ chores, onRefresh, filterMyChores = false }: ChoreKanbanProps) {
  const { markComplete, isMarking, isConfirmed, error } = useMarkChoreComplete()
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const { t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    if (isConfirmed && completingId) {
      setSuccessId(completingId)
      toast({
        title: "Chore completed!",
        description: "Your chore has been marked as complete.",
        variant: "default",
      })

      // Show success animation for 1.5 seconds before refreshing
      setTimeout(() => {
        setSuccessId(null)
        setCompletingId(null)
        onRefresh()
      }, 1500)
    }
  }, [isConfirmed, completingId, onRefresh, toast])

  useEffect(() => {
    if (error && completingId) {
      toast({
        title: "Failed to complete chore",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
      setCompletingId(null)
    }
  }, [error, completingId, toast])

  const sortByDate = (a: ChoreInstance, b: ChoreInstance) => a.periodStart - b.periodStart

  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60

  const assignedToMe = chores.filter((c) => c.isAssignedToUser === true && c.completed === false).sort(sortByDate)
  const notStarted = chores.filter((c) => c.isAssignedToUser === false && c.completed === false).sort(sortByDate)
  const completed = chores.filter((c) => c.completed === true && c.periodStart >= sevenDaysAgo).sort(sortByDate)

  const handleComplete = async (chore: ChoreInstance) => {
    setCompletingId(chore.scheduleId.toString())
    try {
      await markComplete(chore.scheduleId, {
        scheduleId: chore.scheduleId,
        periodNumber: chore.periodNumber,
        title: chore.title,
        assignedTo: chore.assignedTo,
        completed: chore.completed,
      })
    } catch (err) {
      setCompletingId(null)
    }
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
            <AnimatePresence mode="popLayout">
              {assignedToMe.length === 0 ? (
                <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noAssignedChores")}</p>
              ) : (
                assignedToMe.map((chore) => (
                  <ChoreCard
                    key={`${chore.scheduleId}-${chore.periodNumber}`}
                    chore={chore}
                    onComplete={() => handleComplete(chore)}
                    isCompleting={completingId === chore.scheduleId.toString()}
                    isSuccess={successId === chore.scheduleId.toString()}
                    showCompleteButton
                  />
                ))
              )}
            </AnimatePresence>
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
            <AnimatePresence mode="popLayout">
              {completed.length === 0 ? (
                <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noCompletedChores")}</p>
              ) : (
                completed.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />)
              )}
            </AnimatePresence>
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
          <AnimatePresence mode="popLayout">
            {notStarted.length === 0 ? (
              <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noPendingChores")}</p>
            ) : (
              notStarted.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />)
            )}
          </AnimatePresence>
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
          <AnimatePresence mode="popLayout">
            {completed.length === 0 ? (
              <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noCompletedChores")}</p>
            ) : (
              completed.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />)
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
