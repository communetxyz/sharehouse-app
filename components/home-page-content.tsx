"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { Plus } from "lucide-react"

export default function HomePageContent() {
  const { t } = useI18n()

  return (
    <>
      <div className="pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-serif text-charcoal leading-tight">
              {t("hero.title.line1")} <br />
              <span className="text-sage">{t("hero.title.line2")}</span>
            </h1>
            <p className="text-lg md:text-xl text-charcoal/70 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/create-sharehouse">
                <Button size="lg" className="bg-sage hover:bg-sage/90 text-cream text-lg px-8 py-3">
                  <Plus className="w-5 h-5 mr-2" />
                  {t("createSharehouse.title")}
                </Button>
              </Link>
              <Link href="/join">
                <Button size="lg" variant="outline" className="border-charcoal text-charcoal hover:bg-charcoal/5 text-lg px-8 py-3">
                  {t("common.join")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
              {t("features.title")}
            </h2>
            <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature cards would go here, simplified for now */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto">
                <div className="text-sage text-2xl">🏠</div>
              </div>
              <h3 className="text-xl font-serif text-charcoal">{t("features.decentralized.title")}</h3>
              <p className="text-charcoal/60">{t("features.decentralized.description")}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto">
                <div className="text-sage text-2xl">🤝</div>
              </div>
              <h3 className="text-xl font-serif text-charcoal">{t("features.transparent.title")}</h3>
              <p className="text-charcoal/60">{t("features.transparent.description")}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto">
                <div className="text-sage text-2xl">📊</div>
              </div>
              <h3 className="text-xl font-serif text-charcoal">{t("features.smart.title")}</h3>
              <p className="text-charcoal/60">{t("features.smart.description")}</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-sage/10 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
                {t("howItWorks.title")}
              </h2>
              <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
                {t("howItWorks.subtitle")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-sage text-cream rounded-full flex items-center justify-center mx-auto text-xl font-bold">1</div>
                <h3 className="text-xl font-serif text-charcoal">{t("howItWorks.step1.title")}</h3>
                <p className="text-charcoal/60">{t("howItWorks.step1.description")}</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-sage text-cream rounded-full flex items-center justify-center mx-auto text-xl font-bold">2</div>
                <h3 className="text-xl font-serif text-charcoal">{t("howItWorks.step2.title")}</h3>
                <p className="text-charcoal/60">{t("howItWorks.step2.description")}</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-sage text-cream rounded-full flex items-center justify-center mx-auto text-xl font-bold">3</div>
                <h3 className="text-xl font-serif text-charcoal">{t("howItWorks.step3.title")}</h3>
                <p className="text-charcoal/60">{t("howItWorks.step3.description")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal">
              {t("cta.title")}
            </h2>
            <p className="text-lg text-charcoal/70">
              {t("cta.subtitle")}
            </p>
            <Link href="/create-sharehouse">
              <Button size="lg" className="bg-sage hover:bg-sage/90 text-cream text-lg px-8 py-3">
                <Plus className="w-5 h-5 mr-2" />
                {t("cta.button")}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}