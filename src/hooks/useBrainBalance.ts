'use client'

import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import { BRAIN_MINT } from '@/lib/staking/constants'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import BN from 'bn.js'

/**
 * React Query hook that fetches the connected wallet's BRAIN token balance.
 * Returns the balance as a raw BN (6-decimal amount).
 * Returns BN(0) if the ATA doesn't exist (user has never held BRAIN).
 */
export function useBrainBalance() {
  const { provider } = useAnchorProvider()
  const { publicKey } = useWallet()

  return useQuery({
    queryKey: ['brain-balance', publicKey?.toBase58()],
    queryFn: async (): Promise<BN> => {
      if (!provider || !publicKey) throw new Error('Provider or wallet not available')

      const ata = await getAssociatedTokenAddress(BRAIN_MINT, publicKey)

      try {
        const info = await provider.connection.getTokenAccountBalance(ata)
        return new BN(info.value.amount)
      } catch {
        // ATA doesn't exist — user has never held BRAIN or account is closed
        return new BN(0)
      }
    },
    enabled: !!provider && !!publicKey,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
