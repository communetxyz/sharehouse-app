"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/lib/i18n/context"
import { useCreateTask } from "@/hooks/use-create-task"
import type { Member } from "@/types/commune"
import { Plus, Loader2 } from "lucide-react"

interface CreateTaskDialogProps {
  communeId: string
  members: Member[]
  onSuccess: () => void
  onOptimisticCreate?: (taskData: { budget: string, description: string, dueDate: Date, assignedTo: string }) => void
}

export function CreateTaskDialog({ communeId, members, onSuccess, onOptimisticCreate }: CreateTaskDialogProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [showBudget, setShowBudget] = useState(false)
  const [budget, setBudget] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [dueDate, setDueDate] = useState("")

  const { createTask, isCreating } = useCreateTask(communeId, onSuccess)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !assignedTo || !dueDate) return

    console.log("[create-task-dialog] ✅ NEW VERSION RUNNING - v2024-01-19")

    const dueDateObj = new Date(dueDate)
    const budgetValue = budget || "0"

    // Close dialog and reset form immediately
    setOpen(false)
    setShowBudget(false)
    setBudget("")
    setDescription("")
    setAssignedTo("")
    setDueDate("")

    // Optimistically add the task (will show in list with spinner)
    if (onOptimisticCreate) {
      console.log("[create-task-dialog] Calling optimistic create with:", { budget: budgetValue, description, dueDate: dueDateObj, assignedTo })
      onOptimisticCreate({ budget: budgetValue, description, dueDate: dueDateObj, assignedTo })
    } else {
      console.warn("[create-task-dialog] ⚠️ onOptimisticCreate callback is missing!")
    }

    // Create task in background
    await createTask(budgetValue, description, dueDateObj, assignedTo)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sage hover:bg-sage/90">
          <Plus className="mr-2 h-4 w-4" />
          {t("tasks.createTask")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("tasks.newTask")}</DialogTitle>
          <DialogDescription>{t("tasks.createTask")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="budget-toggle">{t("tasks.budget")} (Collateral Currency)</Label>
              <button
                id="budget-toggle"
                type="button"
                onClick={() => setShowBudget(!showBudget)}
                className="text-xs text-sage hover:text-sage/80 underline"
              >
                {showBudget ? "Hide budget" : "Add budget"}
              </button>
            </div>
            {showBudget && (
              <Input
                id="budget"
                type="number"
                step="0.01"
                placeholder={t("tasks.enterBudget")}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("tasks.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("tasks.enterDescription")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">{t("tasks.assignedTo")}</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger>
                <SelectValue placeholder={t("tasks.selectMember")} />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.address} value={member.address}>
                    {member.username}
                    {member.isCurrentUser && " (You)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{t("tasks.dueDate")}</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>

          <Button type="submit" disabled={isCreating} className="w-full bg-sage hover:bg-sage/90 text-cream">
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("tasks.creating")}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t("tasks.create")}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
