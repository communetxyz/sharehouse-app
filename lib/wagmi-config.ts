"use client"

import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { gnosis, gnosisChiado, mainnet } from "wagmi/chains"

export const config = createConfig({
  chains: [gnosis, gnosisChiado, mainnet],
  transports: {
    [gnosis.id]: http("https://gnosis-mainnet.g.alchemy.com/v2/Rr57Q41YGfkxYkx0kZp3EOQs86HatGGE"),
    [gnosisChiado.id]: http(),
    [mainnet.id]: http(),
  },
})
