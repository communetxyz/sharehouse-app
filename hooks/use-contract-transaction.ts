"use client"

import { useState, useCallback } from "react"
import { encodeFunctionData, type Abi } from "viem"
import { gnosis } from "viem/chains"
import { useAccount, useSwitchChain } from "wagmi"
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { COMMUNE_OS_ABI, COMMUNE_OS_ADDRESS } from "@/lib/contracts"
import { useToast } from "@/hooks/use-toast"
import { debug } from "@/lib/debug"

// Citizen Wallet paymaster address from contracts.ts
const PAYMASTER_ADDRESS = "0x6c9b7c830bCB48338e926Ed80eA8A9DE4f2f17E0" as `0x${string}`

interface TransactionParams {
  functionName: string
  args: any[]
  onSuccess?: (hash: `0x${string}`) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

/**
 * Shared hook for contract transactions with:
 * - Chain validation
 * - Gas sponsorship
 * - Transaction receipt validation
 * - Error handling
 * - Toast notifications
 */
export function useContractTransaction() {
  const { address, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { sendTransactionAsync } = useSendTransaction()
  const { toast } = useToast()

  const [isExecuting, setIsExecuting] = useState(false)
  const [hash, setHash] = useState<`0x${string}` | null>(null)

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: hash || undefined,
  })

  const executeTransaction = useCallback(
    async ({
      functionName,
      args,
      onSuccess,
      onError,
      successMessage = "Transaction successful!",
      errorMessage = "Transaction failed",
    }: TransactionParams) => {
      if (!address) {
        const error = new Error("Account not connected")
        toast({
          title: "Account Not Connected",
          description: "Please connect your account to continue",
          variant: "destructive",
        })
        onError?.(error)
        throw error
      }

      try {
        setIsExecuting(true)

        // 1. Validate chain
        if (chain?.id !== gnosis.id) {
          debug.log("Wrong chain detected, prompting switch...")

          toast({
            title: "Wrong Network",
            description: "Please switch to Gnosis Chain",
            variant: "destructive",
          })

          try {
            await switchChain({ chainId: gnosis.id })
            debug.log("Switched to Gnosis chain")
          } catch (switchError) {
            const error = new Error("User rejected network switch")
            onError?.(error)
            throw error
          }
        }

        // 2. Encode function data
        debug.log(`Encoding function: ${functionName}`, args)

        const data = encodeFunctionData({
          abi: COMMUNE_OS_ABI as Abi,
          functionName,
          args,
        })

        // 3. Send transaction with gas sponsorship
        debug.log("Sending transaction with gas sponsorship...")

        const txHash = await sendTransactionAsync({
          to: COMMUNE_OS_ADDRESS,
          data,
          chain: gnosis,
          // @ts-ignore - wagmi types don't include gasSponsorship yet
          gasSponsorship: {
            paymasterAddress: PAYMASTER_ADDRESS,
          },
        })

        debug.log("Transaction sent:", txHash)
        setHash(txHash)

        // Show pending toast
        toast({
          title: "Transaction Pending",
          description: "Waiting for confirmation...",
        })

        // 4. Wait for confirmation (handled by useWaitForTransactionReceipt)
        // The hook will update isConfirming and isConfirmed states

        // Call success callback
        onSuccess?.(txHash)

        // Show success toast
        toast({
          title: "Success!",
          description: successMessage,
          variant: "default",
        })

        return txHash
      } catch (error) {
        debug.error("Transaction error:", error)

        const errorObj = error instanceof Error ? error : new Error(String(error))

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        onError?.(errorObj)
        throw errorObj
      } finally {
        setIsExecuting(false)
      }
    },
    [address, chain, switchChain, sendTransactionAsync, toast]
  )

  return {
    executeTransaction,
    isExecuting,
    isConfirming,
    isConfirmed,
    hash,
  }
}
