import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletConnectButton } from "@/components/wallet-connect-button"

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
              How It Works
            </Link>
            <Link href="/join" className="text-sm text-charcoal/70 hover:text-charcoal transition-colors">
              Join
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:block">
              <Button variant="ghost" className="text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5">
                Dashboard
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
              <div className="text-6xl md:text-8xl font-serif text-charcoal mb-4">共同生活</div>
              <div className="text-xl md:text-2xl text-charcoal/60 tracking-wide">Harmonious Living, Together</div>
            </div>

            <p className="text-lg md:text-xl text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
              ShareHouse brings the spirit of Japanese communal living to the blockchain. Manage shared
              responsibilities, rotate chores fairly, and build a harmonious home together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/join">
                <Button size="lg" className="bg-sage hover:bg-sage/90 text-cream px-8">
                  Join a ShareHouse
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-charcoal/20 hover:bg-charcoal/5 px-8 bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-charcoal">Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-8 rounded-lg bg-cream/50 border border-charcoal/10">
              <div className="text-3xl">🏠</div>
              <h3 className="text-xl font-serif text-charcoal">Invite-Based Communities</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Join trusted communities through secure, signature-based invitations. No public listings, just curated
                homes.
              </p>
            </div>

            <div className="space-y-4 p-8 rounded-lg bg-cream/50 border border-charcoal/10">
              <div className="text-3xl">🔄</div>
              <h3 className="text-xl font-serif text-charcoal">Rotating Chores</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Fair, automatic rotation of household tasks. Everyone contributes equally, tracked transparently
                on-chain.
              </p>
            </div>

            <div className="space-y-4 p-8 rounded-lg bg-cream/50 border border-charcoal/10">
              <div className="text-3xl">📋</div>
              <h3 className="text-xl font-serif text-charcoal">Kanban Board</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Visualize your responsibilities with an intuitive kanban interface. Track what's yours, what's pending,
                and what's done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-charcoal">How It Works</h2>

          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">Receive an Invite</h3>
                <p className="text-charcoal/70 leading-relaxed">
                  Get invite parameters (commune ID, nonce, and signature) from your future housemates.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">Join with Your Wallet</h3>
                <p className="text-charcoal/70 leading-relaxed">
                  Connect your wallet using WalletConnect, deposit any required collateral, and become a member.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">View Your Chores</h3>
                <p className="text-charcoal/70 leading-relaxed">
                  See your assigned tasks on the kanban board. Chores rotate automatically based on the schedule.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage text-cream flex items-center justify-center font-serif text-xl">
                4
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-charcoal">Complete & Track</h3>
                <p className="text-charcoal/70 leading-relaxed">
                  Mark tasks complete as you finish them. Everyone sees real-time updates on the shared board.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-sage text-cream">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif">Ready to Join?</h2>
          <p className="text-lg md:text-xl text-cream/90 leading-relaxed max-w-2xl mx-auto">
            Have an invite? Enter your commune details and start your journey toward harmonious shared living.
          </p>
          <Link href="/join">
            <Button size="lg" className="bg-cream text-sage hover:bg-cream/90 px-8">
              Join Your ShareHouse
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
              <p className="text-cream/50 mt-1">Harmonious living, powered by blockchain</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
