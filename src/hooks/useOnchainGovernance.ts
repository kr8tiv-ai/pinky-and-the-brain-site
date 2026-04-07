'use client'

import { useMemo } from 'react'
import { BN } from '@coral-xyz/anchor'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import { BRAIN_MINT } from '@/lib/staking/constants'
import {
  findDlmmExit,
  findGovernanceConfig,
  findProposal,
  findStakerAccount,
  findStakingPool,
  findVoteRecord,
} from '@/lib/staking/pda'

export const GOVERNANCE_PROPOSAL_STATUS = {
  Active: 0,
  Passed: 1,
  Rejected: 2,
  Cancelled: 3,
} as const

export interface GovernanceConfigData {
  nextProposalId: number
  autoExecute: boolean
  minQuorumBps: number
}

export interface GovernanceProposalData {
  id: number
  proposer: string
  title: string
  descriptionUri: string
  proposalType: number
  options: string[]
  voteCounts: bigint[]
  votingStarts: number
  votingEnds: number
  status: number
  totalVoteWeight: bigint
  winningOptionIndex: number
  executed: boolean
}

export interface VoteRecordData {
  proposalId: number
  optionIndex: number
  weight: bigint
  votedAt: number
}

interface GovernanceError extends Error {
  code?: string
}

const GOVERNANCE_ERRORS: Record<number, string> = {
  6000: 'UNAUTHORIZED — OWNER AUTHORITY REQUIRED',
  6001: 'POOL IS PAUSED — GOVERNANCE ACTIONS LOCKED',
}

function toInt(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (value && BN.isBN(value)) return (value as BN).toNumber()
  return Number(value ?? 0)
}

function toBig(value: unknown): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(Math.max(0, Math.trunc(value)))
  if (value && BN.isBN(value)) return BigInt((value as BN).toString())
  return BigInt(0)
}

function mapGovernanceError(error: unknown): GovernanceError {
  const message = error instanceof Error ? error.message : String(error)

  const hexMatch = message.match(/custom program error:\s*0x([0-9a-fA-F]+)/)
  if (hexMatch) {
    const code = parseInt(hexMatch[1], 16)
    const mapped = GOVERNANCE_ERRORS[code]
    if (mapped) {
      const e = new Error(mapped) as GovernanceError
      e.code = `PROGRAM_${code}`
      return e
    }
  }

  if (/user rejected|rejected/i.test(message)) {
    const e = new Error('TRANSACTION REJECTED IN WALLET') as GovernanceError
    e.code = 'WALLET_REJECTED'
    return e
  }

  if (/Wallet not connected|not connected/i.test(message)) {
    const e = new Error('CONNECT WALLET TO SUBMIT GOVERNANCE TRANSACTIONS') as GovernanceError
    e.code = 'WALLET_REQUIRED'
    return e
  }

  if (/insufficient/i.test(message)) {
    const e = new Error('INSUFFICIENT SOL FOR TRANSACTION FEES') as GovernanceError
    e.code = 'INSUFFICIENT_SOL'
    return e
  }

  return new Error(message) as GovernanceError
}

function normalizeProposal(account: any): GovernanceProposalData {
  return {
    id: toInt(account.id),
    proposer: account.proposer.toBase58(),
    title: account.title,
    descriptionUri: account.descriptionUri,
    proposalType: toInt(account.proposalType),
    options: Array.isArray(account.options) ? account.options : [],
    voteCounts: Array.isArray(account.voteCounts) ? account.voteCounts.map((value: unknown) => toBig(value)) : [],
    votingStarts: toInt(account.votingStarts),
    votingEnds: toInt(account.votingEnds),
    status: toInt(account.status),
    totalVoteWeight: toBig(account.totalVoteWeight),
    winningOptionIndex: toInt(account.winningOptionIndex),
    executed: Boolean(account.executed),
  }
}

export function useGovernanceConfig() {
  const { program } = useAnchorProvider()

  return useQuery<GovernanceConfigData | null, Error>({
    queryKey: ['governance', 'config'],
    queryFn: async () => {
      if (!program) return null
      const [governanceConfig] = findGovernanceConfig(program.programId)

      try {
        const config = await (program.account as any).governanceConfig.fetch(governanceConfig)
        return {
          nextProposalId: toInt(config.nextProposalId),
          autoExecute: Boolean(config.autoExecute),
          minQuorumBps: toInt(config.minQuorumBps),
        }
      } catch {
        return null
      }
    },
    enabled: !!program,
    staleTime: 15_000,
  })
}

