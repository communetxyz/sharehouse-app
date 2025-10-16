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

  console.log('[ENS] Hook called with address:', address)
  console.log('[ENS] Address valid?', address ? isValidAddress(address) : 'no address')
  console.log('[ENS] Cache has address?', address ? ensCache.has(address) : 'no address')

  // Check cache first
  useEffect(() => {
    if (address && ensCache.has(address)) {
      const cached = ensCache.get(address) || null
      console.log('[ENS] Using cached value for', address, ':', cached)
      setCachedName(cached)
    }
  }, [address])

  const enabled = !!address && isValidAddress(address) && !ensCache.has(address)
  console.log('[ENS] Query enabled?', enabled)

  const { data: ensName, isError, error, isFetching, isLoading } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id, // Always check mainnet for ENS
    enabled, // Only query if not cached
  })

  console.log('[ENS] Query state:', { ensName, isError, isFetching, isLoading })

  useEffect(() => {
    if (address && ensName) {
      console.log('[ENS] Caching successful lookup for', address, ':', ensName)
      // Cache successful ENS lookups
      ensCache.set(address, ensName)
      setCachedName(ensName)
    }
  }, [address, ensName])

  useEffect(() => {
    if (isError && error) {
      console.error('[ENS] Lookup error for', address, ':', error)
    }
  }, [isError, error, address])

  if (!address || !isValidAddress(address)) {
    console.log('[ENS] Returning empty - invalid address')
    return ""
  }

  const result = cachedName || ensName || truncateAddress(address)
  console.log('[ENS] Returning:', result, 'for', address)

  return result
}
