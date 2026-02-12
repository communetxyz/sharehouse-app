import type React from "react"
import type { Metadata } from "next"

// Force dynamic rendering — PrivyProvider needs a valid app ID at render time
export const dynamic = "force-dynamic"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Noto_Serif_JP } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Web3Provider } from "@/lib/web3-provider"
import { I18nProvider } from "@/lib/i18n/context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { ErrorBoundary } from "@/components/error-boundary"
import { NotificationProvider } from "@/lib/notifications/context"
import "./globals.css"

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-serif-jp",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ShareHouse - シェアハウス",
  description: "Harmonious communal living powered by blockchain",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${notoSerifJP.variable}`}>
        <ErrorBoundary>
          <I18nProvider>
            <NotificationProvider>
              <Web3Provider>
                <Suspense fallback={null}>{children}</Suspense>
                <Toaster />
                <Sonner />
              </Web3Provider>
            </NotificationProvider>
          </I18nProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
