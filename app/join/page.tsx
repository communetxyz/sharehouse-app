"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2 } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useJoinCommune } from "@/hooks/use-join-commune"
import { useWallet } from "@/hooks/use-wallet"

export default function JoinPage() {
  const searchParams = useSearchParams()
  const [communeId, setCommuneId] = useState("")
  const [nonce, setNonce] = useState("")
  const [signature, setSignature] = useState("")
  const [hasAutoValidated, setHasAutoValidated] = useState(false)

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
    const urlCommuneId = searchParams.get("communeId")
    const urlNonce = searchParams.get("nonce")
    const urlSignature = searchParams.get("signature")

    if (urlCommuneId) setCommuneId(urlCommuneId)
    if (urlNonce) setNonce(urlNonce)
    if (urlSignature) setSignature(urlSignature)

    // Auto-validate if all params are present and wallet is connected
    if (urlCommuneId && urlNonce && urlSignature && isConnected && !hasAutoValidated && !communeData) {
      setHasAutoValidated(true)
      validateInvite(urlCommuneId, urlNonce, urlSignature)
    }
  }, [searchParams, isConnected, hasAutoValidated, communeData, validateInvite])

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
    await joinCommune(communeId, nonce, signature)
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
                Back
              </Button>
            </Link>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Join a ShareHouse</h1>
          <p className="text-lg text-charcoal/70">Enter your invite details to join your commune</p>
        </div>

        {!isConnected && (
          <Card className="border-charcoal/10 mb-6">
            <CardHeader>
              <CardTitle className="font-serif">Connect Your Wallet</CardTitle>
              <CardDescription>You need to connect your wallet before joining a commune</CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnectButton />
            </CardContent>
          </Card>
        )}

        <Card className="border-charcoal/10">
          <CardHeader>
            <CardTitle className="font-serif">Invite Details</CardTitle>
            <CardDescription>You should have received these parameters from your commune creator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="communeId">Commune ID</Label>
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
                <Label htmlFor="nonce">Nonce</Label>
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
                <Label htmlFor="signature">Signature</Label>
                <Input
                  id="signature"
                  placeholder="0x..."
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  disabled={isValidating || isJoining || !isConnected}
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
                Validate Invite
              </Button>
            )}

            {communeData && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-sage/10 border border-sage/20 space-y-4">
                  <h3 className="font-serif text-xl text-charcoal">Commune Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Name:</span>
                      <span className="font-medium text-charcoal">{communeData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Members:</span>
                      <span className="font-medium text-charcoal">{communeData.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Chores:</span>
                      <span className="font-medium text-charcoal">{communeData.choreCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Collateral Required:</span>
                      <span className="font-medium text-charcoal">{communeData.collateralRequired ? "Yes" : "No"}</span>
                    </div>
                    {communeData.collateralRequired && (
                      <div className="flex justify-between">
                        <span className="text-charcoal/70">Collateral Amount:</span>
                        <span className="font-medium text-charcoal">{communeData.collateralAmount} BREAD</span>
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
                    Approve BREAD Token
                  </Button>
                )}

                {(!communeData.collateralRequired || hasAllowance) && !isCheckingAllowance && (
                  <Button
                    onClick={handleJoin}
                    disabled={isJoining || !isConnected}
                    className="w-full bg-sage hover:bg-sage/90 text-cream"
                  >
                    {isJoining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Join ShareHouse
                  </Button>
                )}

                {isCheckingAllowance && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-sage" />
                    <span className="ml-2 text-charcoal/70">Checking token allowance...</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-charcoal/60">
          <p>Don't have an invite? Contact your future housemates to get started.</p>
        </div>
      </main>
    </div>
  )
}
