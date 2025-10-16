"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import { useMarkTaskDone } from "@/hooks/use-mark-task-done"
import { useCommuneData } from "@/hooks/use-commune-data"
import type { Task } from "@/types/commune"
import { DollarSign, Calendar, User, AlertCircle, Sparkles, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { DisputeTaskDialog } from "@/components/dispute-task-dialog"
import { Confetti } from "@/components/ui/confetti"

interface TaskListProps {
  tasks: Task[]
  communeId: string
  filterAssignedToMe?: boolean
  onOptimisticMarkDone?: (taskId: string) => void
  onRefresh: () => void
  pendingCreateIds?: Set<string>
  confirmedCreateIds?: Set<string>
}

export function TaskList({ tasks, communeId, filterAssignedToMe = false, onOptimisticMarkDone, onRefresh, pendingCreateIds, confirmedCreateIds }: TaskListProps) {
  const { t } = useI18n()
  const { markDone } = useMarkTaskDone(communeId, onRefresh)
  const [successTaskId, setSuccessTaskId] = useState<string | null>(null)
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set())
  const [confirmedTaskIds, setConfirmedTaskIds] = useState<Set<string>>(new Set())
  const [markingTaskId, setMarkingTaskId] = useState<string | null>(null)

  const filteredTasks = filterAssignedToMe ? tasks.filter((e) => e.isAssignedToUser) : tasks

  const undoneTasks = filteredTasks.filter((e) => !e.done && !e.disputed)
  const doneTasks = filteredTasks.filter((e) => e.done && !e.disputed)
  const disputedTasks = filteredTasks.filter((e) => e.disputed)

  const handleMarkDone = async (taskId: string) => {
    // Don't allow marking temporary tasks as done
    if (taskId.startsWith('temp-')) {
      console.warn('Cannot mark temporary task as done')
      return
    }

    // Optimistically update UI immediately
    if (onOptimisticMarkDone) {
      onOptimisticMarkDone(taskId)
    }
    setSuccessTaskId(taskId)
    setTimeout(() => setSuccessTaskId(null), 1500)

    // Track which task is being marked
    setMarkingTaskId(taskId)

    // Track pending transaction
    setPendingTaskIds(prev => new Set(prev).add(taskId))

    try {
      await markDone(taskId)
      // Transaction confirmed
      setConfirmedTaskIds(prev => new Set(prev).add(taskId))
      setPendingTaskIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })

      // Clear confirmed status and refresh data after 2 seconds
      setTimeout(() => {
        setConfirmedTaskIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
        // Refresh data to get updated state from blockchain
        if (onRefresh) {
          onRefresh()
        }
      }, 2000)
    } catch (error) {
      // Remove from pending on error
      setPendingTaskIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    } finally {
      // Clear marking state
      setMarkingTaskId(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <TaskColumn
        title={t("tasks.undone")}
        tasks={undoneTasks}
        communeId={communeId}
        onMarkDone={handleMarkDone}
        markingTaskId={markingTaskId}
        onRefresh={onRefresh}
        successTaskId={successTaskId}
        pendingTaskIds={pendingTaskIds}
        confirmedTaskIds={confirmedTaskIds}
        pendingCreateIds={pendingCreateIds}
        confirmedCreateIds={confirmedCreateIds}
        emptyMessage={t("tasks.noTasks")}
      />
      <TaskColumn
        title={t("tasks.done")}
        tasks={doneTasks}
        communeId={communeId}
        isDone
        pendingTaskIds={pendingTaskIds}
        confirmedTaskIds={confirmedTaskIds}
        pendingCreateIds={pendingCreateIds}
        confirmedCreateIds={confirmedCreateIds}
        emptyMessage={t("tasks.noDoneTasks")}
      />
      <TaskColumn
        title={t("tasks.disputed")}
        tasks={disputedTasks}
        communeId={communeId}
        isDisputed
        onRefresh={onRefresh}
        emptyMessage={t("tasks.noTasks")}
      />
    </div>
  )
}

