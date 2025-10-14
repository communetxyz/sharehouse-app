"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"
import { useWallet } from "@/hooks/use-wallet"
import { useCreateCommune, type CreateCommuneInput } from "@/hooks/use-create-commune"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"

export default function CreateCommunePage() {
  const { t } = useI18n()
  const { address, isConnected, status } = useWallet()
  const { createCommune, isLoading } = useCreateCommune()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CreateCommuneInput>({
    name: "",
    username: "",
    collateralRequired: false,
    collateralAmount: "10",
  })

  const updateFormData = (updates: Partial<CreateCommuneInput>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    try {
      await createCommune(formData)
    } catch (error) {
      console.error("Failed to create commune:", error)
    }
  }

  const canProceedStep1 = formData.name.trim().length > 0
  const canSubmit =
    canProceedStep1 && (!formData.collateralRequired || Number.parseFloat(formData.collateralAmount) > 0)

  if (status === "reconnecting" || status === "connecting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">{t("dashboard.connectingWallet")}</p>
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
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-charcoal/70 hover:text-charcoal mb-4">
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">{t("createCommune.title")}</h1>
          <p className="text-charcoal/70">{t("createCommune.subtitle")}</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                currentStep === 1 ? "bg-sage text-cream" : "bg-sage/20 text-sage"
              }`}
            >
              1
            </div>
            <span className={`text-sm ${currentStep === 1 ? "text-charcoal" : "text-charcoal/50"}`}>
              {t("createCommune.step1")}
            </span>
          </div>
          <div className="w-12 h-px bg-charcoal/20" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                currentStep === 2 ? "bg-sage text-cream" : "bg-sage/20 text-sage"
              }`}
            >
              2
            </div>
            <span className={`text-sm ${currentStep === 2 ? "text-charcoal" : "text-charcoal/50"}`}>
              {t("createCommune.step2")}
            </span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("createCommune.step1")}</CardTitle>
              <CardDescription>{t("createCommune.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("createCommune.communeName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder={t("createCommune.enterCommuneName")}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">{t("createCommune.username")}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => updateFormData({ username: e.target.value })}
                  placeholder={t("createCommune.enterUsername")}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedStep1 || isLoading}
                className="w-full bg-sage hover:bg-sage/90 text-cream"
              >
                {t("createCommune.next")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Collateral Settings */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("createCommune.step2")}</CardTitle>
              <CardDescription>{t("createCommune.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="collateral-toggle">{t("createCommune.requireCollateral")}</Label>
                  <p className="text-sm text-charcoal/60">Members must deposit collateral to join</p>
                </div>
                <Switch
                  id="collateral-toggle"
                  checked={formData.collateralRequired}
                  onCheckedChange={(checked) => updateFormData({ collateralRequired: checked })}
                  disabled={isLoading}
                />
              </div>

              {formData.collateralRequired && (
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("createCommune.collateralAmount")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      type="number"
                      value={formData.collateralAmount}
                      onChange={(e) => updateFormData({ collateralAmount: e.target.value })}
                      placeholder={t("createCommune.enterCollateralAmount")}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => updateFormData({ collateralAmount: "10" })}
                      disabled={isLoading}
                      className="border-sage text-sage hover:bg-sage/10"
                    >
                      {t("createCommune.preset10")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
                className="flex-1 border-charcoal/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("createCommune.back")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className="flex-1 bg-sage hover:bg-sage/90 text-cream"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("createCommune.creating")}
                  </>
                ) : (
                  t("createCommune.createCommune")
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  )
}
