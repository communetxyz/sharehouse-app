import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { GUEST_MANAGER_ADDRESS, COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"

export interface GuestInvite {
  id: string
  communeId: string
  host: string
  guestName: string
  arrivalTime: number
  departureTime: number
  reason: string
  status: InviteStatus
  approvals: number
}

export interface GuestPolicy {
  maxGuestsAtOnce: number
  maxDurationSeconds: number
  requireApproval: boolean
  approvalThreshold: number
}

export enum InviteStatus {
  Pending = 0,
  Approved = 1,
  Active = 2,
  Completed = 3,
  Cancelled = 4
}

const GUEST_MANAGER_ABI = [
  {
    type: "function",
    name: "createGuestInvite",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "guestName", type: "string" },
      { name: "arrival", type: "uint256" },
      { name: "departure", type: "uint256" },
      { name: "reason", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approveGuest",
    inputs: [{ name: "inviteId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelInvite",
    inputs: [{ name: "inviteId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "checkInGuest",
    inputs: [{ name: "inviteId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "checkOutGuest",
    inputs: [{ name: "inviteId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "extendStay",
    inputs: [
      { name: "inviteId", type: "uint256" },
      { name: "newDeparture", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getCommuneGuests",
    inputs: [{ name: "communeId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "communeId", type: "uint256" },
          { name: "host", type: "address" },
          { name: "guestName", type: "string" },
          { name: "arrivalTime", type: "uint256" },
          { name: "departureTime", type: "uint256" },
          { name: "reason", type: "string" },
          { name: "status", type: "uint8" },
          { name: "approvals", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getGuestPolicy",
    inputs: [{ name: "communeId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "maxGuestsAtOnce", type: "uint256" },
          { name: "maxDurationSeconds", type: "uint256" },
          { name: "requireApproval", type: "bool" },
          { name: "approvalThreshold", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  }
] as const

export function useGuests(communeId?: string) {
  const { address } = useAccount()
  const [guests, setGuests] = useState<GuestInvite[]>([])
  const [guestPolicy, setGuestPolicy] = useState<GuestPolicy | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read guests for commune
  const { data: guestData, refetch: refetchGuests } = useReadContract({
    address: GUEST_MANAGER_ADDRESS,
    abi: GUEST_MANAGER_ABI,
    functionName: "getCommuneGuests",
    args: communeId ? [BigInt(communeId)] : undefined,
    query: {
      enabled: !!communeId
    }
  })

  // Read guest policy
  const { data: policyData, refetch: refetchPolicy } = useReadContract({
    address: GUEST_MANAGER_ADDRESS,
    abi: GUEST_MANAGER_ABI,
    functionName: "getGuestPolicy",
    args: communeId ? [BigInt(communeId)] : undefined,
    query: {
      enabled: !!communeId
    }
  })

  useEffect(() => {
    if (guestData) {
      const formattedGuests = guestData.map((guest: any) => ({
        id: guest.id.toString(),
        communeId: guest.communeId.toString(),
        host: guest.host,
        guestName: guest.guestName,
        arrivalTime: Number(guest.arrivalTime),
        departureTime: Number(guest.departureTime),
        reason: guest.reason,
        status: guest.status,
        approvals: Number(guest.approvals)
      }))
      setGuests(formattedGuests)
    }
  }, [guestData])

  useEffect(() => {
    if (policyData) {
      setGuestPolicy({
        maxGuestsAtOnce: Number(policyData.maxGuestsAtOnce),
        maxDurationSeconds: Number(policyData.maxDurationSeconds),
        requireApproval: policyData.requireApproval,
        approvalThreshold: Number(policyData.approvalThreshold)
      })
    }
  }, [policyData])

  const refreshGuests = () => {
    refetchGuests()
    refetchPolicy()
  }

  return {
    guests,
    guestPolicy,
    isLoading,
    error,
    refreshGuests
  }
}

export function useCreateGuestInvite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createGuestInvite = (
    communeId: string, 
    guestName: string, 
    arrivalTime: Date, 
    departureTime: Date, 
    reason: string
  ) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "createGuestInvite",
      args: [
        BigInt(communeId), 
        guestName, 
        BigInt(Math.floor(arrivalTime.getTime() / 1000)), 
        BigInt(Math.floor(departureTime.getTime() / 1000)), 
        reason
      ],
    })
  }

  return {
    createGuestInvite,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useApproveGuest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const approveGuest = (inviteId: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "approveGuest",
      args: [BigInt(inviteId)],
    })
  }

  return {
    approveGuest,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useCheckInGuest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const checkInGuest = (inviteId: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "checkInGuest",
      args: [BigInt(inviteId)],
    })
  }

  return {
    checkInGuest,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useCheckOutGuest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const checkOutGuest = (inviteId: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "checkOutGuest",
      args: [BigInt(inviteId)],
    })
  }

  return {
    checkOutGuest,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}