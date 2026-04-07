'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import { findStakingPool, findStakerAccount, findBrainVault, findRewardVault } from '@/lib/staking/pda'
import { BRAIN_MINT } from '@/lib/staking/constants'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SystemProgram } from '@solana/web3.js'
import BN from 'bn.js'

// ── Program error code → user-friendly message ──────────────────────────────

const PROGRAM_ERROR_MESSAGES: Record<number, string> = {
  6000: 'UNAUTHORIZED — ONLY POOL OWNER CAN PERFORM THIS ACTION',
  6001: 'STAKING POOL IS CURRENTLY PAUSED',
  6002: 'AMOUNT BELOW MINIMUM STAKE (100,000 BRAIN)',
  6003: 'NO REWARDS AVAILABLE TO CLAIM',
  6005: 'STAKE AMOUNT MUST BE GREATER THAN ZERO',
  6007: 'ACTIVE STAKE EXISTS — UNSTAKE FIRST TO RE-STAKE',
  6008: 'NO ACTIVE STAKE FOUND',
  6014: 'INSUFFICIENT REWARDS IN VAULT',
  6011: 'EXIT ALREADY ACTIVE FOR THIS ASSET/POOL PAIR',
  6012: 'EXIT IS NOT ACTIVE — CANNOT TERMINATE',
  6013: 'EXIT ALREADY COMPLETED',
}

/**
 * Maps an Anchor/wallet error into a user-friendly message string.
 * Checks program error codes first, then wallet rejection and SOL balance patterns.
 */
export function mapStakingError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)

  // Anchor program errors carry a numeric `code` property
  if (typeof (err as any)?.code === 'number') {
    const mapped = PROGRAM_ERROR_MESSAGES[(err as any).code]
    if (mapped) return mapped
  }

  // Also check the error message for code patterns (e.g. "custom program error: 0x1771")
  const hexMatch = message.match(/custom program error:\s*0x([0-9a-fA-F]+)/)
  if (hexMatch) {
    const code = parseInt(hexMatch[1], 16)
    const mapped = PROGRAM_ERROR_MESSAGES[code]
    if (mapped) return mapped
  }

  // Wallet rejection
  if (/user rejected|rejected/i.test(message)) {
    return 'TRANSACTION REJECTED BY WALLET'
  }

  // Insufficient SOL for fees
  if (/insufficient/i.test(message)) {
    return 'INSUFFICIENT SOL FOR TRANSACTION FEE'
  }

  return message
}

/** Query keys that should be invalidated after any staking mutation. */
function stakingQueryKeys(pubkey: string) {
  return [
    ['staker-account', pubkey],
    ['staking-pool-onchain'],
    ['staking-pool-overview'],
    ['brain-balance', pubkey],
  ]
}

// ── Stake Mutation ───────────────────────────────────────────────────────────

/**
 * Mutation hook that stakes BRAIN tokens into the staking pool.
 * Accepts `amount` as a BN (raw 6-decimal value).
 * Returns the transaction signature on success.
 */
export function useStakeMutation() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, { amount: BN }>({
    mutationFn: async ({ amount }) => {
      if (!program || !publicKey) throw new Error('Wallet not connected')

      const [stakingPool] = findStakingPool(program.programId)
      const [stakerAccount] = findStakerAccount(publicKey, program.programId)
      const [brainVault] = findBrainVault(program.programId)
      const userBrainAta = await getAssociatedTokenAddress(BRAIN_MINT, publicKey)

      try {
        const txSig = await (program.methods as any)
          .stake(amount)
          .accountsStrict({
            user: publicKey,
            stakingPool,
            stakerAccount,
            userBrainAta,
            brainVault,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc()

        return txSig as string
      } catch (err) {
        throw new Error(mapStakingError(err))
      }
    },
    onSuccess: () => {
      if (!publicKey) return
      const pubkey = publicKey.toBase58()
      for (const key of stakingQueryKeys(pubkey)) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}

// ── Unstake Mutation ─────────────────────────────────────────────────────────

/**
 * Mutation hook that unstakes all BRAIN tokens and auto-claims rewards (post-cliff).
 * Returns the transaction signature on success.
 */
export function useUnstakeMutation() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected')

      const [stakingPool] = findStakingPool(program.programId)
      const [stakerAccount] = findStakerAccount(publicKey, program.programId)
      const [brainVault] = findBrainVault(program.programId)
      const [rewardVault] = findRewardVault(program.programId)
      const userBrainAta = await getAssociatedTokenAddress(BRAIN_MINT, publicKey)

      try {
        const txSig = await (program.methods as any)
          .unstake()
          .accountsStrict({
            user: publicKey,
            stakingPool,
            stakerAccount,
            brainVault,
            userBrainAta,
            rewardVault,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc()

        return txSig as string
      } catch (err) {
        throw new Error(mapStakingError(err))
      }
    },
    onSuccess: () => {
      if (!publicKey) return
      const pubkey = publicKey.toBase58()
      for (const key of stakingQueryKeys(pubkey)) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}

// ── Claim Mutation ───────────────────────────────────────────────────────────

/**
 * Mutation hook that claims accrued SOL rewards.
 * Returns the transaction signature on success.
 */
export function useClaimMutation() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected')

      const [stakingPool] = findStakingPool(program.programId)
      const [stakerAccount] = findStakerAccount(publicKey, program.programId)
      const [rewardVault] = findRewardVault(program.programId)

      try {
        const txSig = await (program.methods as any)
          .claim()
          .accountsStrict({
            user: publicKey,
            stakingPool,
            stakerAccount,
            rewardVault,
            systemProgram: SystemProgram.programId,
          })
          .rpc()

        return txSig as string
      } catch (err) {
        throw new Error(mapStakingError(err))
      }
    },
    onSuccess: () => {
      if (!publicKey) return
      const pubkey = publicKey.toBase58()
      for (const key of stakingQueryKeys(pubkey)) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}
