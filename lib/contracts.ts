import { ethers } from "ethers"

export const COMMUNE_OS_ADDRESS = "0x3b019bcfd1F76906136694D5C52Dbddb82648891" as `0x${string}`
export const BREAD_TOKEN_ADDRESS = "0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3" as `0x${string}`
export const COLLATERAL_MANAGER_ADDRESS = "0x61Ba220071184886710A8F2814B7c6eDecbcaA82" as `0x${string}`

export const RPC_URL = "https://gnosis-mainnet.g.alchemy.com/v2/Rr57Q41YGfkxYkx0kZp3EOQs86HatGGE"

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
]

export const COMMUNE_OS_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "collateralToken",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addChores",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "choreSchedules",
        type: "tuple[]",
        internalType: "struct ChoreSchedule[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "title",
            type: "string",
            internalType: "string",
          },
          {
            name: "frequency",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "startTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "deleted",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "choreScheduler",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ChoreScheduler",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "collateralManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract CollateralManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "communeRegistry",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract CommuneRegistry",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createCommune",
    inputs: [
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "collateralRequired",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "collateralAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "choreSchedules",
        type: "tuple[]",
        internalType: "struct ChoreSchedule[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "title",
            type: "string",
            internalType: "string",
          },
          {
            name: "frequency",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "startTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "deleted",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
      {
        name: "username",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createTask",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "budget",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "description",
        type: "string",
        internalType: "string",
      },
      {
        name: "dueDate",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "assignedTo",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "taskId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "disputeTask",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "taskId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "newAssignee",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "disputeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "taskManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract TaskManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCollateralBalance",
    inputs: [
      {
        name: "member",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneBasicInfo",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "communeData",
        type: "tuple",
        internalType: "struct Commune",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralRequired",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "collateralAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "members",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "memberCollaterals",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "memberUsernames",
        type: "string[]",
        internalType: "string[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneChores",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
      {
        name: "startDate",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "endDate",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "instances",
        type: "tuple[]",
        internalType: "struct ChoreInstance[]",
        components: [
          {
            name: "scheduleId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "title",
            type: "string",
            internalType: "string",
          },
          {
            name: "frequency",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "periodNumber",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "periodStart",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "periodEnd",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "assignedTo",
            type: "address",
            internalType: "address",
          },
          {
            name: "assignedToUsername",
            type: "string",
            internalType: "string",
          },
          {
            name: "completed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneDisputes",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "disputes",
        type: "tuple[]",
        internalType: "struct Dispute[]",
        components: [
          {
            name: "taskId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "proposedNewAssignee",
            type: "address",
            internalType: "address",
          },
          {
            name: "votesFor",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "votesAgainst",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum DisputeStatus",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneTasks",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
      {
        name: "monthStart",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "monthEnd",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "doneTasks",
        type: "tuple[]",
        internalType: "struct Task[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "communeId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "budget",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          {
            name: "assignedTo",
            type: "address",
            internalType: "address",
          },
          {
            name: "dueDate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "done",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "disputed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
      {
        name: "pendingTasks",
        type: "tuple[]",
        internalType: "struct Task[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "communeId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "budget",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          {
            name: "assignedTo",
            type: "address",
            internalType: "address",
          },
          {
            name: "dueDate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "done",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "disputed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
      {
        name: "disputedTasks",
        type: "tuple[]",
        internalType: "struct Task[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "communeId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "budget",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          {
            name: "assignedTo",
            type: "address",
            internalType: "address",
          },
          {
            name: "dueDate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "done",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "disputed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
      {
        name: "overdueTasks",
        type: "tuple[]",
        internalType: "struct Task[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "communeId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "budget",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          {
            name: "assignedTo",
            type: "address",
            internalType: "address",
          },
          {
            name: "dueDate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "done",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "disputed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneTasks",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Task[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "communeId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "budget",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          {
            name: "assignedTo",
            type: "address",
            internalType: "address",
          },
          {
            name: "dueDate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "done",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "disputed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneMembers",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneStatistics",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "commune",
        type: "tuple",
        internalType: "struct Commune",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralRequired",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "collateralAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "memberCount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "choreCount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "taskCount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentChores",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "schedules",
        type: "tuple[]",
        internalType: "struct ChoreSchedule[]",
        components: [
          {
            name: "id",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "title",
            type: "string",
            internalType: "string",
          },
          {
            name: "frequency",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "startTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "deleted",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
      {
        name: "periods",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "completed",
        type: "bool[]",
        internalType: "bool[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDisputeVoters",
    inputs: [
      {
        name: "disputeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "voters",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUsernames",
    inputs: [
      {
        name: "addresses",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "usernames",
        type: "string[]",
        internalType: "string[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "joinCommune",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "username",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "markChoreComplete",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "choreId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "period",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "markTaskDone",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "taskId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "memberRegistry",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract MemberRegistry",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeChore",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "choreId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeMember",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "memberAddress",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setChoreAssignee",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "choreId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "period",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "assignee",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "taskManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract TaskManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "voteOnDispute",
    inputs: [
      {
        name: "communeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "disputeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "support",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "votingModule",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract VotingModule",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "error",
    name: "InsufficientCollateral",
    inputs: [],
  },
  {
    type: "error",
    name: "NotAMember",
    inputs: [],
  },
]

export const MEMBER_REGISTRY_ABI = [
  {
    type: "function",
    name: "isNonceUsed",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
]

// Create provider and contract instance
const provider = new ethers.JsonRpcProvider(RPC_URL)
export const communeOSContract = new ethers.Contract(COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI, provider)

// Add isNonceUsed method manually since it's on MemberRegistry
communeOSContract.isNonceUsed = async (communeId: bigint, nonce: bigint) => {
  const memberRegistryAddress = await communeOSContract.memberRegistry()
  const memberRegistry = new ethers.Contract(memberRegistryAddress, MEMBER_REGISTRY_ABI, provider)
  return await memberRegistry.isNonceUsed(communeId, nonce)
}

// Add collateralManager method manually since it's on CommuneOS
communeOSContract.collateralManager = async () => {
  return await communeOSContract.collateralManager()
}

// Citizen Wallet Community Config
export const COMMUNITY_CONFIG = {
  alias: "bread",
  chain_id: 100,
  json: {
    ipfs: { url: "https://ipfs.internal.citizenwallet.xyz" },
    scan: { url: "https://gnosisscan.io", name: "Gnosis Explorer" },
    cards: {
      "100:0xBA861e2DABd8316cf11Ae7CdA101d110CF581f28": {
        type: "safe",
        address: "0xBA861e2DABd8316cf11Ae7CdA101d110CF581f28",
        chain_id: 100,
        instance_id: "cw-discord-1",
      },
    },
    chains: {
      "100": {
        id: 100,
        node: {
          url: "https://100.engine.citizenwallet.xyz",
          ws_url: "wss://100.engine.citizenwallet.xyz",
        },
      },
    },
    tokens: {
      "100:0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3": {
        name: "Breadchain Community Token",
        symbol: "BREAD",
        address: "0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3",
        chain_id: 100,
        decimals: 18,
        standard: "erc20",
      },
    },
    version: 5,
    community: {
      url: "https://breadchain.xyz/",
      logo: "https://assets.citizenwallet.xyz/wallet-config/_images/bread.svg",
      name: "Breadchain",
    },
  },
}
