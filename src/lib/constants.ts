// Wallet & Token Addresses
export const BRAIN_TOKEN_MINT = '7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS'
export const TREASURY_WALLET = 'CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV'
export const BURN_SOURCE = 'G4vH7anfjEt7WXyT3eAzie3NZRE7ywdgKgcqLVkaHTA8'
export const BURN_DESTINATION = '1nc1nerator11111111111111111111111111111111'
export const DEV_WALLET = '7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf'
export const MARKETING_WALLET = '3KjchVv3grS5S8YP4NfJ8XbU5gCNm9Qq86FrnnVUEB6r'
export const LP_WALLET = 'GcNK263XZXW3omuVQpg2wc9Rs79TsGunknz8R378w3d8'
export const TEAM_WALLET = '' // To be configured when known

export const SOLANA_NETWORK = 'mainnet-beta' as const
export const SOL_MINT = 'So11111111111111111111111111111111111111112'

// Bags.fm Program IDs
export const BAGS_FEE_SHARE_V2 = 'FEE2tBhCKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK'
export const BAGS_API_BASE = 'https://public-api-v2.bags.fm/api/v1'
export const PAYOUT_THRESHOLD_SOL = 10

// API Configuration (server-side only — import in Route Handlers, not client components)
export const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
export const HELIUS_API_URL = `https://api-mainnet.helius-rpc.com/v0`
export const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so'
export const SOLSCAN_API_BASE = 'https://pro-api.solscan.io/v2.0'

// Free public endpoints (no API key needed)
export const SOL_RPC = 'https://api.mainnet-beta.solana.com'
export const JUPITER_PRICE_URL = 'https://api.jup.ag/price/v2'

// UI Constants
export const CHART_COLORS = {
  primary: '#d4f000',
  secondary: '#ff9e9e',
  muted: '#cccccc',
  background: '#0d0d0d',
  surface: '#1a1a1a',
} as const
