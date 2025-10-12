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
  MEMBER_REGISTRY_ABI,
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

  const shouldCheckAllowance = Boolean(address && communeData?.collateralRequired)

  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isCheckingAllowance,
  } = useReadContract({
    address: BREAD_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: shouldCheckAllowance ? [address!, COLLATERAL_MANAGER_ADDRESS as `0x${string}`] : undefined,
    query: {
      enabled: shouldCheckAllowance, // Only run query when we have the required data
    },
  })

  const hasAllowance =
    communeData?.collateralRequired && allowance
      ? (allowance as bigint) >= BigInt(Math.floor(Number.parseFloat(communeData.collateralAmount) * 1e18))
      : !communeData?.collateralRequired // If no collateral required, consider it as "has allowance"

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

      const memberRegistryAddress = (await provider.readContract({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "memberRegistry",
      })) as `0x${string}`

      console.log("[v0] Member registry address:", memberRegistryAddress)

      const isUsed = await provider.readContract({
        address: memberRegistryAddress,
        abi: MEMBER_REGISTRY_ABI,
        functionName: "isNonceUsed",
        args: [BigInt(communeId), BigInt(nonce)],
      })

      console.log("[v0] Is nonce used:", isUsed)

      if (isUsed) {
        throw new Error("This invite has already been used or expired")
      }

      const stats: any = await provider.readContract({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "getCommuneStatistics",
        args: [BigInt(communeId)],
      })

      console.log("[v0] Raw commune stats from contract:", stats)
      console.log("[v0] Stats is array:", Array.isArray(stats))
      console.log("[v0] Stats length:", stats?.length)

      if (!stats || !Array.isArray(stats) || stats.length < 4) {
        throw new Error("Invalid data structure returned from contract")
      }

      console.log("[v0] stats[0] (commune):", stats[0])
      console.log("[v0] stats[1] (totalMembers):", stats[1])
      console.log("[v0] stats[2] (totalChores):", stats[2])
      console.log("[v0] stats[3] (activeChores):", stats[3])

      const communeInfo = stats[0]
      const totalMembers = stats[1]
      const totalChores = stats[2]
      const activeChores = stats[3]

      console.log("[v0] communeInfo type:", typeof communeInfo)
      console.log("[v0] communeInfo keys:", communeInfo ? Object.keys(communeInfo) : "null")
      console.log("[v0] communeInfo.name:", communeInfo?.name)

      if (!communeInfo || typeof communeInfo !== "object") {
        throw new Error("Commune info is not an object")
      }

      setCommuneData({
        id: communeInfo.id?.toString() || communeId,
        name: communeInfo.name || "Unknown Commune",
        creator: communeInfo.creator || "0x0",
        collateralRequired: communeInfo.collateralRequired || false,
        collateralAmount: communeInfo.collateralAmount ? (Number(communeInfo.collateralAmount) / 1e18).toString() : "0",
        memberCount: totalMembers?.toString() || "0",
        choreCount: totalChores?.toString() || "0",
        expenseCount: activeChores?.toString() || "0",
      })

      console.log("[v0] Successfully set commune data")
    } catch (err: any) {
      console.error("[v0] Validation error:", err)
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
    isCheckingAllowance, // Export isCheckingAllowance state
    hasAllowance,
    error,
    validateInvite,
    joinCommune,
    approveToken: handleApproveToken,
  }
}
