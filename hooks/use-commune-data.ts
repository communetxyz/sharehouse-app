"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { communeOSContract } from "@/lib/contracts"
import type { Commune, Member, ChoreInstance } from "@/types/commune"

export function useCommuneData() {
  const { address } = useWallet()
  const [commune, setCommune] = useState<Commune | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [chores, setChores] = useState<ChoreInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    if (!address) {
      setError("Please connect your wallet")
      setIsLoading(false)
      return
    }

    try {
      const now = new Date()

      // Get 7 days ago at 00:00:00
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      // Get 4 days from now at 23:59:59
      const fourDaysFromNow = new Date(now)
      fourDaysFromNow.setDate(now.getDate() + 4)
      fourDaysFromNow.setHours(23, 59, 59, 999)

      const startDate = Math.floor(sevenDaysAgo.getTime() / 1000)
      const endDate = Math.floor(fourDaysFromNow.getTime() / 1000)

      console.log("[v0] Fetching chores for date range:", {
        startDate,
        endDate,
        startDateReadable: new Date(startDate * 1000).toISOString(),
        endDateReadable: new Date(endDate * 1000).toISOString(),
      })

      // Fetch commune basic info
      const basicInfo = await communeOSContract.getCommuneBasicInfo(address)

      setCommune({
        id: basicInfo.communeId.toString(),
        name: basicInfo.communeData.name,
        creator: basicInfo.communeData.creator,
        collateralRequired: basicInfo.communeData.collateralRequired,
        collateralAmount: (Number(basicInfo.communeData.collateralAmount) / 1e18).toString(),
      })

      setMembers(
        basicInfo.members.map((addr: string, idx: number) => ({
          address: addr,
          collateral: (Number(basicInfo.memberCollaterals[idx]) / 1e18).toString(),
          isCurrentUser: addr.toLowerCase() === address.toLowerCase(),
        })),
      )

      // Fetch chores
      const choreData = await communeOSContract.getCommuneChores(address, BigInt(startDate), BigInt(endDate))

      console.log("[v0] Raw chore data from contract:", choreData)
      console.log("[v0] Number of chore instances:", choreData.instances.length)

      const processedChores = choreData.instances.map((instance: any) => {
        const chore = {
          scheduleId: instance.scheduleId.toString(),
          title: instance.title,
          frequency: Number(instance.frequency),
          periodNumber: instance.periodNumber.toString(),
          periodStart: Number(instance.periodStart),
          periodEnd: Number(instance.periodEnd),
          assignedTo: instance.assignedTo,
          completed: instance.completed,
          isAssignedToUser: instance.assignedTo.toLowerCase() === address.toLowerCase(),
        }

        console.log("[v0] Chore instance:", {
          scheduleId: chore.scheduleId,
          periodNumber: chore.periodNumber,
          title: chore.title,
          completed: chore.completed,
          assignedTo: chore.assignedTo,
          isAssignedToUser: chore.isAssignedToUser,
        })

        return chore
      })

      setChores(processedChores)

      const completedCount = processedChores.filter((c: ChoreInstance) => c.completed).length
      const uncompletedCount = processedChores.filter((c: ChoreInstance) => !c.completed).length
      const myCompletedCount = processedChores.filter((c: ChoreInstance) => c.completed && c.isAssignedToUser).length
      const myUncompletedCount = processedChores.filter((c: ChoreInstance) => !c.completed && c.isAssignedToUser).length

      console.log("[v0] Chore summary:", {
        total: processedChores.length,
        completed: completedCount,
        uncompleted: uncompletedCount,
        myCompleted: myCompletedCount,
        myUncompleted: myUncompletedCount,
      })

      setError(null)
    } catch (err: any) {
      console.error("Error fetching commune data:", err)
      setError(err.message || "Failed to load commune data")
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return {
    commune,
    members,
    chores,
    isLoading,
    error,
    refreshData,
  }
}
