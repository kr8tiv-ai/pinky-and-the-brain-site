import { NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { HELIUS_RPC_URL } from '@/lib/constants'
import idl from '@/lib/idl/brain_staking.json'

const PROGRAM_ID = new PublicKey(idl.address)

export const revalidate = 15

export async function GET() {
  try {
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed')

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
    const exits = await (program.account as any).dlmmExit.all()

    const serialized = exits.map((exit: any) => {
      const account = exit.account ?? {}
      const rawProposalId = account.proposalId

      let proposalId = '0'
      if (rawProposalId == null) {
        console.warn('[staking/exits API] Missing proposalId; defaulting to 0', {
          exit: exit.publicKey?.toBase58?.() ?? 'unknown',
        })
      } else {
        const candidate =
          typeof rawProposalId === 'bigint'
            ? rawProposalId.toString()
            : typeof rawProposalId?.toString === 'function'
              ? rawProposalId.toString()
              : String(rawProposalId)

        try {
          const parsed = BigInt(candidate)
          if (parsed < BigInt(0)) {
            throw new Error('proposalId must be non-negative')
          }
          proposalId = parsed.toString()
        } catch {
          throw new Error(
            `Invalid proposalId value for exit ${exit.publicKey.toBase58()}: ${candidate}`
          )
        }
      }

      return {
        pool: account.pool.toBase58(),
        owner: account.owner.toBase58(),
        assetMint: account.assetMint.toBase58(),
        dlmmPool: account.dlmmPool.toBase58(),
        position: account.position.toBase58(),
        totalSolClaimed: account.totalSolClaimed.toString(),
        status: account.status,
        createdAt: account.createdAt,
        completedAt: account.completedAt,
        proposalId,
        bump: account.bump,
        publicKey: exit.publicKey.toBase58(),
      }
    })

    return NextResponse.json(serialized, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    console.error('[staking/exits API]', err)
    return NextResponse.json(
      { error: 'DLMM exits fetch failed' },
      { status: 500 }
    )
  }
}
