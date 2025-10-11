"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChoreKanban } from "@/components/chore-kanban"
import { MemberList } from "@/components/member-list"
import { CommuneInfo } from "@/components/commune-info"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useCitizenWallet } from "@/hooks/use-citizen-wallet"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { address, isConnected } = useCitizenWallet()
  const { commune, members, chores, isLoading, error, refreshData } = useCommuneData()

  useEffect(() => {
    // Refresh data every 10 seconds
    const interval = setInterval(() => {
      refreshData()
    }, 10000)

    return () => clearInterval(interval)
  }, [refreshData])

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
        <header className="border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-serif">シェアハウス</div>
              <div className="text-xl font-sans tracking-wide">ShareHouse</div>
            </Link>
            <WalletConnectButton />
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">Connect Your Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">Please connect your Citizen Wallet to view your ShareHouse dashboard.</p>
              <WalletConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">Loading your ShareHouse...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-charcoal/70">{error}</p>
            <div className="flex gap-4">
              <Button onClick={refreshData} className="bg-sage hover:bg-sage/90 text-cream">
                Try Again
              </Button>
              <Link href="/join">
                <Button variant="outline" className="border-charcoal/20 bg-transparent">
                  Join a ShareHouse
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
      {/* Header */}
      <header className="border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-serif">シェアハウス</div>
            <div className="text-xl font-sans tracking-wide">ShareHouse</div>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              onClick={refreshData}
              variant="ghost"
              size="sm"
              className="text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
            >
              Refresh
            </Button>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">{commune?.name || "Your ShareHouse"}</h1>
          <p className="text-charcoal/70">Manage your shared responsibilities</p>
        </div>

        <Tabs defaultValue="chores" className="space-y-6">
          <TabsList className="bg-white/50 border border-charcoal/10">
            <TabsTrigger value="chores">Chores</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="chores" className="space-y-6">
            <ChoreKanban chores={chores} onRefresh={refreshData} />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MemberList members={members} />
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <CommuneInfo commune={commune} members={members} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
