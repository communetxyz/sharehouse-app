"use client"

import { truncateAddress, isValidAddress } from "@/lib/address-utils"

/**
 * Note: ENS is not available on Gnosis Chain
 * This hook has been simplified to just return truncated addresses
 * If cross-chain ENS resolution is needed in the future, consider using a service like ens.domains API
 */
export function useEnsNameOrAddress(address: string | undefined) {
  if (!address || !isValidAddress(address)) return ""

  // For now, just return truncated address since Gnosis doesn't have ENS
  // In the future, could check mainnet ENS if needed
  return truncateAddress(address)
}
