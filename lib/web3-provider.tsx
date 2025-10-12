"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"
import { config } from "./wagmi-config"

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

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
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        supportedChains: ["base-sepolia", "base"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
