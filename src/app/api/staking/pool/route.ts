import { NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { HELIUS_RPC_URL } from '@/lib/constants'
import idl from '@/lib/idl/brain_staking.json'

// PDA seeds — duplicated here to avoid importing Buffer-dependent
// constants module in a server route (keeps the import graph clean)
const STAKING_POOL_SEED = Buffer.from('staking_pool')
const REWARD_VAULT_SEED = Buffer.from('reward_vault')
const PROGRAM_ID = new PublicKey(idl.address)

export const revalidate = 15

export async function GET() {
  try {
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed')

    // Derive PDAs
    const [poolPda] = PublicKey.findProgramAddressSync(
      [STAKING_POOL_SEED],
      PROGRAM_ID
    )
    const [rewardVaultPda] = PublicKey.findProgramAddressSync(
      [REWARD_VAULT_SEED],
      PROGRAM_ID
    )

    // Create a read-only provider (no wallet needed for fetching)
    const provider = new AnchorProvider(
      connection,
      // Dummy wallet for read-only — AnchorProvider requires one
      // but we never sign anything in this route
      {
        publicKey: PublicKey.default,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      } as any,
      { commitment: 'confirmed' }
    )

    const program = new Program(idl as any, provider)
    const pool = await (program.account as any).stakingPool.fetch(poolPda)

    // Fetch reward vault SOL balance
    const rewardVaultBalance = await connection.getBalance(rewardVaultPda)

    return NextResponse.json(
      {
        totalStaked: pool.totalStaked.toString(),
        totalWeightedStake: pool.totalWeightedStake.toString(),
        rewardPerShare: pool.rewardPerShare.toString(),
        totalRewardsDistributed: pool.totalRewardsDistributed.toString(),
        protocolFeeBps: pool.protocolFeeBps,
        minStakeAmount: pool.minStakeAmount.toString(),
        isPaused: pool.isPaused,
        rewardVaultBalance: rewardVaultBalance.toString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        },
      }
    )
  } catch (err) {
    console.error('[staking/pool API]', err)
    return NextResponse.json(
      { error: 'Staking pool fetch failed' },
      { status: 500 }
    )
  }
}
