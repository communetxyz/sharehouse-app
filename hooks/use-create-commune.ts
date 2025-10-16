"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { encodeFunctionData } from "viem"
import { useSendTransaction } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export interface CreateCommuneInput {
  name: string
  username: string
  collateralRequired: boolean
  collateralAmount: string
}

export function useCreateCommune() {
  const { address } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCommune = async (input: CreateCommuneInput) => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Creating commune with data:", input)

      // Convert collateral amount to wei (assuming USD = 1e18 for simplicity)
      const collateralAmountWei = input.collateralRequired
        ? BigInt(Math.floor(Number.parseFloat(input.collateralAmount) * 1e18))
        : BigInt(0)

      // Encode the createCommune function call
      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "createCommune",
        args: [
          input.name,
          input.collateralRequired,
          collateralAmountWei,
          [], // Empty chore schedules array
          input.username,
        ],
      })

      console.log("[v0] Encoded transaction data:", data)

      // Send transaction with gas sponsorship
      // Note: sendTransaction resolves when transaction is submitted and confirmed on-chain
      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
          address: address as `0x${string}`,
        },
        {
          sponsor: true, // Enable gas sponsorship
        },
      )

      console.log("[v0] Transaction successful")

      toast({
        title: "Success",
        description: "Commune created successfully!",
      })

      // Redirect to dashboard after successful transaction
      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Create commune error:", err)
      const error = err as Error
      setError(error)
      toast({
        title: "Error",
        description: error.message || "Failed to create commune. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCommune,
    isLoading,
    error,
  }
}
