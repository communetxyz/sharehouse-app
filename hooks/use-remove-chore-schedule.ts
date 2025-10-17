"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { encodeFunctionData } from "viem"
import { useSendTransaction } from "@privy-io/react-auth"

export function useRemoveChoreSchedule(communeId: string) {
  const { address } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const removeChoreSchedule = async (
    choreId: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!address) {
      const error = new Error("Wallet not connected")
      setError(error)
      if (onError) onError(error)
      throw error
    }

    if (!communeId) {
      const error = new Error("Commune ID not found")
      setError(error)
      if (onError) onError(error)
      throw error
    }

    setIsRemoving(true)
    setError(null)

    try {
      console.log("[remove-chore] Removing chore schedule:", choreId)

      // Encode the removeChore function call
      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "removeChore",
        args: [BigInt(communeId), BigInt(choreId)],
      })

      console.log("[remove-chore] Encoded transaction data:", data)

      // Send transaction with gas sponsorship
      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
          address: address as `0x${string}`,
        },
        {
          sponsor: true, // Enable gas sponsorship
        }
      )

      console.log("[remove-chore] Transaction successful")

      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("[remove-chore] Remove chore schedule error:", err)
      const error = err as Error
      setError(error)
      if (onError) onError(error)
      throw error
    } finally {
      setIsRemoving(false)
    }
  }

  return {
    removeChoreSchedule,
    isRemoving,
    error,
  }
}
