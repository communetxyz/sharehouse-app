"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useMarkTaskDone(communeId: string, onRefresh?: () => void) {
  const { address, isConnected } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [markingTaskId, setMarkingTaskId] = useState<string | null>(null)
  const [confirmedTaskIds, setConfirmedTaskIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const markDone = async (taskId: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mark task as done",
        variant: "destructive",
      })
      return
    }

    setMarkingTaskId(taskId)

    // Optimistically mark as confirmed
    setConfirmedTaskIds(prev => new Set(prev).add(taskId))

    try {
      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "markTaskDone",
        args: [BigInt(communeId), BigInt(taskId)],
      })

      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
        },
        {
          sponsor: true, // Enable gas sponsorship
        },
      )

      toast({
        title: "Task marked as done",
        description: "The task has been marked as done successfully",
      })

      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      console.error("Error marking task as done:", error)
      setConfirmedTaskIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
      toast({
        title: "Failed to mark task as done",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setMarkingTaskId(null)
    }
  }

  return {
    markDone,
    markingTaskId,
    confirmedTaskIds,
  }
}
