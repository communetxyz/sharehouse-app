"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useReadContract } from "wagmi"
import {
  COMMUNE_OS_ABI,
  COMMUNE_OS_ADDRESS,
  BREAD_TOKEN_ADDRESS,
  COLLATERAL_MANAGER_ADDRESS,
  ERC20_ABI,
} from "@/lib/contracts"
import type { CommuneStatistics } from "@/types/commune"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

export function useJoinCommune() {
  const { address, executeTransaction, approveToken, isConfirming } = useWallet()
  const [communeData, setCommuneData] = useState<CommuneStatistics | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: BREAD_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && communeData ? [address, COLLATERAL_MANAGER_ADDRESS as `0x${string}`] : undefined,
  })

  const hasAllowance =
    communeData && allowance
      ? (allowance as bigint) >= BigInt(Math.floor(Number.parseFloat(communeData.collateralAmount) * 1e18))
      : false

  const handleApproveToken = async () => {
    if (!communeData) {
      setError("Missing commune data")
      return
    }

    setIsApproving(true)
    setError(null)

    try {
      const amount = BigInt(Math.floor(Number.parseFloat(communeData.collateralAmount) * 1e18))
      await approveToken(amount)

      // Wait a bit for the transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Refetch allowance
      await refetchAllowance()
    } catch (err: any) {
      setError(err.message || "Failed to approve token")
    } finally {
      setIsApproving(false)
    }
  }

  const validateInvite = async (communeId: string, nonce: string, signature: string) => {
    setIsValidating(true)
    setError(null)

    try {
      const provider = createPublicClient({
        chain: mainnet,
        transport: http("https://gnosis-mainnet.g.alchemy.com/v2/Rr57Q41YGfkxYkx0kZp3EOQs86HatGGE"),
      })

      // Check if nonce is used
      const isUsed = await provider.readContract({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "isNonceUsed",
        args: [BigInt(communeId), BigInt(nonce)],
      })

      if (isUsed) {
        throw new Error("This invite has already been used or expired")
      }

      // Fetch commune statistics
      const stats: any = await provider.readContract({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "getCommuneStatistics",
        args: [BigInt(communeId)],
      })

      setCommuneData({
        id: stats.commune.id.toString(),
        name: stats.commune.name,
        creator: stats.commune.creator,
        collateralRequired: stats.commune.collateralRequired,
        collateralAmount: (Number(stats.commune.collateralAmount) / 1e18).toString(),
        memberCount: stats.memberCount.toString(),
        choreCount: stats.choreCount.toString(),
        expenseCount: stats.expenseCount.toString(),
      })
    } catch (err: any) {
      setError(err.message || "Failed to validate invite")
      setCommuneData(null)
    } finally {
      setIsValidating(false)
    }
  }

  const joinCommune = async (communeId: string, nonce: string, signature: string) => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      await executeTransaction("joinCommune", [BigInt(communeId), BigInt(nonce), signature])

      // Wait for confirmation
      await new Promise((resolve) => {
        const checkConfirmation = setInterval(() => {
          if (!isConfirming) {
            clearInterval(checkConfirmation)
            resolve(true)
          }
        }, 500)
      })

      // Redirect to dashboard after successful join
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message || "Failed to join commune")
    } finally {
      setIsJoining(false)
    }
  }

  return {
    communeData,
    isValidating,
    isJoining,
    isApproving,
    hasAllowance,
    error,
    validateInvite,
    joinCommune,
    approveToken: handleApproveToken,
  }
}
