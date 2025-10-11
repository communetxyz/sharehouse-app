import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Commune, Member } from "@/types/commune"

interface CommuneInfoProps {
  commune: Commune | null
  members: Member[]
}

export function CommuneInfo({ commune, members }: CommuneInfoProps) {
  if (!commune) {
    return (
      <Card className="border-charcoal/10">
        <CardContent className="p-8 text-center text-charcoal/60">No commune data available</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-charcoal/10">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal">Commune Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-charcoal/60 mb-1">Name</p>
              <p className="font-medium text-charcoal">{commune.name}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">Commune ID</p>
              <p className="font-medium text-charcoal">{commune.id}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">Creator</p>
              <p className="font-mono text-sm text-charcoal">
                {commune.creator.slice(0, 6)}...{commune.creator.slice(-4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">Members</p>
              <p className="font-medium text-charcoal">{members.length}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">Collateral Required</p>
              <p className="font-medium text-charcoal">{commune.collateralRequired ? "Yes" : "No"}</p>
            </div>
            {commune.collateralRequired && (
              <div>
                <p className="text-sm text-charcoal/60 mb-1">Collateral Amount</p>
                <p className="font-medium text-charcoal">{commune.collateralAmount} BREAD</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-sage/30 bg-sage/5">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal">About ShareHouse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-charcoal/70 leading-relaxed">
          <p>
            ShareHouse brings the spirit of Japanese communal living to the blockchain. All chores rotate automatically
            based on the configured schedule, ensuring fair distribution of responsibilities.
          </p>
          <p>Built on Gnosis Chain with Citizen Wallet integration for seamless crypto interactions.</p>
        </CardContent>
      </Card>
    </div>
  )
}
