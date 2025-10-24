import { PublicClient, TransactionReceipt } from 'viem'

/**
 * Wait for transaction receipt with timeout
 * Optimized for Arbitrum's 250ms block time
 */
export async function waitForTransactionWithTimeout(
  publicClient: PublicClient,
  hash: `0x${string}`,
  timeoutMs = 30000, // 30 seconds (reduced from 60s for Arbitrum)
  pollIntervalMs = 500 // 500ms (reduced from 2000ms for Arbitrum's 250ms block time)
): Promise<TransactionReceipt> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash })

      if (receipt) {
        // Validate transaction succeeded
        if (receipt.status === 'reverted') {
          throw new Error('Transaction reverted on-chain')
        }

        return receipt
      }
    } catch (error) {
      // Receipt not found yet, continue polling
      // Or it's a revert, in which case we throw
      if (error instanceof Error && error.message.includes('reverted')) {
        throw error
      }
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  // Timeout reached
  throw new Error(
    `Transaction confirmation timeout after ${timeoutMs / 1000}s. ` +
    `Please check transaction status on block explorer.`
  )
}

/**
 * Validate transaction receipt status
 */
export function validateTransactionReceipt(receipt: TransactionReceipt): void {
  if (receipt.status === 'reverted') {
    throw new Error('Transaction failed on-chain')
  }
}

/**
 * Get transaction explorer URL for Arbitrum
 */
export function getTransactionUrl(hash: `0x${string}`): string {
  return `https://arbiscan.io/tx/${hash}`
}

/**
 * Get address explorer URL for Arbitrum
 */
export function getAddressUrl(address: `0x${string}`): string {
  return `https://arbiscan.io/address/${address}`
}
