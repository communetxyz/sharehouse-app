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
import { usePrivy } from "@privy-io/react-auth"
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
  const { signMessage } = usePrivy()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const isOwner = commune && address && commune.creator.toLowerCase() === address.toLowerCase()

  const handleGenerateInvite = async () => {
    if (!commune || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet and join a commune first",
        variant: "destructive",
      })
      return
    }

    if (!isOwner) {
      toast({
        title: "Error",
        description: "You must be a commune owner to generate invites",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Generate unique nonce
      const nonce = Math.floor(Math.random() * 1000000)

      // Create message to sign (matching smart contract validation)
      // The message format should match what the smart contract expects
      const message = `Join Commune ${commune.id} with nonce ${nonce}`

      // Request signature from wallet using Privy's signMessage
      // signMessage returns a promise that resolves to the signature string
      const signature = await signMessage(message)

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

      toast({
        title: "Success",
        description: "Invite link generated successfully!",
      })
    } catch (error: any) {
      console.error("Failed to generate invite:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate invite link",
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
        title: "Copied!",
        description: "Invite link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
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
              <CardTitle className="font-serif text-charcoal">Not a Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">
                You must be a member of a commune to access this page.
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
              <CardTitle className="font-serif text-charcoal">Owner Only</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-charcoal/70">
                You must be a commune owner to generate invites.
              </p>
              <Link href="/dashboard">
                <Button className="bg-sage hover:bg-sage/90 text-cream">
                  Back to Dashboard
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
            Generate Invite Link
          </h1>
          <p className="text-lg text-charcoal/70">
            Create a secure invite link for new members to join {commune.name}
          </p>
        </div>

        <Card className="border-charcoal/10 mb-6">
          <CardHeader>
            <CardTitle className="font-serif">Invite Generation</CardTitle>
            <CardDescription>
              Generate an invite link to share with prospective members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!invite ? (
              <div className="text-center py-8 space-y-4">
                <Mail className="w-16 h-16 mx-auto text-sage/50" />
                <div>
                  <h3 className="text-lg font-medium text-charcoal mb-2">
                    No Invite Generated Yet
                  </h3>
                  <p className="text-sm text-charcoal/60">
                    Click the button below to generate a new invite link
                  </p>
                </div>
                <Button
                  onClick={handleGenerateInvite}
                  disabled={isGenerating}
                  className="bg-sage hover:bg-sage/90 text-cream"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isGenerating ? "Generating..." : "Generate Invite Link"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-sage/10 border border-sage/20 space-y-4">
                  <h3 className="font-serif text-xl text-charcoal">Invite Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Commune:</span>
                      <span className="font-medium text-charcoal">{commune.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Commune ID:</span>
                      <span className="font-medium text-charcoal">{invite.communeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Nonce:</span>
                      <span className="font-medium text-charcoal">{invite.nonce}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Generated:</span>
                      <span className="font-medium text-charcoal">
                        {invite.generatedAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Invite Link:</label>
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
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
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
                    Generate New Invite
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-charcoal/60 space-y-2">
          <p>
            Each invite requires a new wallet signature for security. Share the generated link via
            messaging or email.
          </p>
          <p className="text-xs">
            Note: Invite links do not expire. Keep them secure and only share with trusted
            individuals.
          </p>
        </div>
      </main>
    </div>
  )
}
