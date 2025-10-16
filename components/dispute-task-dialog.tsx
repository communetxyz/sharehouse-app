"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/lib/i18n/context"
import { useDisputeTask } from "@/hooks/use-dispute-task"
import type { Member } from "@/types/commune"

interface DisputeTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  currentAssignee: string
  communeId: string
  members: Member[]
  onRefresh: () => void
}

export function DisputeTaskDialog({
  open,
  onOpenChange,
  taskId,
  currentAssignee,
  communeId,
  members,
  onRefresh,
}: DisputeTaskDialogProps) {
  const { t } = useI18n()
  const [selectedMember, setSelectedMember] = useState<string>("")

  const handleClose = () => {
    onOpenChange(false)
    setSelectedMember("")
  }

  const { disputeTask, isDisputing } = useDisputeTask(communeId, handleClose, onRefresh)

  const handleDispute = async () => {
    if (!selectedMember) return

    await disputeTask(taskId, selectedMember)
  }

  // Filter out the current assignee from the member list
  const availableMembers = members.filter((m) => m.address.toLowerCase() !== currentAssignee.toLowerCase())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tasks.disputeTask")}</DialogTitle>
          <DialogDescription>{t("tasks.selectNewAssignee")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("tasks.newAssignee")}</label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder={t("tasks.selectMember")} />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((member) => (
                  <SelectItem key={member.address} value={member.address}>
                    {member.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDisputing}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleDispute}
            disabled={!selectedMember || isDisputing}
            className="bg-sage hover:bg-sage/90"
          >
            {isDisputing ? t("tasks.disputing") : t("tasks.submitDispute")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
