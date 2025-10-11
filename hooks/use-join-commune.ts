"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./use-wallet"
import { communeOSContract, BREAD_TOKEN_ADDRESS, COLLATERAL_MANAGER_ADDRESS, ERC20_ABI } from "@/lib/contracts"
import type { CommuneStatistics } from "@/types/commune"
import { ethers } from "ethers"

export function useJoinCommune() {
  const { address, executeTransaction, isConfirming } = useWallet()
  const [communeData, setCommuneData] = useState<CommuneStatistics | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false)
  const [hasAllowance, setHasAllowance] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (communeData && address && communeData.collateralRequired) {
      checkAllowance()
    }
  }, [communeData, address])

  const checkAllowance = async () => {
    if (!address || !communeData) return

    setIsCheckingAllowance(true)
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://gnosis-mainnet.g.alchemy.com/v2/Rr57Q41YGfkxYkx0kZp3EOQs86HatGGE",
      )
      const breadToken = new ethers.Contract(BREAD_TOKEN_ADDRESS, ERC20_ABI, provider)

      const allowance = await breadToken.allowance(address, COLLATERAL_MANAGER_ADDRESS)
      const requiredAmount = ethers.parseEther(communeData.collateralAmount)

      setHasAllowance(allowance >= requiredAmount)
    } catch (err) {
      console.error("Failed to check allowance:", err)
      setHasAllowance(false)
    } finally {
      setIsCheckingAllowance(false)
    }
  }

  const approveToken = async (amount: ethers.BigNumber) => {
    if (!address || !communeData) {
      setError("Missing required data")
      return
    }

    setIsApproving(true)
    setError(null)

    try {
      const provider = new ethers.JsonRpcProvider(
        "https://gnosis-mainnet.g.alchemy.com/v2/Rr57Q41YGfkxYkx0kZp3EOQs86HatGGE",
      )
      const signer = provider.getSigner()
      const breadToken = new ethers.Contract(BREAD_TOKEN_ADDRESS, ERC20_ABI, signer)

      await breadToken.approve(COLLATERAL_MANAGER_ADDRESS, amount)

      // Wait for confirmation
      await new Promise((resolve) => {
        const checkConfirmation = setInterval(() => {
          if (!isConfirming) {
            clearInterval(checkConfirmation)
            resolve(true)
          }
        }, 500)
      })

      // Recheck allowance after approval
      await checkAllowance()
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
    isCheckingAllowance,
    hasAllowance,
    error,
    validateInvite,
    joinCommune,
    approveToken,
  }
}
