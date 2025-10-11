"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

interface CWQRCodeProps {
  url: string
  size?: number
}

export function CWQRCode({ url, size = 200 }: CWQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#2C2C2C", // charcoal
          light: "#FFFEF7", // cream
        },
      },
      (err) => {
        if (err) {
          console.error("[v0] QR Code generation error:", err)
          setError("Failed to generate QR code")
        }
      },
    )
  }, [url, size])

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>
  }

  return <canvas ref={canvasRef} className="rounded-lg" />
}
