"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useDisputeTask(communeId: string, onClose?: () => void, onRefresh?: () => void) {
  const { address, isConnected } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isDisputing, setIsDisputing] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { toast } = useToast()

  const disputeTask = async (taskId: string, newAssignee: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Account not connected",
        description: "Please connect your account to dispute an task",
        variant: "destructive",
      })
      return
    }

    // Close dialog IMMEDIATELY before any async operations
    if (onClose) {
      onClose()
    }

    setIsDisputing(true)
    setIsConfirmed(false)

    // Optimistically mark as confirmed
    setIsConfirmed(true)

    try {
      console.log("[v0] ===== DISPUTE EXPENSE START =====")
      console.log("[v0] Disputing task:", {
        taskId,
        newAssignee,
        communeId,
        contractAddress: COMMUNE_OS_ADDRESS,
      })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "disputeTask",
        args: [BigInt(communeId), BigInt(taskId), newAssignee as `0x${string}`],
      })

      console.log("[v0] Encoded data:", data)
      console.log("[v0] Calling sendTransaction with sponsor: true")

      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
        },
        {
          sponsor: true, // Enable gas sponsorship
        },
      )

      console.log("[v0] ===== DISPUTE EXPENSE SUCCESS =====")

      toast({
        title: "Dispute initiated",
        description: "Your dispute has been submitted for voting",
      })

      // Don't refresh - UI already updated optimistically
    } catch (error: any) {
      console.error("[v0] ===== DISPUTE EXPENSE FAILED =====")
      console.error("[v0] Error disputing task:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      })
      setIsConfirmed(false)
      toast({
        title: "Failed to dispute task",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDisputing(false)
    }
  }

  return {
    disputeTask,
    isDisputing,
    isConfirmed,
  }
}
