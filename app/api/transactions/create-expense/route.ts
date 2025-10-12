import { type NextRequest, NextResponse } from "next/server"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"

export async function POST(request: NextRequest) {
  try {
    const { communeId, description, amount, assignedTo } = await request.json()

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = encodeFunctionData({
      abi: COMMUNE_OS_ABI,
      functionName: "createExpense",
      args: [BigInt(communeId), description, BigInt(amount), assignedTo],
    })

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
            to: COMMUNE_OS_ADDRESS,
            data,
          },
        ],
        sponsor: true,
      }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
