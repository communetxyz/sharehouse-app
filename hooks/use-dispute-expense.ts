"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useDisputeExpense(communeId: string, onSuccess?: () => void) {
  const { address, isConnected } = useWallet()
  const { writeContractAsync } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [isDisputing, setIsDisputing] = useState(false)
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const disputeExpense = async (expenseId: string, newAssignee: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to dispute an expense",
        variant: "destructive",
      })
      return
    }

    setIsDisputing(true)

    try {
      const hash = await writeContractAsync({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "disputeExpense",
        args: [BigInt(communeId), BigInt(expenseId), newAssignee as `0x${string}`],
      })

      setTxHash(hash)

      toast({
        title: "Dispute initiated",
        description: "Your dispute has been submitted for voting",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error disputing expense:", error)
      toast({
        title: "Failed to dispute expense",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDisputing(false)
    }
  }

  return {
    disputeExpense,
    isDisputing: isDisputing || isConfirming,
    isConfirmed,
    txHash,
  }
}
