"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { communeOSContract } from "@/lib/contracts"

export interface ChoreSchedule {
  id: string
  title: string
  frequency: number
  startTime: number
  deleted: boolean
}

export function useChoreSchedules(communeId: string) {
  const { address } = useWallet()
  const [schedules, setSchedules] = useState<ChoreSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshSchedules = useCallback(async () => {
    if (!communeId || !address) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      console.log("[use-chore-schedules] Fetching schedules for commune:", communeId)

      // Fetch current chore schedules from the contract
      const choreData = await communeOSContract.getCurrentChores(BigInt(communeId))

      console.log("[use-chore-schedules] Raw schedule data:", choreData)

      // Filter out deleted schedules and map to our interface
      const activeSchedules = choreData.schedules
        .filter((schedule: any) => !schedule.deleted)
        .map((schedule: any) => ({
          id: schedule.id.toString(),
          title: schedule.title,
          frequency: Number(schedule.frequency),
          startTime: Number(schedule.startTime),
          deleted: Boolean(schedule.deleted),
        }))

      console.log("[use-chore-schedules] Active schedules:", activeSchedules)
      setSchedules(activeSchedules)
      setError(null)
    } catch (err: any) {
      console.error("[use-chore-schedules] Error fetching chore schedules:", err)
      setError(err.message || "Failed to load chore schedules")
    } finally {
      setIsLoading(false)
    }
  }, [communeId, address])

  useEffect(() => {
    refreshSchedules()
  }, [refreshSchedules])

  return {
    schedules,
    isLoading,
    error,
    refreshSchedules,
  }
}
