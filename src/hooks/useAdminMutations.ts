'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import { findStakingPool, findDlmmExit } from '@/lib/staking/pda'
import { mapStakingError } from '@/hooks/useStakingMutations'
import type { DlmmExitData } from '@/hooks/useDlmmExits'

// ── Admin query keys to invalidate after owner actions ──────────────

function adminQueryKeys() {
  return [
    ['dlmm-exits'],
    ['staking-pool-overview'],
    ['staking-pool-onchain'],
  ]
}

// ── Emergency Halt Mutation ─────────────────────────────────────────

/**
 * Mutation hook that triggers an emergency halt on the staking pool.
 * Only callable by the pool owner (enforced on-chain).
 * Returns the transaction signature on success.
 */
export function useEmergencyHalt() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected')

      const [stakingPool] = findStakingPool(program.programId)

      try {
        const txSig = await (program.methods as any)
          .emergencyHalt()
          .accountsStrict({
            authority: publicKey,
            stakingPool,
          })
          .rpc()

        return txSig as string
      } catch (err) {
        throw new Error(mapStakingError(err))
      }
    },
    onSuccess: () => {
      for (const key of adminQueryKeys()) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}

// ── Resume Mutation ─────────────────────────────────────────────────

/**
 * Mutation hook that resumes the staking pool after an emergency halt.
 * Only callable by the pool owner (enforced on-chain).
 * Returns the transaction signature on success.
 */
export function useResume() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected')

      const [stakingPool] = findStakingPool(program.programId)

      try {
        const txSig = await (program.methods as any)
          .resume()
          .accountsStrict({
            authority: publicKey,
            stakingPool,
          })
          .rpc()

        return txSig as string
      } catch (err) {
        throw new Error(mapStakingError(err))
      }
    },
    onSuccess: () => {
      for (const key of adminQueryKeys()) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}

// ── Initiate Exit Mutation ────────────────────────────────────────

/**
 * Mutation hook that initiates a new DLMM exit tracking entry.
 * Accepts three PublicKey arguments: assetMint, dlmmPool, position.
 * Derives the DlmmExit PDA from [dlmm_exit, assetMint, dlmmPool].
 * Only callable by the pool owner (enforced on-chain).
 * Returns the transaction signature on success.
 */
export function useInitiateExit() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, { assetMint: PublicKey; dlmmPool: PublicKey; position: PublicKey }>({
    mutationFn: async (args) => {
      if (!program || !publicKey) throw new Error('Wallet not connected')

      const [stakingPool] = findStakingPool(program.programId)
      const [dlmmExit] = findDlmmExit(args.assetMint, args.dlmmPool, program.programId)

      try {
        const txSig = await (program.methods as any)
          .initiateExit(args.assetMint, args.dlmmPool, args.position)
          .accountsStrict({
            authority: publicKey,
            stakingPool,
            dlmmExit,
            systemProgram: SystemProgram.programId,
          })
          .rpc()

        return txSig as string
      } catch (err) {
        throw new Error(mapStakingError(err))
      }
    },
    onSuccess: () => {
      for (const key of adminQueryKeys()) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}

// ── Terminate Exit Mutation ───────────────────────────────────────

/**
 * Mutation hook that terminates an active DLMM exit.
 * Accepts a DlmmExitData object (from useDlmmExits) which contains
 * assetMint and dlmmPool as base58 strings used to derive the PDA.
 * Only callable by the pool owner (enforced on-chain).
 * Returns the transaction signature on success.
 */
export function useTerminateExit() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, { exit: DlmmExitData }>({
    mutationFn: async ({ exit }) => {
      if (!program || !publicKey) throw new Error('Wallet not connected')

      const [stakingPool] = findStakingPool(program.programId)
      const [dlmmExit] = findDlmmExit(
        new PublicKey(exit.assetMint),
        new PublicKey(exit.dlmmPool),
        program.programId
      )

      try {
        const txSig = await (program.methods as any)
          .terminateExit()
          .accountsStrict({
            authority: publicKey,
            stakingPool,
            dlmmExit,
          })
          .rpc()

        return txSig as string
      } catch (err) {
        throw new Error(mapStakingError(err))
      }
    },
    onSuccess: () => {
      for (const key of adminQueryKeys()) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}