export function useGovernanceProposals() {
  const { program } = useAnchorProvider()

  return useQuery<GovernanceProposalData[], Error>({
    queryKey: ['governance', 'proposals'],
    queryFn: async () => {
      if (!program) return []
      const accounts = await (program.account as any).proposal.all()

      return accounts
        .map((row: any) => normalizeProposal(row.account))
        .sort((a: GovernanceProposalData, b: GovernanceProposalData) => b.id - a.id)
    },
    enabled: !!program,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useGovernanceVoteRecord(proposalId: number) {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()

  return useQuery<VoteRecordData | null, Error>({
    queryKey: ['governance', 'vote-record', proposalId, publicKey?.toBase58() ?? 'anon'],
    queryFn: async () => {
      if (!program || !publicKey) return null
      const [voteRecordPda] = findVoteRecord(proposalId, publicKey, program.programId)

      try {
        const voteRecord = await (program.account as any).voteRecord.fetch(voteRecordPda)
        return {
          proposalId: toInt(voteRecord.proposalId),
          optionIndex: toInt(voteRecord.optionIndex),
          weight: toBig(voteRecord.weight),
          votedAt: toInt(voteRecord.votedAt),
        }
      } catch {
        return null
      }
    },
    enabled: !!program && !!publicKey,
    staleTime: 15_000,
  })
}

export function useCreateGovernanceProposal() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, {
    title: string
    descriptionUri: string
    proposalType: number
    options: string[]
    votingStarts: number
    votingEnds: number
  }>({
    mutationFn: async (args) => {
      if (!program || !publicKey) {
        throw new Error('Wallet not connected')
      }

      try {
        const [stakingPool] = findStakingPool(program.programId)
        const [governanceConfig] = findGovernanceConfig(program.programId)
        const config = await (program.account as any).governanceConfig.fetch(governanceConfig)
        const proposalId = toInt(config.nextProposalId)
        const [proposal] = findProposal(proposalId, stakingPool, program.programId)

        return await (program.methods as any)
          .createProposal(
            args.title,
            args.descriptionUri,
            args.proposalType,
            args.options,
            new BN(args.votingStarts),
            new BN(args.votingEnds)
          )
          .accountsStrict({
            owner: publicKey,
            stakingPool,
            governanceConfig,
            proposal,
            systemProgram: SystemProgram.programId,
          })
          .rpc()
      } catch (error) {
        throw mapGovernanceError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] })
      queryClient.invalidateQueries({ queryKey: ['governance', 'config'] })
    },
  })
}

export function useCastGovernanceVote() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, { proposalId: number; optionIndex: number }>({
    mutationFn: async ({ proposalId, optionIndex }) => {
      if (!program || !publicKey) {
        throw new Error('Wallet not connected')
      }

      try {
        const [stakingPool] = findStakingPool(program.programId)
        const [governanceConfig] = findGovernanceConfig(program.programId)
        const [proposal] = findProposal(proposalId, stakingPool, program.programId)
        const [voteRecord] = findVoteRecord(proposalId, publicKey, program.programId)
        const voterBrainAta = await getAssociatedTokenAddress(BRAIN_MINT, publicKey)

        let stakerAccount: PublicKey | null = null
        const [stakerPda] = findStakerAccount(publicKey, program.programId)
        try {
          await (program.account as any).stakerAccount.fetch(stakerPda)
          stakerAccount = stakerPda
        } catch {
          stakerAccount = null
        }

        return await (program.methods as any)
          .castVote(optionIndex)
          .accountsStrict({
            voter: publicKey,
            stakingPool,
            governanceConfig,
            proposal,
            voteRecord,
            voterBrainAta,
            stakerAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc()
      } catch (error) {
        throw mapGovernanceError(error)
      }
    },
    onSuccess: (_sig, args) => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] })
      queryClient.invalidateQueries({ queryKey: ['governance', 'vote-record', args.proposalId] })
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposal', args.proposalId] })
    },
  })
}

export function useGovernanceInitiateExit() {
  const { program } = useAnchorProvider()
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, {
    proposalId: number
    assetMint: PublicKey
    dlmmPool: PublicKey
    position: PublicKey
  }>({
    mutationFn: async (args) => {
      if (!program || !publicKey) {
        throw new Error('Wallet not connected')
      }

      try {
        const [stakingPool] = findStakingPool(program.programId)
        const [governanceConfig] = findGovernanceConfig(program.programId)
        const [proposal] = findProposal(args.proposalId, stakingPool, program.programId)
        const [dlmmExit] = findDlmmExit(args.assetMint, args.dlmmPool, program.programId)

        return await (program.methods as any)
          .governanceInitiateExit(args.assetMint, args.dlmmPool, args.position)
          .accountsStrict({
            authority: publicKey,
            stakingPool,
            governanceConfig,
            proposal,
            dlmmExit,
            systemProgram: SystemProgram.programId,
          })
          .rpc()
      } catch (error) {
        throw mapGovernanceError(error)
      }
    },
    onSuccess: (_sig, args) => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] })
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposal', args.proposalId] })
      queryClient.invalidateQueries({ queryKey: ['dlmm-exits'] })
      queryClient.invalidateQueries({ queryKey: ['staking-pool-overview'] })
    },
  })
}

export function useGovernanceDiagnostics() {
  const proposalsQuery = useGovernanceProposals()
  const configQuery = useGovernanceConfig()

  const staleMs = useMemo(() => {
    if (!proposalsQuery.dataUpdatedAt) return Number.POSITIVE_INFINITY
    return Date.now() - proposalsQuery.dataUpdatedAt
  }, [proposalsQuery.dataUpdatedAt, proposalsQuery.data])

  return {
    proposalsQuery,
    configQuery,
    staleMs,
    isStale: Number.isFinite(staleMs) && staleMs > 90_000,
  }
}
