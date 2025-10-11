"use client"

import { useState, useEffect } from "react"
import { generateCalldataLink, CommunityConfig } from "@citizenwallet/sdk"
import { ethers } from "ethers"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS, COMMUNITY_CONFIG } from "@/lib/contracts"

export function useCitizenWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if user is authenticated via URL params
    const params = new URLSearchParams(window.location.search)
    const walletAddress = params.get("walletAddress")

    if (walletAddress) {
      setAddress(walletAddress)
      setIsConnected(true)
      // Store in localStorage for persistence
      localStorage.setItem("walletAddress", walletAddress)
    } else {
      // Check localStorage
      const stored = localStorage.getItem("walletAddress")
      if (stored) {
        setAddress(stored)
        setIsConnected(true)
      }
    }
  }, [])

  const executeTransaction = async (functionName: string, args: any[], value: bigint = BigInt(0)) => {
    try {
      const iface = new ethers.Interface(COMMUNE_OS_ABI)
      const calldata = iface.encodeFunctionData(functionName, args)

      const communityConfig = new CommunityConfig(COMMUNITY_CONFIG)
      const walletAppUrl = "https://app.citizenwallet.xyz"

      const link = generateCalldataLink(walletAppUrl, communityConfig, COMMUNE_OS_ADDRESS, value, calldata)

      // Open Citizen Wallet with transaction
      window.location.href = link
    } catch (error: any) {
      throw new Error(error.message || "Transaction failed")
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
  }

  return {
    address,
    isConnected,
    executeTransaction,
    disconnect,
  }
}
