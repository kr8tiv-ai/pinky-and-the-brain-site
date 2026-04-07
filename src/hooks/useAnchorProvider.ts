'use client'

import { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import type { AnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import idl from '@/lib/idl/brain_staking.json'

// Program ID from the IDL
const PROGRAM_ID = idl.address

const READ_ONLY_WALLET: AnchorWallet = {
  publicKey: PublicKey.default,
  signTransaction: async (tx: any) => tx,
  signAllTransactions: async (txs: any) => txs,
}

/**
 * Constructs an AnchorProvider + Program for reads and writes.
 *
 * - With a connected signing wallet: full read/write provider.
 * - Without a wallet: read-only provider so public on-chain reads still work.
 */
export function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const hasSigningWallet = Boolean(
    wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions
  )

  const provider = useMemo(() => {
    const anchorWallet: AnchorWallet = hasSigningWallet
      ? {
          publicKey: wallet.publicKey!,
          signTransaction: wallet.signTransaction!,
          signAllTransactions: wallet.signAllTransactions!,
        }
      : READ_ONLY_WALLET

    return new AnchorProvider(connection, anchorWallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    })
  }, [
    connection,
    hasSigningWallet,
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ])

  const program = useMemo(() => {
    // Anchor 0.31 Program constructor: new Program(idl, provider)
    // The IDL contains the program address.
    return new Program(idl as any, provider)
  }, [provider])

  return {
    provider,
    program,
    programId: PROGRAM_ID,
    connected: hasSigningWallet,
  }
}
