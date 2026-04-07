/**
 * PDA derivation functions for the Brain Staking program.
 * Follows the same pattern as frontend-pr/utils/governance.ts.
 * All seeds must match constants.rs in the on-chain program.
 */

import { PublicKey } from '@solana/web3.js'
import {
  PROGRAM_ID,
  STAKING_POOL_SEED,
  STAKER_SEED,
  BRAIN_VAULT_SEED,
  REWARD_VAULT_SEED,
  DLMM_EXIT_SEED,
  GOVERNANCE_CONFIG_SEED,
  PROPOSAL_SEED,
  VOTE_RECORD_SEED,
} from './constants'

function toU64Buffer(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError('value must be a non-negative integer')
  }

  const out = Buffer.alloc(8)
  out.writeBigUInt64LE(BigInt(value))
  return out
}

/** Derive the singleton StakingPool PDA. */
export function findStakingPool(
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([STAKING_POOL_SEED], programId)
}

/** Derive a StakerAccount PDA from the user's wallet. */
export function findStakerAccount(
  user: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [STAKER_SEED, user.toBuffer()],
    programId
  )
}

/** Derive the BRAIN token vault PDA (holds staked BRAIN). */
export function findBrainVault(
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([BRAIN_VAULT_SEED], programId)
}

/** Derive the SOL reward vault PDA (SystemAccount holding SOL rewards). */
export function findRewardVault(
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([REWARD_VAULT_SEED], programId)
}

/** Derive a DlmmExit PDA from asset mint and DLMM pool addresses. */
export function findDlmmExit(
  assetMint: PublicKey,
  dlmmPool: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [DLMM_EXIT_SEED, assetMint.toBuffer(), dlmmPool.toBuffer()],
    programId
  )
}

/** Derive the singleton GovernanceConfig PDA. */
export function findGovernanceConfig(
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([GOVERNANCE_CONFIG_SEED], programId)
}

/** Derive a Proposal PDA from staking pool + proposal id. */
export function findProposal(
  proposalId: number,
  poolKey: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [PROPOSAL_SEED, poolKey.toBuffer(), toU64Buffer(proposalId)],
    programId
  )
}

/** Derive a VoteRecord PDA from proposal id + voter wallet. */
export function findVoteRecord(
  proposalId: number,
  voter: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VOTE_RECORD_SEED, toU64Buffer(proposalId), voter.toBuffer()],
    programId
  )
}
