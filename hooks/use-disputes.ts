"use client"

import { useState, useEffect, useCallback } from "react"
import { communeOSContract } from "@/lib/contracts"

export interface Dispute {
  id: string
  taskId: string
  proposedNewAssignee: string
  votesFor: number
  votesAgainst: number
  status: number // 0 = Active, 1 = Resolved, 2 = Rejected
}

export function useDisputes(communeId?: string) {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchDisputes = useCallback(async () => {
    if (!communeId) return

    setIsLoading(true)
    try {
      const result = await communeOSContract.getCommuneDisputes(BigInt(communeId))
      const parsed: Dispute[] = result.map((d: any, index: number) => ({
        id: index.toString(),
        taskId: d.taskId.toString(),
        proposedNewAssignee: d.proposedNewAssignee,
        votesFor: Number(d.votesFor),
        votesAgainst: Number(d.votesAgainst),
        status: Number(d.status),
      }))
      setDisputes(parsed)
    } catch (error) {
      console.error("[use-disputes] Error fetching disputes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [communeId])

  useEffect(() => {
    fetchDisputes()
  }, [fetchDisputes])

  return { disputes, isLoading, refreshDisputes: fetchDisputes }
}
