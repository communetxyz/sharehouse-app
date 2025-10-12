"use client"

import { useState } from "react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useCommuneData } from "./use-commune-data"
import { COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"

export function useMarkChoreComplete() {
  const { commune } = useCommuneData()
  const [isMarking, setIsMarking] = useState(false)

  const { writeContract, data: hash, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const markComplete = async (choreId: string) => {
    if (!commune) {
      throw new Error("No commune data available")
    }

    setIsMarking(true)

    try {
      writeContract({
        address: COMMUNE_OS_ADDRESS,
        abi: COMMUNE_OS_ABI,
        functionName: "markChoreComplete",
        args: [BigInt(commune.id), BigInt(choreId)],
      })
    } catch (err: any) {
      setIsMarking(false)
      throw new Error(err.message || "Failed to mark chore complete")
    }
  }

  return {
    markComplete,
    isMarking: isMarking || isConfirming,
    isConfirmed,
    isConfirming,
    error: writeError,
  }
}
