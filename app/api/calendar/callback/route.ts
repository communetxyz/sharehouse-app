import { NextRequest, NextResponse } from "next/server"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
  : "http://localhost:3000/api/calendar/callback"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard?calendar_error=auth_denied", request.url))
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokens)
      return NextResponse.redirect(new URL("/dashboard?calendar_error=token_exchange", request.url))
    }

    // Redirect to dashboard with token in hash (client-side storage)
    const params = new URLSearchParams({
      calendar_connected: "true",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || "",
      expires_in: tokens.expires_in?.toString() || "3600",
    })

    return NextResponse.redirect(new URL(`/dashboard?${params.toString()}`, request.url))
  } catch (err) {
    console.error("Calendar callback error:", err)
    return NextResponse.redirect(new URL("/dashboard?calendar_error=server_error", request.url))
  }
}
