import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-4xl font-serif text-charcoal">404 - Page Not Found</h1>
        <p className="text-charcoal/70">Sorry, we couldn't find the page you're looking for.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-sage text-cream rounded-md hover:bg-sage/90 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  )
}