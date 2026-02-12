import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { EXPENSE_MANAGER_ADDRESS, COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"
import { formatEther, parseEther } from "viem"

export interface Expense {
  id: string
  communeId: string
  creator: string
  description: string
  amount: string
  hasAmount: boolean
  assignedTo: string[]
  isPaid: boolean
  createdAt: number
}

const EXPENSE_MANAGER_ABI = [
  {
    type: "function",
    name: "createExpense",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "description", type: "string" },
      { name: "assignedTo", type: "address[]" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createExpenseWithAmount",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "description", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "assignedTo", type: "address[]" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setExpenseAmount",
    inputs: [
      { name: "expenseId", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "markExpensePaid",
    inputs: [
      { name: "expenseId", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getExpense",
    inputs: [
      { name: "expenseId", type: "uint256" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "communeId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "description", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "hasAmount", type: "bool" },
          { name: "assignedTo", type: "address[]" },
          { name: "isPaid", type: "bool" },
          { name: "createdAt", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneExpenses",
    inputs: [
      { name: "communeId", type: "uint256" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "communeId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "description", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "hasAmount", type: "bool" },
          { name: "assignedTo", type: "address[]" },
          { name: "isPaid", type: "bool" },
          { name: "createdAt", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  }
] as const

export function useExpenses(communeId?: string) {
  const { address } = useAccount()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read expenses for commune
  const { data: expenseData, refetch: refetchExpenses } = useReadContract({
    address: EXPENSE_MANAGER_ADDRESS,
    abi: EXPENSE_MANAGER_ABI,
    functionName: "getCommuneExpenses",
    args: communeId ? [BigInt(communeId)] : undefined,
    query: {
      enabled: !!communeId
    }
  })

  useEffect(() => {
    if (expenseData) {
      const formattedExpenses = expenseData.map((expense: any) => ({
        id: expense.id.toString(),
        communeId: expense.communeId.toString(),
        creator: expense.creator,
        description: expense.description,
        amount: formatEther(expense.amount),
        hasAmount: expense.hasAmount,
        assignedTo: expense.assignedTo,
        isPaid: expense.isPaid,
        createdAt: Number(expense.createdAt)
      }))
      setExpenses(formattedExpenses)
    }
  }, [expenseData])

  const refreshExpenses = () => {
    refetchExpenses()
  }

  return {
    expenses,
    isLoading,
    error,
    refreshExpenses
  }
}

export function useCreateExpense() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createExpense = (communeId: string, description: string, assignedTo: string[], amount?: string) => {
    if (amount) {
      writeContract({
        address: COMMUNE_OS_ADDRESS,
        abi: COMMUNE_OS_ABI,
        functionName: "createExpenseWithAmount",
        args: [BigInt(communeId), description, parseEther(amount), assignedTo],
      })
    } else {
      writeContract({
        address: COMMUNE_OS_ADDRESS,
        abi: COMMUNE_OS_ABI,
        functionName: "createExpense",
        args: [BigInt(communeId), description, assignedTo],
      })
    }
  }

  return {
    createExpense,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useMarkExpensePaid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const markExpensePaid = (expenseId: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "markExpensePaid",
      args: [BigInt(expenseId)],
    })
  }

  return {
    markExpensePaid,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useSetExpenseAmount() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setExpenseAmount = (expenseId: string, amount: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "setExpenseAmount",
      args: [BigInt(expenseId), parseEther(amount)],
    })
  }

  return {
    setExpenseAmount,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}