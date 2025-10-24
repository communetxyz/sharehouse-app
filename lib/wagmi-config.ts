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
        wait: 250, // Batch calls within 250ms
      },
      retryCount: 3,
      retryDelay: 250, // Retry after 250ms
    }),
  },
  pollingInterval: 250, // Poll every 250ms to match Arbitrum block time (vs 4000ms default)
})
