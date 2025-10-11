"use client"

import { useCitizenWallet } from "@/hooks/use-citizen-wallet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Copy, Check, QrCode } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CWQRCode } from "./cw-qr-code"

export function WalletConnectButton() {
  const { address, isConnected, disconnect, authUrl } = useCitizenWallet()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected || !address) {
    return (
      <>
        <Button onClick={() => setShowQR(true)} className="bg-sage hover:bg-sage/90 text-cream gap-2">
          <QrCode className="w-4 h-4" />
          Connect Wallet
        </Button>

        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="sm:max-w-md bg-cream border-charcoal/20">
            <DialogHeader>
              <DialogTitle className="text-charcoal">Connect with Citizen Wallet</DialogTitle>
              <DialogDescription className="text-charcoal/70">
                Scan this QR code with your Citizen Wallet app to authenticate
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <CWQRCode url={authUrl} size={256} />
              </div>
            </div>
            <p className="text-xs text-center text-charcoal/60">
              Don't have Citizen Wallet?{" "}
              <a
                href="https://citizenwallet.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage hover:underline"
              >
                Get it here
              </a>
            </p>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-charcoal/20 hover:bg-charcoal/5 bg-transparent gap-2">
          <Wallet className="w-4 h-4" />
          {formatAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
