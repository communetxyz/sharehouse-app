"use client"

import { useEnsName } from "wagmi"
import { mainnet } from "wagmi/chains"
import { truncateAddress, isValidAddress } from "@/lib/address-utils"
import { useState, useEffect } from "react"

// Simple in-memory cache for ENS names
const ensCache = new Map<string, string>()

/**
 * Resolves ENS name from mainnet or returns truncated address
 * Since Gnosis doesn't have ENS, we check mainnet for ENS names
 */
export function useEnsNameOrAddress(address: string | undefined) {
  const [cachedName, setCachedName] = useState<string | null>(null)

  const { data: ensName, isError, error } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id, // Always check mainnet for ENS
  })

  useEffect(() => {
    if (address && ensName) {
      // Cache successful ENS lookups
      ensCache.set(address, ensName)
    } else if (address && ensCache.has(address)) {
      // Use cached value if available
      setCachedName(ensCache.get(address) || null)
    }
  }, [address, ensName])

  if (!address || !isValidAddress(address)) return ""

  // Log errors for debugging but don't break the UI
  if (isError && error) {
    console.warn(`ENS lookup failed for ${address}:`, error)
  }

  // Return ENS name if available, otherwise cached name, otherwise truncated address
  return ensName || cachedName || truncateAddress(address)
}
