"use client"

import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { useWallets } from "@privy-io/react-auth"
import {
  COMMUNE_OS_ABI,
  COMMUNE_OS_ADDRESS,
  ERC20_ABI,
  BREAD_TOKEN_ADDRESS,
  COLLATERAL_MANAGER_ADDRESS,
} from "@/lib/contracts"
import { useState } from "react"

export function useWallet() {
  const { wallets } = useWallets()
  const privyAddress = wallets[0]?.address as `0x${string}` | undefined

  const { address: wagmiAddress, isConnected: wagmiConnected, status } = useAccount()
  const { disconnect } = useDisconnect()
  const { writeContractAsync } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const address = privyAddress || wagmiAddress
  const isConnected = !!privyAddress || wagmiConnected

  const { data: allowance } = useReadContract({
    address: BREAD_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, COLLATERAL_MANAGER_ADDRESS] : undefined,
  })

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

  const approveToken = async (amount: bigint, spender: `0x${string}`) => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    try {
      console.log("[v0] Approving token:", { amount: amount.toString(), spender })

      const hash = await writeContractAsync({
        address: BREAD_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amount],
      })

      console.log("[v0] Approval transaction submitted:", hash)
      setTxHash(hash)
      return hash
    } catch (error: any) {
      console.error("[v0] Approval failed:", error)
      throw new Error(error.message || "Token approval failed")
    }
  }

  const checkAllowance = async () => {
    if (!address) return BigInt(0)

    try {
      return allowance as bigint
    } catch (error) {
      console.error("[v0] Failed to check allowance:", error)
      return BigInt(0)
    }
  }

  return {
    address,
    isConnected,
    status,
    disconnect,
    executeTransaction,
    approveToken,
    checkAllowance,
    isConfirming,
    isConfirmed,
    txHash,
  }
}
