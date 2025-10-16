"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { useCommuneData } from "./use-commune-data"
import { communeOSContract } from "@/lib/contracts"
import type { Task } from "@/types/commune"

export function useCalendarTasks() {
  const { address } = useWallet()
  const { commune } = useCommuneData()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTasks = useCallback(async () => {
    if (!address || !commune?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const taskData = await communeOSContract.getCommuneTasks(BigInt(commune.id))

      setTasks(
        taskData.map((task: any) => ({
          id: task.id.toString(),
          communeId: task.communeId.toString(),
          amount: (Number(task.amount) / 1e18).toString(),
          description: task.description,
          assignedTo: task.assignedTo,
          dueDate: Number(task.dueDate),
          done: Boolean(task.done),
          disputed: Boolean(task.disputed),
          isAssignedToUser: task.assignedTo.toLowerCase() === address.toLowerCase(),
        })),
      )

      setError(null)
    } catch (err: any) {
      console.error("Error fetching calendar tasks:", err)
      setError(err.message || "Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }, [address, commune?.id])

  useEffect(() => {
    refreshTasks()
  }, [refreshTasks])

  return {
    tasks,
    isLoading,
    error,
    refreshTasks,
  }
}
