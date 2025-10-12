"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { communeOSContract } from "@/lib/contracts"
import type { Expense } from "@/types/commune"

export function useExpenseData() {
  const { address } = useWallet()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshExpenses = useCallback(async () => {
    if (!address) {
      setError("Please connect your wallet")
      setIsLoading(false)
      return
    }

    try {
      const expenseData = await communeOSContract.getCommuneExpenses(address)

      setExpenses(
        expenseData.expenses.map((expense: any) => ({
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
  }, [address])

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
