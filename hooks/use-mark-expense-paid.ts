"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useMarkExpensePaid(communeId: string, onSuccess?: () => void) {
  const { address, isConnected } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isMarking, setIsMarking] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { toast } = useToast()

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
    setIsConfirmed(false)

    try {
      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "markExpensePaid",
        args: [BigInt(communeId), BigInt(expenseId)],
      })

      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
        },
        {
          sponsor: true, // Enable gas sponsorship
        },
      )

      setIsConfirmed(true)

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
    isMarking,
    isConfirmed,
  }
}
