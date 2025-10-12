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
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useWallet } from "@/hooks/use-wallet"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { t } = useI18n()
  const { address, isConnected } = useWallet()
  const { commune, members, chores, isLoading, error, refreshData } = useCommuneData()

  useEffect(() => {
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
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <WalletConnectButton />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("dashboard.connectWallet")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">{t("dashboard.connectWalletDesc")}</p>
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
          <p className="text-charcoal/70">{t("dashboard.loadingSharehouse")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">{t("common.error")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-charcoal/70">{error}</p>
            <div className="flex gap-4">
              <Button onClick={refreshData} className="bg-sage hover:bg-sage/90 text-cream">
                {t("common.tryAgain")}
              </Button>
              <Link href="/join">
                <Button variant="outline" className="border-charcoal/20 bg-transparent">
                  {t("home.joinSharehouse")}
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
            <LanguageToggle />
            <Button
              onClick={refreshData}
              variant="ghost"
              size="sm"
              className="text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
            >
              {t("common.refresh")}
            </Button>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">
            {commune?.name || t("dashboard.title")}
          </h1>
          <p className="text-charcoal/70">{t("dashboard.subtitle")}</p>
        </div>

        <Tabs defaultValue="my-chores" className="space-y-6">
          <TabsList className="bg-white/50 border border-charcoal/10">
            <TabsTrigger value="my-chores">{t("dashboard.myChores")}</TabsTrigger>
            <TabsTrigger value="all-chores">{t("dashboard.allChores")}</TabsTrigger>
            <TabsTrigger value="members">{t("dashboard.members")}</TabsTrigger>
            <TabsTrigger value="info">{t("dashboard.info")}</TabsTrigger>
          </TabsList>

          <TabsContent value="my-chores" className="space-y-6">
            <ChoreKanban chores={chores} onRefresh={refreshData} filterMyChores />
          </TabsContent>

          <TabsContent value="all-chores" className="space-y-6">
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
