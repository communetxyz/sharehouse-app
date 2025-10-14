# Simple Fixes

This document contains minor issues that can be fixed quickly with low risk. These are mostly style issues, minor refactoring opportunities, and small improvements.

## Code Organization

### 1. Remove Unused theme-provider.tsx
**Location:** `components/theme-provider.tsx`
**Issue:** File exists but is never imported or used
**Fix:** Delete the file
**Impact:** Cleaner codebase, less confusion

### 2. Duplicate globals.css
**Location:** `styles/globals.css` and `app/globals.css`
**Issue:** Two global CSS files, unclear which is used
**Fix:** Delete unused file, consolidate styles
**Impact:** Clearer project structure

### 3. Missing Barrel Exports
**Location:** `components/`, `hooks/`, `lib/`
**Issue:** No index.ts files for cleaner imports
**Fix:** Add index.ts files:
```typescript
// components/index.ts
export * from './chore-kanban';
export * from './expense-list';
// ...

// Usage: import { ChoreKanban, ExpenseList } from '@/components';
```
**Impact:** Cleaner imports, better code organization

### 4. Contracts File Too Large
**Location:** `lib/contracts.ts` (1133 lines)
**Issue:** Contains ABIs, addresses, instances, and config
**Fix:** Split into:
- `lib/contracts/abi.ts` - Contract ABIs
- `lib/contracts/addresses.ts` - Contract addresses
- `lib/contracts/instances.ts` - Contract instances
- `lib/contracts/citizen-wallet.ts` - Citizen wallet config
**Impact:** Better code organization, easier to find things

### 5. Large Component Files
**Location:** `components/chore-kanban.tsx` (276 lines)
**Issue:** Contains internal components and helper functions
**Fix:** Extract ChoreCard and helpers to separate files
**Impact:** Better separation of concerns, easier testing

## React Best Practices

### 6. Missing useEffect Cleanup
**Location:** `components/chore-kanban.tsx:127-154`
**Issue:** setTimeout without cleanup
**Fix:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setSuccessStates(prev => ({ ...prev, [choreId]: false }));
  }, 2000);

  return () => clearTimeout(timer); // Add cleanup
}, [choreId]);
```
**Impact:** Prevents memory leaks

### 7. Refs for One-time Checks Anti-pattern
**Location:** `app/join/page.tsx:24-25`
**Issue:** Using refs to prevent effect runs
**Fix:**
```typescript
// Instead of refs, use proper state or dependency array
useEffect(() => {
  // ... effect code
}, []); // Empty array for one-time effect
```
**Impact:** Clearer code, follows React patterns

### 8. Using window.location Instead of Next Router
**Location:** `hooks/use-join-commune.ts:195`
**Issue:** Direct DOM manipulation
**Fix:**
```typescript
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```
**Impact:** Better Next.js integration, no page reload

### 9. Index as Key in Lists
**Location:** `components/chore-calendar.tsx:131`
**Issue:** Using array index as key
**Fix:** Use unique ID if available:
```typescript
{days.map(day => (
  <div key={`${day.date}-${day.month}`}>
    {/* ... */}
  </div>
))}
```
**Impact:** Better React reconciliation

### 10. Excessive console.log Statements
**Location:** Multiple files throughout codebase
**Issue:** Console logs in production code
**Fix:** Create debug utility:
```typescript
// lib/debug.ts
export const debug = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  }
};

// Usage: debug.log('Transaction sent:', hash);
```
**Impact:** Cleaner production console

## State Management

### 11. Redundant Boolean States
**Location:** `hooks/use-join-commune.ts:20-24`
**Issue:** Multiple boolean states that should be enum
**Fix:**
```typescript
type JoinState = 'idle' | 'validating' | 'approving' | 'joining' | 'success';
const [state, setState] = useState<JoinState>('idle');

// Instead of:
// const [isValidating, setIsValidating] = useState(false);
// const [isJoining, setIsJoining] = useState(false);
// const [isApproving, setIsApproving] = useState(false);
```
**Impact:** Clearer state management, impossible states prevented

### 12. setTimeout Memory Leak
**Location:** `components/wallet-connect-button.tsx:18-23`
**Issue:** setTimeout without cleanup
**Fix:**
```typescript
useEffect(() => {
  if (copied) {
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }
}, [copied]);
```
**Impact:** Prevents memory leaks on unmount

### 13. No Form Data Persistence
**Location:** `app/join/page.tsx:20-23`
**Issue:** Form data lost on refresh
**Fix:**
```typescript
const [communeId, setCommuneId] = useState(() => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('joinCommuneId') || '';
  }
  return '';
});

