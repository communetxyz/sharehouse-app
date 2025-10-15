"use client"

import { useEnsName } from "wagmi"
import { mainnet } from "wagmi/chains"
import { truncateAddress, isValidAddress } from "@/lib/address-utils"

/**
 * Resolves ENS name from mainnet or returns truncated address
 * Since Gnosis doesn't have ENS, we check mainnet for ENS names
 */
export function useEnsNameOrAddress(address: string | undefined) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id, // Always check mainnet for ENS
  })

  if (!address || !isValidAddress(address)) return ""

  // Return ENS name if available, otherwise truncated address
  return ensName || truncateAddress(address)
}
