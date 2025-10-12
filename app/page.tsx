"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-charcoal/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-serif">シェアハウス</div>
            <div className="text-xl font-sans tracking-wide">ShareHouse</div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-charcoal/70 hover:text-charcoal transition-colors">
              {t("common.features")}
            </Link>
            <Link href="#how-it-works" className="text-sm text-charcoal/70 hover:text-charcoal transition-colors">
              {t("common.howItWorks")}
            </Link>
            <Link href="/join" className="text-sm text-charcoal/70 hover:text-charcoal transition-colors">
              {t("common.join")}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link href="/dashboard">
              <Button variant="ghost" className="text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5">
                {t("common.dashboard")}
              </Button>
            </Link>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="text-6xl md:text-8xl font-serif text-charcoal mb-4">{t("home.title")}</div>
              <div className="text-xl md:text-2xl text-charcoal/60 tracking-wide">{t("home.subtitle")}</div>
            </div>

            <p className="text-lg md:text-xl text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
              {t("home.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/dashboard">
                <Button size="lg" className="bg-sage hover:bg-sage/90 text-cream px-8">
                  {t("home.goToDashboard")}
                </Button>
              </Link>
              <Link href="/join">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-charcoal/20 hover:bg-charcoal/5 px-8 bg-transparent"
                >
                  {t("home.joinSharehouse")}
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-charcoal/20 hover:bg-charcoal/5 px-8 bg-transparent"
                >
                  {t("common.learnMore")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-charcoal">{t("home.featuresTitle")}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-8 rounded-lg bg-cream/50 border border-charcoal/10">
              <div className="text-3xl">🏠</div>
              <h3 className="text-xl font-serif text-charcoal">{t("home.feature1Title")}</h3>
              <p className="text-charcoal/70 leading-relaxed">{t("home.feature1Desc")}</p>
            </div>

            <div className="space-y-4 p-8 rounded-lg bg-cream/50 border border-charcoal/10">
              <div className="text-3xl">🔄</div>
              <h3 className="text-xl font-serif text-charcoal">{t("home.feature2Title")}</h3>
              <p className="text-charcoal/70 leading-relaxed">{t("home.feature2Desc")}</p>
            </div>

            <div className="space-y-4 p-8 rounded-lg bg-cream/50 border border-charcoal/10">
              <div className="text-3xl">📋</div>
              <h3 className="text-xl font-serif text-charcoal">{t("home.feature3Title")}</h3>
              <p className="text-charcoal/70 leading-relaxed">{t("home.feature3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-charcoal">
            {t("home.howItWorksTitle")}
          </h2>

          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">{t("home.step1Title")}</h3>
                <p className="text-charcoal/70 leading-relaxed">{t("home.step1Desc")}</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">{t("home.step2Title")}</h3>
                <p className="text-charcoal/70 leading-relaxed">{t("home.step2Desc")}</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">{t("home.step3Title")}</h3>
                <p className="text-charcoal/70 leading-relaxed">{t("home.step3Desc")}</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                4
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">{t("home.step4Title")}</h3>
                <p className="text-charcoal/70 leading-relaxed">{t("home.step4Desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-sage text-cream">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif">{t("home.ctaTitle")}</h2>
          <p className="text-lg md:text-xl text-cream/90 leading-relaxed max-w-2xl mx-auto">{t("home.ctaDesc")}</p>
          <Link href="/join">
            <Button size="lg" className="bg-cream text-sage hover:bg-cream/90 px-8">
              {t("home.joinSharehouse")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-charcoal text-cream/70">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-xl font-serif text-cream">シェアハウス</div>
              <div className="text-lg font-sans tracking-wide text-cream">ShareHouse</div>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>Built on Gnosis Chain with WalletConnect</p>
              <p className="text-cream/50 mt-1">{t("home.footerTagline")}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
