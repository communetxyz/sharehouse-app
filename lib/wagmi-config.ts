"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { arbitrum } from "wagmi/chains"

export const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL, {
      // Optimize polling for Arbitrum's 250ms block time
      batch: {
        wait: 100, // Batch calls within 100ms
      },
      retryCount: 3,
      retryDelay: 100, // Retry after 100ms
    }),
  },
  pollingInterval: 100, // Poll every 100ms for faster confirmations (vs 4000ms default)
})
