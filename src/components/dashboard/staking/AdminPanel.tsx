'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useStakingPool } from '@/hooks/useStakingPool'
import { usePoolOverview } from '@/hooks/usePoolOverview'
import { useEmergencyHalt, useResume, useInitiateExit } from '@/hooks/useAdminMutations'
import TransactionToast from './TransactionToast'
import type { ToastStatus } from './TransactionToast'

// ── Stat Card ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
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
      </div>
    </div>
  )
}

// ── Loading Skeleton ────────────────────────────────────────────────

function AdminSkeleton() {
  return (
    <div className="mt-6 border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-6">
      {/* Section header skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="wr-skeleton h-3 w-6" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-px bg-[#333]" />
        <div className="wr-skeleton h-3 w-28" style={{ animationDelay: '75ms' }} />
        <div className="flex-1 h-px bg-[#333]/40" />
        <div className="wr-skeleton h-3 w-20" style={{ animationDelay: '150ms' }} />
      </div>
      {/* Stat + button skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-4">
          <div className="wr-skeleton h-3 w-24 mb-3" style={{ animationDelay: '200ms' }} />
          <div className="wr-skeleton h-6 w-20" style={{ animationDelay: '275ms' }} />
        </div>
        <div className="border border-[#333]/30 bg-[#0d0d0d]/60 rounded-sm p-4 flex items-center justify-center">
          <div className="wr-skeleton h-10 w-40 rounded-sm" style={{ animationDelay: '350ms' }} />
        </div>
      </div>
    </div>
  )
}

// ── Error State ─────────────────────────────────────────────────────

function AdminError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-6 border border-[#ff9e9e]/20 bg-[#ff9e9e]/[0.03] rounded-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">06</span>
        <div className="w-3 h-px bg-[#d4f000]/30" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
          ADMIN CONTROLS
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
      </div>
      <div className="text-center py-4">
        <div className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#ff9e9e] font-bold mb-2">
          ◆ SIGNAL LOST
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#666] mb-4">
          UNABLE TO RETRIEVE POOL DATA — CONNECTION INTERRUPTED
        </div>
        <button onClick={onRetry} className="wr-vote-btn">
          RETRY CONNECTION
        </button>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────

export default function AdminPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { publicKey, connected } = useWallet()
  const { data: pool, isLoading: poolLoading, isError: poolError, refetch: refetchPool } = useStakingPool()
  const { data: overview } = usePoolOverview()

  const haltMutation = useEmergencyHalt()
  const resumeMutation = useResume()
  const initiateMutation = useInitiateExit()

  // ── Toast state ─────────────────────────────────────────────────
  const [toastStatus, setToastStatus] = useState<ToastStatus>('idle')
  const [toastSuccessMsg, setToastSuccessMsg] = useState('')
  const [toastErrorMsg, setToastErrorMsg] = useState('')

  const handleDismissToast = useCallback(() => {
    setToastStatus('idle')
    setToastSuccessMsg('')
    setToastErrorMsg('')
  }, [])

  // ── Initiate Exit form state ────────────────────────────────────
  const [assetMintInput, setAssetMintInput] = useState('')
  const [dlmmPoolInput, setDlmmPoolInput] = useState('')
  const [positionInput, setPositionInput] = useState('')

  const validatePubkey = (value: string): boolean => {
    if (!value.trim()) return false
    try { new PublicKey(value.trim()); return true } catch { return false }
  }

  const assetMintValid = validatePubkey(assetMintInput)
  const dlmmPoolValid = validatePubkey(dlmmPoolInput)
  const positionValid = validatePubkey(positionInput)
  const allFieldsValid = assetMintInput.trim() && dlmmPoolInput.trim() && positionInput.trim()
    && assetMintValid && dlmmPoolValid && positionValid
  const initiatePending = initiateMutation.isPending

  // Track halt mutation state
  useEffect(() => {
    if (haltMutation.isPending && toastStatus !== 'pending') {
      setToastStatus('pending')
    } else if (haltMutation.isSuccess && toastStatus === 'pending') {
      setToastSuccessMsg('EMERGENCY HALT CONFIRMED — POOL PAUSED')
      setToastStatus('success')
    } else if (haltMutation.isError && toastStatus === 'pending') {
      setToastErrorMsg(haltMutation.error?.message ?? 'HALT FAILED')
      setToastStatus('error')
    }
  }, [haltMutation.isPending, haltMutation.isSuccess, haltMutation.isError, haltMutation.error, toastStatus])

  // Track resume mutation state
  useEffect(() => {
    if (resumeMutation.isPending && toastStatus !== 'pending') {
      setToastStatus('pending')
    } else if (resumeMutation.isSuccess && toastStatus === 'pending') {
      setToastSuccessMsg('POOL RESUMED — STAKING OPERATIONS ACTIVE')
      setToastStatus('success')
    } else if (resumeMutation.isError && toastStatus === 'pending') {
      setToastErrorMsg(resumeMutation.error?.message ?? 'RESUME FAILED')
      setToastStatus('error')
    }
  }, [resumeMutation.isPending, resumeMutation.isSuccess, resumeMutation.isError, resumeMutation.error, toastStatus])

  // Track initiate mutation state
  useEffect(() => {
    if (initiateMutation.isPending && toastStatus !== 'pending') {
      setToastStatus('pending')
    } else if (initiateMutation.isSuccess && toastStatus === 'pending') {
      setToastSuccessMsg('DLMM EXIT INITIATED — POSITION NOW TRACKING')
      setToastStatus('success')
      setAssetMintInput('')
      setDlmmPoolInput('')
      setPositionInput('')
    } else if (initiateMutation.isError && toastStatus === 'pending') {
      setToastErrorMsg(initiateMutation.error?.message ?? 'INITIATE FAILED')
      setToastStatus('error')
    }
  }, [initiateMutation.isPending, initiateMutation.isSuccess, initiateMutation.isError, initiateMutation.error, toastStatus])

  // ── Owner gating ─────────────────────────────────────────────────
  if (!connected || !publicKey) {
    return null
  }

  if (poolLoading) {
    return <AdminSkeleton />
  }

  if (poolError) {
    return <AdminError onRetry={() => refetchPool()} />
  }

  if (!pool) {
    return null
  }

  const isOwner = publicKey.toBase58() === pool.owner

  if (!isOwner) {
    return null
  }

  // ── Derive state ─────────────────────────────────────────────────
  const isPaused = pool?.isPaused ?? overview?.isPaused ?? false
  const isMutating = haltMutation.isPending || resumeMutation.isPending || initiateMutation.isPending

  // ── Handlers ─────────────────────────────────────────────────────
  const handleHalt = () => {
    if (!window.confirm('Are you sure you want to emergency halt the pool? All staking operations will be paused.')) {
      return
    }
    haltMutation.mutate()
  }

  const handleResume = () => {
    if (!window.confirm('Are you sure you want to resume the pool? Staking operations will be re-enabled.')) {
      return
    }
    resumeMutation.mutate()
  }

  const handleInitiateExit = () => {
    if (!allFieldsValid) return
    if (!window.confirm('Initiate DLMM exit for this asset/pool pair?')) {
      return
    }
    initiateMutation.mutate({
      assetMint: new PublicKey(assetMintInput.trim()),
      dlmmPool: new PublicKey(dlmmPoolInput.trim()),
      position: new PublicKey(positionInput.trim()),
    })
  }

  // ── GSAP stagger reveal ──────────────────────────────────────────
  useEffect(() => {
    if (!pool || !containerRef.current) return
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
  }, [pool])

  return (
    <div ref={containerRef} className="mt-6 border border-[#333]/40 rounded-sm bg-[#0d0d0d]/60 p-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-mono text-[10px] text-[#d4f000]/60 tracking-[0.2em] tabular-nums">06</span>
        <div className="w-3 h-px bg-[#d4f000]/30" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] font-bold">
          ADMIN CONTROLS
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#333]/40 to-transparent" />
        {/* OWNER VERIFIED indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full bg-[#d4f000]"
            style={{ boxShadow: '0 0 5px #d4f000, 0 0 12px rgba(212,240,0,0.3)' }}
          />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4f000]">
            OWNER VERIFIED
          </span>
        </div>
      </div>

      {/* Transaction Toast */}
      <TransactionToast
        status={toastStatus}
        successMessage={toastSuccessMsg}
        errorMessage={toastErrorMsg}
        onDismiss={handleDismissToast}
      />

      {/* Pool Status + Control Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Pool Status Card */}
        <StatCard
          label="POOL STATUS"
          value={isPaused ? 'PAUSED' : 'ACTIVE'}
          accent={!isPaused}
        />

        {/* Emergency Control Button */}
        <div
          data-wr-reveal
          className="border rounded-sm bg-[#0d0d0d]/60 flex items-center justify-center p-4"
        >
          {!isPaused ? (
            <button
              onClick={handleHalt}
              disabled={isMutating}
              className="w-full font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-bold
                border border-[#ff9e9e]/30 text-[#ff9e9e]
                bg-[#ff9e9e]/[0.03] hover:bg-[#ff9e9e]/[0.08]
                rounded-sm px-6 py-3 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMutating ? '◇ PROCESSING...' : '◆ EMERGENCY HALT'}
            </button>
          ) : (
            <button
              onClick={handleResume}
              disabled={isMutating}
              className="w-full font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-bold
                border border-[#d4f000]/30 text-[#d4f000]
                bg-[#d4f000]/[0.03] hover:bg-[#d4f000]/[0.08]
                rounded-sm px-6 py-3 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMutating ? '◇ PROCESSING...' : '◆ RESUME POOL'}
            </button>
          )}
        </div>
      </div>

      {/* ── Initiate Exit Form ──────────────────────────────────── */}
      <div className="mt-5 border-t border-[#333]/40 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-sm bg-[#d4f000]/50" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold">
            INITIATE DLMM EXIT
          </span>
          <div className="flex-1 h-px bg-[#333]/30" />
        </div>

        <div className="space-y-3">
          {/* Asset Mint Input */}
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#555] mb-1">
              ASSET MINT ADDRESS
            </label>
            <input
              type="text"
              value={assetMintInput}
              onChange={(e) => setAssetMintInput(e.target.value)}
              placeholder="e.g. 7xKX…3f9d"
              className="w-full font-mono text-[11px] text-[#ccc] bg-[#0d0d0d] border border-[#333]/30
                rounded-sm px-3 py-2 placeholder-[#444] outline-none
                focus:border-[#d4f000]/30 transition-colors"
            />
            {assetMintInput.trim() && !assetMintValid && (
              <div className="font-mono text-[9px] text-[#ff9e9e] mt-1 tracking-wider">
                INVALID PUBLIC KEY
              </div>
            )}
          </div>

          {/* DLMM Pool Input */}
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#555] mb-1">
              DLMM POOL ADDRESS
            </label>
            <input
              type="text"
              value={dlmmPoolInput}
              onChange={(e) => setDlmmPoolInput(e.target.value)}
              placeholder="e.g. 7xKX…3f9d"
              className="w-full font-mono text-[11px] text-[#ccc] bg-[#0d0d0d] border border-[#333]/30
                rounded-sm px-3 py-2 placeholder-[#444] outline-none
                focus:border-[#d4f000]/30 transition-colors"
            />
            {dlmmPoolInput.trim() && !dlmmPoolValid && (
              <div className="font-mono text-[9px] text-[#ff9e9e] mt-1 tracking-wider">
                INVALID PUBLIC KEY
              </div>
            )}
          </div>

          {/* Position Input */}
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#555] mb-1">
              POSITION ADDRESS
            </label>
            <input
              type="text"
              value={positionInput}
              onChange={(e) => setPositionInput(e.target.value)}
              placeholder="e.g. 7xKX…3f9d"
              className="w-full font-mono text-[11px] text-[#ccc] bg-[#0d0d0d] border border-[#333]/30
                rounded-sm px-3 py-2 placeholder-[#444] outline-none
                focus:border-[#d4f000]/30 transition-colors"
            />
            {positionInput.trim() && !positionValid && (
              <div className="font-mono text-[9px] text-[#ff9e9e] mt-1 tracking-wider">
                INVALID PUBLIC KEY
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleInitiateExit}
            disabled={!allFieldsValid || initiatePending}
            className="w-full font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-bold
              border border-[#d4f000]/30 text-[#d4f000]
              bg-[#d4f000]/[0.03] hover:bg-[#d4f000]/[0.08]
              rounded-sm px-6 py-3 transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initiatePending ? '◇ PROCESSING...' : '◆ INITIATE EXIT'}
          </button>
        </div>
      </div>
    </div>
  )
}
