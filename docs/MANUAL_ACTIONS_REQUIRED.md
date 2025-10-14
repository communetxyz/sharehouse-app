# Manual Actions Required

This document lists actions that require manual intervention or cannot be completed automatically.

## Critical - Environment Variables Setup

### 1. Create `.env.local` File

Create a `.env.local` file in the project root with the following variables:

\`\`\`bash
# Alchemy API Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=Rr57Q41YGfkxYkx0kZp3EOQs86HatGGE
NEXT_PUBLIC_RPC_URL=https://gnosis-mainnet.g.alchemy.com/v2

# Contract Addresses (already public, but good practice)
NEXT_PUBLIC_COMMUNE_OS_ADDRESS=0x05e7feed5b5db8a7b394d02e9de809b057fd6ee6
NEXT_PUBLIC_BREAD_TOKEN_ADDRESS=0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3
NEXT_PUBLIC_COLLATERAL_MANAGER_ADDRESS=0x61Ba220071184886710A8F2814B7c6eDecbcaA82
\`\`\`

### 2. Update `.gitignore`

Ensure `.env.local` is in `.gitignore`:

\`\`\`
# Local env files
.env*.local
.env.local
\`\`\`

### 3. Security Best Practice (Recommended)

For production, consider creating a Next.js API route to proxy RPC calls:

\`\`\`typescript
// app/api/rpc/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RPC_URL}/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'RPC request failed' },
      { status: 500 }
    );
  }
}
\`\`\`

Then update `lib/contracts.ts` to use `/api/rpc` instead of direct Alchemy URL.

## High Priority - Testing Requirements

### 4. Test Transaction Flows

After applying fixes, manually test:

- [ ] Create expense transaction
- [ ] Mark expense as paid transaction
- [ ] Dispute expense transaction
- [ ] Mark chore complete transaction
- [ ] Join commune flow
- [ ] Approve token transaction

Verify:
- ✅ Chain validation prompts appear on wrong network
- ✅ Transactions timeout after 60 seconds
- ✅ Transaction receipts are validated
- ✅ Error messages are user-friendly
- ✅ Loading states work correctly

### 5. Test Error Boundary

Manually trigger errors to test error boundary:

\`\`\`typescript
// Temporarily add to a component to test
throw new Error('Test error boundary');
\`\`\`

Verify:
- ✅ Error boundary catches error
- ✅ User sees friendly error message
- ✅ "Reload" button works
- ✅ Error is logged to console

### 6. Test Performance Improvements

Use React DevTools Profiler to verify:
- [ ] Fewer re-renders after commune data changes
- [ ] ChoreCard only re-renders when its data changes
- [ ] ExpenseCard only re-renders when its data changes
- [ ] Sorting/filtering doesn't run on every render

## Medium Priority - Code Review

### 7. Review Contract ABI Matches

Verify that contract method calls match the actual deployed contract ABI:

\`\`\`typescript
// hooks/use-expense-data.ts - verify this matches contract
const expenses = await contract.read.getCommuneExpenses([BigInt(commune.id)]);
\`\`\`

Check against actual contract on Gnosis scan to ensure:
- Function name is correct
- Parameters match
- Return type is handled correctly

### 8. Review ENS Implementation

Decision needed: Should ENS lookups be removed or kept?

Current state: ENS lookup uses mainnet, but app is on Gnosis (which doesn't have ENS).

Options:
- **Option A:** Remove ENS entirely (implemented in code)
- **Option B:** Keep ENS lookup for mainnet addresses
- **Option C:** Use a cross-chain ENS resolution service

Current fix implements Option A. If you want Option B or C, update `hooks/use-ens-name.ts`.

### 9. Verify Gas Sponsorship Still Works

The transaction hooks have been updated with better error handling. Verify gas sponsorship still works:

\`\`\`typescript
// Check that paymasterAddress is still accepted
gasSponsorship: {
  paymasterAddress: PAYMASTER_ADDRESS as `0x${string}`
}
\`\`\`

Test with actual transactions on testnet/mainnet.

## Low Priority - Nice to Have

### 10. Set Up Error Monitoring

Consider adding Sentry or similar:

\`\`\`bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
\`\`\`

### 11. Add Bundle Analysis

To track bundle size after changes:

\`\`\`bash
npm install --save-dev @next/bundle-analyzer
\`\`\`

Update `next.config.js`:

\`\`\`javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
\`\`\`

Run: `ANALYZE=true npm run build`

### 12. Consider React Query Migration

If performance is still an issue after Context migration, consider React Query:

\`\`\`bash
npm install @tanstack/react-query
\`\`\`

See `docs/06-state-management-refactor.md` for implementation guide.

### 13. Add E2E Tests

Consider adding Playwright for critical flows:

\`\`\`bash
npm install --save-dev @playwright/test
npx playwright install
\`\`\`

Test flows:
- Join commune
- Create expense
- Complete chore
- Dispute resolution

## Documentation Updates

### 14. Update README

Add sections for:
- Environment variable setup
- Development setup
- Testing guide
- Deployment guide

### 15. Add CONTRIBUTING.md

Document:
- Code style guidelines
- How to run tests
- How to submit PRs
- Architecture overview

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in deployment platform
- [ ] `.env.local` added to `.gitignore`
- [ ] No API keys in client-side code
- [ ] Error boundary tested
- [ ] All transactions tested on testnet
- [ ] Performance tested with realistic data (20+ items)
- [ ] Accessibility tested with screen reader
- [ ] Mobile responsive tested
- [ ] Error monitoring configured
- [ ] Analytics configured (if desired)

## Questions to Answer

1. **Should we keep ENS lookups or remove them entirely?**
   Current: Removed (Gnosis doesn't have ENS)

2. **Should we implement RPC proxy or just use env variables?**
   Current: Using env variables (simpler)
   Recommended for production: RPC proxy (more secure)

3. **Do we want to migrate to React Query now or later?**
   Current: Using Context (simpler, less dependencies)
   Can migrate to React Query later if needed

4. **Should we add comprehensive test suite?**
   Recommended: Yes, at least for critical transaction flows

5. **What error monitoring service to use?**
   Options: Sentry, LogRocket, Rollbar, etc.

## Priority Order

1. ✅ **Immediate:** Set up environment variables
2. ✅ **Day 1:** Test all transaction flows
3. ✅ **Day 1:** Test error boundary
4. 📅 **Week 1:** Review contract ABI matches
5. 📅 **Week 1:** Verify gas sponsorship
6. 📅 **Week 2:** Set up error monitoring
7. 📅 **Week 3:** Consider React Query migration
8. 📅 **Week 4:** Add E2E tests

---

**Note:** The code fixes have been applied automatically. This document lists only the manual actions required to complete the implementation.
