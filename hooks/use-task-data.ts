"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { useCommuneData } from "./use-commune-data"
import { communeOSContract } from "@/lib/contracts"
import type { Task } from "@/types/commune"

export function useTaskData() {
  const { address } = useWallet()
  const { commune, members } = useCommuneData()
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
      console.log("[use-task-data] Fetching tasks for commune:", commune.id)
      const taskData = await communeOSContract.getCommuneTasks(BigInt(commune.id))
      console.log("[use-task-data] Raw task data from contract:", taskData)

      const mappedTasks = taskData.map((task: any) => ({
        id: task.id.toString(),
        communeId: task.communeId.toString(),
        budget: (Number(task.budget) / 1e18).toString(),
        description: task.description,
        assignedTo: task.assignedTo,
        assignedToUsername: members.find(m => m.address.toLowerCase() === task.assignedTo.toLowerCase())?.username || task.assignedTo,
        dueDate: Number(task.dueDate),
        done: Boolean(task.done),
        disputed: Boolean(task.disputed),
        isAssignedToUser: task.assignedTo.toLowerCase() === address.toLowerCase(),
      }))

      console.log("[use-task-data] Mapped tasks:", mappedTasks)
      setTasks(mappedTasks)

      setError(null)
    } catch (err: any) {
      console.error("Error fetching task data:", err)
      setError(err.message || "Failed to load task data")
    } finally {
      setIsLoading(false)
    }
  }, [address, commune?.id, members])

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
