"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AccountButton } from "@/components/account-button"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useGuests, useCreateGuestInvite, useApproveGuest, useCheckInGuest, useCheckOutGuest, InviteStatus } from "@/hooks/use-guest-management"
import { useWallet } from "@/hooks/use-wallet"
import { Loader2, Plus, Users, UserCheck, UserMinus, Calendar, ArrowLeft, Clock, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function GuestsPage() {
  // SSR safety check
  if (typeof window === 'undefined') {
    return null
  }

  const { t } = useI18n()
  const { address, isConnected } = useWallet()
  const { commune, members, isLoading: communeLoading } = useCommuneData()
  const { guests, guestPolicy, isLoading: guestsLoading, refreshGuests } = useGuests(commune?.id)
  
  const [newInviteOpen, setNewInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    guestName: "",
    arrivalDate: "",
    arrivalTime: "",
    departureDate: "",
    departureTime: "",
    reason: ""
  })
  
  const { createGuestInvite, isPending: creating } = useCreateGuestInvite()
  const { approveGuest, isPending: approving } = useApproveGuest()
  const { checkInGuest, isPending: checkingIn } = useCheckInGuest()
  const { checkOutGuest, isPending: checkingOut } = useCheckOutGuest()

  const handleCreateInvite = () => {
    if (!commune || !inviteForm.guestName || !inviteForm.arrivalDate || !inviteForm.departureDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const arrivalTime = new Date(`${inviteForm.arrivalDate}T${inviteForm.arrivalTime || '12:00'}`)
    const departureTime = new Date(`${inviteForm.departureDate}T${inviteForm.departureTime || '12:00'}`)

    if (departureTime <= arrivalTime) {
      toast.error("Departure time must be after arrival time")
      return
    }

    createGuestInvite(commune.id, inviteForm.guestName, arrivalTime, departureTime, inviteForm.reason)
    
    setInviteForm({
      guestName: "",
      arrivalDate: "",
      arrivalTime: "",
      departureDate: "",
      departureTime: "",
      reason: ""
    })
    setNewInviteOpen(false)
    
    setTimeout(() => {
      refreshGuests()
    }, 3000)
  }

  const handleApprove = (inviteId: string) => {
    approveGuest(inviteId)
    setTimeout(() => {
      refreshGuests()
    }, 3000)
  }

  const handleCheckIn = (inviteId: string) => {
    checkInGuest(inviteId)
    setTimeout(() => {
      refreshGuests()
    }, 3000)
  }

  const handleCheckOut = (inviteId: string) => {
    checkOutGuest(inviteId)
    setTimeout(() => {
      refreshGuests()
    }, 3000)
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getUsernameByAddress = (address: string) => {
    const member = members.find(m => m.address.toLowerCase() === address.toLowerCase())
    return member?.username || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusBadge = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.Pending:
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Pending</Badge>
      case InviteStatus.Approved:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case InviteStatus.Active:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case InviteStatus.Completed:
        return <Badge variant="secondary">Completed</Badge>
      case InviteStatus.Cancelled:
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getActionButtons = (guest: any) => {
    const isHost = guest.host.toLowerCase() === address?.toLowerCase()
    
    switch (guest.status) {
      case InviteStatus.Pending:
        if (!isHost && guestPolicy?.requireApproval) {
          return (
            <Button
              size="sm"
              onClick={() => handleApprove(guest.id)}
              disabled={approving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              <UserCheck className="w-3 h-3 mr-1" />
              Approve
            </Button>
          )
        }
        break
      case InviteStatus.Approved:
        if (isHost) {
          return (
            <Button
              size="sm"
              onClick={() => handleCheckIn(guest.id)}
              disabled={checkingIn}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {checkingIn && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Check In
            </Button>
          )
        }
        break
      case InviteStatus.Active:
        if (isHost) {
          return (
            <Button
              size="sm"
              onClick={() => handleCheckOut(guest.id)}
              disabled={checkingOut}
              variant="outline"
            >
              {checkingOut && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              <UserMinus className="w-3 h-3 mr-1" />
              Check Out
            </Button>
          )
        }
        break
    }
    return null
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-charcoal/70 mb-4">Please connect your wallet to manage guests.</p>
            <AccountButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (communeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">Loading commune data...</p>
        </div>
      </div>
    )
  }

  if (!commune) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">No Commune Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-charcoal/70">You're not a member of any commune yet.</p>
            <Link href="/join">
              <Button className="bg-sage hover:bg-sage/90 text-cream">
                Join a Commune
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
      {/* Header */}
      <header className="border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-charcoal/70 hover:text-charcoal">
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </Link>
            <div className="text-2xl font-serif">Guest Management</div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <AccountButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">
              Guest Management
            </h1>
            <p className="text-charcoal/70">Invite and manage temporary guests in your commune</p>
          </div>

          <Dialog open={newInviteOpen} onOpenChange={setNewInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sage hover:bg-sage/90 text-cream">
                <Plus className="w-4 h-4 mr-2" />
                Invite Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Invite New Guest</DialogTitle>
                <DialogDescription>
                  Create an invitation for a temporary guest.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input
                    id="guestName"
                    placeholder="Enter guest's name"
                    value={inviteForm.guestName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, guestName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arrivalDate">Arrival Date</Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      value={inviteForm.arrivalDate}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, arrivalDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrivalTime">Arrival Time</Label>
                    <Input
                      id="arrivalTime"
                      type="time"
                      value={inviteForm.arrivalTime}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, arrivalTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureDate">Departure Date</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={inviteForm.departureDate}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, departureDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={inviteForm.departureTime}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, departureTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Optional: Why is this guest visiting?"
                    value={inviteForm.reason}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvite} disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Guest Policy Info */}
        {guestPolicy && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Guest Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-charcoal/60">Max guests at once:</span>
                  <div className="font-semibold">{guestPolicy.maxGuestsAtOnce}</div>
                </div>
                <div>
                  <span className="text-charcoal/60">Max duration:</span>
                  <div className="font-semibold">{Math.floor(guestPolicy.maxDurationSeconds / 86400)} days</div>
                </div>
                <div>
                  <span className="text-charcoal/60">Requires approval:</span>
                  <div className="font-semibold">{guestPolicy.requireApproval ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <span className="text-charcoal/60">Approval threshold:</span>
                  <div className="font-semibold">{guestPolicy.approvalThreshold} member{guestPolicy.approvalThreshold !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guests List */}
        {guestsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sage" />
          </div>
        ) : (
          <div className="space-y-4">
            {guests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-charcoal/30 mx-auto mb-4" />
                  <h3 className="text-xl font-serif text-charcoal mb-2">No guest invitations yet</h3>
                  <p className="text-charcoal/70 mb-4">Create your first guest invitation to get started.</p>
                  <Button onClick={() => setNewInviteOpen(true)} className="bg-sage hover:bg-sage/90 text-cream">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite First Guest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              guests.map(guest => (
                <Card key={guest.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-serif text-charcoal">{guest.guestName}</h3>
                          {getStatusBadge(guest.status)}
                        </div>
                        <p className="text-sm text-charcoal/60 mb-1">
                          Hosted by {getUsernameByAddress(guest.host)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-charcoal/70">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(guest.arrivalTime)}
                          </div>
                          <span>→</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(guest.departureTime)}
                          </div>
                        </div>
                        {guest.reason && (
                          <p className="text-sm text-charcoal/70 mt-2 italic">"{guest.reason}"</p>
                        )}
                        {guest.status === InviteStatus.Pending && guestPolicy?.requireApproval && (
                          <p className="text-sm text-orange-600 mt-2">
                            {guest.approvals} of {guestPolicy.approvalThreshold} approvals received
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getActionButtons(guest)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}