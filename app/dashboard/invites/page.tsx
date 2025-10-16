"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountButton } from "@/components/account-button"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useWallet } from "@/hooks/use-wallet"
import { useSignMessage, useWallets } from "@privy-io/react-auth"
import { Loader2, ArrowLeft, Copy, Check, Mail } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ethers } from "ethers"

interface Invite {
  communeId: string
  nonce: number
  signature: string
  url: string
  generatedAt: Date
}

export default function InviteGenerationPage() {
  const { t } = useI18n()
  const { address, isConnected, status } = useWallet()
  const { commune, isLoading: isLoadingCommune, error: communeError } = useCommuneData()
  const { wallets } = useWallets()
  const { signMessage } = useSignMessage()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const isOwner = commune && address && commune.creator.toLowerCase() === address.toLowerCase()

  const handleGenerateInvite = async () => {
    if (!commune || !address) {
      toast({
        title: t("invites.error"),
        description: t("invites.errorConnectWallet"),
        variant: "destructive",
      })
      return
    }

    if (!isOwner) {
      toast({
        title: t("invites.error"),
        description: t("invites.errorOwnerOnly"),
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Generate unique nonce
      const nonce = Math.floor(Math.random() * 1000000)

      // Create the message hash exactly as the smart contract does
      // messageHash = keccak256(abi.encodePacked(communeId, nonce))
      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [commune.id, nonce]
      )

      console.log("[Invite] Message hash:", messageHash)
      console.log("[Invite] Commune ID:", commune.id)
      console.log("[Invite] Nonce:", nonce)

      // Sign the message hash using Privy's useSignMessage hook
      // Privy will automatically convert to EIP-191 format (Ethereum Signed Message)
      const { signature } = await signMessage(
        { message: messageHash },
        {
          uiOptions: {
            title: "Sign Invite",
            description: `Sign this message to generate an invite link for ${commune.name}`,
          },
          address: wallets[0]?.address,
        }
      )

      console.log("[Invite] Signature received:", signature)

      // Wait a moment for the signature to fully process
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Construct invite URL
      const baseUrl = "https://www.share-house.fun"
      const inviteUrl = `${baseUrl}/join?communeId=${commune.id}&nonce=${nonce}&signature=${signature}`

      // Store invite data
      const newInvite: Invite = {
        communeId: commune.id,
        nonce,
        signature,
        url: inviteUrl,
        generatedAt: new Date(),
      }

      setInvite(newInvite)

      // Wait another moment before showing success
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: t("invites.success"),
        description: t("invites.successGenerated"),
      })
    } catch (error: any) {
      console.error("Failed to generate invite:", error)
      toast({
        title: t("invites.error"),
        description: error.message || t("invites.errorFailedToGenerate"),
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    if (!invite) return

    try {
      await navigator.clipboard.writeText(invite.url)
      setCopied(true)
      toast({
        title: t("invites.successCopied"),
        description: t("invites.successCopiedDesc"),
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: t("invites.error"),
        description: t("invites.errorCopyFailed"),
        variant: "destructive",
      })
    }
  }

  if (status === "reconnecting" || status === "connecting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">{t("dashboard.signingIn")}</p>
        </div>
      </div>
    )
  }

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
              <AccountButton />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("dashboard.signIn")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">{t("dashboard.signInDesc")}</p>
              <AccountButton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoadingCommune) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">{t("dashboard.loadingSharehouse")}</p>
        </div>
      </div>
    )
  }

  if (communeError || !commune) {
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
              <AccountButton />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("invites.notMember")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">
                {t("invites.notMemberDesc")}
              </p>
              <Link href="/join">
                <Button className="bg-sage hover:bg-sage/90 text-cream">
                  {t("home.joinSharehouse")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isOwner) {
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.back", "Back")}
                </Button>
              </Link>
              <AccountButton />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("invites.ownerOnly")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">
                {t("invites.ownerOnlyDesc")}
              </p>
              <Link href="/dashboard">
                <Button className="bg-sage hover:bg-sage/90 text-cream">
                  {t("invites.backToDashboard")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back", "Back")}
              </Button>
            </Link>
            <AccountButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">
            {t("invites.title")}
          </h1>
          <p className="text-lg text-charcoal/70">
            {t("invites.subtitle", { name: commune.name })}
          </p>
        </div>

        <Card className="border-charcoal/10 mb-6">
          <CardHeader>
            <CardTitle className="font-serif">{t("invites.generation")}</CardTitle>
            <CardDescription>
              {t("invites.generationDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!invite ? (
              <div className="text-center py-8 space-y-4">
                <Mail className="w-16 h-16 mx-auto text-sage/50" />
                <div>
                  <h3 className="text-lg font-medium text-charcoal mb-2">
                    {t("invites.notGenerated")}
                  </h3>
                  <p className="text-sm text-charcoal/60">
                    {t("invites.clickToGenerate")}
                  </p>
                </div>
                <Button
                  onClick={handleGenerateInvite}
                  disabled={isGenerating}
                  className="bg-sage hover:bg-sage/90 text-cream"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isGenerating ? t("invites.generating") : t("invites.generateLink")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-sage/10 border border-sage/20 space-y-4">
                  <h3 className="font-serif text-xl text-charcoal">{t("invites.details")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("invites.commune")}:</span>
                      <span className="font-medium text-charcoal">{commune.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("invites.communeId")}:</span>
                      <span className="font-medium text-charcoal">{invite.communeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("invites.nonce")}:</span>
                      <span className="font-medium text-charcoal">{invite.nonce}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("invites.generated")}:</span>
                      <span className="font-medium text-charcoal">
                        {invite.generatedAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">{t("invites.inviteLink")}:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={invite.url}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-white border border-charcoal/20 rounded-md text-charcoal/80 font-mono"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="border-sage text-sage hover:bg-sage/10"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {t("invites.copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          {t("invites.copy")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-charcoal/10">
                  <Button
                    onClick={handleGenerateInvite}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full border-charcoal/20"
                  >
                    {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t("invites.generateNew")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-charcoal/60 space-y-2">
          <p>
            {t("invites.securityNote")}
          </p>
          <p className="text-xs">
            {t("invites.expiryNote")}
          </p>
        </div>
      </main>
    </div>
  )
}
