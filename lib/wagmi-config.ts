"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { sepolia } from "wagmi/chains"

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/Rr57Q41YGfkxYkx0kZp3EOQs86HatGGE", {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 15000,
    }),
  },
  pollingInterval: 4000,
})
