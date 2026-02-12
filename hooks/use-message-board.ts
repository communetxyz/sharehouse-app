import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { MESSAGE_BOARD_ADDRESS, COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI } from "@/lib/contracts"

export interface Message {
  id: string
  communeId: string
  author: string
  content: string
  ipfsHash: string
  timestamp: number
  isPinned: boolean
  isDeleted: boolean
  parentId: string | null
}

const MESSAGE_BOARD_ABI = [
  {
    type: "function",
    name: "postMessage",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "content", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "replyToMessage",
    inputs: [
      { name: "parentId", type: "uint256" },
      { name: "content", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "editMessage",
    inputs: [
      { name: "messageId", type: "uint256" },
      { name: "newContent", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deleteMessage",
    inputs: [{ name: "messageId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pinMessage",
    inputs: [{ name: "messageId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpinMessage",
    inputs: [{ name: "messageId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMessage",
    inputs: [{ name: "messageId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "communeId", type: "uint256" },
          { name: "author", type: "address" },
          { name: "content", type: "string" },
          { name: "ipfsHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "isPinned", type: "bool" },
          { name: "isDeleted", type: "bool" },
          { name: "parentId", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMessages",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "communeId", type: "uint256" },
          { name: "author", type: "address" },
          { name: "content", type: "string" },
          { name: "ipfsHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "isPinned", type: "bool" },
          { name: "isDeleted", type: "bool" },
          { name: "parentId", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPinnedMessages",
    inputs: [{ name: "communeId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "communeId", type: "uint256" },
          { name: "author", type: "address" },
          { name: "content", type: "string" },
          { name: "ipfsHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "isPinned", type: "bool" },
          { name: "isDeleted", type: "bool" },
          { name: "parentId", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view",
  }
] as const

const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

export function useMessages(communeId?: string, limit: number = 50) {
  const { address } = useAccount()
  const [messages, setMessages] = useState<Message[]>([])
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read messages for commune
  const { data: messageData, refetch: refetchMessages } = useReadContract({
    address: MESSAGE_BOARD_ADDRESS,
    abi: MESSAGE_BOARD_ABI,
    functionName: "getMessages",
    args: communeId ? [BigInt(communeId), BigInt(0), BigInt(limit)] : undefined,
    query: {
      enabled: !!communeId
    }
  })

  // Read pinned messages
  const { data: pinnedData, refetch: refetchPinned } = useReadContract({
    address: MESSAGE_BOARD_ADDRESS,
    abi: MESSAGE_BOARD_ABI,
    functionName: "getPinnedMessages",
    args: communeId ? [BigInt(communeId)] : undefined,
    query: {
      enabled: !!communeId
    }
  })

  useEffect(() => {
    if (messageData) {
      const formattedMessages = messageData.map((message: any) => ({
        id: message.id.toString(),
        communeId: message.communeId.toString(),
        author: message.author,
        content: message.content,
        ipfsHash: message.ipfsHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' ? message.ipfsHash : '',
        timestamp: Number(message.timestamp),
        isPinned: message.isPinned,
        isDeleted: message.isDeleted,
        parentId: message.parentId === MAX_UINT256 ? null : message.parentId.toString()
      }))
      setMessages(formattedMessages)
    }
  }, [messageData])

  useEffect(() => {
    if (pinnedData) {
      const formattedPinned = pinnedData.map((message: any) => ({
        id: message.id.toString(),
        communeId: message.communeId.toString(),
        author: message.author,
        content: message.content,
        ipfsHash: message.ipfsHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' ? message.ipfsHash : '',
        timestamp: Number(message.timestamp),
        isPinned: message.isPinned,
        isDeleted: message.isDeleted,
        parentId: message.parentId === MAX_UINT256 ? null : message.parentId.toString()
      }))
      setPinnedMessages(formattedPinned)
    }
  }, [pinnedData])

  const refreshMessages = () => {
    refetchMessages()
    refetchPinned()
  }

  return {
    messages,
    pinnedMessages,
    isLoading,
    error,
    refreshMessages
  }
}

export function usePostMessage() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const postMessage = (communeId: string, content: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "postMessage",
      args: [BigInt(communeId), content],
    })
  }

  return {
    postMessage,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useReplyToMessage() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const replyToMessage = (communeId: string, parentId: string, content: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "replyToMessage",
      args: [BigInt(communeId), BigInt(parentId), content],
    })
  }

  return {
    replyToMessage,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useEditMessage() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const editMessage = (communeId: string, messageId: string, newContent: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "editMessage",
      args: [BigInt(communeId), BigInt(messageId), newContent],
    })
  }

  return {
    editMessage,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function useDeleteMessage() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const deleteMessage = (communeId: string, messageId: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "deleteMessage",
      args: [BigInt(communeId), BigInt(messageId)],
    })
  }

  return {
    deleteMessage,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}

export function usePinMessage() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const pinMessage = (communeId: string, messageId: string) => {
    writeContract({
      address: COMMUNE_OS_ADDRESS,
      abi: COMMUNE_OS_ABI,
      functionName: "pinMessage",
      args: [BigInt(communeId), BigInt(messageId)],
    })
  }

  return {
    pinMessage,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  }
}