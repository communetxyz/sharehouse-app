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
import { Plus } from "lucide-react"

interface CreateTaskDialogProps {
  communeId: string
  members: Member[]
  onSuccess: () => void
}

export function CreateTaskDialog({ communeId, members, onSuccess }: CreateTaskDialogProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [budget, setBudget] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [dueDate, setDueDate] = useState("")

  const { createTask, isCreating } = useCreateTask(communeId, () => {
    setOpen(false)
    setBudget("")
    setDescription("")
    setAssignedTo("")
    setDueDate("")
    onSuccess()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budget || !description || !assignedTo || !dueDate) return

    const dueDateObj = new Date(dueDate)
    await createTask(budget, description, dueDateObj, assignedTo)
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
            <Label htmlFor="budget">{t("tasks.budget")} (Collateral Currency)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              placeholder={t("tasks.enterBudget")}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
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

          <Button type="submit" disabled={isCreating} className="w-full bg-sage hover:bg-sage/90">
            {isCreating ? t("tasks.creating") : t("tasks.create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
