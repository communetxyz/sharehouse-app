"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, Link2, Unlink, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CalendarEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
  htmlLink: string
}

const STORAGE_KEY = "sharehouse-gcal-token"

function getStoredToken(): { accessToken: string; refreshToken: string; expiresAt: number } | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function storeToken(accessToken: string, refreshToken: string, expiresIn: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    })
  )
}

function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function GoogleCalendarSync() {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Check for stored token on mount
  useEffect(() => {
    const token = getStoredToken()
    if (token && token.expiresAt > Date.now()) {
      setIsConnected(true)
    }
  }, [])

  // Check URL params for callback
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const calendarConnected = params.get("calendar_connected")
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")
    const expiresIn = params.get("expires_in")

    if (calendarConnected === "true" && accessToken) {
      storeToken(accessToken, refreshToken || "", parseInt(expiresIn || "3600"))
      setIsConnected(true)
      toast({ title: "Google Calendar connected!", description: "Your calendar events will now appear here." })
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname)
    }

    const calendarError = params.get("calendar_error")
    if (calendarError) {
      toast({ title: "Calendar connection failed", description: calendarError, variant: "destructive" })
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [toast])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch("/api/calendar/auth")
      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        toast({
          title: "Calendar not configured",
          description: "Google Calendar integration requires server-side configuration (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).",
          variant: "destructive",
        })
      }
    } catch {
      toast({ title: "Failed to connect", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    clearToken()
    setIsConnected(false)
    setEvents([])
    toast({ title: "Calendar disconnected" })
  }

  const fetchEvents = useCallback(async () => {
    const token = getStoredToken()
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/calendar/events", {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      })
      const data = await response.json()
      if (data.events) {
        setEvents(data.events)
      } else if (response.status === 401) {
        clearToken()
        setIsConnected(false)
        toast({ title: "Calendar session expired", description: "Please reconnect.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed to fetch events", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (isConnected) {
      fetchEvents()
    }
  }, [isConnected, fetchEvents])

  return (
    <Card className="border-charcoal/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-charcoal flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar
          </CardTitle>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-sage text-sage">
                Connected
              </Badge>
              <Button variant="ghost" size="sm" onClick={fetchEvents} disabled={isLoading}>
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-red-500">
                <Unlink className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="sm"
              variant="outline"
              className="border-sage text-sage hover:bg-sage/10"
            >
              {isConnecting ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Link2 className="w-3 h-3 mr-1" />
              )}
              Connect
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <p className="text-sm text-charcoal/60 text-center py-4">
            Connect your Google Calendar to see events alongside your chores and tasks.
          </p>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-sage" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-charcoal/60 text-center py-4">No upcoming events</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white/50 border border-charcoal/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{event.title}</p>
                  <p className="text-xs text-charcoal/60">
                    {new Date(event.start).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {event.htmlLink && (
                  <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 text-charcoal/40 hover:text-charcoal" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
