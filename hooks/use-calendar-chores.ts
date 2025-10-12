"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { useCommuneData } from "./use-commune-data"
import { communeOSContract } from "@/lib/contracts"
import type { ChoreInstance } from "@/types/commune"

export function useCalendarChores(year: number, month: number) {
  const { address } = useWallet()
  const { commune } = useCommuneData()
  const [chores, setChores] = useState<ChoreInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshChores = useCallback(async () => {
    if (!address || !commune?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Get first day of the month at midnight
      const firstDay = new Date(year, month, 1)
      firstDay.setHours(0, 0, 0, 0)

      // Get last day of the month at 23:59:59
      const lastDay = new Date(year, month + 1, 0)
      lastDay.setHours(23, 59, 59, 999)

      const startDate = Math.floor(firstDay.getTime() / 1000)
      const endDate = Math.floor(lastDay.getTime() / 1000)

      console.log("[v0] Fetching calendar chores for:", {
        year,
        month: month + 1,
        firstDay: firstDay.toISOString(),
        lastDay: lastDay.toISOString(),
        startDate,
        endDate,
      })

      const choreData = await communeOSContract.getCommuneChores(address, BigInt(startDate), BigInt(endDate))

      const mappedChores = choreData.instances.map((instance: any) => ({
        scheduleId: instance.scheduleId.toString(),
        title: instance.title,
        frequency: Number(instance.frequency),
        periodNumber: instance.periodNumber.toString(),
        periodStart: Number(instance.periodStart),
        periodEnd: Number(instance.periodEnd),
        assignedTo: instance.assignedTo,
        completed: Boolean(instance.completed),
        isAssignedToUser: instance.assignedTo.toLowerCase() === address.toLowerCase(),
      }))

      console.log("[v0] Fetched", mappedChores.length, "chores for calendar")
      console.log(
        "[v0] Sample chore dates:",
        mappedChores.slice(0, 3).map((c) => ({
          title: c.title,
          periodStart: new Date(c.periodStart * 1000).toISOString(),
        })),
      )

      setChores(mappedChores)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching calendar chores:", err)
      setError(err.message || "Failed to load calendar chores")
    } finally {
      setIsLoading(false)
    }
  }, [address, commune?.id, year, month])

  useEffect(() => {
    refreshChores()
  }, [refreshChores])

  return {
    chores,
    isLoading,
    error,
    refreshChores,
  }
}
