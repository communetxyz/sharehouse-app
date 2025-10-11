"use client"

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import { cookieStorage, createStorage } from "wagmi"
import { gnosis } from "wagmi/chains"

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "549077143e5bfa40a6c5f280e0b0d13e"

if (!projectId) throw new Error("Project ID is not defined")

const metadata = {
  name: "ShareHouse",
  description: "Japanese-themed platform for managing shared living spaces with rotating chores",
  url: typeof window !== "undefined" ? window.location.origin : "https://sharehouse.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
}

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: [gnosis],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})
