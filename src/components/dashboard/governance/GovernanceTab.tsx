'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import CreateProposalPanel from './CreateProposalPanel'
import ProposalList from './ProposalList'
import {
  useCastGovernanceVote,
  useCreateGovernanceProposal,
  useGovernanceDiagnostics,
  useGovernanceInitiateExit,
} from '@/hooks/useOnchainGovernance'
import { useStakingPool } from '@/hooks/useStakingPool'
import TransactionToast, { type ToastStatus } from '@/components/dashboard/staking/TransactionToast'
import { evaluateOwnerGate } from './model'

function formatStaleAge(staleMs: number): string {
  if (!Number.isFinite(staleMs) || staleMs < 1_000) return 'LIVE'
  const seconds = Math.floor(staleMs / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

function mapUiError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (/rejected/i.test(message)) {
    return 'SIGNATURE REJECTED — APPROVE IN WALLET TO CONTINUE.'
  }

  if (/connect wallet|wallet not connected/i.test(message)) {
    return 'WALLET REQUIRED — CONNECT A SIGNING WALLET.'
  }

  if (/timeout|timed out/i.test(message)) {
    return 'TRANSACTION TIMEOUT — RETRY WITH MANUAL REFRESH.'
  }

  return message.toUpperCase()
}

export default function GovernanceTab() {
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const walletAddress = publicKey?.toBase58() ?? null

  const governance = useGovernanceDiagnostics()
  const proposalsQuery = governance.proposalsQuery
  const configQuery = governance.configQuery

  const poolQuery = useStakingPool()
  const poolOwner = poolQuery.data?.owner ?? null

  const createProposalMutation = useCreateGovernanceProposal()
  const castVoteMutation = useCastGovernanceVote()
  const executeMutation = useGovernanceInitiateExit()

  const ownerGate = useMemo(
    () => evaluateOwnerGate(poolOwner, walletAddress),
    [poolOwner, walletAddress]
  )

  const [toastStatus, setToastStatus] = useState<ToastStatus>('idle')
  const [toastSuccessMessage, setToastSuccessMessage] = useState('')
  const [toastErrorMessage, setToastErrorMessage] = useState('')
  const [pendingStartedAt, setPendingStartedAt] = useState<number | null>(null)

  const proposals = proposalsQuery.data ?? []

  const anyMutationPending =
    createProposalMutation.isPending || castVoteMutation.isPending || executeMutation.isPending

  useEffect(() => {
    if (anyMutationPending) {
      setToastStatus('pending')
      if (!pendingStartedAt) {
        setPendingStartedAt(Date.now())
      }
      return
    }

    setPendingStartedAt(null)
  }, [anyMutationPending, pendingStartedAt])

  useEffect(() => {
    if (createProposalMutation.isSuccess) {
      setToastSuccessMessage('PROPOSAL SUBMITTED ON-CHAIN.')
      setToastStatus('success')
    }
  }, [createProposalMutation.isSuccess])

  useEffect(() => {
    if (castVoteMutation.isSuccess) {
      setToastSuccessMessage('VOTE RECORDED ON-CHAIN.')
      setToastStatus('success')
    }
  }, [castVoteMutation.isSuccess])

  useEffect(() => {
    if (executeMutation.isSuccess) {
      setToastSuccessMessage('GOVERNANCE SELL EXECUTION SUBMITTED.')
      setToastStatus('success')
    }
  }, [executeMutation.isSuccess])

  useEffect(() => {
    if (createProposalMutation.isError) {
      setToastErrorMessage(mapUiError(createProposalMutation.error))
      setToastStatus('error')
    }
  }, [createProposalMutation.isError, createProposalMutation.error])

  useEffect(() => {
    if (castVoteMutation.isError) {
      setToastErrorMessage(mapUiError(castVoteMutation.error))
      setToastStatus('error')
    }
  }, [castVoteMutation.isError, castVoteMutation.error])

  useEffect(() => {
    if (executeMutation.isError) {
      setToastErrorMessage(mapUiError(executeMutation.error))
      setToastStatus('error')
    }
  }, [executeMutation.isError, executeMutation.error])

  const pendingTooLong = pendingStartedAt !== null && Date.now() - pendingStartedAt > 20_000

  const handleManualRefresh = useCallback(() => {
    void proposalsQuery.refetch()
    void configQuery.refetch()
    if (connected) {
      void poolQuery.refetch()
    }
  }, [proposalsQuery, configQuery, poolQuery, connected])

  const handleDismissToast = useCallback(() => {
    setToastStatus('idle')
    setToastSuccessMessage('')
    setToastErrorMessage('')
  }, [])

  const resetMutations = useCallback(() => {
    createProposalMutation.reset()
    castVoteMutation.reset()
    executeMutation.reset()
    setToastStatus('idle')
    setToastErrorMessage('')
    setToastSuccessMessage('')
  }, [createProposalMutation, castVoteMutation, executeMutation])

  const handleCreateProposal = useCallback(
    async (payload: {
      title: string
      descriptionUri: string
      proposalType: number
      options: string[]
      votingStarts: number
      votingEnds: number
    }) => {
      await createProposalMutation.mutateAsync(payload)
    },
    [createProposalMutation]
  )

  const handleVote = useCallback(
    async (proposalId: number, optionIndex: number) => {
      await castVoteMutation.mutateAsync({ proposalId, optionIndex })
    },
    [castVoteMutation]
  )

  const handleExecute = useCallback(
    async (payload: {
      proposalId: number
      assetMint: import('@solana/web3.js').PublicKey
      dlmmPool: import('@solana/web3.js').PublicKey
      position: import('@solana/web3.js').PublicKey
    }) => {
      await executeMutation.mutateAsync(payload)
    },
    [executeMutation]
  )

  const showHardError = proposalsQuery.isError && proposals.length === 0

  return (
    <section className="px-4 sm:px-5 lg:px-8 py-8" aria-label="Governance Operations" data-testid="governance-tab">
      <TransactionToast
        status={toastStatus}
        successMessage={toastSuccessMessage}
        errorMessage={toastErrorMessage}
        onDismiss={handleDismissToast}
      />

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-[#d4f000]/60" />
          <h2 className="font-mono text-[13px] sm:text-[14px] uppercase tracking-[0.25em] text-[#d4f000] font-bold">
            ◆ GOVERNANCE COMMAND
          </h2>
          <span className="wr-tag border-[#444]/35 text-[#888]">{proposals.length} PROPOSALS</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#777]">
          <span>
            FEED STATUS: {governance.isStale ? 'STALE' : 'LIVE'} ({formatStaleAge(governance.staleMs)})
          </span>
          {governance.isStale && <span className="text-[#ff9e9e]">MANUAL REFRESH RECOMMENDED</span>}
          <button
            onClick={handleManualRefresh}
            className="ml-auto border border-[#333]/40 text-[#bbb] hover:text-[#d4f000] hover:border-[#d4f000]/35 rounded-sm px-3 py-1 transition-all duration-300"
          >
            REFRESH
          </button>
        </div>

        {configQuery.data && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="wr-tag border-[#444]/35 text-[#bbb]">
              QUORUM {configQuery.data.minQuorumBps / 100}%
            </span>
            <span className={`wr-tag ${configQuery.data.autoExecute ? 'border-[#6fdbb1]/35 text-[#6fdbb1]' : 'border-[#555]/35 text-[#888]'}`}>
              AUTO EXECUTE {configQuery.data.autoExecute ? 'ON' : 'OFF'}
            </span>
            <span className="wr-tag border-[#444]/35 text-[#666]">NEXT ID {configQuery.data.nextProposalId}</span>
          </div>
        )}
      </header>

      {!connected && (
        <div className="mb-6 border border-[#e6c84a]/20 bg-[#e6c84a]/[0.04] rounded-sm p-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#e6c84a] mb-2">
            CONNECT WALLET TO VOTE OR CREATE PROPOSALS
          </div>
          <button onClick={() => setVisible(true)} className="wr-vote-btn">
            CONNECT WALLET
          </button>
        </div>
      )}

      {showHardError ? (
        <div className="border border-[#ff9e9e]/20 bg-[#ff9e9e]/[0.03] rounded-sm p-6 text-center">
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#ff9e9e] mb-2">GOVERNANCE FEED ERROR</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#666] mb-4">
            LAST REQUEST FAILED. RETRY TO LOAD ON-CHAIN PROPOSALS.
          </div>
          <button onClick={handleManualRefresh} className="wr-vote-btn">RETRY FEED</button>
        </div>
      ) : (
        <>
          <ProposalList
            proposals={proposals}
            walletConnected={connected}
            isOwner={ownerGate.isOwner}
            onConnectWallet={() => setVisible(true)}
            votePending={castVoteMutation.isPending}
            executePending={executeMutation.isPending}
            onVote={handleVote}
            onExecute={handleExecute}
          />

          <CreateProposalPanel
            isOwner={ownerGate.isOwner}
            ownerGateReason={ownerGate.reason}
            walletConnected={connected}
            isSubmitting={createProposalMutation.isPending}
            onConnectWallet={() => setVisible(true)}
            onSubmit={handleCreateProposal}
          />
        </>
      )}

      {pendingTooLong && (
        <div className="mt-4 border border-[#e6c84a]/25 bg-[#e6c84a]/[0.04] rounded-sm p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e6c84a] mb-2">
            TRANSACTION STILL PENDING — YOU CAN WAIT OR RESET UI STATE
          </div>
          <button
            onClick={resetMutations}
            className="border border-[#e6c84a]/35 text-[#e6c84a] hover:bg-[#e6c84a]/[0.08] rounded-sm px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-300"
          >
            RESET PENDING STATE
          </button>
        </div>
      )}
    </section>
  )
}
