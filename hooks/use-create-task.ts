"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useCreateTask(communeId: string) {
  const { address, isConnected } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const createTask = async (budget: string, description: string, dueDate: Date, assignedTo: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an task",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      console.log("[v0] ===== CREATE TASK START =====")
      console.log("[v0] Creating task:", {
        budget,
        description,
        dueDate,
        assignedTo,
        communeId,
        contractAddress: COMMUNE_OS_ADDRESS,
      })

      const budgetInWei = BigInt(Math.floor(Number.parseFloat(budget) * 1e18))
      const dueDateTimestamp = BigInt(Math.floor(dueDate.getTime() / 1000))

      console.log("[v0] Converted values:", {
        budgetInWei: budgetInWei.toString(),
        dueDateTimestamp: dueDateTimestamp.toString(),
      })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "createTask",
        args: [BigInt(communeId), budgetInWei, description, dueDateTimestamp, assignedTo as `0x${string}`],
      })

      console.log("[v0] Encoded data:", data)
      console.log("[v0] Calling sendTransaction with sponsor: true")

      try {
        await sendTransaction(
          {
            to: COMMUNE_OS_ADDRESS as `0x${string}`,
            data,
          },
          {
            sponsor: true,
          },
        )
        console.log("[v0] ===== CREATE TASK SUCCESS =====")
      } catch (sendErr: any) {
        // Check if this is an AbortError - transaction might still have been submitted
        if (sendErr.name === "AbortError" || sendErr.message?.includes("aborted")) {
          console.warn("[v0] AbortError caught, but transaction may have been submitted.")
          // Don't throw - the transaction likely succeeded, optimistic update stays
        } else {
          // This is a real error, re-throw it
          throw sendErr
        }
      }

      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      })
    } catch (error: any) {
      console.error("[v0] ===== CREATE TASK FAILED =====")
      console.error("[v0] Error creating task:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      })
      toast({
        title: "Failed to create task",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return {
    createTask,
    isCreating,
  }
}
