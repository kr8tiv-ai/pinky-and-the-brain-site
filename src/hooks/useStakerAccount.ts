'use client'

import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import { findStakerAccount } from '@/lib/staking/pda'

/**
 * React Query hook that fetches the connected wallet's StakerAccount PDA.
 * Returns null if the wallet has no active stake (account doesn't exist).
 * Requires a connected wallet.
 */
export function useStakerAccount() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()

  return useQuery({
    queryKey: ['staker-account', publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey) throw new Error('Program or wallet not available')

      const [stakerPda] = findStakerAccount(publicKey, program.programId)

      try {
        const staker = await (program.account as any).stakerAccount.fetch(stakerPda)
        return {
          owner: staker.owner.toBase58(),
          stakedAmount: staker.stakedAmount,
          stakeTimestamp: staker.stakeTimestamp.toNumber(),
          rewardDebt: staker.rewardDebt,
          pendingRewards: staker.pendingRewards,
          lastClaimTimestamp: staker.lastClaimTimestamp.toNumber(),
          currentMultiplier: staker.currentMultiplier,
          bump: staker.bump,
        }
      } catch (err: unknown) {
        // Account doesn't exist — user has no active stake
        const message = err instanceof Error ? err.message : String(err)
        if (
          message.includes('Account does not exist') ||
          message.includes('Could not find')
        ) {
          return null
        }
        throw err
      }
    },
    enabled: !!program && !!publicKey,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
