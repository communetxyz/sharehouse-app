"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react"
import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useMarkChoreComplete } from "@/hooks/use-mark-chore-complete"
import { useCommuneData } from "@/hooks/use-commune-data"
import type { ChoreInstance } from "@/types/commune"
import { useLanguage } from "@/lib/i18n/context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Confetti } from "@/components/ui/confetti"
import { EmojiPickerDialog } from "@/components/emoji-picker-dialog"

interface ChoreKanbanProps {
  chores: ChoreInstance[]
  onOptimisticComplete?: (choreId: string) => void
  onRefresh: () => void
  filterMyChores?: boolean
}

// Helper function to get frequency label
const getFrequencyLabel = (frequency: number, t: (key: string) => string) => {
  const days = frequency / (24 * 60 * 60)
  if (days === 1) return t("calendar.frequencyDaily")
  if (days === 7) return t("calendar.frequencyWeekly")
  if (days === 30) return t("calendar.frequencyMonthly")
  // Simple template replacement for "Every X days"
  return t("calendar.everyXDays").replace("{{days}}", days.toString())
}

const formatPeriodDate = (periodStart: number, locale: string = "en-US") => {
  const start = new Date(periodStart * 1000)
  return start.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", { weekday: "short", month: "short", day: "numeric" })
}

// Memoize ChoreCard to prevent unnecessary re-renders
const ChoreCard = memo(function ChoreCard({
  chore,
  onComplete,
  isCompleting,
  isConfirming,
  showCompleteButton,
  isSuccess,
  locale,
  t,
}: {
  chore: ChoreInstance
  onComplete?: () => void
  isCompleting?: boolean
  isConfirming?: boolean
  showCompleteButton?: boolean
  isSuccess?: boolean
  locale?: string
  t: (key: string) => string
}) {
  const [choreEmoji, setChoreEmoji] = useState("")

  useEffect(() => {
    // Load emoji from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`chore-emoji-${chore.scheduleId}`)
      if (stored) {
        setChoreEmoji(stored)
      }
    }
  }, [chore.scheduleId])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`border-charcoal/10 ${chore.completed ? "border-sage/20 bg-sage/5" : "bg-white/50"} ${isSuccess ? "ring-2 ring-sage/50" : ""} relative overflow-hidden`}
      >
        <CardContent className="p-4 space-y-3">
          <AnimatePresence>
            {isSuccess && (
              <>
                <Confetti active={isSuccess} />
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
              </>
            )}
          </AnimatePresence>

          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`font-medium text-charcoal flex-1 ${chore.completed ? "line-through opacity-60" : ""}`}>
                {choreEmoji && <span className="mr-2">{choreEmoji}</span>}
                {chore.title}
              </h4>
              <EmojiPickerDialog
                choreId={chore.scheduleId.toString()}
                currentEmoji={choreEmoji}
                onSelect={setChoreEmoji}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-charcoal/60">
              <Badge variant="outline" className={chore.completed ? "border-sage/30 text-sage" : "border-charcoal/20"}>
                {getFrequencyLabel(chore.frequency, t)}
              </Badge>
              <span>{formatPeriodDate(chore.periodStart, locale)}</span>
            </div>
          </div>
          {!showCompleteButton && (
            <p className="text-xs text-charcoal/60">
              {chore.completed ? `${t("chores.completedBy")}: ` : `${t("chores.assignedTo")}: `}
              {chore.assignedToUsername}
            </p>
          )}
          {showCompleteButton && onComplete && (
            <Button
              onClick={onComplete}
              disabled={isCompleting || isConfirming}
              size="sm"
              className="w-full bg-sage hover:bg-sage/90 text-cream"
            >
              {isCompleting || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? t("chores.confirming") : t("chores.marking")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t("chores.markComplete")}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.chore.scheduleId === nextProps.chore.scheduleId &&
    prevProps.chore.completed === nextProps.chore.completed &&
    prevProps.isCompleting === nextProps.isCompleting &&
    prevProps.isConfirming === nextProps.isConfirming &&
    prevProps.isSuccess === nextProps.isSuccess &&
    prevProps.locale === nextProps.locale
  )
})

