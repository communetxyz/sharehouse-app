"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useDisputeTask(communeId: string, onSuccess?: () => void) {
  const { address, isConnected } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isDisputing, setIsDisputing] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { toast } = useToast()

  const disputeTask = async (taskId: string, newAssignee: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to dispute a task",
        variant: "destructive",
      })
      return
    }

    setIsDisputing(true)
    setIsConfirmed(false)

    try {
      console.log("[v0] ===== DISPUTE TASK START =====")
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

      const result = await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
        },
        {
          sponsor: true, // Enable gas sponsorship
        },
      )

      console.log("[v0] Transaction result:", result)
      console.log("[v0] Transaction hash:", result.hash)
      console.log("[v0] ===== DISPUTE TASK SUCCESS =====")

      setIsConfirmed(true)

      toast({
        title: "Dispute initiated",
        description: "Your dispute has been submitted for voting",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("[v0] ===== DISPUTE TASK FAILED =====")
      console.error("[v0] Error disputing task:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      })
      toast({
        title: "Failed to dispute task",
        description: error.message || "An error occurred",
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
