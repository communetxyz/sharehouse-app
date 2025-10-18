"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { gnosis, gnosisChiado, mainnet } from "wagmi/chains"

// Enforce environment variables - no fallbacks
if (!process.env.NEXT_PUBLIC_GNOSIS_RPC_URL) {
  throw new Error(
    "NEXT_PUBLIC_GNOSIS_RPC_URL environment variable is required but not set. Please add it to your .env.local file."
  )
}

if (!process.env.NEXT_PUBLIC_MAINNET_RPC_URL) {
  throw new Error(
    "NEXT_PUBLIC_MAINNET_RPC_URL environment variable is required but not set. Please add it to your .env.local file."
  )
}

const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC_URL
const gnosisRpc = process.env.NEXT_PUBLIC_GNOSIS_RPC_URL

// Debug logging to verify RPC URL configuration
if (typeof window !== "undefined") {
  console.log("[wagmi-config] Using RPC URLs from environment:", {
    gnosisRpc,
    mainnetRpc,
  })
}

export const config = createConfig({
  chains: [gnosis, gnosisChiado, mainnet],
  transports: {
    [gnosis.id]: http(gnosisRpc),
    [gnosisChiado.id]: http(),
    [mainnet.id]: http(mainnetRpc),
  },
})
