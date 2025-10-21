"use client"

import { useAccount, useDisconnect, useReadContract } from "wagmi"
import { useWallets, useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
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
  const { sendTransaction } = useSendTransaction()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const address = privyAddress || wagmiAddress
  const isConnected = !!privyAddress || wagmiAddress

  const { data: allowance } = useReadContract({
    address: BREAD_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, COLLATERAL_MANAGER_ADDRESS] : undefined,
  })

  const executeTransaction = async (functionName: string, args: any[]) => {
    if (!address) {
      throw new Error("Account not connected")
    }

    try {
      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName,
        args,
      })

      setIsConfirming(true)
      setIsConfirmed(false)

      const { hash } = await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
          address, // Specify which wallet to use for the transaction
        },
        {
          sponsor: true, // Enable gas sponsorship
        },
      )

      setTxHash(hash as `0x${string}`)
      setIsConfirming(false)
      setIsConfirmed(true)
      return hash as `0x${string}`
    } catch (error: any) {
      console.error("[v0] Transaction failed:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      })
      setIsConfirming(false)
      throw new Error(error.message || "Transaction failed")
    }
  }

  const approveToken = async (amount: bigint, spender: `0x${string}`) => {
    if (!address) {
      throw new Error("Account not connected")
    }

    try {
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amount],
      })

      setIsConfirming(true)
      setIsConfirmed(false)

      const result = await sendTransaction(
        {
          to: BREAD_TOKEN_ADDRESS as `0x${string}`,
          data,
          address, // Specify which wallet to use for the transaction
        },
        {
          sponsor: true, // Enable gas sponsorship
        },
      )

      setTxHash(result.hash as `0x${string}`)
      setIsConfirming(false)
      setIsConfirmed(true)
      return result.hash as `0x${string}`
    } catch (error: any) {
      console.error("[v0] ===== APPROVE TOKEN FAILED =====")
      console.error("[v0] Approval error:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack,
      })
      setIsConfirming(false)
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
