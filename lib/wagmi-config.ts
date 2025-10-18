"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { gnosis, gnosisChiado, mainnet } from "wagmi/chains"

// Get RPC URLs from environment - these MUST be set in Vercel project settings
const gnosisRpc = process.env.NEXT_PUBLIC_GNOSIS_RPC_URL
const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC_URL

// Validate at runtime (client-side only)
if (typeof window !== "undefined") {
  if (!gnosisRpc) {
    console.error(
      "[wagmi-config] NEXT_PUBLIC_GNOSIS_RPC_URL is not set. Please add it to Vercel environment variables."
    )
  }
  if (!mainnetRpc) {
    console.error(
      "[wagmi-config] NEXT_PUBLIC_MAINNET_RPC_URL is not set. Please add it to Vercel environment variables."
    )
  }
  if (gnosisRpc && mainnetRpc) {
    console.log("[wagmi-config] Using RPC URLs from environment:", {
      gnosisRpc: gnosisRpc.substring(0, 50) + "...",
      mainnetRpc: mainnetRpc.substring(0, 50) + "...",
    })
  }
}

export const config = createConfig({
  chains: [gnosis, gnosisChiado, mainnet],
  transports: {
    [gnosis.id]: http(gnosisRpc),
    [gnosisChiado.id]: http(),
    [mainnet.id]: http(mainnetRpc),
  },
})