export function ChoreKanban({ chores, onOptimisticComplete, onRefresh, filterMyChores = false }: ChoreKanbanProps) {
  const { commune } = useCommuneData()
  console.log("[chore-kanban] Commune ID:", commune?.id)
  const { markComplete, isMarking, isConfirming, isConfirmed, error } = useMarkChoreComplete()
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const { t, language } = useLanguage()
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
      const timer = setTimeout(() => {
        setSuccessId(null)
        setCompletingId(null)
        onRefresh()
      }, 1500)

      // Cleanup timeout when effect re-runs or component unmounts
      return () => clearTimeout(timer)
    }
    // No cleanup needed if condition is false
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

  // Memoize expensive computations
  const sevenDaysAgo = useMemo(() => Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, [])

  const { assignedToMe, notStarted, completed } = useMemo(() => {
    const sortByDate = (a: ChoreInstance, b: ChoreInstance) => a.periodStart - b.periodStart

    return {
      assignedToMe: chores.filter((c) => c.isAssignedToUser === true && c.completed === false).sort(sortByDate),
      notStarted: chores.filter((c) => c.isAssignedToUser === false && c.completed === false).sort(sortByDate),
      completed: chores.filter((c) => c.completed === true && c.periodStart >= sevenDaysAgo).sort(sortByDate),
    }
  }, [chores, sevenDaysAgo])

  const handleComplete = useCallback(async (chore: ChoreInstance) => {
    // Use compound key: scheduleId-periodNumber to uniquely identify this chore instance
    const choreKey = `${chore.scheduleId}-${chore.periodNumber}`
    console.log("[chore-kanban] handleComplete called for chore:", choreKey)
    setCompletingId(choreKey)

    // Optimistically update UI immediately
    if (onOptimisticComplete) {
      onOptimisticComplete(choreKey)
    }
    setSuccessId(choreKey)

    try {
      console.log("[chore-kanban] Calling markComplete with:", {
        scheduleId: chore.scheduleId,
        periodNumber: chore.periodNumber,
        communeId: commune?.id,
      })
      await markComplete(chore.scheduleId, {
        scheduleId: chore.scheduleId,
        periodNumber: chore.periodNumber,
        title: chore.title,
        assignedTo: chore.assignedTo,
        completed: chore.completed,
      }, () => {
        // Keep success animation
      }, onRefresh, commune?.id)
      console.log("[chore-kanban] markComplete completed successfully")
    } catch (err) {
      console.error("[chore-kanban] markComplete failed:", err)
      setCompletingId(null)
      setSuccessId(null)
    }
  }, [markComplete, onOptimisticComplete, onRefresh, commune?.id])

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
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {assignedToMe.length === 0 ? (
                  <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noAssignedChores")}</p>
                ) : (
                  assignedToMe.map((chore) => {
                    const choreKey = `${chore.scheduleId}-${chore.periodNumber}`
                    return (
                      <ChoreCard
                        key={choreKey}
                        chore={chore}
                        onComplete={() => handleComplete(chore)}
                        isCompleting={completingId === choreKey && isMarking}
                        isConfirming={completingId === choreKey && isConfirming}
                        isSuccess={successId === choreKey}
                        showCompleteButton
                        locale={language}
                        t={t}
                      />
                    )
                  })
                )}
              </AnimatePresence>
            </div>
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
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {completed.length === 0 ? (
                  <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noCompletedChores")}</p>
                ) : (
                  completed.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} locale={language} t={t} />)
                )}
              </AnimatePresence>
            </div>
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
        <CardContent className="max-h-[600px] overflow-y-auto">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notStarted.length === 0 ? (
                <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noPendingChores")}</p>
              ) : (
                notStarted.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} locale={language} t={t} />)
              )}
            </AnimatePresence>
          </div>
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
        <CardContent className="max-h-[600px] overflow-y-auto">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {completed.length === 0 ? (
                <p className="text-sm text-charcoal/60 text-center py-8">{t("chores.noCompletedChores")}</p>
              ) : (
                completed.map((chore) => <ChoreCard key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} locale={language} t={t} />)
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
