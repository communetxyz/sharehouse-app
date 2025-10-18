"use client"

import { useState } from "react"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

interface RemoveMemberParams {
  communeId: string
  memberAddress: string
  onSuccess?: () => void
}

/**
 * Hook for removing a member from a commune
 * Uses Privy's gas sponsorship
 */
export function useRemoveMember() {
  const { sendTransaction } = useSendTransaction()
  const [isRemoving, setIsRemoving] = useState(false)
  const { toast } = useToast()

  const removeMember = async ({ communeId, memberAddress, onSuccess }: RemoveMemberParams) => {
    setIsRemoving(true)

    try {
      console.log("[remove-member] Removing member:", { communeId, memberAddress })

      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "removeMember",
        args: [BigInt(communeId), memberAddress as `0x${string}`],
      })

      console.log("[remove-member] Calling sendTransaction with sponsor: true")

      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
        },
        {
          sponsor: true,
        },
      )

      console.log("[remove-member] Member removed successfully")

      toast({
        title: "Member removed",
        description: "Member has been removed from the sharehouse",
      })

      onSuccess?.()
    } catch (error: any) {
      console.error("[remove-member] Error removing member:", error)
      toast({
        title: "Failed to remove member",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsRemoving(false)
    }
  }

  return {
    removeMember,
    isRemoving,
  }
}
