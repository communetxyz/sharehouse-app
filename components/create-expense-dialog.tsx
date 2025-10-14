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
import { useCreateExpense } from "@/hooks/use-create-expense"
import type { Member } from "@/types/commune"
import { Plus } from "lucide-react"

interface CreateExpenseDialogProps {
  communeId: string
  members: Member[]
  onSuccess: () => void
}

export function CreateExpenseDialog({ communeId, members, onSuccess }: CreateExpenseDialogProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [dueDate, setDueDate] = useState("")

  const { createExpense, isCreating } = useCreateExpense(communeId, () => {
    setOpen(false)
    setAmount("")
    setDescription("")
    setAssignedTo("")
    setDueDate("")
    onSuccess()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !assignedTo || !dueDate) return

    const dueDateObj = new Date(dueDate)
    await createExpense(amount, description, dueDateObj, assignedTo)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sage hover:bg-sage/90">
          <Plus className="mr-2 h-4 w-4" />
          {t("expenses.createExpense")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("expenses.newExpense")}</DialogTitle>
          <DialogDescription>{t("expenses.createExpense")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("expenses.amount")} (Collateral Currency)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder={t("expenses.enterAmount")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("expenses.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("expenses.enterDescription")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">{t("expenses.assignedTo")}</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger>
                <SelectValue placeholder={t("expenses.selectMember")} />
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
            <Label htmlFor="dueDate">{t("expenses.dueDate")}</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>

          <Button type="submit" disabled={isCreating} className="w-full bg-sage hover:bg-sage/90">
            {isCreating ? t("expenses.creating") : t("expenses.create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
