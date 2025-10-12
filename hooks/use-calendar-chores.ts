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

      // Get first day of the month at midnight UTC
      const startDate = Math.floor(Date.UTC(year, month, 1, 0, 0, 0) / 1000)

      // Get last day of the month at 23:59:59 UTC
      // month + 1, 0 gives us the last day of the current month
      const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
      const endDate = Math.floor(Date.UTC(year, month, lastDayOfMonth, 23, 59, 59) / 1000)

      console.log("[v0] Fetching calendar chores for:", {
        year,
        month: month + 1, // Display as 1-12 for readability
        startDate,
        endDate,
        startDateReadable: new Date(startDate * 1000).toISOString(),
        endDateReadable: new Date(endDate * 1000).toISOString(),
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
