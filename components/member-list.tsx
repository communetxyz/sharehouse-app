import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Member } from "@/types/commune"
// import { useEnsNameOrAddress } from "@/hooks/use-ens-name"

interface MemberListProps {
  members: Member[]
}

function MemberItem({ member }: { member: Member }) {
  // const displayName = useEnsNameOrAddress(member.address)

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-charcoal/10">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-sage text-cream">{member.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-charcoal">{member.username}</p>
          {member.isCurrentUser && (
            <Badge variant="outline" className="border-sage/30 text-sage mt-1">
              You
            </Badge>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-charcoal/60">Collateral</p>
        <p className="font-medium text-charcoal">{member.collateral} Collateral Currency</p>
      </div>
    </div>
  )
}

export function MemberList({ members }: MemberListProps) {
  return (
    <Card className="border-charcoal/10">
      <CardHeader>
        <CardTitle className="font-serif text-charcoal">Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <MemberItem key={member.address} member={member} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
