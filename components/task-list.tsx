"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import { useMarkTaskDone } from "@/hooks/use-mark-task-done"
import { useCommuneData } from "@/hooks/use-commune-data"
import type { Task } from "@/types/commune"
import { DollarSign, Calendar, User, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { DisputeTaskDialog } from "@/components/dispute-task-dialog"

interface TaskListProps {
  tasks: Task[]
  communeId: string
  filterAssignedToMe?: boolean
  onRefresh: () => void
}

export function TaskList({ tasks, communeId, filterAssignedToMe = false, onRefresh }: TaskListProps) {
  const { t } = useI18n()
  const { markDone, isMarking } = useMarkTaskDone(communeId, onRefresh)

  const filteredTasks = filterAssignedToMe ? tasks.filter((e) => e.isAssignedToUser) : tasks

  const undoneTasks = filteredTasks.filter((e) => !e.done && !e.disputed)
  const doneTasks = filteredTasks.filter((e) => e.done && !e.disputed)
  const disputedTasks = filteredTasks.filter((e) => e.disputed)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <TaskColumn
        title={t("tasks.undone")}
        tasks={undoneTasks}
        communeId={communeId}
        onMarkDone={markDone}
        isMarking={isMarking}
        onRefresh={onRefresh}
        emptyMessage={t("tasks.noTasks")}
      />
      <TaskColumn
        title={t("tasks.done")}
        tasks={doneTasks}
        communeId={communeId}
        isDone
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
  isMarking?: boolean
  onRefresh?: () => void
  emptyMessage: string
}

function TaskColumn({
  title,
  tasks,
  communeId,
  isDone,
  isDisputed,
  onMarkDone,
  isMarking,
  onRefresh,
  emptyMessage,
}: TaskColumnProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-charcoal">{title}</h3>
      <div className="max-h-[600px] overflow-y-auto space-y-3">
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
              isMarking={isMarking}
              onRefresh={onRefresh}
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
}

function TaskCard({ task, communeId, isDone, isDisputed, onMarkDone, isMarking, onRefresh }: TaskCardProps) {
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
        <Card className={isOverdue ? "border-red-300 bg-red-50/50" : ""}>

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

            {!isDone && !isDisputed && task.isAssignedToUser && onMarkDone && (
              <Button
                onClick={() => onMarkDone(task.id)}
                disabled={isMarking}
                size="sm"
                className="w-full bg-sage hover:bg-sage/90"
              >
                {isMarking ? t("tasks.markingDone") : t("tasks.markDone")}
              </Button>
            )}

            {!isDisputed && !task.isAssignedToUser && (
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