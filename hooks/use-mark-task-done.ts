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
  const [isMarking, setIsMarking] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { toast } = useToast()

  const markDone = async (taskId: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Account not connected",
        description: "Please connect your account to mark task as done",
        variant: "destructive",
      })
      return
    }

    setIsMarking(true)
    setIsConfirmed(false)

    // Optimistically mark as confirmed
    setIsConfirmed(true)

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

      // Don't call onRefresh - TaskList handles confirmation internally
    } catch (error: any) {
      console.error("Error marking task as done:", error)
      setIsConfirmed(false)
      toast({
        title: "Failed to mark task as done",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMarking(false)
    }
  }

  return {
    markDone,
    isMarking,
    isConfirmed,
  }
}
