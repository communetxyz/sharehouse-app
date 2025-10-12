"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { gnosis, mainnet } from "wagmi/chains"

export const config = createConfig({
  chains: [gnosis, mainnet],
  transports: {
    [gnosis.id]: http(),
    [mainnet.id]: http(),
  },
})
