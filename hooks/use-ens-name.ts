"use client"

import { useEnsName } from "wagmi"
import { mainnet } from "wagmi/chains"

export function useEnsNameOrAddress(address: string | undefined) {
  const { data: ensName, isLoading } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: !!address && address.startsWith("0x") && address.length === 42,
    },
  })

  if (!address) return ""

  // Show loading state while fetching ENS
  if (isLoading) return `${address.slice(0, 6)}...${address.slice(-4)}`

  // Return ENS name if available, otherwise return truncated address
  if (ensName) return ensName

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
