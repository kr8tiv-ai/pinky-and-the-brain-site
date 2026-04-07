'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import BN from 'bn.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useDlmmExits } from '@/hooks/useDlmmExits'
import { useStakingPool } from '@/hooks/useStakingPool'
import { useTerminateExit } from '@/hooks/useAdminMutations'
import TransactionToast from './TransactionToast'
import type { ToastStatus } from './TransactionToast'
import type { DlmmExitData } from '@/hooks/useDlmmExits'
import { formatSol, formatDuration } from '@/lib/staking/format'

// ── Helpers ─────────────────────────────────────────────────────────

/** Truncate a pubkey to "AbCd…XyZw" form */
function truncatePubkey(pubkey: string): string {
  if (pubkey.length < 8) return pubkey
  return `${pubkey.slice(0, 4)}…${pubkey.slice(-4)}`
}

/** Status label and color mapping */
function statusMeta(status: number): { label: string; color: string } {
  switch (status) {
    case 0:
      return { label: 'ACTIVE', color: '#d4f000' }
    case 1:
      return { label: 'COMPLETED', color: '#888' }
    case 2:
      return { label: 'TERMINATED', color: '#ff9e9e' }
    default:
      return { label: `UNKNOWN(${status})`, color: '#555' }
  }
}

/** Time since a unix timestamp in seconds */
function timeSince(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000)
  return formatDuration(now - unixSeconds)
}

export interface ExitProvenanceMeta {
  label: string
  color: string
  borderColor: string
  backgroundColor: string
  diagnostic?: string
}

export function deriveExitProvenanceMeta(proposalIdRaw: string | number | bigint | null | undefined): ExitProvenanceMeta {
  if (proposalIdRaw === null || proposalIdRaw === undefined) {
    return {
      label: 'UNKNOWN SOURCE',
      color: '#ff9e9e',
      borderColor: '#ff9e9e30',
      backgroundColor: '#ff9e9e08',
      diagnostic: 'missing_proposal_id',
    }
  }

  try {
    const parsed = typeof proposalIdRaw === 'bigint' ? proposalIdRaw : BigInt(String(proposalIdRaw))

    if (parsed === BigInt(0)) {
      return {
        label: 'MANUAL',
        color: '#8f8f8f',
        borderColor: '#8f8f8f30',
        backgroundColor: '#8f8f8f08',
      }
    }

    if (parsed > BigInt(0)) {
      return {
        label: `GOVERNANCE #${parsed.toString()}`,
        color: '#9dc2ff',
        borderColor: '#9dc2ff30',
        backgroundColor: '#9dc2ff08',
      }
    }

    return {
      label: 'UNKNOWN SOURCE',
      color: '#ff9e9e',
      borderColor: '#ff9e9e30',
      backgroundColor: '#ff9e9e08',
      diagnostic: 'negative_proposal_id',
    }
  } catch {
    return {
      label: 'UNKNOWN SOURCE',
      color: '#ff9e9e',
      borderColor: '#ff9e9e30',
      backgroundColor: '#ff9e9e08',
      diagnostic: 'invalid_proposal_id',
    }
  }
}

// ── Stat Card (reused from PoolOverview pattern) ────────────────────

function StatCard({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string
  value: string
  suffix?: string
  accent?: boolean
}) {
  return (
    <div
      data-wr-reveal
      className={`relative border rounded-sm p-4 transition-all duration-300 group
        ${accent
          ? 'border-[#d4f000]/20 bg-[#d4f000]/[0.03] hover:border-[#d4f000]/35 hover:bg-[#d4f000]/[0.05]'
          : 'border-[#333]/30 bg-[#0d0d0d]/60 hover:border-[#444]/50 hover:bg-[#0d0d0d]/80'
        }
      `}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#d4f000]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#777] mb-2 flex items-center gap-1.5">
        <span className="text-[#d4f000]/50 text-[9px]">◆</span>
        {label}
      </div>
      <div className={`font-mono text-[16px] sm:text-[20px] font-black tabular-nums leading-none
        ${accent ? 'text-[#d4f000]' : 'text-white'}
        group-hover:drop-shadow-[0_0_8px_rgba(212,240,0,0.1)] transition-all duration-300
      `}>
        {value}
        {suffix && (
          <span className="text-[11px] sm:text-[13px] font-bold text-[#888] ml-1.5">{suffix}</span>
        )}
      </div>
    </div>
  )
}