useEffect(() => {
  sessionStorage.setItem('joinCommuneId', communeId);
}, [communeId]);
```
**Impact:** Better UX, form data survives refresh

## Error Handling

### 14. Silent Failure in checkAllowance
**Location:** `hooks/use-wallet.ts:152-161`
**Issue:** Errors logged but not shown to user
**Fix:**
```typescript
} catch (error) {
  console.error('Error checking allowance:', error);
  toast({
    title: 'Error',
    description: 'Failed to check token allowance',
    variant: 'destructive',
  });
  throw error; // Or return BigInt(0) with user notification
}
```
**Impact:** Better user feedback

### 15. Missing localStorage Error Handling
**Location:** `lib/i18n/context.tsx:17-27`
**Issue:** No try-catch for localStorage access
**Fix:**
```typescript
const [language, setLanguage] = useState<Language>(() => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as Language) || 'en';
    }
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
  return 'en';
});
```
**Impact:** Works in incognito/localStorage disabled

### 16. Missing Form Validation
**Location:** `components/create-expense-dialog.tsx:47-53`
**Issue:** Only checks truthy, not format
**Fix:**
```typescript
const amount = parseFloat(formData.amount);
if (isNaN(amount) || amount <= 0) {
  toast({
    title: 'Invalid Amount',
    description: 'Please enter a positive number',
    variant: 'destructive',
  });
  return;
}
```
**Impact:** Better data validation

## Accessibility

### 17. Missing aria-labels
**Location:** `components/language-toggle.tsx:10`, `components/wallet-connect-button.tsx:46`
**Fix:**
```typescript
<Button aria-label="Toggle language between English and Español">
  {language === 'en' ? 'ES' : 'EN'}
</Button>
```
**Impact:** Better screen reader support

### 18. Missing htmlFor on Labels
**Location:** `components/dispute-expense-dialog.tsx:55`
**Fix:**
```typescript
<Label htmlFor="reason">Reason</Label>
<Textarea id="reason" {...props} />
```
**Impact:** Better accessibility, clicking label focuses input

### 19. Missing alt Text on Avatars
**Location:** `components/member-list.tsx:17`
**Fix:**
```typescript
<Avatar alt={`${member.username || member.address} avatar`}>
```
**Impact:** Screen reader support

### 20. No Skip to Main Content
**Location:** `app/page.tsx`
**Fix:**
```typescript
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">
  {/* ... */}
</main>
```
**Impact:** Better keyboard navigation

## Loading/Error States

### 21. No Skeleton Loaders
**Location:** All component files
**Fix:** Add skeleton components:
```typescript
// components/ui/skeleton.tsx
export function ExpenseListSkeleton() {
  return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-24 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  );
}

// Usage
{isLoading ? <ExpenseListSkeleton /> : <ExpenseList data={expenses} />}
```
**Impact:** Better perceived performance, no layout shift

### 22. Missing Loading State on ExpenseCard
**Location:** `components/expense-list.tsx:126-204`
**Fix:**
```typescript
const [loadingId, setLoadingId] = useState<number | null>(null);

<Button
  disabled={loadingId === expense.id}
  onClick={() => handleMarkPaid(expense.id)}
>
  {loadingId === expense.id ? <Spinner /> : 'Mark as Paid'}
</Button>
```
**Impact:** User knows which item is processing

### 23. Incomplete Loading Display in ChoreCalendar
**Location:** `components/chore-calendar.tsx:64`
**Fix:**
```typescript
{isLoading && (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
    <p className="ml-2 text-sm text-gray-600">Loading chores...</p>
  </div>
)}
```
**Impact:** Better loading UX

### 24. Missing Error State in WalletConnectButton
**Location:** `components/wallet-connect-button.tsx`
**Fix:**
```typescript
const [error, setError] = useState<string | null>(null);

const handleLogin = async () => {
  try {
    await login();
  } catch (error) {
    setError('Failed to connect wallet');
    setTimeout(() => setError(null), 3000);
  }
};
```
**Impact:** User knows if connection failed

## Performance (Minor)

### 25. Expensive Calendar Calculations
**Location:** `components/chore-calendar.tsx:66-77`
**Fix:**
```typescript
const calendarDays = useMemo(() => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // ... calculation
  return days;
}, [year, month]);
```
**Impact:** Avoids recalculation on every render

## Implementation Checklist

High Priority (1-2 hours):
- [ ] Remove console.logs (use debug utility)
- [ ] Add useEffect cleanups
- [ ] Fix missing aria-labels
- [ ] Add form validation
- [ ] Fix localStorage error handling

Medium Priority (2-4 hours):
- [ ] Split contracts.ts file
- [ ] Extract ChoreCard component
- [ ] Convert boolean states to enums
- [ ] Add skeleton loaders
- [ ] Use Next router instead of window.location

Low Priority (nice to have):
- [ ] Add barrel exports
- [ ] Add skip to main content
- [ ] Add form data persistence
- [ ] Remove unused theme-provider
- [ ] Fix duplicate globals.css
