"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Member, Commune } from "@/types/commune"
import { useI18n } from "@/lib/i18n/context"
import { useRemoveMember } from "@/hooks/use-remove-member"
import { useWallet } from "@/hooks/use-wallet"
import { Trash2 } from "lucide-react"
// import { useEnsNameOrAddress } from "@/hooks/use-ens-name"

interface MemberListProps {
  members: Member[]
  commune: Commune | null
  onMemberRemoved?: () => void
}

function MemberItem({
  member,
  commune,
  onMemberRemoved,
}: {
  member: Member
  commune: Commune | null
  onMemberRemoved?: () => void
}) {
  const { t } = useI18n()
  const { address } = useWallet()
  const { removeMember, isRemoving } = useRemoveMember()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  // const displayName = useEnsNameOrAddress(member.address)

  const isCreator = address && commune?.creator.toLowerCase() === address.toLowerCase()
  const canRemove = isCreator && !member.isCurrentUser

  const handleRemove = async () => {
    if (!commune) return

    try {
      await removeMember({
        communeId: commune.id,
        memberAddress: member.address,
        onSuccess: () => {
          setShowConfirmDialog(false)
          onMemberRemoved?.()
        },
      })
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-charcoal/10">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-sage text-cream">{member.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-charcoal">{member.username}</p>
            {member.isCurrentUser && (
              <Badge variant="outline" className="border-sage/30 text-sage mt-1">
                {t("members.you")}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-charcoal/60">{t("members.collateral")}</p>
            <p className="font-medium text-charcoal">¥{member.collateral}</p>
          </div>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirmDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("members.removeConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("members.removeConfirmDesc", { username: member.username })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isRemoving}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isRemoving}>
              {isRemoving ? t("members.removing") : t("members.remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function MemberList({ members, commune, onMemberRemoved }: MemberListProps) {
  const { t } = useI18n()

  return (
    <Card className="border-charcoal/10">
      <CardHeader>
        <CardTitle className="font-serif text-charcoal">
          {t("members.title")} ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <MemberItem
              key={member.address}
              member={member}
              commune={commune}
              onMemberRemoved={onMemberRemoved}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