// ── Loading Skeleton ────────────────────────────────────────────────

function ExitsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-4">
            <div className="wr-skeleton h-3 w-24 mb-3" style={{ animationDelay: `${i * 150}ms` }} />
            <div className="wr-skeleton h-6 w-20" style={{ animationDelay: `${i * 150 + 75}ms` }} />
          </div>
        ))}
      </div>
      {/* Exit row skeletons */}
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="wr-skeleton h-4 w-16" style={{ animationDelay: `${i * 150 + 300}ms` }} />
              <div className="wr-skeleton h-4 w-24" style={{ animationDelay: `${i * 150 + 375}ms` }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="wr-skeleton h-4 w-20" style={{ animationDelay: `${i * 150 + 450}ms` }} />
              <div className="wr-skeleton h-5 w-16 rounded-sm" style={{ animationDelay: `${i * 150 + 525}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Error State ─────────────────────────────────────────────────────

function ExitsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-[#ff9e9e]/20 bg-[#ff9e9e]/[0.03] rounded-sm p-8 text-center">
      <div className="font-mono text-[14px] uppercase tracking-[0.3em] text-[#ff9e9e] font-black mb-2">
        ◆ SIGNAL LOST
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#666] mb-5">
        UNABLE TO RETRIEVE DLMM EXIT DATA — CONNECTION INTERRUPTED
      </div>
      <button
        onClick={onRetry}
        className="wr-vote-btn"
      >
        RETRY CONNECTION
      </button>
    </div>
  )
}

// ── Empty State ─────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      data-wr-reveal
      className="border border-[#333]/20 bg-[#0d0d0d]/40 rounded-sm p-10 text-center"
    >
      <div className="font-mono text-[14px] uppercase tracking-[0.3em] text-[#555] font-black">
        ◆ NO ACTIVE DLMM EXITS
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#444] mt-2">
        DLMM EXIT OPERATIONS WILL APPEAR HERE
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────

export default function DlmmExits() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: exits, isLoading, isError, refetch } = useDlmmExits()
  const { publicKey, connected } = useWallet()
  const { data: pool } = useStakingPool()
  const terminateExit = useTerminateExit()

  // Owner check
  const isOwner = connected && !!publicKey && !!pool && publicKey.toBase58() === pool.owner

  // Toast state for terminate actions
  const [toastStatus, setToastStatus] = useState<ToastStatus>('idle')
  const [toastSuccessMsg, setToastSuccessMsg] = useState('')
  const [toastErrorMsg, setToastErrorMsg] = useState('')

  const handleDismissToast = useCallback(() => {
    setToastStatus('idle')
    setToastSuccessMsg('')
    setToastErrorMsg('')
  }, [])

  // Track terminate mutation state
  useEffect(() => {
    if (terminateExit.isPending && toastStatus !== 'pending') {
      setToastStatus('pending')
    } else if (terminateExit.isSuccess && toastStatus === 'pending') {
      setToastSuccessMsg('EXIT TERMINATED — REMAINING ASSET RETURNED TO TREASURY')
      setToastStatus('success')
    } else if (terminateExit.isError && toastStatus === 'pending') {
      setToastErrorMsg(terminateExit.error?.message ?? 'TERMINATE FAILED')
      setToastStatus('error')
    }
  }, [terminateExit.isPending, terminateExit.isSuccess, terminateExit.isError, terminateExit.error, toastStatus])

  // GSAP stagger reveal on data load
  useEffect(() => {
    if (!exits || !containerRef.current) return
    const els = containerRef.current.querySelectorAll('[data-wr-reveal]')
    if (!els.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: 20, opacity: 0, scale: 0.97, filter: 'blur(2px)' },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.06,
          delay: 0.1,
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [exits])

  // Loading state
  if (isLoading) {
    return <ExitsSkeleton />
  }

  // Error state
  if (isError) {
    return <ExitsError onRetry={() => refetch()} />
  }

  // No data edge case
  if (!exits) {
    return <ExitsError onRetry={() => refetch()} />
  }

  // Compute stats
  const activeCount = exits.filter((e) => e.status === 0).length
  const totalSolClaimed = exits.reduce(
    (sum, e) => sum.add(new BN(e.totalSolClaimed)),
    new BN(0)
  )

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Transaction Toast (for terminate actions) */}
      <TransactionToast
        status={toastStatus}
        successMessage={toastSuccessMsg}
        errorMessage={toastErrorMsg}
        onDismiss={handleDismissToast}
      />

      {/* ── Section 05: DLMM EXITS ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">05</span>
          <div className="w-3 h-px bg-[#d4f000]/30" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
            DLMM EXITS
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
        </div>

        {/* Empty state when no exits exist */}
        {exits.length === 0 && <EmptyState />}

        {exits.length > 0 && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <StatCard
                label="ACTIVE EXITS"
                value={String(activeCount)}
                accent
              />
              <StatCard
                label="TOTAL SOL CLAIMED"
                value={formatSol(totalSolClaimed)}
                suffix="SOL"
              />
            </div>

            {/* Exit list */}
            <div className="space-y-2">
              {exits.map((exit) => {
                const meta = statusMeta(exit.status)
                const provenance = deriveExitProvenanceMeta(exit.proposalId)
                return (
                  <div
                    key={exit.publicKey}
                    data-wr-reveal
                    className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-3
                      hover:border-[#444]/50 hover:bg-[#0d0d0d]/80 transition-all duration-300
                      flex flex-wrap items-center justify-between gap-2"
                  >
                    {/* Left: asset mint + SOL claimed */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[#aaa] tracking-wider">
                        {truncatePubkey(exit.assetMint)}
                      </span>
                      <span className="font-mono text-[11px] text-white font-bold tabular-nums">
                        {formatSol(new BN(exit.totalSolClaimed))}
                        <span className="text-[#888] ml-1">SOL</span>
                      </span>
                    </div>

                    {/* Right: provenance + status badge + time since + terminate */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-[#666] tabular-nums">
                        {timeSince(exit.createdAt)}
                      </span>
                      <span
                        className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm border"
                        style={{
                          color: provenance.color,
                          borderColor: provenance.borderColor,
                          backgroundColor: provenance.backgroundColor,
                        }}
                        data-provenance={provenance.diagnostic ? 'unknown' : 'known'}
                        data-provenance-diagnostic={provenance.diagnostic}
                      >
                        {provenance.label}
                      </span>
                      <span
                        className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm border"
                        style={{
                          color: meta.color,
                          borderColor: meta.color + '30',
                          backgroundColor: meta.color + '08',
                        }}
                      >
                        {meta.label}
                      </span>
                      {/* Owner-only terminate button for active exits */}
                      {isOwner && exit.status === 0 && (
                        <button
                          onClick={() => {
                            if (!window.confirm('Terminate this DLMM exit? Accumulated SOL goes to reward pool.')) {
                              return
                            }
                            terminateExit.mutate({ exit })
                          }}
                          disabled={terminateExit.isPending}
                          className="font-mono text-[9px] uppercase tracking-[0.15em] font-bold
                            border border-[#ff9e9e]/30 text-[#ff9e9e]
                            bg-[#ff9e9e]/[0.03] hover:bg-[#ff9e9e]/[0.08]
                            rounded-sm px-2.5 py-1 transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {terminateExit.isPending ? '◇' : 'TERMINATE'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
