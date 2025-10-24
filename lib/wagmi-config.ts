"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { arbitrum } from "wagmi/chains"

export const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
  },
})