interface TaskColumnProps {
  title: string
  tasks: Task[]
  communeId: string
  isDone?: boolean
  isDisputed?: boolean
  onMarkDone?: (taskId: string) => void
  markingTaskId?: string | null
  onRefresh?: () => void
  successTaskId?: string | null
  pendingTaskIds?: Set<string>
  confirmedTaskIds?: Set<string>
  pendingCreateIds?: Set<string>
  confirmedCreateIds?: Set<string>
  emptyMessage: string
}

function TaskColumn({
  title,
  tasks,
  communeId,
  isDone,
  isDisputed,
  onMarkDone,
  markingTaskId,
  onRefresh,
  successTaskId,
  pendingTaskIds,
  confirmedTaskIds,
  pendingCreateIds,
  confirmedCreateIds,
  emptyMessage,
}: TaskColumnProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-charcoal">{title}</h3>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-sm text-charcoal/50">{emptyMessage}</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              communeId={communeId}
              isDone={isDone}
              isDisputed={isDisputed}
              onMarkDone={onMarkDone}
              isMarking={markingTaskId === task.id}
              onRefresh={onRefresh}
              isSuccess={successTaskId === task.id}
              isPending={
                task.id.startsWith('temp-')
                  ? (pendingCreateIds?.has(task.id) || false)
                  : (pendingTaskIds?.has(task.id) || false)
              }
              isConfirmed={
                task.id.startsWith('temp-')
                  ? (confirmedCreateIds?.has(task.id) || false)
                  : (confirmedTaskIds?.has(task.id) || false)
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task
  communeId: string
  isDone?: boolean
  isDisputed?: boolean
  onMarkDone?: (taskId: string) => void
  isMarking?: boolean
  onRefresh?: () => void
  isSuccess?: boolean
  isPending?: boolean
  isConfirmed?: boolean
}

function TaskCard({
  task,
  communeId,
  isDone,
  isDisputed,
  onMarkDone,
  isMarking,
  onRefresh,
  isSuccess,
  isPending,
  isConfirmed
}: TaskCardProps) {
  const { t } = useI18n()
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const { members } = useCommuneData()

  const isOverdue = !task.done && task.dueDate < Date.now() / 1000

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`${isOverdue ? "border-red-300 bg-red-50/50" : ""} ${isSuccess ? "ring-2 ring-sage/50" : ""} relative overflow-hidden`}>
          <AnimatePresence>
            {isSuccess && (
              <>
                <Confetti active={isSuccess} />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <Sparkles className="w-6 h-6 text-sage" />
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Transaction status indicator */}
          {(isPending || isConfirmed) && (
            <div className="absolute top-3 right-3 z-20">
              {isPending && !isConfirmed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="flex items-center gap-2 bg-sage/10 rounded-full px-3 py-1">
                    <Loader2 className="w-3 h-3 animate-spin text-sage" />
                    <span className="text-xs text-sage font-medium">Processing...</span>
                  </div>
                </motion.div>
              )}
              {isConfirmed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="flex items-center gap-2 bg-green-100 rounded-full px-3 py-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Confirmed!</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base font-medium text-charcoal">{task.description}</CardTitle>
              {isDisputed && (
                <Badge variant="destructive" className="ml-2">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {t("tasks.disputed")}
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {task.budget} Collateral Currency
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate * 1000).toLocaleDateString()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1 text-xs text-charcoal/70">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  {t("tasks.assignedTo")}: {task.assignedToUsername}
                </span>
              </div>
            </div>

            {!isDone && !isDisputed && task.isAssignedToUser && onMarkDone && !task.id.startsWith('temp-') && (
              <Button
                onClick={() => onMarkDone(task.id)}
                disabled={isMarking}
                size="sm"
                className="w-full bg-sage hover:bg-sage/90"
              >
                {isMarking ? t("tasks.markingDone") : t("tasks.markDone")}
              </Button>
            )}

            {!isDisputed && !task.isAssignedToUser && !task.id.startsWith('temp-') && (
              <Button onClick={() => setShowDisputeDialog(true)} size="sm" variant="outline" className="w-full">
                {t("tasks.dispute")}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <DisputeTaskDialog
        open={showDisputeDialog}
        onOpenChange={setShowDisputeDialog}
        taskId={task.id}
        currentAssignee={task.assignedTo}
        communeId={communeId}
        members={members}
        onRefresh={onRefresh || (() => {})}
      />
    </>
  )
}