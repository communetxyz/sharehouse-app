"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ThumbsUp, ThumbsDown, Scale } from "lucide-react"
import { useDisputes, type Dispute } from "@/hooks/use-disputes"
import { useVoteDispute } from "@/hooks/use-vote-dispute"
import { useTaskData } from "@/hooks/use-task-data"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useI18n } from "@/lib/i18n/context"
import { useEnsNameOrAddress } from "@/hooks/use-ens-name"

function DisputeCard({
  dispute,
  communeId,
  tasks,
  onRefresh,
}: {
  dispute: Dispute
  communeId: string
  tasks: any[]
  onRefresh: () => void
}) {
  const { t } = useI18n()
  const { voteOnDispute, isVoting, votingDisputeId } = useVoteDispute(communeId)
  const assigneeDisplay = useEnsNameOrAddress(dispute.proposedNewAssignee as `0x${string}`)
  const relatedTask = tasks.find((task) => task.id === dispute.taskId)

  const statusLabels: Record<number, { label: string; color: string }> = {
    0: { label: "Active", color: "bg-amber-100 text-amber-700 border-amber-200" },
    1: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200" },
    2: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
  }

  const status = statusLabels[dispute.status] || statusLabels[0]
  const isThisVoting = votingDisputeId === dispute.id
  const totalVotes = dispute.votesFor + dispute.votesAgainst

  return (
    <Card className="border-charcoal/10">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-charcoal">
              Task #{dispute.taskId}: {relatedTask?.description || "Unknown task"}
            </p>
            <p className="text-xs text-charcoal/60">
              Proposed reassignment to: {assigneeDisplay}
            </p>
          </div>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </div>

        {/* Vote counts */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-green-600">
            <ThumbsUp className="w-3 h-3" />
            <span>{dispute.votesFor} for</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <ThumbsDown className="w-3 h-3" />
            <span>{dispute.votesAgainst} against</span>
          </div>
          {totalVotes > 0 && (
            <div className="flex-1">
              <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(dispute.votesFor / totalVotes) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Vote buttons - only for active disputes */}
        {dispute.status === 0 && (
          <div className="flex gap-2">
            <Button
              onClick={() => voteOnDispute(dispute.id, true, onRefresh)}
              disabled={isVoting}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isThisVoting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Vote For
                </>
              )}
            </Button>
            <Button
              onClick={() => voteOnDispute(dispute.id, false, onRefresh)}
              disabled={isVoting}
              size="sm"
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              {isThisVoting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Vote Against
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DisputeResolution() {
  const { t } = useI18n()
  const { commune } = useCommuneData()
  const { tasks } = useTaskData()
  const { disputes, isLoading, refreshDisputes } = useDisputes(commune?.id)

  if (!commune) return null

  const activeDisputes = disputes.filter((d) => d.status === 0)
  const resolvedDisputes = disputes.filter((d) => d.status !== 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-charcoal flex items-center gap-2">
          <Scale className="w-6 h-6" />
          Dispute Resolution
        </h2>
        <Badge variant="outline">
          {activeDisputes.length} active
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sage" />
        </div>
      ) : disputes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-charcoal/50">No disputes filed yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeDisputes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-charcoal/70 uppercase tracking-wide">Active Disputes</h3>
              {activeDisputes.map((dispute) => (
                <DisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  communeId={commune.id}
                  tasks={tasks}
                  onRefresh={refreshDisputes}
                />
              ))}
            </div>
          )}
          {resolvedDisputes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-charcoal/70 uppercase tracking-wide">Past Disputes</h3>
              {resolvedDisputes.map((dispute) => (
                <DisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  communeId={commune.id}
                  tasks={tasks}
                  onRefresh={refreshDisputes}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
