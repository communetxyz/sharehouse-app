"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { gnosis, gnosisChiado, mainnet } from "wagmi/chains"

const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://cloudflare-eth.com"

console.log('[WAGMI CONFIG] Mainnet RPC URL:', mainnetRpc)
console.log('[WAGMI CONFIG] Gnosis RPC URL:', process.env.NEXT_PUBLIC_GNOSIS_RPC_URL)
console.log('[WAGMI CONFIG] Chains configured:', [gnosis.id, gnosisChiado.id, mainnet.id])

export const config = createConfig({
  chains: [gnosis, gnosisChiado, mainnet],
  transports: {
    [gnosis.id]: http(process.env.NEXT_PUBLIC_GNOSIS_RPC_URL),
    [gnosisChiado.id]: http(),
    [mainnet.id]: http(mainnetRpc),
  },
})

console.log('[WAGMI CONFIG] Config created successfully')
