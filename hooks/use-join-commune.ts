"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { communeOSContract } from "@/lib/contracts"
import type { CommuneStatistics } from "@/types/commune"

export function useJoinCommune() {
  const { address, executeTransaction, approveToken, isConfirming } = useWallet()
  const [communeData, setCommuneData] = useState<CommuneStatistics | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateInvite = async (communeId: string, nonce: string, signature: string) => {
    setIsValidating(true)
    setError(null)

    try {
      // Check if nonce is used
      const isUsed = await communeOSContract.isNonceUsed(BigInt(communeId), BigInt(nonce))

      if (isUsed) {
        throw new Error("This invite has already been used or expired")
      }

      // Fetch commune statistics
      const stats = await communeOSContract.getCommuneStatistics(BigInt(communeId))

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

      setIsApproved(false)
    } catch (err: any) {
      setError(err.message || "Failed to validate invite")
      setCommuneData(null)
    } finally {
      setIsValidating(false)
    }
  }

  const approveCollateral = async () => {
    if (!address || !communeData) {
      setError("Missing required data")
      return
    }

    if (!communeData.collateralRequired) {
      setIsApproved(true)
      return
    }

    setIsApproving(true)
    setError(null)

    try {
      const collateralAmount = BigInt(Math.floor(Number.parseFloat(communeData.collateralAmount) * 1e18))
      await approveToken(collateralAmount)

      // Wait for confirmation
      await new Promise((resolve) => {
        const checkConfirmation = setInterval(() => {
          if (!isConfirming) {
            clearInterval(checkConfirmation)
            resolve(true)
          }
        }, 500)
      })

      setIsApproved(true)
    } catch (err: any) {
      setError(err.message || "Failed to approve collateral")
    } finally {
      setIsApproving(false)
    }
  }

  const joinCommune = async (communeId: string, nonce: string, signature: string) => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    if (communeData?.collateralRequired && !isApproved) {
      setError("Please approve collateral first")
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
    isApproving,
    isApproved,
    isJoining,
    error,
    validateInvite,
    approveCollateral,
    joinCommune,
  }
}
