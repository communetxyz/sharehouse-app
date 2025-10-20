"use client"

import { useState } from "react"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useReassignChore() {
  const [isReassigning, setIsReassigning] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const { sendTransaction } = useSendTransaction()

  const reassignChore = async (
    communeId: string,
    choreId: string,
    period: string,
    newAssignee: string,
    onSuccess?: () => void,
    onRefresh?: () => void
  ) => {
    setIsReassigning(true)
    setIsConfirmed(false)
    setError(null)

    try {
      if (!communeId) {
        const error = new Error("No commune data available")
        setError(error)
        toast({
          title: "Failed to reassign chore",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      if (!newAssignee || newAssignee === "") {
        const error = new Error("New assignee address is required")
        setError(error)
        toast({
          title: "Failed to reassign chore",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }
      console.log("[v0] ===== REASSIGN CHORE START =====")
      console.log("[v0] Reassigning chore:", {
        choreId,
        choreIdType: typeof choreId,
        period,
        periodType: typeof period,
        newAssignee,
        communeId: communeId,
        communeIdType: typeof communeId,
        contractAddress: COMMUNE_OS_ADDRESS,
      })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "setChoreAssignee",
        args: [BigInt(communeId), BigInt(choreId), BigInt(period), newAssignee as `0x${string}`],
      })

      console.log("[v0] Encoded data:", data)
      console.log("[v0] Function args:", {
        communeId: BigInt(communeId).toString(),
        choreId: BigInt(choreId).toString(),
        period: BigInt(period).toString(),
        assignee: newAssignee,
      })
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

      console.log("[v0] ===== REASSIGN CHORE SUCCESS =====")

      setIsConfirmed(true)

      toast({
        title: "Chore reassigned!",
        description: "The chore has been successfully reassigned.",
        variant: "default",
      })

      if (onSuccess) {
        onSuccess()
      }

      // Refresh after a short delay
      if (onRefresh) {
        setTimeout(() => {
          onRefresh()
        }, 1500)
      }
    } catch (err: any) {
      console.error("[v0] ===== REASSIGN CHORE FAILED =====")
      console.error("[v0] Error:", err)
      console.error("[v0] Error details:", {
        message: err.message,
        code: err.code,
        data: err.data,
        cause: err.cause,
      })
      setError(err)
      setIsConfirmed(false)
      toast({
        title: "Failed to reassign chore",
        description: err.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
      throw new Error(err.message || "Failed to reassign chore")
    } finally {
      setIsReassigning(false)
    }
  }

  return {
    reassignChore,
    isReassigning,
    isConfirmed,
    error,
  }
}
