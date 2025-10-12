"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useMarkExpensePaid(communeId: string, onSuccess?: () => void) {
  const { address, isConnected } = useWallet()
  const { writeContractAsync } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [isMarking, setIsMarking] = useState(false)
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const markPaid = async (expenseId: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mark expense as paid",
        variant: "destructive",
      })
      return
    }

    setIsMarking(true)

    try {
      const hash = await writeContractAsync({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "markExpensePaid",
        args: [BigInt(communeId), BigInt(expenseId)],
      })

      setTxHash(hash)

      toast({
        title: "Expense marked as paid",
        description: "The expense has been marked as paid successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error marking expense as paid:", error)
      toast({
        title: "Failed to mark expense as paid",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsMarking(false)
    }
  }

  return {
    markPaid,
    isMarking: isMarking || isConfirming,
    isConfirmed,
    txHash,
  }
}
