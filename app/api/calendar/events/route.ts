import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "")

  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 })
  }

  const timeMin = request.nextUrl.searchParams.get("timeMin") || new Date().toISOString()
  const timeMax = request.nextUrl.searchParams.get("timeMax") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "50",
        }),
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error?.message || "Failed to fetch events" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({
      events: (data.items || []).map((event: any) => ({
        id: event.id,
        title: event.summary || "Untitled",
        description: event.description || "",
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        htmlLink: event.htmlLink,
      })),
    })
  } catch (err) {
    console.error("Calendar events fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "")

  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: body.title,
          description: body.description || "",
          start: {
            dateTime: body.start,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: body.end,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error?.message || "Failed to create event" }, { status: response.status })
    }

    const event = await response.json()
    return NextResponse.json({ event: { id: event.id, htmlLink: event.htmlLink } })
  } catch (err) {
    console.error("Calendar event creation error:", err)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
