import { isAddress } from 'viem'

/**
 * Type guard to check if a value is a valid Ethereum address
 */
export function isValidAddress(address: unknown): address is `0x${string}` {
  return typeof address === 'string' && isAddress(address)
}

/**
 * Assert that a value is a valid Ethereum address, throws if not
 */
export function assertAddress(address: unknown): asserts address is `0x${string}` {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`)
  }
}

/**
 * Safely convert unknown value to address, throws if invalid
 */
export function toAddress(address: unknown): `0x${string}` {
  assertAddress(address)
  return address
}

/**
 * Safely convert unknown value to address, returns null if invalid
 */
export function toAddressOrNull(address: unknown): `0x${string}` | null {
  return isValidAddress(address) ? address : null
}

/**
 * Truncate address for display (0x1234...5678)
 */
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length < startLength + endLength) return address
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}
