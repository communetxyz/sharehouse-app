"use client"

import { useState, useEffect } from "react"
import { generateCalldataLink, CommunityConfig } from "@citizenwallet/sdk"
import { ethers } from "ethers"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import CommunityJson from "@/community.json"

export function useCitizenWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [authUrl, setAuthUrl] = useState<string>("")

  useEffect(() => {
    // Generate authentication URL
    const returnUrl = typeof window !== "undefined" ? window.location.origin : ""
    const callbackUrl = `${returnUrl}/cw`
    const walletAppUrl = "https://app.citizenwallet.xyz"

    // Create auth URL with sigAuth parameters
    const url = `${walletAppUrl}?sigAuthRedirect=${encodeURIComponent(callbackUrl)}`
    setAuthUrl(url)

    // Check if user is authenticated via URL params
    const params = new URLSearchParams(window.location.search)
    const cwAddress = params.get("cwAddress")

    if (cwAddress) {
      console.log("[v0] Citizen Wallet authenticated:", cwAddress)
      setAddress(cwAddress)
      setIsConnected(true)
      // Store in localStorage for persistence
      localStorage.setItem("cwAddress", cwAddress)

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    } else {
      // Check localStorage
      const stored = localStorage.getItem("cwAddress")
      if (stored) {
        console.log("[v0] Restored address from localStorage:", stored)
        setAddress(stored)
        setIsConnected(true)
      }
    }
  }, [])

  const executeTransaction = async (functionName: string, args: any[], value: bigint = BigInt(0)) => {
    try {
      const iface = new ethers.Interface(COMMUNE_OS_ABI)
      const calldata = iface.encodeFunctionData(functionName, args)

      const communityConfig = new CommunityConfig(CommunityJson)
      const walletAppUrl = "https://app.citizenwallet.xyz"

      const link = generateCalldataLink(walletAppUrl, communityConfig, COMMUNE_OS_ADDRESS, value, calldata)

      console.log("[v0] Opening Citizen Wallet with transaction:", { functionName, args })

      // Open Citizen Wallet with transaction
      window.location.href = link
    } catch (error: any) {
      console.error("[v0] Transaction generation failed:", error)
      throw new Error(error.message || "Transaction failed")
    }
  }

  const disconnect = () => {
    console.log("[v0] Disconnecting wallet")
    setAddress(null)
    setIsConnected(false)
    localStorage.removeItem("cwAddress")
  }

  return {
    address,
    isConnected,
    authUrl,
    executeTransaction,
    disconnect,
  }
}
