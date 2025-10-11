import { ethers } from "ethers"

export const COMMUNE_OS_ADDRESS = "0x7D9E1d5AEE1a873AD2C49925b410382d3CAB4ccC"

export const BREAD_TOKEN_ADDRESS = "0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3"
export const COLLATERAL_MANAGER_ADDRESS = "0x61Ba220071184886710A8F2814B7c6eDecbcaA82"

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
    type: "function",
    name: "joinCommune",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getCommuneBasicInfo",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "communeId", type: "uint256" },
      {
        name: "communeData",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "creator", type: "address" },
          { name: "collateralRequired", type: "bool" },
          { name: "collateralAmount", type: "uint256" },
        ],
      },
      { name: "members", type: "address[]" },
      { name: "memberCollaterals", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneChores",
    inputs: [
      { name: "user", type: "address" },
      { name: "startDate", type: "uint256" },
      { name: "endDate", type: "uint256" },
    ],
    outputs: [
      { name: "communeId", type: "uint256" },
      {
        name: "instances",
        type: "tuple[]",
        components: [
          { name: "scheduleId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "frequency", type: "uint256" },
          { name: "periodNumber", type: "uint256" },
          { name: "periodStart", type: "uint256" },
          { name: "periodEnd", type: "uint256" },
          { name: "assignedTo", type: "address" },
          { name: "completed", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCommuneStatistics",
    inputs: [{ name: "communeId", type: "uint256" }],
    outputs: [
      {
        name: "commune",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "creator", type: "address" },
          { name: "collateralRequired", type: "bool" },
          { name: "collateralAmount", type: "uint256" },
        ],
      },
      { name: "memberCount", type: "uint256" },
      { name: "choreCount", type: "uint256" },
      { name: "expenseCount", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "markChoreComplete",
    inputs: [
      { name: "communeId", type: "uint256" },
      { name: "choreId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "memberRegistry",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
]

// Create provider and contract instance
const provider = new ethers.JsonRpcProvider(RPC_URL)
export const communeOSContract = new ethers.Contract(COMMUNE_OS_ADDRESS, COMMUNE_OS_ABI, provider)

// Add isNonceUsed method manually since it's on MemberRegistry
communeOSContract.isNonceUsed = async (communeId: bigint, nonce: bigint) => {
  const memberRegistryAddress = await communeOSContract.memberRegistry()
  const memberRegistry = new ethers.Contract(
    memberRegistryAddress,
    [
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
    ],
    provider,
  )
  return await memberRegistry.isNonceUsed(communeId, nonce)
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
