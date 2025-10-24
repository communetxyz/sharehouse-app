"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { arbitrum } from "wagmi/chains"
import { config } from "./wagmi-config"

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: [
          "email",
          "wallet",
          "google",
          "twitter",
          "discord",
          "github",
          "linkedin",
          "apple",
          "farcaster",
          "telegram",
          "sms",
        ],
        appearance: {
          theme: "light",
          accentColor: "#8B7355",
          logo: "https://avatars.githubusercontent.com/u/37784886",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          showWalletUIs: false,
        },
        externalWallets: {
          showWalletUIs: false,
        },
        supportedChains: [arbitrum],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
