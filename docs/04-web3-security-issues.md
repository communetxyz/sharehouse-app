# Web3 and Security Issues

## Introduction

This document identifies critical Web3 integration and security issues in the sharehouse-app. These issues include exposed API keys, incorrect network handling, missing transaction validations, and potential security vulnerabilities.

## Problem Statement

The application has several critical security and Web3 integration issues:
1. Hardcoded API keys exposed in client-side code
2. Missing network/chain validation
3. No transaction receipt validation
4. ENS lookup on wrong network
5. No gas estimation before transactions
6. Missing transaction timeout handling

These issues can lead to failed transactions, security breaches, and poor user experience.

## Security Threat Model

\`\`\`mermaid
graph TD
    A[User Initiates Transaction] --> B{Chain Check?}
    B -->|No Check| C[Wrong Network Transaction]
    C --> D[Transaction Fails]

    A --> E{Gas Estimation?}
    E -->|No Estimation| F[Out of Gas Error]

    A --> G{Receipt Validation?}
    G -->|No Validation| H[Silent Failure]

    I[Client Code] --> J[Hardcoded API Key]
    J --> K[Key Exposed in Browser]
    K --> L[Potential API Abuse]

    style C fill:#ff6b6b
    style D fill:#ff6b6b
    style F fill:#ff6b6b
    style H fill:#ff6b6b
    style K fill:#ff0000,color:#fff
    style L fill:#ff0000,color:#fff
\`\`\`

## Issues Found

### 1. Hardcoded RPC URL and API Key Exposed (Critical)

**Location:**
- `lib/contracts.ts:8`
- `lib/wagmi-config.ts:10`
- `hooks/use-join-commune.ts:100`

**Description:**
Alchemy API key is hardcoded in multiple client-side files:

\`\`\`typescript
// lib/contracts.ts
const publicClient = createPublicClient({
  chain: gnosis,
  transport: http('https://gnosis-mainnet.g.alchemy.com/v2/6PqeObUqUEEVOvs03MKYTbFYL32tG0S8')
  // API key exposed in browser bundle!
});

// lib/wagmi-config.ts
export const config = createConfig({
  chains: [gnosis],
  transports: {
    [gnosis.id]: http('https://gnosis-mainnet.g.alchemy.com/v2/6PqeObUqUEEVOvs03MKYTbFYL32tG0S8'),
    // Same API key exposed again!
  },
  // ...
});
\`\`\`

**Security Impact:**
- ✗ API key visible in browser DevTools
- ✗ Key visible in bundled JavaScript
- ✗ Anyone can extract and abuse the key
- ✗ Can lead to rate limiting for all users
- ✗ Potential financial cost if key is abused

**Recommended Fix:**

\`\`\`typescript
// .env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here
NEXT_PUBLIC_RPC_URL=https://gnosis-mainnet.g.alchemy.com/v2

// lib/contracts.ts
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL
  ? `${process.env.NEXT_PUBLIC_RPC_URL}/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  : 'https://rpc.gnosischain.com'; // Fallback to public RPC

const publicClient = createPublicClient({
  chain: gnosis,
  transport: http(RPC_URL)
});
\`\`\`

**Better Alternative:**
Use a proxy API route to hide the key completely:

\`\`\`typescript
// app/api/rpc/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(
    `https://gnosis-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}

