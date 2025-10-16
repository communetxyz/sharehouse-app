"use client"

import { useEnsName } from "wagmi"
import { mainnet } from "wagmi/chains"
import { truncateAddress, isValidAddress } from "@/lib/address-utils"
import { useState, useEffect } from "react"

// Simple in-memory cache for ENS names
// Use null to indicate "no ENS name found" (cache the failure)
const ensCache = new Map<string, string | null>()

/**
 * Resolves ENS name from mainnet or returns truncated address
 * Since Gnosis doesn't have ENS, we check mainnet for ENS names
 */
export function useEnsNameOrAddress(address: string | undefined) {
  const [cachedName, setCachedName] = useState<string | null>(null)

  // Check cache first
  useEffect(() => {
    if (address && ensCache.has(address)) {
      const cached = ensCache.get(address)
      setCachedName(cached)
    }
  }, [address])

  // Only query if address is valid and not in cache (including failed lookups)
  const enabled = !!address && isValidAddress(address) && !ensCache.has(address)

  const { data: ensName, isError, error, isFetching } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id, // Always check mainnet for ENS
    enabled, // Only query if not cached
  })

  // Cache successful ENS lookups
  useEffect(() => {
    if (address && ensName) {
      ensCache.set(address, ensName)
      setCachedName(ensName)
    }
  }, [address, ensName])

  // Cache failures to prevent retry loops
  useEffect(() => {
    if (address && isError && !isFetching && !ensCache.has(address)) {
      // Cache null to indicate "no ENS name" so we don't keep retrying
      ensCache.set(address, null)
      setCachedName(null)
    }
  }, [address, isError, isFetching])

  if (!address || !isValidAddress(address)) {
    return ""
  }

  // If we have a cached ENS name, use it. Otherwise use truncated address.
  return cachedName || ensName || truncateAddress(address)
}
