import { PublicKey } from '@solana/web3.js'

// ── Token decimals ──────────────────────────────────────────────────
export const BRAIN_DECIMALS = 6
export const SOL_DECIMALS = 9

// ── Reward math precision (matches on-chain PRECISION constant) ─────
export const PRECISION = 1_000_000_000_000 // 1e12

// ── Multiplier tier thresholds (seconds) ────────────────────────────
// Pre-cliff: 0–7 days → 0x (no rewards)
// Tier 1: 7–30 days → 1x
// Tier 2: 30–90 days → 2x
// Tier 3: 90+ days → 3x
export const MULTIPLIER_THRESHOLDS = [
  { days: 7, seconds: 7 * 24 * 60 * 60, multiplier: 1 },
  { days: 30, seconds: 30 * 24 * 60 * 60, multiplier: 2 },
  { days: 90, seconds: 90 * 24 * 60 * 60, multiplier: 3 },
] as const

// ── Program addresses ───────────────────────────────────────────────
export const PROGRAM_ID = new PublicKey(
  '5o2uBwvKUy4oF78ziR4tEiqz59k7XBXuZBwiZFqCfca2'
)

export const BRAIN_MINT = new PublicKey(
  '7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS'
)

// ── PDA seeds (must match constants.rs in brain-staking program) ────
export const STAKING_POOL_SEED = Buffer.from('staking_pool')
export const STAKER_SEED = Buffer.from('staker')
export const BRAIN_VAULT_SEED = Buffer.from('brain_vault')
export const REWARD_VAULT_SEED = Buffer.from('reward_vault')
export const DLMM_EXIT_SEED = Buffer.from('dlmm_exit')
export const GOVERNANCE_CONFIG_SEED = Buffer.from('governance_config')
export const PROPOSAL_SEED = Buffer.from('proposal')
export const VOTE_RECORD_SEED = Buffer.from('vote')
