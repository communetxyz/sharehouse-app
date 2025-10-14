"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { gnosis, gnosisChiado, mainnet } from "wagmi/chains"

export const config = createConfig({
  chains: [gnosis, gnosisChiado, mainnet],
  transports: {
    [gnosis.id]: http(process.env.NEXT_PUBLIC_GNOSIS_RPC_URL),
    [gnosisChiado.id]: http(),
    [mainnet.id]: http(),
  },
})
