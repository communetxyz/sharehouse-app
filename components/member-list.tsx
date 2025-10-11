import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Member } from "@/types/commune"

interface MemberListProps {
  members: Member[]
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
            <div
              key={member.address}
              className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-charcoal/10"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-sage text-cream">
                    {member.address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-charcoal">
                    {member.address.slice(0, 6)}...{member.address.slice(-4)}
                  </p>
                  {member.isCurrentUser && (
                    <Badge variant="outline" className="border-sage/30 text-sage mt-1">
                      You
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-charcoal/60">Collateral</p>
                <p className="font-medium text-charcoal">{member.collateral} BREAD</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
