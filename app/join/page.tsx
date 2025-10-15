"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AccountButton } from "@/components/account-button"
import { useJoinCommune } from "@/hooks/use-join-commune"
import { useWallet } from "@/hooks/use-wallet"
import { useI18n } from "@/lib/i18n/context"

export default function JoinPage() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const [communeId, setCommuneId] = useState("")
  const [nonce, setNonce] = useState("")
  const [signature, setSignature] = useState("")
  const [username, setUsername] = useState("") // Added username state
  const hasLoadedParams = useRef(false)
  const hasAutoValidated = useRef(false)

  const { isConnected } = useWallet()
  const {
    communeData,
    isValidating,
    isJoining,
    isApproving,
    isCheckingAllowance,
    hasAllowance,
    error,
    validateInvite,
    joinCommune,
    approveToken,
  } = useJoinCommune()

  useEffect(() => {
    if (hasLoadedParams.current) return

    console.log("[v0] Full search params:", searchParams.toString())
    console.log("[v0] All params:", {
      communeId: searchParams.get("communeId"),
      nonce: searchParams.get("nonce"),
      signature: searchParams.get("signature"),
    })

    const urlCommuneId = searchParams.get("communeId")
    const urlNonce = searchParams.get("nonce")
    const urlSignature = searchParams.get("signature")

    if (urlCommuneId) {
      setCommuneId(urlCommuneId)
      console.log("[v0] Loaded communeId from URL:", urlCommuneId)
    }
    if (urlNonce) {
      setNonce(urlNonce)
      console.log("[v0] Loaded nonce from URL:", urlNonce)
    }
    if (urlSignature) {
      setSignature(urlSignature)
      console.log("[v0] Loaded signature from URL:", urlSignature)
    }

    hasLoadedParams.current = true
  }, [searchParams])

  useEffect(() => {
    if (hasAutoValidated.current || !isConnected || communeData) return

    if (communeId && nonce && signature) {
      console.log("[v0] Auto-validating invite with params:", { communeId, nonce, signature })
      hasAutoValidated.current = true
      validateInvite(communeId, nonce, signature)
    }
  }, [isConnected, communeId, nonce, signature, communeData, validateInvite])

  const handleValidate = async () => {
    if (!communeId || !nonce || !signature) {
      return
    }
    await validateInvite(communeId, nonce, signature)
  }

  const handleApprove = async () => {
    await approveToken()
  }

  const handleJoin = async () => {
    await joinCommune(communeId, nonce, signature, username) // Pass username to joinCommune
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
            <Link href="/">
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
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">{t("join.title")}</h1>
          <p className="text-lg text-charcoal/70">
            {t("join.subtitle", "Enter your invite details to join your commune")}
          </p>
        </div>

        {!isConnected && (
          <Card className="border-charcoal/10 mb-6">
            <CardHeader>
              <CardTitle className="font-serif">{t("dashboard.signIn")}</CardTitle>
              <CardDescription>{t("dashboard.signInDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountButton />
            </CardContent>
          </Card>
        )}

        <Card className="border-charcoal/10">
          <CardHeader>
            <CardTitle className="font-serif">{t("join.inviteDetails")}</CardTitle>
            <CardDescription>{t("join.inviteDetailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="communeId">{t("join.communeId")}</Label>
                <Input
                  id="communeId"
                  type="number"
                  placeholder="e.g., 1"
                  value={communeId}
                  onChange={(e) => setCommuneId(e.target.value)}
                  disabled={isValidating || isJoining || !isConnected}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nonce">{t("join.nonce")}</Label>
                <Input
                  id="nonce"
                  type="number"
                  placeholder="e.g., 12345"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  disabled={isValidating || isJoining || !isConnected}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">{t("join.signature")}</Label>
                <Input
                  id="signature"
                  placeholder="0x..."
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  disabled={isValidating || isJoining || !isConnected}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t("join.username")}</Label>
                <Input
                  id="username"
                  placeholder={t("join.enterUsername")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isJoining || !isConnected}
                />
              </div>
            </div>

            {!communeData && (
              <Button
                onClick={handleValidate}
                disabled={!communeId || !nonce || !signature || isValidating || !isConnected}
                className="w-full bg-sage hover:bg-sage/90 text-cream"
              >
                {isValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isValidating ? t("join.validating") : t("join.validateInvite")}
              </Button>
            )}

            {communeData && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-sage/10 border border-sage/20 space-y-4">
                  <h3 className="font-serif text-xl text-charcoal">{t("join.communeDetails", "Commune Details")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("commune.name")}:</span>
                      <span className="font-medium text-charcoal">{communeData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("members.title")}:</span>
                      <span className="font-medium text-charcoal">{communeData.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("commune.totalChores")}:</span>
                      <span className="font-medium text-charcoal">{communeData.choreCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">{t("commune.collateralRequired")}:</span>
                      <span className="font-medium text-charcoal">
                        {communeData.collateralRequired ? t("commune.yes") : t("commune.no")}
                      </span>
                    </div>
                    {communeData.collateralRequired && (
                      <div className="flex justify-between">
                        <span className="text-charcoal/70">{t("commune.collateralAmount")}:</span>
                        <span className="font-medium text-charcoal">
                          {communeData.collateralAmount} Collateral Currency
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {communeData.collateralRequired && !hasAllowance && !isCheckingAllowance && (
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || !isConnected}
                    className="w-full bg-sage hover:bg-sage/90 text-cream"
                  >
                    {isApproving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isApproving ? t("join.approving") : t("join.approveCollateral")}
                  </Button>
                )}

                {(!communeData.collateralRequired || hasAllowance) && !isCheckingAllowance && (
                  <Button
                    onClick={handleJoin}
                    disabled={isJoining || !isConnected || !username.trim()}
                    className="w-full bg-sage hover:bg-sage/90 text-cream"
                  >
                    {isJoining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isJoining ? t("join.joining") : t("join.joinSharehouse")}
                  </Button>
                )}

                {isCheckingAllowance && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-sage" />
                    <span className="ml-2 text-charcoal/70">{t("join.checkingAllowance")}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-charcoal/60">
          <p>{t("join.noInvite", "Don't have an invite? Contact your future housemates to get started.")}</p>
        </div>
      </main>
    </div>
  )
}
