"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useCreateExpense(communeId: string, onSuccess?: () => void) {
  const { address, isConnected } = useWallet()
  const { writeContractAsync } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const createExpense = async (amount: string, description: string, dueDate: Date, assignedTo: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an expense",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const amountInWei = BigInt(Math.floor(Number.parseFloat(amount) * 1e18))
      const dueDateTimestamp = BigInt(Math.floor(dueDate.getTime() / 1000))

      const hash = await writeContractAsync({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "createExpense",
        args: [BigInt(communeId), amountInWei, description, dueDateTimestamp, assignedTo as `0x${string}`],
      })

      setTxHash(hash)

      toast({
        title: "Expense created",
        description: "Your expense has been created successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error creating expense:", error)
      toast({
        title: "Failed to create expense",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return {
    createExpense,
    isCreating: isCreating || isConfirming,
    isConfirmed,
    txHash,
  }
}
