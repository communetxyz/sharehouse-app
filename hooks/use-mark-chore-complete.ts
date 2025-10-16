"use client"

import { useState } from "react"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { useCommuneData } from "./use-commune-data"
import { COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useMarkChoreComplete() {
  const { commune } = useCommuneData()
  const [isMarking, setIsMarking] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const { sendTransaction } = useSendTransaction()

  const markComplete = async (choreId: string, choreData?: any, onSuccess?: () => void, onRefresh?: () => void) => {
    if (!commune) {
      throw new Error("No commune data available")
    }

    // Call onSuccess IMMEDIATELY before any async operations (for animations)
    if (onSuccess) {
      onSuccess()
    }

    setIsMarking(true)
    setIsConfirmed(false)
    setError(null)

    // Optimistically mark as confirmed
    setIsConfirmed(true)

    try {
      console.log("[v0] ===== MARK CHORE COMPLETE START =====")
      console.log("[v0] Full chore data:", choreData)
      console.log("[v0] Marking chore complete:", {
        choreId,
        choreIdType: typeof choreId,
        communeId: commune.id,
        communeIdType: typeof commune.id,
        contractAddress: COMMUNE_OS_ADDRESS,
      })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "markChoreComplete",
        args: [BigInt(commune.id), BigInt(choreId)],
      })

      console.log("[v0] Encoded data:", data)
      console.log("[v0] Function args:", {
        communeId: BigInt(commune.id).toString(),
        choreId: BigInt(choreId).toString(),
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

      console.log("[v0] ===== MARK CHORE COMPLETE SUCCESS =====")

      // Don't refresh - UI already updated optimistically
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
      setIsConfirmed(false)
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
    isConfirming: isMarking,
    error,
  }
}
