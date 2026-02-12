"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { useSendTransaction } from "@privy-io/react-auth"
import { encodeFunctionData } from "viem"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "./use-toast"

export function useVoteDispute(communeId: string) {
  const { address, isConnected } = useWallet()
  const { sendTransaction } = useSendTransaction()
  const [isVoting, setIsVoting] = useState(false)
  const [votingDisputeId, setVotingDisputeId] = useState<string | null>(null)
  const { toast } = useToast()

  const voteOnDispute = async (disputeId: string, support: boolean, onSuccess?: () => void) => {
    if (!isConnected || !address) {
      toast({
        title: "Account not connected",
        description: "Please connect your account to vote",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)
    setVotingDisputeId(disputeId)

    try {
      const data = encodeFunctionData({
        abi: COMMUNE_OS_ABI,
        functionName: "voteOnDispute",
        args: [BigInt(communeId), BigInt(disputeId), support],
      })

      await sendTransaction(
        {
          to: COMMUNE_OS_ADDRESS as `0x${string}`,
          data,
        } as any,
        { sponsor: true }
      )

      toast({
        title: "Vote submitted",
        description: `You voted ${support ? "for" : "against"} the dispute.`,
      })

      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("[vote-dispute] Error:", error)
      toast({
        title: "Failed to vote",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
      setVotingDisputeId(null)
    }
  }

  return { voteOnDispute, isVoting, votingDisputeId }
}
