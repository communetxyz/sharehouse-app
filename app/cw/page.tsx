import { verifyConnectedUrl, CommunityConfig } from "@citizenwallet/sdk"
import CommunityJson from "@/community.json"
import { redirect } from "next/navigation"

export default async function CitizenWalletAuth({
  searchParams,
}: {
  searchParams: Promise<{
    sigAuthAccount?: string
    sigAuthExpiry?: string
    sigAuthSignature?: string
    sigAuthRedirect?: string
  }>
}) {
  const community = new CommunityConfig(CommunityJson)
  const params = new URLSearchParams(await searchParams)

  const { sigAuthRedirect } = await searchParams

  if (!sigAuthRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-2">Invalid Authentication URL</h1>
          <p className="text-charcoal/70">Please scan the QR code again from ShareHouse.</p>
        </div>
      </div>
    )
  }

  // Verify the connected URL and get the account owner's address
  const accountOwnerAddress = await verifyConnectedUrl(community, { params })

  if (!accountOwnerAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-2">Authentication Failed</h1>
          <p className="text-charcoal/70">Unable to verify your wallet. Please try again.</p>
        </div>
      </div>
    )
  }

  // Redirect back with the authenticated address
  redirect(`${sigAuthRedirect}?cwAddress=${accountOwnerAddress}`)
}
