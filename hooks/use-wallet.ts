"use client"

import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useState } from "react"

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { writeContractAsync } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const executeTransaction = async (functionName: string, args: any[]) => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    try {
      console.log("[v0] Executing transaction:", { functionName, args })

      const hash = await writeContractAsync({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName,
        args,
      })

      console.log("[v0] Transaction submitted:", hash)
      setTxHash(hash)
      return hash
    } catch (error: any) {
      console.error("[v0] Transaction failed:", error)
      throw new Error(error.message || "Transaction failed")
    }
  }

  return {
    address,
    isConnected,
    disconnect,
    executeTransaction,
    isConfirming,
    isConfirmed,
    txHash,
  }
}
