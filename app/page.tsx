"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import components that use hooks with SSR disabled
const DynamicAccountButton = dynamic(() => import("@/components/account-button").then(mod => ({ default: mod.AccountButton })), { ssr: false })
const DynamicLanguageToggle = dynamic(() => import("@/components/language-toggle").then(mod => ({ default: mod.LanguageToggle })), { ssr: false })
const DynamicContent = dynamic(() => import("@/components/home-page-content"), { ssr: false })

export default function HomePage() {
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
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-charcoal/70 hover:text-charcoal transition-colors">
              How it works
            </Link>
            <Link href="/join" className="text-sm text-charcoal/70 hover:text-charcoal transition-colors">
              Join
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <DynamicLanguageToggle />
            <Link href="/dashboard">
              <Button variant="ghost" className="text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5">
                Dashboard
              </Button>
            </Link>
            <Link href="/create-sharehouse">
              <Button variant="outline" className="border-sage text-sage hover:bg-sage/10 bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Create ShareHouse
              </Button>
            </Link>
            <DynamicAccountButton />
          </div>
        </div>
      </header>

      <DynamicContent />
    </div>
  )
}