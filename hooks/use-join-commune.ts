"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./use-wallet"
import { useReadContract } from "wagmi"
import {
  COMMUNE_OS_ABI,
  COMMUNE_OS_ADDRESS,
  BREAD_TOKEN_ADDRESS,
  ERC20_ABI,
  MEMBER_REGISTRY_ABI,
} from "@/lib/contracts"
import type { CommuneStatistics } from "@/types/commune"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

export function useJoinCommune() {
  const { address, executeTransaction, approveToken, isConfirming, isConfirmed } = useWallet()
  const [communeData, setCommuneData] = useState<CommuneStatistics | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [justApproved, setJustApproved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: collateralManagerAddress } = useReadContract({
    address: COMMUNE_OS_ADDRESS as `0x${string}`,
    abi: COMMUNE_OS_ABI,
    functionName: "collateralManager",
  })

  const shouldCheckAllowance = Boolean(address && communeData?.collateralRequired && collateralManagerAddress)

  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isCheckingAllowance,
  } = useReadContract({
    address: BREAD_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: shouldCheckAllowance ? [address!, collateralManagerAddress as `0x${string}`] : undefined,
    query: {
      enabled: shouldCheckAllowance,
    },
  })

  useEffect(() => {
    if (justApproved && isConfirmed && !isConfirming) {
      console.log("[v0] Approval confirmed, refetching allowance")
      // Wait for blockchain state to update
      setTimeout(() => {
        refetchAllowance()
        setJustApproved(false)
        setIsApproving(false)
      }, 2000) // Increased delay to 2 seconds
    }
  }, [isConfirmed, isConfirming, justApproved, refetchAllowance])

  const hasAllowance =
    communeData?.collateralRequired && allowance
      ? (allowance as bigint) >= BigInt(Math.floor(Number.parseFloat(communeData.collateralAmount) * 1e18))
      : !communeData?.collateralRequired

  const handleApproveToken = async () => {
    if (!communeData) {
      setError("Missing commune data")
      return
    }

    if (!collateralManagerAddress) {
      setError("Collateral manager address not available")
      return
    }

    setIsApproving(true)
    setJustApproved(false)
    setError(null)

    try {
      const amount = BigInt(Math.floor(Number.parseFloat(communeData.collateralAmount) * 1e18))
      console.log("[v0] Starting approval for amount:", amount.toString(), "to spender:", collateralManagerAddress)
      await approveToken(amount, collateralManagerAddress as `0x${string}`)
      setJustApproved(true)
    } catch (err: any) {
      console.error("[v0] Approval error:", err)
      setError(err.message || "Failed to approve token")
      setIsApproving(false)
      setJustApproved(false)
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

      const isUsed = await provider.readContract({
        address: memberRegistryAddress,
        abi: MEMBER_REGISTRY_ABI,
        functionName: "isNonceUsed",
        args: [BigInt(communeId), BigInt(nonce)],
      })

      if (isUsed) {
        throw new Error("This invite has already been used or expired")
      }

      const stats: any = await provider.readContract({
        address: COMMUNE_OS_ADDRESS as `0x${string}`,
        abi: COMMUNE_OS_ABI,
        functionName: "getCommuneStatistics",
        args: [BigInt(communeId)],
      })

      if (!stats || !Array.isArray(stats) || stats.length < 4) {
        throw new Error("Invalid data structure returned from contract")
      }

      const communeInfo = stats[0]
      const totalMembers = stats[1]
      const totalChores = stats[2]
      const totalTasks = stats[3]

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
        taskCount: totalTasks?.toString() || "0",
      })
    } catch (err: any) {
      console.error("[v0] Validation error:", err)
      setError(err.message || "Failed to validate invite")
      setCommuneData(null)
    } finally {
      setIsValidating(false)
    }
  }

  const joinCommune = async (communeId: string, nonce: string, signature: string, username: string) => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    if (!communeData) {
      setError("Please validate invite first")
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      console.log("[v0] Joining commune with params:", {
        communeId: BigInt(communeId),
        nonce: BigInt(nonce),
        signature,
        username,
      })

      // Call joinCommune with correct parameters: communeId, nonce, signature, username
      await executeTransaction("joinCommune", [BigInt(communeId), BigInt(nonce), signature, username])

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
    isApproving: isApproving || isConfirming,
    isCheckingAllowance,
    hasAllowance,
    error,
    validateInvite,
    joinCommune,
    approveToken: handleApproveToken,
  }
}
