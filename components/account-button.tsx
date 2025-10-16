"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Copy, Check } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useEnsNameOrAddress } from "@/hooks/use-ens-name"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useI18n } from "@/lib/i18n/context"

export function AccountButton() {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const { wallets } = useWallets()
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useI18n()

  const address = wallets[0]?.address as `0x${string}` | undefined
  const ensNameOrAddress = useEnsNameOrAddress(address)

  const { members } = useCommuneData()
  const currentMember = members.find((m) => m.isCurrentUser)

  const displayName = currentMember?.username || ensNameOrAddress

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)

      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }

      // Set new timeout
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!ready) {
    return (
      <Button disabled className="bg-sage/50 text-cream gap-2">
        <User className="w-4 h-4" />
        {t("common.loading")}
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className="bg-sage hover:bg-sage/90 text-cream gap-2"
        aria-label={t("dashboard.signIn")}
      >
        <User className="w-4 h-4" />
        {t("dashboard.signIn")}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-charcoal/20 hover:bg-charcoal/5 bg-transparent gap-2"
          aria-label={`Account menu for ${displayName}`}
        >
          <User className="w-4 h-4" />
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? t("dashboard.copied") : t("dashboard.copyAddress")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          {t("dashboard.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
