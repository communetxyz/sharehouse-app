"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { useCommuneData } from "./use-commune-data"
import { communeOSContract } from "@/lib/contracts"
import type { Expense } from "@/types/commune"

export function useExpenseData() {
  const { address } = useWallet()
  const { commune } = useCommuneData()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshExpenses = useCallback(async () => {
    if (!address || !commune?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const expenseData = await communeOSContract.getCommuneExpenses(BigInt(commune.id))

      setExpenses(
        expenseData.map((expense: any) => ({
          id: expense.id.toString(),
          communeId: expense.communeId.toString(),
          amount: (Number(expense.amount) / 1e18).toString(),
          description: expense.description,
          assignedTo: expense.assignedTo,
          dueDate: Number(expense.dueDate),
          paid: Boolean(expense.paid),
          disputed: Boolean(expense.disputed),
          isAssignedToUser: expense.assignedTo.toLowerCase() === address.toLowerCase(),
        })),
      )

      setError(null)
    } catch (err: any) {
      console.error("Error fetching expense data:", err)
      setError(err.message || "Failed to load expense data")
    } finally {
      setIsLoading(false)
    }
  }, [address, commune?.id])

  useEffect(() => {
    refreshExpenses()
  }, [refreshExpenses])

  return {
    expenses,
    isLoading,
    error,
    refreshExpenses,
  }
}
