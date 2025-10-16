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

  // Check cache first
  useEffect(() => {
    if (address && ensCache.has(address)) {
      setCachedName(ensCache.get(address) || null)
    }
  }, [address])

  const { data: ensName, isError, error } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id, // Always check mainnet for ENS
    enabled: !!address && isValidAddress(address) && !ensCache.has(address), // Only query if not cached
  })

  useEffect(() => {
    if (address && ensName) {
      // Cache successful ENS lookups
      ensCache.set(address, ensName)
      setCachedName(ensName)
    }
  }, [address, ensName])

  if (!address || !isValidAddress(address)) return ""

  // Don't log errors for now to reduce console noise
  // The ENS gateway issue is known and doesn't affect functionality

  // Return cached name first, then ENS name, otherwise truncated address
  return cachedName || ensName || truncateAddress(address)
}
