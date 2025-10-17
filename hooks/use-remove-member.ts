"use client"

import { useCallback } from "react"
import { useContractTransaction } from "./use-contract-transaction"
import { debug } from "@/lib/debug"

interface RemoveMemberParams {
  communeId: string
  memberAddress: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook for removing a member from a commune
 * Calls the removeMember function on the CommuneOS contract
 */
export function useRemoveMember() {
  const { executeTransaction, isExecuting, isConfirming, isConfirmed, hash } = useContractTransaction()

  const removeMember = useCallback(
    async ({ communeId, memberAddress, onSuccess, onError }: RemoveMemberParams) => {
      debug.log("Removing member:", { communeId, memberAddress })

      try {
        const txHash = await executeTransaction({
          functionName: "removeMember",
          args: [BigInt(communeId), memberAddress],
          onSuccess: () => {
            debug.log("Member removed successfully")
            onSuccess?.()
          },
          onError,
          successMessage: "Member removed successfully!",
          errorMessage: "Failed to remove member",
        })

        return txHash
      } catch (error) {
        debug.error("Error removing member:", error)
        throw error
      }
    },
    [executeTransaction]
  )

  return {
    removeMember,
    isRemoving: isExecuting,
    isConfirming,
    isConfirmed,
    hash,
  }
}
