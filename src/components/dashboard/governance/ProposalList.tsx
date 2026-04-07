'use client'

import { useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useGovernanceVoteRecord, type GovernanceProposalData } from '@/hooks/useOnchainGovernance'
import {
  executeEligibilityLabel,
  getProposalPresentation,
  validateVoteOptionIndex,
} from './model'
import { RadialVoteWheel } from '../visualizations'

const VOTE_COLORS = [
  '#d4f000', '#4a90e2', '#ff9e9e', '#00d4aa', '#c084fc',
  '#e4ff57', '#ff6b35', '#87ceeb', '#ffadad', '#a8e6cf',
]

interface ProposalListProps {
  proposals: GovernanceProposalData[]
  walletConnected: boolean
  isOwner: boolean
  onConnectWallet: () => void
  votePending: boolean
  executePending: boolean
  onVote: (proposalId: number, optionIndex: number) => Promise<unknown>
  onExecute: (payload: {
    proposalId: number
    assetMint: PublicKey
    dlmmPool: PublicKey
    position: PublicKey
  }) => Promise<unknown>
}

function toPercent(value: bigint, total: bigint): string {
  if (total <= BigInt(0)) return '0.0%'
  const scaled = (value * BigInt(10_000)) / total
  const asNumber = Number(scaled) / 100
  return `${asNumber.toFixed(1)}%`
}

function formatVoteWeight(value: bigint): string {
  const asNumber = Number(value > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : value)
  if (asNumber >= 1_000_000) return `${(asNumber / 1_000_000).toFixed(1)}M`
  if (asNumber >= 1_000) return `${(asNumber / 1_000).toFixed(1)}K`
  return asNumber.toLocaleString()
}

function formatUnixTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isValidPublicKey(input: string): boolean {
  try {
    new PublicKey(input.trim())
    return true
  } catch {
    return false
  }
}

