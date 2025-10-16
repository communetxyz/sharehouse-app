import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Commune, Member } from "@/types/commune"
import { useI18n } from "@/lib/i18n/context"

interface CommuneInfoProps {
  commune: Commune | null
  members: Member[]
}

export function CommuneInfo({ commune, members }: CommuneInfoProps) {
  const { t } = useI18n()

  if (!commune) {
    return (
      <Card className="border-charcoal/10">
        <CardContent className="p-8 text-center text-charcoal/60">{t("commune.noCommuneData")}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-charcoal/10">
        <CardHeader>
          <CardTitle className="font-serif text-charcoal">{t("commune.details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-charcoal/60 mb-1">{t("commune.name")}</p>
              <p className="font-medium text-charcoal">{commune.name}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">{t("commune.communeId")}</p>
              <p className="font-medium text-charcoal">{commune.id}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">{t("commune.creator")}</p>
              <p className="font-mono text-sm text-charcoal">{commune.creatorUsername || commune.creator}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">{t("commune.members")}</p>
              <p className="font-medium text-charcoal">{members.length}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal/60 mb-1">{t("commune.collateralRequired")}</p>
              <p className="font-medium text-charcoal">{commune.collateralRequired ? t("commune.yes") : t("commune.no")}</p>
            </div>
            {commune.collateralRequired && (
              <div>
                <p className="text-sm text-charcoal/60 mb-1">{t("commune.collateralAmount")}</p>
                <p className="font-medium text-charcoal">¥{commune.collateralAmount}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
