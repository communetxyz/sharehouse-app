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
      // Get current month start and end timestamps
      const now = new Date()
      const startDate = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000)
      const endDate = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000)

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

      setChores(
        choreData.instances.map((instance: any) => ({
          scheduleId: instance.scheduleId.toString(),
          title: instance.title,
          frequency: Number(instance.frequency),
          periodNumber: instance.periodNumber.toString(),
          periodStart: Number(instance.periodStart),
          periodEnd: Number(instance.periodEnd),
          assignedTo: instance.assignedTo,
          completed: instance.completed,
          isAssignedToUser: instance.assignedTo.toLowerCase() === address.toLowerCase(),
        })),
      )

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
