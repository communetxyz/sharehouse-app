"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/lib/i18n/context"
import { useDisputeExpense } from "@/hooks/use-dispute-expense"
import { useEnsNameOrAddress } from "@/hooks/use-ens-name"
import type { Member } from "@/types/commune"

interface DisputeExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseId: string
  currentAssignee: string
  communeId: string
  members: Member[]
  onRefresh: () => void
}

export function DisputeExpenseDialog({
  open,
  onOpenChange,
  expenseId,
  currentAssignee,
  communeId,
  members,
  onRefresh,
}: DisputeExpenseDialogProps) {
  const { t } = useI18n()
  const [selectedMember, setSelectedMember] = useState<string>("")
  const { disputeExpense, isDisputing } = useDisputeExpense(communeId, onRefresh)

  const handleDispute = async () => {
    if (!selectedMember) return

    await disputeExpense(expenseId, selectedMember)
    onOpenChange(false)
    setSelectedMember("")
  }

  // Filter out the current assignee from the member list
  const availableMembers = members.filter((m) => m.address.toLowerCase() !== currentAssignee.toLowerCase())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("expenses.disputeExpense")}</DialogTitle>
          <DialogDescription>{t("expenses.selectNewAssignee")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("expenses.newAssignee")}</label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder={t("expenses.selectMember")} />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((member) => (
                  <SelectItem key={member.address} value={member.address}>
                    <MemberOption address={member.address} />
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
            {isDisputing ? t("expenses.disputing") : t("expenses.submitDispute")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MemberOption({ address }: { address: string }) {
  const name = useEnsNameOrAddress(address)
  return <span>{name}</span>
}
