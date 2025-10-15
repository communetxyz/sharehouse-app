"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useCreateExpense(communeId: string, onSuccess?: () => void) {
  const { address, isConnected } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const createExpense = async (amount: string, description: string, dueDate: Date, assignedTo: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an expense",
        variant: "destructive",
      })
      return
    }

    // Call onSuccess IMMEDIATELY before any async operations
    if (onSuccess) {
      onSuccess()
    }

    setIsCreating(true)

    try {
      console.log("[v0] ===== CREATE EXPENSE START =====")
      console.log("[v0] Creating expense:", {
        amount,
        description,
        dueDate,
        assignedTo,
        communeId,
        contractAddress: COMMUNE_OS_ADDRESS,
      })

      const amountInWei = BigInt(Math.floor(Number.parseFloat(amount) * 1e18))
      const dueDateTimestamp = BigInt(Math.floor(dueDate.getTime() / 1000))

      console.log("[v0] Converted values:", {
        amountInWei: amountInWei.toString(),
        dueDateTimestamp: dueDateTimestamp.toString(),
      })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "createExpense",
        args: [BigInt(communeId), amountInWei, description, dueDateTimestamp, assignedTo as `0x${string}`],
      })

      console.log("[v0] Encoded data:", data)
      console.log("[v0] Calling sendTransaction with sponsor: true")

      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
        },
        {
          sponsor: true,
        },
      )

      console.log("[v0] ===== CREATE EXPENSE SUCCESS =====")

      toast({
        title: "Expense created",
        description: "Your expense has been created successfully",
      })
    } catch (error: any) {
      console.error("[v0] ===== CREATE EXPENSE FAILED =====")
      console.error("[v0] Error creating expense:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      })
      toast({
        title: "Failed to create expense",
        description: error.message || "An error occurred. Refreshing page...",
        variant: "destructive",
      })
      // Refresh page on error
      setTimeout(() => window.location.reload(), 2000)
    } finally {
      setIsCreating(false)
    }
  }

  return {
    createExpense,
    isCreating,
  }
}
