"use client"

import { useState } from "react"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { useCommuneData } from "./use-commune-data"
import { COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"

export function useMarkChoreComplete() {
  const { commune } = useCommuneData()
  const [isMarking, setIsMarking] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { sendTransaction } = useSendTransaction()

  const markComplete = async (choreId: string) => {
    if (!commune) {
      throw new Error("No commune data available")
    }

    setIsMarking(true)
    setIsConfirmed(false)
    setError(null)

    try {
      console.log("[v0] ===== MARK CHORE COMPLETE START =====")
      console.log("[v0] Marking chore complete:", {
        choreId,
        communeId: commune.id,
        contractAddress: COMMUNE_OS_ADDRESS,
      })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "markChoreComplete",
        args: [BigInt(commune.id), BigInt(choreId)],
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
      console.log("[v0] ===== MARK CHORE COMPLETE SUCCESS =====")

      setIsConfirmed(true)
    } catch (err: any) {
      console.error("[v0] ===== MARK CHORE COMPLETE FAILED =====")
      console.error("[v0] Error:", err)
      console.error("[v0] Error details:", {
        message: err.message,
        code: err.code,
        data: err.data,
      })
      setError(err)
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
