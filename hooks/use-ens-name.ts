"use client"

import { useEnsName } from "wagmi"
import { mainnet } from "wagmi/chains"

export function useEnsNameOrAddress(address: string | undefined) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
  })

  if (!address) return ""

  // Return ENS name if available, otherwise return truncated address
  if (ensName) return ensName

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
