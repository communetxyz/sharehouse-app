"use client"

import { useState, useEffect } from "react"
import { useSendTransaction } from "@privy-io/react-auth"
import { useWaitForTransactionReceipt } from "wagmi"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useReassignChore() {
  const [isReassigning, setIsReassigning] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const { sendTransaction } = useSendTransaction()

  // Wait for transaction confirmation (with aggressive polling for Arbitrum)
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
    pollingInterval: 100, // Poll every 100ms
  })

  // Log confirmation state changes
  useEffect(() => {
    if (txHash) {
      console.log("[v0] Reassign transaction hash set:", txHash)
      console.log("[v0] isConfirming:", isConfirming, "isConfirmed:", isConfirmed)
    }
  }, [txHash, isConfirming, isConfirmed])

  // Log when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("[v0] ===== REASSIGN TRANSACTION CONFIRMED =====")
      console.log("[v0] Transaction hash:", txHash)
    }
  }, [isConfirmed, txHash])

  const reassignChore = async (
    communeId: string,
    choreId: string,
    period: string,
    newAssignee: string,
    onSuccess?: () => void,
    onRefresh?: () => void
  ) => {
    console.log("[v0] Setting isReassigning to true")
    setIsReassigning(true)
    setTxHash(null)
    setError(null)

    // Call onSuccess IMMEDIATELY before any async operations (for animations)
    if (onSuccess) {
      onSuccess()
    }

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

      let transactionHash: string | null = null

      try {
        const result = await sendTransaction(
          {
            to: COMMUNE_OS_ADDRESS as `0x${string}`,
            data,
          },
          {
            sponsor: true, // Enable gas sponsorship
          },
        )

        transactionHash = result.hash
        console.log("[v0] Reassign transaction sent:", transactionHash)
        setTxHash(transactionHash as `0x${string}`)
      } catch (sendErr: any) {
        // Check if this is an AbortError - transaction might still have been submitted
        if (sendErr.name === "AbortError" || sendErr.message?.includes("aborted")) {
          console.warn("[v0] AbortError caught, but transaction may have been submitted. Waiting for confirmation...")
          // Don't throw - let the transaction confirmation handle it
          // The transaction might still succeed
        } else {
          // This is a real error, re-throw it
          throw sendErr
        }
      }

      // Transaction will be confirmed via useWaitForTransactionReceipt
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
      setTxHash(null)
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
    isConfirming,
    error,
  }
}