function ProposalRow({
  proposal,
  walletConnected,
  isOwner,
  votePending,
  executePending,
  onConnectWallet,
  onVote,
  onExecute,
}: {
  proposal: GovernanceProposalData
  walletConnected: boolean
  isOwner: boolean
  votePending: boolean
  executePending: boolean
  onConnectWallet: () => void
  onVote: (proposalId: number, optionIndex: number) => Promise<unknown>
  onExecute: (payload: {
    proposalId: number
    assetMint: PublicKey
    dlmmPool: PublicKey
    position: PublicKey
  }) => Promise<unknown>
}) {
  const voteRecordQuery = useGovernanceVoteRecord(proposal.id)
  const voteRecord = voteRecordQuery.data

  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false)
  const [assetMintInput, setAssetMintInput] = useState('')
  const [dlmmPoolInput, setDlmmPoolInput] = useState('')
  const [positionInput, setPositionInput] = useState('')
  const [rowError, setRowError] = useState<string | null>(null)

  const presentation = getProposalPresentation({
    id: proposal.id,
    status: proposal.status,
    proposalType: proposal.proposalType,
    options: proposal.options,
    voteCounts: proposal.voteCounts,
    winningOptionIndex: proposal.winningOptionIndex,
    executed: proposal.executed,
  })

  const totalVotes = proposal.voteCounts.reduce((sum, current) => sum + current, BigInt(0))
  const assetMintValid = isValidPublicKey(assetMintInput)
  const dlmmPoolValid = isValidPublicKey(dlmmPoolInput)
  const positionValid = isValidPublicKey(positionInput)

  const canSubmitExecute = Boolean(
    presentation.execute.executable &&
      showExecuteConfirm &&
      assetMintInput.trim() &&
      dlmmPoolInput.trim() &&
      positionInput.trim() &&
      assetMintValid &&
      dlmmPoolValid &&
      positionValid
  )

  const handleVoteClick = async (optionIndex: number) => {
    const optionErrors = validateVoteOptionIndex(optionIndex, proposal.options.length)
    if (optionErrors.length > 0) {
      setRowError('SELECTED VOTE OPTION IS INVALID FOR THIS PROPOSAL.')
      return
    }

    setRowError(null)
    await onVote(proposal.id, optionIndex)
  }

  const handleExecute = async () => {
    if (!canSubmitExecute) {
      setRowError('EXECUTION INPUTS ARE INVALID.')
      return
    }

    setRowError(null)

    await onExecute({
      proposalId: proposal.id,
      assetMint: new PublicKey(assetMintInput.trim()),
      dlmmPool: new PublicKey(dlmmPoolInput.trim()),
      position: new PublicKey(positionInput.trim()),
    })

    setAssetMintInput('')
    setDlmmPoolInput('')
    setPositionInput('')
    setShowExecuteConfirm(false)
  }

  return (
    <article className="border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-5 space-y-4" data-testid="proposal-row">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-[12px] sm:text-[13px] uppercase tracking-[0.1em] text-[#f0f0f0] font-bold">
            #{proposal.id} — {proposal.title}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666] mt-1">
            VOTING WINDOW: {formatUnixTimestamp(proposal.votingStarts)} → {formatUnixTimestamp(proposal.votingEnds)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`wr-tag ${
              presentation.statusTone === 'active'
                ? 'border-[#d4f000]/30 text-[#d4f000]'
                : presentation.statusTone === 'passed'
                  ? 'border-[#6fdbb1]/35 text-[#6fdbb1]'
                  : presentation.statusTone === 'rejected'
                    ? 'border-[#ff9e9e]/35 text-[#ff9e9e]'
                    : 'border-[#666]/35 text-[#bbb]'
            }`}
            data-testid="proposal-status"
          >
            {presentation.statusLabel}
          </span>

          <span className="wr-tag border-[#444]/35 text-[#bbb]" data-testid="execute-eligibility">
            {executeEligibilityLabel(presentation.execute.reason)}
          </span>
        </div>
      </header>

      {/* Radial vote visualization */}
      {totalVotes > BigInt(0) && (
        <div className="flex justify-center py-2">
          <RadialVoteWheel
            options={proposal.options.map((opt, idx) => ({
              index: idx,
              label: opt,
              weight: proposal.voteCounts[idx] ?? BigInt(0),
              color: VOTE_COLORS[idx % VOTE_COLORS.length],
            }))}
            totalWeight={totalVotes}
            winnerIndex={proposal.winningOptionIndex ?? undefined}
            size={160}
          />
        </div>
      )}

      <div className="space-y-2">
        {proposal.options.map((option, index) => {
          const votes = proposal.voteCounts[index] ?? BigInt(0)
          const percentage = toPercent(votes, totalVotes)

          return (
            <div key={`${proposal.id}-option-${index}`} className="border border-[#333]/30 rounded-sm px-3 py-2 bg-[#0a0a0a]/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-[#ddd] uppercase tracking-[0.12em]">
                  {index}. {option}
                </span>
                <span className="font-mono text-[10px] text-[#777] uppercase tracking-[0.12em]">
                  {formatVoteWeight(votes)} WEIGHT · {percentage}
                </span>
              </div>

              {proposal.status === 0 && walletConnected && !voteRecord && (
                <button
                  onClick={() => void handleVoteClick(index)}
                  disabled={votePending}
                  className="mt-2 w-full font-mono text-[10px] uppercase tracking-[0.18em] border border-[#d4f000]/25 text-[#d4f000] bg-[#d4f000]/[0.03] hover:bg-[#d4f000]/[0.08] rounded-sm px-3 py-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {votePending ? '◇ SUBMITTING VOTE...' : `◆ VOTE OPTION ${index}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
        <span className="text-[#777]">PROPOSER:</span>
        <span className="text-[#bbb]">{proposal.proposer.slice(0, 4)}...{proposal.proposer.slice(-4)}</span>
        {voteRecord && (
          <span className="wr-tag border-[#d4f000]/30 text-[#d4f000]">
            YOUR VOTE: OPTION {voteRecord.optionIndex}
          </span>
        )}
      </div>

      {!walletConnected && proposal.status === 0 && (
        <button onClick={onConnectWallet} className="wr-vote-btn w-full" data-testid="connect-wallet-cta">
          CONNECT WALLET TO VOTE
        </button>
      )}

      {isOwner && presentation.execute.executable && (
        <div className="border border-[#6fdbb1]/30 bg-[#6fdbb1]/[0.03] rounded-sm p-3 space-y-3" data-testid="owner-execute-controls">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6fdbb1]">
            OWNER EXECUTION READY — PROPOSAL #{proposal.id}
          </div>

          {!showExecuteConfirm ? (
            <button
              onClick={() => setShowExecuteConfirm(true)}
              className="w-full font-mono text-[10px] uppercase tracking-[0.18em] border border-[#6fdbb1]/40 text-[#6fdbb1] bg-[#6fdbb1]/[0.04] hover:bg-[#6fdbb1]/[0.1] rounded-sm px-3 py-2 transition-all duration-300"
            >
              PREPARE GOVERNANCE EXIT EXECUTION
            </button>
          ) : (
            <div className="space-y-2">
              <input
                value={assetMintInput}
                onChange={(event) => setAssetMintInput(event.target.value)}
                placeholder="ASSET MINT"
                className="w-full font-mono text-[11px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 placeholder-[#555] focus:border-[#6fdbb1]/40 outline-none transition-colors"
              />
              {assetMintInput.trim() && !assetMintValid && (
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#ff9e9e]">INVALID ASSET MINT</div>
              )}

              <input
                value={dlmmPoolInput}
                onChange={(event) => setDlmmPoolInput(event.target.value)}
                placeholder="DLMM POOL"
                className="w-full font-mono text-[11px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 placeholder-[#555] focus:border-[#6fdbb1]/40 outline-none transition-colors"
              />
              {dlmmPoolInput.trim() && !dlmmPoolValid && (
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#ff9e9e]">INVALID DLMM POOL</div>
              )}

              <input
                value={positionInput}
                onChange={(event) => setPositionInput(event.target.value)}
                placeholder="POSITION"
                className="w-full font-mono text-[11px] text-[#ddd] bg-[#0a0a0a] border border-[#333]/40 rounded-sm px-3 py-2 placeholder-[#555] focus:border-[#6fdbb1]/40 outline-none transition-colors"
              />
              {positionInput.trim() && !positionValid && (
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#ff9e9e]">INVALID POSITION</div>
              )}

              <button
                onClick={() => void handleExecute()}
                disabled={!canSubmitExecute || executePending}
                className="w-full font-mono text-[10px] uppercase tracking-[0.18em] border border-[#ff9e9e]/40 text-[#ff9e9e] bg-[#ff9e9e]/[0.04] hover:bg-[#ff9e9e]/[0.1] rounded-sm px-3 py-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executePending ? '◇ SUBMITTING EXECUTION...' : 'CONFIRM EXECUTE SELL'}
              </button>
            </div>
          )}
        </div>
      )}

      {rowError && (
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#ff9e9e]" data-testid="proposal-row-error">
          {rowError}
        </div>
      )}
    </article>
  )
}

export default function ProposalList({
  proposals,
  walletConnected,
  isOwner,
  onConnectWallet,
  votePending,
  executePending,
  onVote,
  onExecute,
}: ProposalListProps) {
  const sorted = useMemo(
    () =>
      [...proposals].sort((left, right) => {
        if (left.status === 0 && right.status !== 0) return -1
        if (left.status !== 0 && right.status === 0) return 1
        return right.id - left.id
      }),
    [proposals]
  )

  if (sorted.length === 0) {
    return (
      <div className="border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-8 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#777]">NO GOVERNANCE PROPOSALS ON-CHAIN</div>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="proposal-list">
      {sorted.map((proposal) => (
        <ProposalRow
          key={proposal.id}
          proposal={proposal}
          walletConnected={walletConnected}
          isOwner={isOwner}
          votePending={votePending}
          executePending={executePending}
          onConnectWallet={onConnectWallet}
          onVote={onVote}
          onExecute={onExecute}
        />
      ))}
    </div>
  )
}
