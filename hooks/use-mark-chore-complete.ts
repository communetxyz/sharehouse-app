"use client"

import { useState } from "react"
import { useCitizenWallet } from "./use-citizen-wallet"
import { useCommuneData } from "./use-commune-data"

export function useMarkChoreComplete() {
  const { executeTransaction } = useCitizenWallet()
  const { commune } = useCommuneData()
  const [isMarking, setIsMarking] = useState(false)

  const markComplete = async (choreId: string) => {
    if (!commune) {
      throw new Error("No commune data available")
    }

    setIsMarking(true)

    try {
      await executeTransaction("markChoreComplete", [BigInt(commune.id), BigInt(choreId)], BigInt(0))
    } catch (err: any) {
      throw new Error(err.message || "Failed to mark chore complete")
    } finally {
      setIsMarking(false)
    }
  }

  return {
    markComplete,
    isMarking,
  }
}