// lib/contracts.ts
const publicClient = createPublicClient({
  chain: gnosis,
  transport: http('/api/rpc'), // API key never exposed!
});
\`\`\`

### 2. Missing Chain Validation (Critical)

**Location:** `hooks/use-wallet.ts` (entire file)

**Description:**
No validation that user is on the correct network (Gnosis) before transactions:

\`\`\`typescript
// Current - no chain check
async function sendTransaction({ to, data }: SendTransactionParams) {
  const hash = await sendTransactionMutation.mutateAsync({
    to,
    data,
    // What if user is on Ethereum mainnet? Transaction fails!
  });
  return hash;
}
\`\`\`

**Impact:**
- Transactions fail with confusing errors
- User wastes gas on wrong network
- Poor user experience

**Recommended Fix:**

\`\`\`typescript
import { useAccount, useSwitchChain } from 'wagmi';
import { gnosis } from 'viem/chains';

async function sendTransaction({ to, data }: SendTransactionParams) {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // Validate chain
  if (chain?.id !== gnosis.id) {
    toast({
      title: 'Wrong Network',
      description: 'Please switch to Gnosis Chain',
      variant: 'destructive',
    });

    try {
      await switchChain({ chainId: gnosis.id });
    } catch (error) {
      throw new Error('User rejected network switch');
    }
  }

  const hash = await sendTransactionMutation.mutateAsync({
    to,
    data,
  });
  return hash;
}
\`\`\`

### 3. Missing Transaction Receipt Validation (Major)

**Location:** `hooks/use-wallet.ts:76, 134`

**Description:**
Transaction hashes are returned without validating success:

\`\`\`typescript
// Current - no validation
const hash = await sendTransactionMutation.mutateAsync({
  to: toAddress,
  data,
});
console.log('Transaction sent:', hash);
return hash; // Could have failed!
\`\`\`

**Impact:**
- UI shows success for failed transactions
- Users think transaction succeeded when it failed
- No way to detect reverted transactions

**Recommended Fix:**

\`\`\`typescript
async function sendTransactionAndWait({ to, data }: SendTransactionParams) {
  // Send transaction
  const hash = await sendTransactionMutation.mutateAsync({
    to,
    data,
  });

  // Wait for receipt
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  // Validate success
  if (receipt.status === 'reverted') {
    throw new Error('Transaction failed on-chain');
  }

  return { hash, receipt };
}
\`\`\`

### 4. ENS Lookup on Wrong Chain (Major)

**Location:** `hooks/use-ens-name.ts:9`

**Description:**
ENS lookup uses mainnet but app is on Gnosis:

\`\`\`typescript
// use-ens-name.ts
const publicClient = createPublicClient({
  chain: mainnet, // Wrong chain!
  transport: http(),
});

const result = await publicClient.getEnsName({
  address: address as `0x${string}`,
});
\`\`\`

**Impact:**
- ENS lookups will fail on Gnosis
- Unnecessary calls to mainnet
- Doesn't support Gnosis profiles

**Recommended Fix:**

Either remove ENS lookup (Gnosis doesn't have ENS) or use a cross-chain ENS service:

\`\`\`typescript
// Option 1: Remove ENS entirely for Gnosis
export function useEnsName(address: string | undefined) {
  return { ensName: null }; // Gnosis doesn't support ENS
}

// Option 2: Use multi-chain ENS resolution service
import { normalize } from 'viem/ens';

export function useEnsName(address: string | undefined) {
  const { data: ensName } = useQuery({
    queryKey: ['ens', address],
    queryFn: async () => {
      // Check mainnet ENS
      const mainnetClient = createPublicClient({
        chain: mainnet,
        transport: http(),
      });
      return await mainnetClient.getEnsName({ address: address as `0x${string}` });
    },
    enabled: !!address && isAddress(address),
  });

  return { ensName };
}
\`\`\`

### 5. No Gas Estimation (Major)

**Location:** All transaction hooks

**Description:**
No gas estimation before sending transactions:

\`\`\`typescript
// Current - no gas estimation
const hash = await sendTransaction({
  to: CONTRACT_ADDRESS,
  data,
});
// Could fail due to insufficient gas
\`\`\`

**Impact:**
- Transactions fail with "out of gas" errors
- Users don't know gas cost upfront
- Poor UX for low balance accounts

**Recommended Fix:**

\`\`\`typescript
async function sendTransaction({ to, data }: SendTransactionParams) {
  // Estimate gas
  const gasEstimate = await publicClient.estimateGas({
    account: address,
    to,
    data,
  });

  // Add 20% buffer
  const gasLimit = (gasEstimate * 120n) / 100n;

  // Check if user has enough balance
  const balance = await publicClient.getBalance({ address });
  const maxCost = gasLimit * /* gas price */;

  if (balance < maxCost) {
    throw new Error('Insufficient balance for transaction');
  }

  // Send with gas limit
  const hash = await sendTransactionMutation.mutateAsync({
    to,
    data,
    gas: gasLimit,
  });

  return hash;
}
\`\`\`

### 6. No Transaction Timeout (Critical)

**Location:** `hooks/use-join-commune.ts:184-192`

**Description:**
Transaction polling has no timeout:

\`\`\`typescript
// Current - infinite loop risk
let isSuccess = false;
while (!isSuccess) {
  const receipt = await publicClient.getTransactionReceipt({ hash });
  if (receipt && receipt.status === 'success') {
    isSuccess = true;
  } else {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
// Loops forever if transaction never confirms!
\`\`\`

**Impact:**
- UI hangs indefinitely if transaction is stuck
- No way for user to cancel
- Browser tab becomes unresponsive

**Recommended Fix:**

\`\`\`typescript
async function waitForTransaction(hash: `0x${string}`, timeoutMs = 60000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash });

      if (receipt) {
        if (receipt.status === 'success') {
          return receipt;
        } else {
          throw new Error('Transaction reverted');
        }
      }
    } catch (error) {
      // Receipt not found yet, continue polling
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Transaction timeout - please check block explorer');
}

// Usage
try {
  const receipt = await waitForTransaction(hash, 60000); // 60 second timeout
  toast({ title: 'Success!' });
} catch (error) {
  if (error.message.includes('timeout')) {
    toast({
      title: 'Transaction Pending',
      description: 'Transaction is taking longer than expected. Check status in block explorer.',
      action: <Button onClick={() => window.open(`https://gnosisscan.io/tx/${hash}`)}>View</Button>
    });
  }
}
\`\`\`

### 7. Incorrect getCommuneExpenses Call (Critical)

**Location:** `hooks/use-expense-data.ts:24`

**Description:**
Function may not match ABI signature:

\`\`\`typescript
// Current
const expenses = await contract.read.getCommuneExpenses([BigInt(commune.id)]);

// But ABI may expect different parameters
// Need to verify against actual contract
\`\`\`

**Impact:**
- Contract calls may fail
- Data may be fetched incorrectly
- Silent failures in production

## Approaches and Tradeoffs

### Approach 1: Use Environment Variables Only

**Description:**
Move sensitive keys to environment variables:

\`\`\`bash
# .env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x...
\`\`\`

**Tradeoffs:**
- ✅ Quick to implement
- ✅ Standard practice
- ✅ Keys not in git
- ❌ Still exposed in client bundle
- ❌ Can be extracted from browser
- ❌ Not truly secure

### Approach 2: Backend Proxy for RPC Calls (Recommended)

**Description:**
Route all RPC calls through Next.js API routes:

\`\`\`typescript
// app/api/rpc/route.ts
export async function POST(request: NextRequest) {
  // Validate request
  // Rate limit per IP
  // Forward to Alchemy
  // Return response
}
\`\`\`

**Tradeoffs:**
- ✅ API key completely hidden
- ✅ Can add rate limiting
- ✅ Can add request validation
- ✅ Better security
- ❌ Adds latency (~50-100ms)
- ❌ More complex setup
- ❌ Server load increases

### Approach 3: Add Comprehensive Transaction Validation

**Description:**
Create a transaction middleware:

\`\`\`typescript
// lib/transaction-middleware.ts
export async function sendSecureTransaction(params: TransactionParams) {
  // 1. Validate chain
  await validateChain();

  // 2. Estimate gas
  const gas = await estimateGas(params);

  // 3. Check balance
  await checkBalance(gas);

  // 4. Send transaction
  const hash = await sendTransaction(params);

  // 5. Wait for receipt
  const receipt = await waitForReceipt(hash, 60000);

  // 6. Validate success
  if (receipt.status !== 'success') {
    throw new Error('Transaction failed');
  }

  return { hash, receipt };
}
\`\`\`

**Tradeoffs:**
- ✅ Comprehensive error handling
- ✅ Better UX
- ✅ Catches issues early
- ✅ Reusable across hooks
- ❌ More complex code
- ❌ Longer transaction flow
- ❌ Requires careful testing

### Approach 4: Use Wagmi Transaction Hooks

**Description:**
Leverage wagmi's built-in hooks:

\`\`\`typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

function useCreateExpense() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createExpense = async (params) => {
    await writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createExpense',
      args: [params],
    });
  };

  return { createExpense, isLoading, isSuccess };
}
\`\`\`

**Tradeoffs:**
- ✅ Built-in validation and error handling
- ✅ Less custom code to maintain
- ✅ Better wagmi integration
- ✅ Automatic chain validation
- ❌ Less control over flow
- ❌ Requires refactoring existing hooks
- ❌ May not support gas sponsorship easily

### Approach 5: Hybrid Approach (Recommended)

1. **Immediate (Critical):**
   - Move API keys to environment variables
   - Add chain validation
   - Add transaction timeout

2. **Short-term (High Priority):**
   - Implement RPC proxy
   - Add transaction receipt validation
   - Fix or remove ENS lookup

3. **Medium-term (Nice to Have):**
   - Add gas estimation
   - Create transaction middleware
   - Consider migrating to wagmi transaction hooks

## Security Checklist

- [ ] No API keys in client-side code
- [ ] All RPC calls through proxy
- [ ] Chain validation before transactions
- [ ] Gas estimation before sending
- [ ] Transaction receipt validation
- [ ] Timeout handling for stuck transactions
- [ ] Balance checking before transactions
- [ ] Rate limiting on API routes
- [ ] Input validation on all contract calls
- [ ] Error messages don't leak sensitive info

## Implementation Priority

1. **Critical:** Move API keys to environment variables + proxy
2. **Critical:** Add chain validation
3. **Critical:** Fix transaction timeout
4. **High:** Add transaction receipt validation
5. **High:** Fix/remove ENS lookup
6. **Medium:** Add gas estimation
7. **Medium:** Create transaction middleware
8. **Low:** Consider wagmi transaction hooks

## Testing Security

\`\`\`typescript
// tests/security.test.ts
describe('Security', () => {
  it('should not expose API keys', () => {
    // Read bundled JS
    // Check for Alchemy key pattern
    expect(bundleContent).not.toMatch(/alch_[a-zA-Z0-9]{32}/);
  });

  it('should validate chain before transaction', async () => {
    // Mock wrong chain
    // Attempt transaction
    // Should throw or switch chain
  });

  it('should timeout stuck transactions', async () => {
    // Mock pending transaction
    // Should timeout after 60s
  });
});
\`\`\`
