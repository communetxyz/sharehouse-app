"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { encodeFunctionData } from "viem"
import { useSendTransaction } from "@privy-io/react-auth"

export enum ChoreFrequency {
  DAILY = 1,
  WEEKLY = 7,
  MONTHLY = 30,
}

export interface ChoreScheduleInput {
  title: string
  description?: string
  frequency: ChoreFrequency
}

export interface OptimisticChoreSchedule extends ChoreScheduleInput {
  id: string
  status: "pending" | "confirmed" | "failed"
  error?: string
}

export function useCreateChoreSchedule(communeId: string) {
  const { address } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createChoreSchedule = async (
    input: ChoreScheduleInput,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!address) {
      const error = new Error("Account not connected")
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

    setIsCreating(true)
    setError(null)

    try {
      console.log("[create-chore] Creating chore schedule:", input)

      // Convert frequency to seconds (contract expects seconds)
      const frequencyInSeconds = BigInt(input.frequency * 24 * 60 * 60)

      // Get current timestamp for startTime
      const startTime = BigInt(Math.floor(Date.now() / 1000))

      // Encode the addChores function call
      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "addChores",
        args: [
          BigInt(communeId),
          [
            {
              id: BigInt(0), // ID is assigned by contract
              title: input.title,
              frequency: frequencyInSeconds,
              startTime: startTime,
              deleted: false, // New chores are not deleted
            },
          ],
        ],
      })

      console.log("[create-chore] Encoded transaction data:", data)

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

      console.log("[create-chore] Transaction successful")

      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("[create-chore] Create chore schedule error:", err)
      const error = err as Error
      setError(error)
      if (onError) onError(error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return {
    createChoreSchedule,
    isCreating,
    error,
  }
}
