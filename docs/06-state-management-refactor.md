# State Management Refactoring

## Introduction

This document outlines opportunities to improve state management across the sharehouse-app. The current implementation suffers from prop drilling, duplicate state, and inefficient data flow patterns that can be resolved with better architectural patterns.

## Problem Statement

Current state management issues:
1. Excessive prop drilling through multiple component layers
2. Duplicate state maintained across different hooks
3. Uncoordinated loading and error states
4. No clear data flow architecture
5. Tight coupling between data fetching and UI components

These issues make the codebase harder to maintain, test, and scale.

## Current Data Flow Architecture

\`\`\`mermaid
graph TD
    A[Dashboard Page] --> B[useCommuneData]
    A --> C[useExpenseData]
    A --> D[useCalendarChores]

    B --> E[commune state]
    B --> F[members state]
    B --> G[chores state]
    B --> H[loading state]

    C --> I[expenses state]
    C --> J[loading state]

    A --> K[ExpenseList Component]
    A --> L[ChoreKanban Component]
    A --> M[MemberList Component]

    A -.prop drilling.-> K
    A -.prop drilling.-> L
    A -.prop drilling.-> M

    K --> N[useCommuneData again!]
    L --> O[useCommuneData again!]

    style A fill:#4ecdc4
    style K fill:#ff6b6b
    style L fill:#ff6b6b
    style M fill:#ff6b6b
    style N fill:#ff0000,color:#fff
    style O fill:#ff0000,color:#fff
\`\`\`

## Issues Found

### 1. Excessive Prop Drilling (Major)

**Location:** `app/dashboard/page.tsx:150-181`

**Description:**
Dashboard passes commune, members, and chores through multiple levels:

\`\`\`typescript
<div>
  <CommuneInfo commune={commune} members={members} />
  <MemberList members={members} />
  <Tabs>
    <ExpenseList commune={commune} members={members} />
    <ChoreKanban
      chores={chores}
      members={members}
      onMarkComplete={handleMarkComplete}
    />
    <ChoreCalendar chores={chores} />
  </Tabs>
</div>
\`\`\`

Every component receives props from the top level, making the component tree rigid and hard to refactor.

### 2. Duplicate State Across Hooks (Minor)

**Location:**
- `hooks/use-commune-data.ts:10-14`
- `hooks/use-expense-data.ts:10-14`

**Description:**
Both hooks maintain separate loading and error states for related data:

\`\`\`typescript
// use-commune-data.ts
const [commune, setCommune] = useState<Commune | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// use-expense-data.ts
const [expenses, setExpenses] = useState<Expense[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
\`\`\`

When both are loading, there's no coordination between them.

### 3. Circular Dependencies Between Hooks (Major)

**Location:** Multiple data fetching hooks

**Description:**
Hooks depend on each other creating circular update patterns:

\`\`\`typescript
// use-expense-data.ts
const { commune } = useCommuneData(); // Depends on commune

useEffect(() => {
  if (commune?.id) {
    refreshExpenses(); // Triggers when commune changes
  }
}, [commune?.id]); // Creates circular dependency
\`\`\`

### 4. Mixed Concerns in Hooks (Major)

**Location:** `hooks/use-wallet.ts`

**Description:**
Single hook handles multiple responsibilities:
- Wallet connection
- Transaction sending
- Token approval
- Allowance checking
- Data refreshing

Should be separated into focused hooks.

## Recommended Architecture

\`\`\`mermaid
graph TD
    A[App Layout] --> B[CommuneProvider Context]

    B --> C[Dashboard Page]
    B --> D[Join Page]

    C --> E[ExpenseList]
    C --> F[ChoreKanban]
    C --> G[MemberList]
    C --> H[CommuneInfo]

    E --> I[useCommuneContext]
    F --> I
    G --> I
    H --> I

    B --> J[Data Layer]
    J --> K[React Query Cache]

    style B fill:#95e1d3
    style I fill:#95e1d3
    style J fill:#f38181
    style K fill:#f38181
\`\`\`

## Approaches and Tradeoffs

### Approach 1: React Context for Commune Data

**Description:**
Create a context provider to share commune data across all components:

\`\`\`typescript
// contexts/commune-context.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface CommuneContextValue {
  // Data
  commune: Commune | null;
  members: Member[];
  chores: Chore[];
  expenses: Expense[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error handling
  error: Error | null;

  // Actions
  refreshData: () => Promise<void>;
  refreshChores: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
}

const CommuneContext = createContext<CommuneContextValue | null>(null);

export function CommuneProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [state, setState] = useState<CommuneState>({
    commune: null,
    members: [],
    chores: [],
    expenses: [],
    isLoading: true,
    error: null,
  });

  // Fetch all data once
  useEffect(() => {
    if (address) {
      fetchAllData();
    }
  }, [address]);

  async function fetchAllData() {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Fetch in parallel
      const [communeData, expenseData, choreData] = await Promise.all([
        fetchCommune(address),
        fetchExpenses(communeId),
        fetchChores(communeId),
      ]);

      setState({
        commune: communeData.commune,
        members: communeData.members,
        expenses: expenseData,
        chores: choreData,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }

  const value = {
    ...state,
    refreshData: fetchAllData,
    refreshChores: () => fetchChores(state.commune?.id),
    refreshExpenses: () => fetchExpenses(state.commune?.id),
  };

  return (
    <CommuneContext.Provider value={value}>
      {children}
    </CommuneContext.Provider>
  );
}

export function useCommuneContext() {
  const context = useContext(CommuneContext);
  if (!context) {
    throw new Error('useCommuneContext must be used within CommuneProvider');
  }
  return context;
}

// Selective hooks for components that only need specific data
export function useCommune() {
  const { commune, isLoading, error } = useCommuneContext();
  return { commune, isLoading, error };
}

export function useMembers() {
  const { members, isLoading, error } = useCommuneContext();
  return { members, isLoading, error };
}

export function useChores() {
  const { chores, refreshChores, isLoading } = useCommuneContext();
  return { chores, refreshChores, isLoading };
}
\`\`\`

**Usage in Components:**

\`\`\`typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  // No more prop drilling!
  const { isLoading, error } = useCommuneContext();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div>
      <CommuneInfo /> {/* Gets data from context */}
      <MemberList /> {/* Gets data from context */}
      <ExpenseList /> {/* Gets data from context */}
    </div>
  );
}

// components/expense-list.tsx
export function ExpenseList() {
  const { expenses, refreshExpenses } = useCommuneContext();
  // No props needed!

  return (
    <div>
      {expenses.map(expense => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
\`\`\`

**Tradeoffs:**
- ✅ Eliminates prop drilling completely
- ✅ Single source of truth for commune data
- ✅ Coordinated loading states
- ✅ Easy to add new consumers
- ✅ Better testing (mock context)
- ❌ All components re-render when context changes (can be optimized)
- ❌ Requires wrapping app in provider
- ❌ Learning curve for context API
- ❌ Can be over-used leading to "provider hell"

**Optimization with useMemo:**

\`\`\`typescript
export function CommuneProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CommuneState>(initialState);

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      ...state,
      refreshData: fetchAllData,
      refreshChores: () => fetchChores(state.commune?.id),
      refreshExpenses: () => fetchExpenses(state.commune?.id),
    }),
    [state]
  );

  return (
    <CommuneContext.Provider value={value}>
      {children}
    </CommuneContext.Provider>
  );
}
\`\`\`

**Further Optimization with Split Contexts:**

\`\`\`typescript
// Split into multiple contexts to reduce re-renders
const CommuneDataContext = createContext<CommuneData | null>(null);
const CommuneActionsContext = createContext<CommuneActions | null>(null);

// Components only subscribe to data they need
// Actions don't cause re-renders since they're stable
\`\`\`

### Approach 2: Use React Query/TanStack Query

**Description:**
Leverage React Query for server state management:

\`\`\`typescript
// hooks/queries/use-commune-query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCommuneQuery(address: string) {
  return useQuery({
    queryKey: ['commune', address],
    queryFn: () => fetchCommune(address),
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
}

export function useExpensesQuery(communeId: number) {
  return useQuery({
    queryKey: ['expenses', communeId],
    queryFn: () => fetchExpenses(communeId),
    enabled: !!communeId,
    staleTime: 30 * 1000,
  });
}

export function useChoresQuery(communeId: number) {
  return useQuery({
    queryKey: ['chores', communeId],
    queryFn: () => fetchChores(communeId),
    enabled: !!communeId,
    staleTime: 30 * 1000,
  });
}

// Mutations with automatic refetch
export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.communeId] });
    },
  });
}

// Usage in components
export function ExpenseList() {
  const { commune } = useCommuneQuery(address);
  const { data: expenses, isLoading } = useExpensesQuery(commune?.id);
  const { mutate: createExpense } = useCreateExpenseMutation();

  // React Query handles caching, deduplication, and refetching
  return (/* ... */);
}
\`\`\`

**Advanced Features:**

\`\`\`typescript
// Optimistic updates
export function useMarkExpensePaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markExpensePaid,
    onMutate: async (expenseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['expenses']);

      // Optimistically update
      queryClient.setQueryData(['expenses'], (old: Expense[]) =>
        old.map(exp =>
          exp.id === expenseId ? { ...exp, isPaid: true } : exp
        )
      );

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['expenses'], context.previous);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
\`\`\`

**Tradeoffs:**
- ✅ Built-in caching and request deduplication
- ✅ Automatic background refetching
- ✅ Optimistic updates support
- ✅ Better loading and error states
- ✅ DevTools for debugging
- ✅ Request cancellation
- ✅ Retry logic built-in
- ✅ Pagination and infinite queries support
- ❌ Adds ~40KB to bundle
- ❌ Learning curve
- ❌ May conflict with existing wagmi QueryClient
- ❌ Requires refactoring all data hooks
- ❌ Another dependency to maintain

### Approach 3: Zustand for Global State

**Description:**
Use Zustand for lightweight global state management:

\`\`\`typescript
// stores/commune-store.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface CommuneStore {
  // State
  commune: Commune | null;
  members: Member[];
  chores: Chore[];
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchCommuneData: (address: string) => Promise<void>;
  addExpense: (expense: Expense) => void;
  updateChore: (id: number, updates: Partial<Chore>) => void;
  reset: () => void;
}

export const useCommuneStore = create<CommuneStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      commune: null,
      members: [],
      chores: [],
      expenses: [],
      isLoading: false,
      error: null,

      // Actions
      fetchCommuneData: async (address: string) => {
        set({ isLoading: true, error: null });
        try {
          const [communeData, expenses, chores] = await Promise.all([
            fetchCommune(address),
            fetchExpenses(address),
            fetchChores(address),
          ]);

          set({
            commune: communeData.commune,
            members: communeData.members,
            expenses,
            chores,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error as Error, isLoading: false });
        }
      },

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, expense],
        })),

      updateChore: (id, updates) =>
        set((state) => ({
          chores: state.chores.map((chore) =>
            chore.id === id ? { ...chore, ...updates } : chore
          ),
        })),

      reset: () =>
        set({
          commune: null,
          members: [],
          chores: [],
          expenses: [],
          isLoading: false,
          error: null,
        }),
    }),
    { name: 'CommuneStore' }
  )
);

// Selective subscriptions (performance optimization)
export const useCommune = () =>
  useCommuneStore((state) => state.commune);

export const useMembers = () =>
  useCommuneStore((state) => state.members);

export const useChores = () =>
  useCommuneStore((state) => ({
    chores: state.chores,
    updateChore: state.updateChore,
  }));

// Usage in components
export function ExpenseList() {
  const expenses = useCommuneStore((state) => state.expenses);
  const addExpense = useCommuneStore((state) => state.addExpense);

  // Only re-renders when expenses change
  return (/* ... */);
}
\`\`\`

**Tradeoffs:**
- ✅ Very lightweight (~3KB)
- ✅ Simple API, easy to learn
- ✅ No providers needed
- ✅ Selective subscriptions prevent re-renders
- ✅ DevTools support
- ✅ Works great with React Server Components
- ✅ TypeScript support
- ❌ No built-in data fetching
- ❌ No caching or request deduplication
- ❌ Manual cache invalidation
- ❌ Less ecosystem/middleware than Redux
- ❌ Still need to handle async logic

### Approach 4: Combine Context + React Query (Recommended)

**Description:**
Use React Query for server state and Context for UI state:

\`\`\`typescript
// contexts/ui-context.tsx
interface UIContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// For server state, use React Query
// hooks/queries/commune.ts
export function useCommuneQuery(address: string) {
  return useQuery({
    queryKey: ['commune', address],
    queryFn: () => fetchCommune(address),
  });
}

// Components
export function Dashboard() {
  // Server state from React Query
  const { data: commune } = useCommuneQuery(address);

  // UI state from Context
  const { activeTab, setActiveTab } = useUI();

  return (/* ... */);
}
\`\`\`

**Tradeoffs:**
- ✅ Clear separation: server state vs UI state
- ✅ Best tool for each job
- ✅ React Query handles data fetching
- ✅ Context handles UI state
- ✅ Most flexible approach
- ❌ Two state management solutions
- ❌ Need to understand both
- ❌ Most complex setup

### Approach 5: Status Quo with Improvements

**Description:**
Keep current architecture but make targeted improvements:

1. Reduce prop drilling by grouping props
2. Memoize expensive hooks
3. Add better loading state coordination

\`\`\`typescript
// Group related props
interface DashboardData {
  commune: Commune;
  members: Member[];
  chores: Chore[];
  expenses: Expense[];
}

// Single prop instead of many
<ExpenseList data={dashboardData} />

// Coordinate loading states
function useDashboardData() {
  const commune = useCommuneData();
  const expenses = useExpenseData();

  const isLoading = commune.isLoading || expenses.isLoading;
  const error = commune.error || expenses.error;

  return {
    data: {
      commune: commune.commune,
      members: commune.members,
      chores: commune.chores,
      expenses: expenses.expenses,
    },
    isLoading,
    error,
  };
}
\`\`\`

**Tradeoffs:**
- ✅ Minimal changes
- ✅ Low risk
- ✅ No new dependencies
- ❌ Doesn't solve root problems
- ❌ Still prop drilling
- ❌ Still duplicate state

## Recommended Implementation Plan

### Phase 1: Quick Wins (1-2 days)
1. Create shared transaction hook (eliminate duplication)
2. Group related props into objects
3. Coordinate loading states in a single hook
4. Add memoization to prevent unnecessary re-renders

### Phase 2: Context Migration (3-5 days)
1. Create CommuneContext
2. Migrate Dashboard page to use context
3. Migrate child components one by one
4. Remove prop drilling
5. Test thoroughly

### Phase 3: Consider React Query (Optional, 5-7 days)
1. Evaluate if benefits justify the effort
2. Set up React Query
3. Migrate one data fetching hook
4. Measure performance improvement
5. Decide whether to continue migration

## Comparison Matrix

| Feature | Context | React Query | Zustand | Hybrid | Status Quo |
|---------|---------|-------------|---------|--------|------------|
| Learning Curve | Low | Medium | Low | High | None |
| Bundle Size | 0KB | +40KB | +3KB | +40KB | 0KB |
| Developer Experience | Good | Excellent | Good | Excellent | Poor |
| Performance | Good* | Excellent | Excellent | Excellent | Poor |
| Caching | Manual | Automatic | Manual | Automatic | Manual |
| Refactoring Effort | Medium | High | Medium | High | None |
| Long-term Maintainability | Good | Excellent | Good | Excellent | Poor |
| **Recommendation** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |

*With proper memoization

## Conclusion

**Recommended Approach:** Start with Context (Approach 1), then evaluate React Query (Approach 4) once Context is working well.

This provides:
- Immediate benefits from eliminating prop drilling
- Lower risk than full React Query migration
- Option to add React Query later if needed
- Incremental improvement path
