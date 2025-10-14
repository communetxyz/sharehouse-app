# Type Safety Issues

## Introduction

This document identifies type safety issues in the sharehouse-app that can lead to runtime errors, poor developer experience, and hard-to-debug problems. The codebase has several instances of loose typing, unsafe type assertions, and missing type definitions.

## Problem Statement

TypeScript's type system is not being fully leveraged, resulting in:
1. Missing fields in type interfaces
2. Unsafe `any` types for contract interactions
3. Unsafe type assertions without validation
4. Optional chaining missing where needed
5. Potential runtime null/undefined errors

These issues reduce the reliability of the application and make refactoring risky.

## Type Flow Diagram

\`\`\`mermaid
graph LR
    A[Smart Contract] -->|any| B[Contract Hook]
    B -->|incomplete type| C[Data Hook]
    C -->|missing fields| D[Component]
    D -->|unsafe assertion| E[Runtime Error]

    style A fill:#ffd93d
    style B fill:#ff6b6b
    style C fill:#ff6b6b
    style D fill:#ff6b6b
    style E fill:#ff0000,color:#fff
\`\`\`

## Issues Found

### 1. Missing assignedToUsername in Expense Interface (Critical)

**Location:**
- `types/commune.ts:35-45` (interface definition)
- `components/expense-list.tsx:168` (usage)

**Description:**
The `Expense` interface is incomplete:

\`\`\`typescript
// types/commune.ts
export interface Expense {
  id: number;
  creator: string;
  assignedTo: string;
  amount: string;
  description: string;
  isPaid: boolean;
  isDisputed: boolean;
  createdAt: number;
  period: number;
  // Missing: assignedToUsername
}

// components/expense-list.tsx
<p className="text-xs text-charcoal/60">
  {expense.assignedToUsername || expense.assignedTo}
  {/* TypeScript doesn't catch this missing field! */}
</p>
\`\`\`

**Impact:**
- Runtime errors when accessing undefined field
- IDE autocomplete doesn't suggest the field
- Refactoring tools miss references

### 2. Missing creatorUsername in Commune Interface (Critical)

**Location:**
- `types/commune.ts:1-7` (interface definition)
- `components/commune-info.tsx:36` (usage)
- `hooks/use-commune-data.ts:42` (populated)

**Description:**
Similar issue with `creatorUsername`:

\`\`\`typescript
// types/commune.ts
export interface Commune {
  id: number;
  creator: string;
  name: string;
  members: string[];
  // Missing: creatorUsername
}

// hooks/use-commune-data.ts
setCommune({
  id: Number(communeData[0]),
  creator: communeData[1],
  name: communeData[2],
  members: communeData[3],
  creatorUsername: creatorUsername || communeData[1], // Field not in type!
});
\`\`\`

### 3. Loose 'any' Types in Contract Interactions (Major)

**Location:**
- `hooks/use-commune-data.ts:60`
- `hooks/use-expense-data.ts:27`
- `hooks/use-join-commune.ts:120`

**Description:**
Contract return values are typed as `any`:

\`\`\`typescript
// hooks/use-commune-data.ts
const choreResult = await contract.getChores(BigInt(commune.id));
const chores = choreResult as any; // No type safety!

chores[0].map((chore: any, index: number) => ({
  // Any field access allowed - no compile-time checks
  id: Number(chore.id),
  description: chore.description,
  // What if ABI changes? Silent failures!
}));
\`\`\`

**Should be:**

\`\`\`typescript
interface ContractChoreResult {
  id: bigint;
  description: string;
  assignedTo: string;
  dueDate: bigint;
  isComplete: boolean;
  frequency: bigint;
  period: bigint;
}

type GetChoresResult = [ContractChoreResult[], string[], string[]];

const choreResult = await contract.getChores(BigInt(commune.id)) as GetChoresResult;
\`\`\`

### 4. Unsafe Type Assertions (Major)

**Location:**
- `hooks/use-wallet.ts:17, 26, 41`
- `hooks/use-ens-name.ts:8`

**Description:**
Addresses are asserted without validation:

\`\`\`typescript
// hooks/use-wallet.ts
const fromAddress = address as `0x${string}`;
// What if address is undefined? Runtime error!

await sendTransaction({
  to: toAddress as `0x${string}`, // Unsafe!
  // ...
});

// hooks/use-ens-name.ts
const result = await publicClient.getEnsName({
  address: address as `0x${string}`, // No undefined check!
});
\`\`\`

**Should be:**

\`\`\`typescript
if (!address || !isAddress(address)) {
  throw new Error('Invalid address');
}

const fromAddress: `0x${string}` = address; // Type-safe
\`\`\`

### 5. Incorrect Allowance Type Handling (Major)

**Location:** `hooks/use-wallet.ts:156`

**Description:**
Returns potentially undefined value as bigint:

\`\`\`typescript
const allowance = await contract.read.allowance([
  fromAddress,
  CONTRACT_ADDRESS as `0x${string}`
]);

return allowance as bigint; // What if allowance is undefined?
\`\`\`

**Should be:**

\`\`\`typescript
const allowance = await contract.read.allowance([
  fromAddress,
  CONTRACT_ADDRESS as `0x${string}`
]);

return allowance ?? BigInt(0); // Safe default
\`\`\`

### 6. Missing Optional Chaining (Minor)

**Location:**
- `components/member-list.tsx:18`
- `hooks/use-calendar-chores.ts:31`

**Description:**
Direct property access without optional chaining:

\`\`\`typescript
// member-list.tsx
const initial = member.username.charAt(0).toUpperCase();
// Crashes if member.username is undefined

// Should be:
const initial = member.username?.charAt(0).toUpperCase() ?? member.address.slice(0, 2);
\`\`\`

## Approaches and Tradeoffs

### Approach 1: Generate Types from Contract ABI

**Description:**
Use tools like `typechain` to generate TypeScript types from smart contract ABIs:

\`\`\`bash
npm install --save-dev @typechain/ethers-v6 typechain
\`\`\`

\`\`\`json
// package.json
{
  "scripts": {
    "typechain": "typechain --target ethers-v6 --out-dir types/contracts './lib/ShareHouse.json'"
  }
}
\`\`\`

\`\`\`typescript
// hooks/use-commune-data.ts
import { ShareHouse } from '@/types/contracts/ShareHouse';

const contract = getContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  client: publicClient,
}) as unknown as ShareHouse;

// Now fully typed!
const chores: Awaited<ReturnType<ShareHouse['getChores']>> = await contract.getChores(BigInt(commune.id));
\`\`\`

**Tradeoffs:**
- ✅ Guaranteed type accuracy matching contract
- ✅ Auto-updates when ABI changes
- ✅ Catches breaking changes at compile time
- ✅ Best IDE autocomplete
- ❌ Requires build step
- ❌ Generated types can be verbose
- ❌ Learning curve for setup
- ❌ May conflict with wagmi types

### Approach 2: Manual Type Definitions

**Description:**
Create comprehensive manual type definitions:

\`\`\`typescript
// types/contracts.ts
export interface ContractChore {
  id: bigint;
  description: string;
  assignedTo: `0x${string}`;
  dueDate: bigint;
  isComplete: boolean;
  frequency: bigint;
  period: bigint;
}

export interface ContractExpense {
  id: bigint;
  creator: `0x${string}`;
  amount: bigint;
  description: string;
  isPaid: boolean;
  isDisputed: boolean;
  createdAt: bigint;
  period: bigint;
}

export type GetChoresResult = [ContractChore[], string[], string[]];
export type GetExpensesResult = [ContractExpense[], `0x${string}`[]];

// types/commune.ts - update interfaces
export interface Expense {
  id: number;
  creator: string;
  assignedTo: string;
  assignedToUsername?: string; // Add missing field
  amount: string;
  description: string;
  isPaid: boolean;
  isDisputed: boolean;
  createdAt: number;
  period: number;
}

export interface Commune {
  id: number;
  creator: string;
  creatorUsername?: string; // Add missing field
  name: string;
  members: string[];
}
\`\`\`

**Tradeoffs:**
- ✅ Full control over types
- ✅ Can add convenience fields (like username)
- ✅ No build step required
- ✅ Simpler setup
- ❌ Can drift from actual contract
- ❌ Manual updates when ABI changes
- ❌ No compile-time guarantee of accuracy
- ❌ More maintenance burden

### Approach 3: Add Runtime Validation

**Description:**
Use libraries like `zod` for runtime type validation:

\`\`\`typescript
// lib/validators.ts
import { z } from 'zod';

const ExpenseSchema = z.object({
  id: z.number(),
  creator: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assignedTo: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assignedToUsername: z.string().optional(),
  amount: z.string(),
  description: z.string(),
  isPaid: z.boolean(),
  isDisputed: z.boolean(),
  createdAt: z.number(),
  period: z.number(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// In hooks
const rawExpenses = await contract.getCommuneExpenses(BigInt(commune.id));
const expenses = rawExpenses[0].map((expense: any) =>
  ExpenseSchema.parse({
    id: Number(expense.id),
    // ... mapping
  })
);
// Throws descriptive error if validation fails
\`\`\`

**Tradeoffs:**
- ✅ Runtime safety in addition to compile-time
- ✅ Great error messages
- ✅ Can validate external data (API, localStorage)
- ✅ Types and validation in one place
- ❌ Performance overhead (negligible for this app)
- ❌ Adds dependency (~13KB)
- ❌ More verbose
- ❌ Requires learning zod API

### Approach 4: Address Validation Helper

**Description:**
Create type guards and validation helpers:

\`\`\`typescript
// lib/address-utils.ts
import { isAddress } from 'viem';

export function assertAddress(address: unknown): asserts address is `0x${string}` {
  if (typeof address !== 'string' || !isAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
}

export function toAddress(address: unknown): `0x${string}` {
  assertAddress(address);
  return address;
}

export function toAddressOrNull(address: unknown): `0x${string}` | null {
  return typeof address === 'string' && isAddress(address) ? address : null;
}

// Usage in hooks
const fromAddress = toAddress(address); // Type-safe, throws if invalid
const ensName = await publicClient.getEnsName({
  address: fromAddress, // No assertion needed
});
\`\`\`

**Tradeoffs:**
- ✅ Centralized address validation
- ✅ Clear error messages
- ✅ Reusable across codebase
- ✅ TypeScript type narrowing
- ❌ Requires updating all assertion sites
- ❌ More verbose than raw assertions
- ❌ Doesn't solve contract type issues

### Approach 5: Hybrid Approach (Recommended)

Combine multiple strategies for comprehensive type safety:

1. **Phase 1:** Fix immediate type issues (Critical)
   - Add missing fields to interfaces
   - Replace unsafe assertions with validation helpers
   - Add optional chaining where needed

2. **Phase 2:** Generate contract types (High priority)
   - Set up typechain for contract type generation
   - Update hooks to use generated types

3. **Phase 3:** Add runtime validation (Nice to have)
   - Add zod for critical data paths
   - Validate user inputs and contract responses

**Implementation:**

\`\`\`typescript
// 1. Fix interfaces
export interface Expense {
  id: number;
  creator: string;
  assignedTo: string;
  assignedToUsername?: string; // Added
  amount: string;
  description: string;
  isPaid: boolean;
  isDisputed: boolean;
  createdAt: number;
  period: number;
}

// 2. Add validation helpers
import { toAddress } from '@/lib/address-utils';

const fromAddress = toAddress(address);

// 3. Use generated types
import { ShareHouse } from '@/types/contracts';

const chores = await contract.getChores(BigInt(commune.id));
// chores is now properly typed!
\`\`\`

**Tradeoffs:**
- ✅ Comprehensive type safety
- ✅ Catches errors at multiple levels
- ✅ Incremental implementation
- ✅ Best long-term solution
- ❌ Most implementation effort
- ❌ Requires team coordination
- ❌ Learning curve for multiple tools

## Strict TypeScript Configuration

Current `tsconfig.json` should be updated:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true, // Add this
    "noImplicitReturns": true, // Add this
    "noFallthroughCasesInSwitch": true, // Add this
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": false // Change to false for stricter checking
  }
}
\`\`\`

## Implementation Priority

1. **Critical:** Add missing fields to Expense and Commune interfaces
2. **Critical:** Fix unsafe address assertions
3. **High:** Create contract type definitions
4. **High:** Fix allowance type handling
5. **Medium:** Add address validation helpers
6. **Medium:** Add optional chaining
7. **Low:** Set up typechain
8. **Low:** Consider zod for validation

## Testing Type Safety

\`\`\`typescript
// tests/type-safety.test.ts
import { describe, it, expect } from 'vitest';
import { toAddress, toAddressOrNull } from '@/lib/address-utils';

describe('Address validation', () => {
  it('should accept valid addresses', () => {
    const addr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    expect(() => toAddress(addr)).not.toThrow();
  });

  it('should reject invalid addresses', () => {
    expect(() => toAddress('invalid')).toThrow();
    expect(() => toAddress(undefined)).toThrow();
  });

  it('should return null for invalid addresses with orNull', () => {
    expect(toAddressOrNull('invalid')).toBeNull();
    expect(toAddressOrNull(undefined)).toBeNull();
  });
});
\`\`\`
