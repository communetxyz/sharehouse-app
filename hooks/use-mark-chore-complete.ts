"use client"

import { useState, useEffect } from "react"
import { useSendTransaction } from "@privy-io/react-auth"
import { useWaitForTransactionReceipt } from "wagmi"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useMarkChoreComplete() {
  const [isMarking, setIsMarking] = useState(false)
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
      console.log("[v0] Transaction hash set:", txHash)
      console.log("[v0] isConfirming:", isConfirming, "isConfirmed:", isConfirmed)
    }
  }, [txHash, isConfirming, isConfirmed])

  // Log when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("[v0] ===== TRANSACTION CONFIRMED =====")
      console.log("[v0] Transaction hash:", txHash)
    }
  }, [isConfirmed, txHash])

  const markComplete = async (choreId: string, choreData?: any, onSuccess?: () => void, onRefresh?: () => void, communeId?: string) => {
    if (!communeId) {
      console.error("[v0] No commune ID provided. communeId:", communeId)
      throw new Error("No commune data available")
    }

    if (!choreData?.periodNumber) {
      throw new Error("Period number is required to mark chore complete")
    }

    // Call onSuccess IMMEDIATELY before any async operations (for animations)
    if (onSuccess) {
      onSuccess()
    }

    console.log("[v0] Setting isMarking to true")
    setIsMarking(true)
    setTxHash(null)
    setError(null)

    try {
      console.log("[v0] ===== MARK CHORE COMPLETE START =====")
      console.log("[v0] Full chore data:", choreData)
      console.log("[v0] Marking chore complete:", {
        choreId,
        choreIdType: typeof choreId,
        period: choreData.periodNumber,
        periodType: typeof choreData.periodNumber,
        communeId: communeId,
        communeIdType: typeof communeId,
        contractAddress: COMMUNE_OS_ADDRESS,
      })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "markChoreComplete",
        args: [BigInt(communeId), BigInt(choreId), BigInt(choreData.periodNumber)],
      })

      console.log("[v0] Encoded data:", data)
      console.log("[v0] Function args:", {
        communeId: BigInt(communeId).toString(),
        choreId: BigInt(choreId).toString(),
        period: BigInt(choreData.periodNumber).toString(),
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
        console.log("[v0] Transaction sent:", transactionHash)
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
      console.error("[v0] ===== MARK CHORE COMPLETE FAILED =====")
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
        title: "Failed to mark chore complete",
        description: err.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
      throw new Error(err.message || "Failed to mark chore complete")
    } finally {
      setIsMarking(false)
    }
  }

  return {
    markComplete,
    isMarking,
    isConfirmed,
    isConfirming,
    error,
  }
}
