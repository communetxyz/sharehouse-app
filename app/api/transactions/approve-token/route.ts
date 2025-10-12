import { type NextRequest, NextResponse } from "next/server"
import { encodeFunctionData } from "viem"
import { ERC20_ABI } from "@/lib/contracts"

export async function POST(request: NextRequest) {
  try {
    const { spender, amount, tokenAddress } = await request.json()

    // Get user's access token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = authHeader.replace("Bearer ", "")

    // Encode the approve function call
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, BigInt(amount)],
    })

    // Send sponsored transaction through Privy's server SDK
    // Note: You'll need to install @privy-io/server-auth
    const response = await fetch("https://api.privy.io/v1/wallets/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PRIVY_APP_SECRET}`,
        "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
      },
      body: JSON.stringify({
        method: "eth_sendTransaction",
        params: [
          {
            to: tokenAddress,
            data,
          },
        ],
        sponsor: true, // Enable gas sponsorship
      }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error approving token:", error)
    return NextResponse.json({ error: "Failed to approve token" }, { status: 500 })
  }
}
