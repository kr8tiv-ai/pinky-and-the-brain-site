'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { format, fromUnixTime } from 'date-fns'
import gsap from 'gsap'
import { useBurns } from '@/hooks/useBurns'
import { FlameTimeline } from './visualizations'

// ─── Constants ────────────────────────────────────────────────────────────────

const LP_LOCKED_PCT = 100

// ─── Utility formatters ──────────────────────────────────────────────────────

function formatBurnAmount(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPct(n: number): string {
  return `${n.toFixed(2)}%`
}

// ─── Supply Comparison Ring ─────────────────────────────────────────────────────

function SupplyComparisonRing({
  totalBurned,
  totalSupply,
  burnedPct,
  burnSourceBalance,
  isLoading,
  isError,
}: {
  totalBurned: number
  totalSupply: number
  burnedPct: number
  burnSourceBalance: number
  isLoading: boolean
  isError: boolean
}) {
  const ringRef = useRef<SVGCircleElement>(null)
  const pendingRingRef = useRef<SVGCircleElement>(null)

  const originalSupply = totalBurned + totalSupply
  const pendingPct = originalSupply > 0 ? (burnSourceBalance / originalSupply) * 100 : 0

  // Animate ring fill
  useEffect(() => {
    if (isLoading || isError || !ringRef.current) return
    const circumference = 2 * Math.PI * 54
    const burnOffset = circumference - (circumference * burnedPct) / 100
    gsap.fromTo(
      ringRef.current,
      { strokeDashoffset: circumference },
      { strokeDashoffset: burnOffset, duration: 2, ease: 'power2.out', delay: 0.3 }
    )
    if (pendingRingRef.current && pendingPct > 0) {
      const pendingOffset = circumference - (circumference * pendingPct) / 100
      gsap.fromTo(
        pendingRingRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: pendingOffset, duration: 1.8, ease: 'power2.out', delay: 0.6 }
      )
    }
  }, [burnedPct, pendingPct, isLoading, isError])

  const circumference = 2 * Math.PI * 54

  return (
    <div className="px-5 lg:px-8 py-6 border-b border-[#333]/12">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-5 flex items-center gap-3 wr-sub-header">
        <span className="text-[#ff6b35]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>SUPPLY INCINERATION MAP</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/55 to-transparent" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* SVG Ring */}
        <div className="relative flex-shrink-0">
          <svg width="148" height="148" viewBox="0 0 128 128" className="transform -rotate-90">
            {/* Background track */}
            <circle cx="64" cy="64" r="54" fill="none" stroke="#1a1a1a" strokeWidth="8" />
            {/* Remaining supply (dark) */}
            <circle cx="64" cy="64" r="54" fill="none" stroke="#222" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={0} />
            {/* Pending burn (amber) */}
            {pendingPct > 0 && (
              <circle ref={pendingRingRef} cx="64" cy="64" r="54" fill="none" stroke="#ff9e3d" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={circumference}
                strokeLinecap="round" opacity={0.5}
                style={{ transform: `rotate(${burnedPct * 3.6}deg)`, transformOrigin: '64px 64px' }} />
            )}
            {/* Burned portion (fire) */}
            <circle ref={ringRef} cx="64" cy="64" r="54" fill="none" stroke="url(#fireGrad)" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={circumference}
              strokeLinecap="round" filter="url(#fireGlow)" />
            <defs>
              <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#ff3d00" />
              </linearGradient>
              <filter id="fireGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="wr-skeleton h-6 w-12 rounded" />
            ) : (
              <>
                <span className="font-mono text-2xl font-black text-[#ff6b35] tabular-nums wr-fire-text">
                  {burnedPct.toFixed(1)}%
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bbb] mt-0.5">burned</span>
              </>
            )}
          </div>
        </div>

        {/* Supply breakdown */}
        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
          {/* Original supply */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111]/60 border border-[#222]/50 rounded-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#444]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#ccc]">Original Supply</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#e0e0e0] tabular-nums">
              {isLoading ? '—' : formatBurnAmount(originalSupply)}
            </span>
          </div>
          {/* Burned */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#ff6b35]/[0.03] border border-[#ff6b35]/10 rounded-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#ff6b35]" style={{ boxShadow: '0 0 6px rgba(255,107,53,0.4)' }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#ff6b35]/80">Incinerated</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#ff6b35] tabular-nums wr-fire-text">
              {isLoading ? '—' : formatBurnAmount(totalBurned)}
            </span>
          </div>
          {/* Pending (in burn source wallet) */}
          {burnSourceBalance > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-[#ff9e3d]/[0.02] border border-[#ff9e3d]/10 rounded-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#ff9e3d]/50 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#ff9e3d]/70">Pending Burn</span>
              </div>
              <span className="font-mono text-sm font-bold text-[#ff9e3d]/80 tabular-nums">
                {formatBurnAmount(burnSourceBalance)}
              </span>
            </div>
          )}
          {/* Circulating */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111]/40 border border-[#222]/30 rounded-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#333]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb]">Circulating</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#ccc] tabular-nums">
              {isLoading ? '—' : formatBurnAmount(totalSupply)}
            </span>
          </div>
        </div>
      </div>

      {/* Incinerator address */}
      <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[12px] text-[#bbb]">
        <span className="text-[#ff6b35]/50">●</span>
        <span className="tracking-[0.1em]">INCINERATOR</span>
        <a
          href="https://solscan.io/account/1nc1nerator11111111111111111111111111111111"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#bbb] hover:text-[#ff6b35] transition-colors tabular-nums"
        >
          1nc1nerator...1111
          <span className="text-[11px] ml-0.5">↗</span>
        </a>
      </div>
    </div>
  )
}

// ─── Burn Summary Bar ──────────────────────────────────────────────────────────

function BurnSummaryBar({
  totalBurned,
  burnedPct,
  isLoading,
  isError,
}: {
  totalBurned: number
  burnedPct: number
  isLoading: boolean
  isError: boolean
}) {
  const totalRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  // Count-up animation
  useEffect(() => {
    if (isLoading || isError) return
    const targets = [
      { ref: totalRef, end: totalBurned, fmt: formatBurnAmount },
      { ref: pctRef, end: burnedPct, fmt: formatPct },
    ]
    targets.forEach(({ ref, end, fmt }) => {
      if (!ref.current) return
      const obj = { val: 0 }
      gsap.to(obj, {
        val: end,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) ref.current.textContent = fmt(obj.val)
        },
      })
    })
  }, [totalBurned, burnedPct, isLoading, isError])

  const cells = [
    {
      label: 'TOTAL INCINERATED',
      content: isLoading ? (
        <div className="wr-skeleton h-6 w-28" />
      ) : isError ? (
        <span className="text-[#ff9e9e]">&mdash;</span>
      ) : (
        <span className="flex items-center">
          <span ref={totalRef} className="text-[#ff6b35] wr-fire-text">{formatBurnAmount(totalBurned)}</span>
          <span className="wr-micro-spark text-[#ff6b35]">
            {[3, 5, 7, 4, 8, 6, 10, 12].map((h, i) => (
              <span key={i} className="wr-micro-spark-bar" style={{ height: `${h}px` }} />
            ))}
          </span>
        </span>
      ),
    },
    {
      label: '% SUPPLY BURNED',
      content: isLoading ? (
        <div className="wr-skeleton h-6 w-20" />
      ) : isError ? (
        <span className="text-[#ff9e9e]">&mdash;</span>
      ) : (
        <span ref={pctRef} className="text-[#ff6b35]">{formatPct(burnedPct)}</span>
      ),
    },
    {
      label: '% BURNED + LP LOCKED',
      content: isLoading ? (
        <div className="wr-skeleton h-6 w-36" />
      ) : isError ? (
        <span className="text-[#ff9e9e]">&mdash;</span>
      ) : (
        <span className="text-[#ff6b35]">
          <span className="text-[#ff6b35]">{formatPct(burnedPct)}</span>
          <span className="text-[#bbb] mx-2">+</span>
          <span className="text-[#ff6b35]">{LP_LOCKED_PCT}%</span>
          <span className="text-[#bbb] text-[12px] ml-1.5 tracking-[0.15em]">LOCKED</span>
        </span>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#333]/12 border-b border-[#333]/12 wr-summary-accent wr-summary-accent-fire wr-summary-glow-divider" role="region" aria-label="Burn statistics summary">
      {cells.map(({ label, content }) => (
        <div key={label} className="px-5 lg:px-6 py-5 group/cell relative transition-colors duration-300 hover:bg-[#ff6b35]/[0.015] wr-stat-scale">
          {/* Hover accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-[#ff6b35]/0 group-hover/cell:bg-[#ff6b35]/10 transition-all duration-300 origin-left scale-x-0 group-hover/cell:scale-x-100" />
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#e0e0e0] mb-2 font-bold group-hover/cell:text-[#ccc] transition-colors flex items-center gap-1.5">
            <span className="text-[#ff6b35]/65 text-[11px]" aria-hidden="true">◆</span>
            {label}
          </div>
          <div className="font-mono text-xl lg:text-2xl font-black tabular-nums leading-none">
            {content}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  index,
  maxAmount = 1,
}: {
  tx: { txHash: string; timestamp: number; amount: number }
  index: number
  maxAmount?: number
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rowRef.current) return
    gsap.fromTo(
      rowRef.current,
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out', delay: index * 0.06 }
    )
  }, [index])

  const intensity = maxAmount > 0 ? (tx.amount / maxAmount) * 100 : 0

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-[24px_1fr_1fr] md:grid-cols-[24px_1fr_1fr_1.2fr] gap-3 md:gap-4 items-center py-3.5 px-3 md:px-4 wr-row-stripe wr-row-flash wr-row-accent wr-row-glow-intensity border-b border-[#333]/8 font-mono text-[11px] md:text-[12px] transition-colors duration-300 relative"
    >
      {/* Burn intensity bar (background) */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#ff6b35]/[0.02] to-transparent pointer-events-none rounded-r-sm"
        style={{ width: `${intensity}%` }}
      />
      <div className="wr-row-num">{String(index + 1).padStart(2, '0')}</div>
      <div className="text-[#ccc] tabular-nums flex items-center gap-2">
        <span className="text-[#ff6b35]/60 text-[12px]">●</span>
        <span className="wr-row-date transition-colors duration-200">{format(fromUnixTime(tx.timestamp), 'yyyy-MM-dd HH:mm')}</span>
      </div>
      <div className="text-[#ff6b35] font-black tabular-nums wr-fire-text">
        <span className="wr-burn-amount">−{formatBurnAmount(tx.amount)}</span>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <a
          href={`https://solscan.io/tx/${tx.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ff6b35]/60 hover:text-[#ff6b35] transition-colors flex items-center gap-1 wr-link-hover"
        >
          <span className="tabular-nums">{tx.txHash.slice(0, 6)}<span className="text-[#bbb] mx-0.5">···</span>{tx.txHash.slice(-4)}</span>
          <span className="text-[11px]">↗</span>
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(tx.txHash)}
          className="text-[#bbb] hover:text-[#ff6b35]/70 transition-colors duration-200"
          title="Copy TX hash"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4V1h11v11h-3v3H1V4h3zm1-1V1.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H13V4.5a.5.5 0 00-.5-.5H5z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Burn Projections ─────────────────────────────────────────────────────────

interface BurnMilestone {
  pct: number
  reached: boolean
  date: number | null
}

function computeBurnProjections(
  totalBurned: number,
  totalSupply: number,
  transactions: Array<{ timestamp: number; amount: number }>
): BurnMilestone[] {
  if (transactions.length < 2) return []
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const timeSpan = last.timestamp - first.timestamp
  if (timeSpan <= 0) return []

  const originalSupply = totalBurned + totalSupply
  const burnRate = totalBurned / timeSpan

  return [25, 50, 75].map(pct => {
    const targetBurned = (pct / 100) * originalSupply
    if (totalBurned >= targetBurned) {
      return { pct, reached: true, date: null }
    }
    const remaining = targetBurned - totalBurned
    const secondsToTarget = remaining / burnRate
    return { pct, reached: false, date: Math.floor(last.timestamp + secondsToTarget) }
  })
}

function BurnProjections({
  totalBurned,
  totalSupply,
  transactions,
  isLoading,
}: {
  totalBurned: number
  totalSupply: number
  transactions: Array<{ timestamp: number; amount: number }>
  isLoading: boolean
}) {
  const milestones = computeBurnProjections(totalBurned, totalSupply, transactions)

  if (isLoading || milestones.length === 0) return null

  return (
    <div className="px-5 lg:px-8 py-6 border-b border-[#333]/12">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-5 flex items-center gap-3 wr-sub-header">
        <span className="text-[#ff6b35]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>BURN PROJECTIONS</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/55 to-transparent" />
        <span className="text-[#bbb]">LINEAR ESTIMATE</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-px bg-[#333]/30" />

        <div className="flex justify-between items-start">
          {milestones.map((m) => (
            <div key={m.pct} className="flex flex-col items-center gap-2 relative">
              {/* Dot */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-mono font-black z-10 ${
                  m.reached
                    ? 'bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/40'
                    : 'bg-[#1a1a1a] text-[#bbb] border border-[#333]/40'
                }`}
                style={m.reached ? { boxShadow: '0 0 12px rgba(255,107,53,0.3)' } : {}}
              >
                {m.pct}%
              </div>
              {/* Label */}
              <div className="text-center">
                {m.reached ? (
                  <span className="font-mono text-[11px] text-[#ff6b35] font-bold tracking-wider wr-fire-text">REACHED</span>
                ) : m.date ? (
                  <span className="font-mono text-[11px] text-[#bbb] tabular-nums">
                    {format(fromUnixTime(m.date), 'MMM yyyy')}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-[#555]">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Burn Transactions Table ──────────────────────────────────────────────────

function BurnTransactionsTable({
  transactions,
  isLoading,
  isError,
}: {
  transactions: Array<{ txHash: string; timestamp: number; amount: number }>
  isLoading: boolean
  isError: boolean
}) {
  return (
    <div className="px-5 lg:px-8 py-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3 wr-sub-header">
        <span className="text-[#ff6b35]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>BURN LEDGER</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/55 to-transparent" />
        {!isLoading && !isError && transactions.length > 0 && (
          <span className="text-[#bbb] tabular-nums flex items-center gap-1.5">
            <span className="text-[12px] text-[#ff6b35]/65 font-black px-1.5 py-0.5 bg-[#ff6b35]/[0.04] border border-[#ff6b35]/10 rounded-sm">{transactions.length}</span>
            RECORDS
          </span>
        )}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[24px_1fr_1fr] md:grid-cols-[24px_1fr_1fr_1.2fr] gap-2 md:gap-3 px-3 md:px-4 pb-2 wr-table-header">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#bbb] text-right">#</div>
        {['DATE', 'AMOUNT'].map(h => (
          <div key={h} className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#bbb]">
            {h}
          </div>
        ))}
        <div className="hidden md:block font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#bbb]">
          TX HASH
        </div>
      </div>

      {/* Rows */}
      <div className="max-h-[360px] overflow-y-auto wr-scroll scroll-smooth">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[24px_1fr_1fr] md:grid-cols-[24px_1fr_1fr_1.2fr] gap-2 md:gap-3 py-3 px-3 md:px-4 border-b border-[#444]/20">
              <div className="wr-skeleton h-3 w-4" style={{ animationDelay: `${i * 120}ms` }} />
              <div className="wr-skeleton h-3 w-28" style={{ animationDelay: `${i * 120 + 50}ms` }} />
              <div className="wr-skeleton h-3 w-24" style={{ animationDelay: `${i * 120 + 100}ms` }} />
              <div className="hidden md:block wr-skeleton h-3 w-32" style={{ animationDelay: `${i * 120 + 150}ms` }} />
            </div>
          ))
        ) : isError ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border border-[#ff9e9e]/20 flex items-center justify-center wr-float wr-empty-ring">
              <span className="text-[#ff9e9e]/40 font-mono text-sm">!</span>
            </div>
            <span className="text-[#ff9e9e]/50 font-mono text-[12px] tracking-[0.25em]">DATA FEED OFFLINE</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border border-[#555]/40 flex items-center justify-center wr-float wr-empty-ring hover:border-[#ff6b35]/20 transition-colors duration-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#bbb]">
                <path d="M12 2L2 22h20L12 2z" />
                <path d="M12 10v5" />
                <circle cx="12" cy="18" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[#ccc] font-mono text-[12px] tracking-[0.2em]">
              NO BURN TRANSACTIONS RECORDED
            </span>
          </div>
        ) : (
          (() => {
            const maxAmount = Math.max(...transactions.map(t => t.amount))
            return transactions.map((tx, i) => (
              <TransactionRow key={tx.txHash} tx={tx} index={i} maxAmount={maxAmount} />
            ))
          })()
        )}
      </div>
    </div>
  )
}

// ─── Main BurnOperations Component ───────────────────────────────────────────

export default function BurnOperations() {
  const { data, isLoading, isError, dataUpdatedAt } = useBurns()
  const sectionRef = useRef<HTMLElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  // Section entrance animation
  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Mouse-tracking fire glow
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!glowRef.current || !sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    glowRef.current.style.background = `radial-gradient(350px circle at ${x}px ${y}px, rgba(255, 107, 53, 0.10), transparent 60%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!glowRef.current) return
    glowRef.current.style.background = 'transparent'
  }, [])

  return (
    <section ref={sectionRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full bg-[#0a0a0a] relative overflow-clip wr-noise wr-section-tint wr-section-tint-fire wr-inner-shadow wr-section-enter-accent wr-section-enter-accent-fire" aria-label="Burn Operations">
      {/* Mouse-tracking fire glow */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300" />

      {/* Edge marker */}
      <div className="wr-edge-marker text-[#ff6b35]" />

      {/* Section badge */}
      <div className="wr-section-badge wr-section-badge-fire hidden lg:block">SEC 02</div>

      {/* Scanning line */}
      <div className="wr-scan-line" style={{ animationDelay: '4s' }} />

      {/* Unique section background — ember gradient mesh */}
      <div className="absolute inset-0 wr-bg-burn pointer-events-none" />

      {/* Watermark section number */}
      <div className="absolute -right-4 -top-8 text-[12rem] font-black text-white/[0.012] leading-none select-none pointer-events-none font-sans wr-watermark" style={{ WebkitTextStroke: '1px rgba(255, 107, 53, 0.02)' }}>
        02
      </div>

      {/* Fire glow at top — vibrant */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#ff6b35]/[0.08] to-transparent pointer-events-none" />

      {/* Fire ember particles */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none overflow-hidden" aria-hidden="true">
        {[15, 35, 65, 85].map((left, i) => (
          <div key={i} className="wr-ember" style={{ left: `${left}%`, bottom: '0', animationDelay: `${i * 0.7}s`, animationDuration: `${3 + i * 0.4}s` }} />
        ))}
      </div>

      {/* Animated fire accent line */}
      <div className="h-[2px] wr-fire-line" aria-hidden="true" />

      {/* Section header */}
      <div className="relative flex justify-between items-center px-5 lg:px-8 py-6 border-b border-[#ff6b35]/40 wr-brackets wr-brackets-fire wr-header-line text-[#ff6b35] wr-glass">
        <div className="flex items-center gap-4">
          <div className="w-1.5 bg-[#ff6b35] wr-accent-bar wr-accent-bar-pulse" style={{ boxShadow: '0 0 8px rgba(255,107,53,0.5)' }} />
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e0e0e0] font-bold mb-1 wr-section-num">
              SECTION 02
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white font-sans wr-cursor wr-cursor-fire">
              Burn <span className="wr-gradient-text-fire drop-shadow-[0_0_10px_rgba(255,107,53,0.25)]">Operations</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Pulsing fire dot */}
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" style={{ boxShadow: '0 0 3px #ff6b35, 0 0 8px rgba(255, 107, 53, 0.35)' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#ff6b35] wr-pulse-ring" />
          </div>
          <div className="flex items-center gap-3">
            {dataUpdatedAt > 0 && (
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb] hover:text-[#bbb] tabular-nums hidden md:inline flex items-center gap-1.5 transition-colors duration-300 cursor-default">
                <span className="wr-data-dot wr-data-dot-fire" />
                {new Date(dataUpdatedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <span className="wr-tag wr-tag-glow border-[#ff6b35]/40 text-[#ff6b35]/90">
              INCINERATED
            </span>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="relative">
        <BurnSummaryBar
          totalBurned={data?.totalBurned ?? 0}
          burnedPct={data?.burnedPct ?? 0}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Supply comparison ring */}
      <SupplyComparisonRing
        totalBurned={data?.totalBurned ?? 0}
        totalSupply={data?.totalSupply ?? 0}
        burnedPct={data?.burnedPct ?? 0}
        burnSourceBalance={data?.burnSourceBalance ?? 0}
        isLoading={isLoading}
        isError={isError}
      />

      {/* Burn progress visualization */}
      <div className="px-5 lg:px-8 py-6 border-b border-[#555]/30">
        <div className="flex items-center justify-between mb-3 wr-sub-header">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold flex items-center gap-3">
            <span className="text-[#ff6b35]/70 text-[12px] wr-sub-diamond">◆</span>
            <span>TOTAL SUPPLY INCINERATION</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/55 to-transparent" />
          </div>
          <div className="font-mono text-[12px] text-[#ff6b35] font-black tabular-nums wr-fire-text">
            {isLoading ? '—' : `${(data?.burnedPct ?? 0).toFixed(2)}%`}
          </div>
        </div>
        <div className="wr-burn-bar wr-burn-bar-glow relative" role="progressbar" aria-valuenow={data?.burnedPct ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Token burn progress">
          <div
            className="wr-burn-bar-fill"
            style={{ width: isLoading ? '0%' : `${Math.min(data?.burnedPct ?? 0, 100)}%` }}
          />
          {/* Live position marker */}
          {!isLoading && (data?.burnedPct ?? 0) > 0 && (
            <>
              <div className="wr-progress-marker" style={{ left: `${Math.min(data?.burnedPct ?? 0, 100)}%` }} />
              {/* Floating percentage label above marker */}
              <div
                className="absolute -top-5 font-mono text-[11px] text-[#ff6b35] font-bold tabular-nums"
                style={{ left: `${Math.min(data?.burnedPct ?? 0, 100)}%`, transform: 'translateX(-50%)' }}
              >
                {(data?.burnedPct ?? 0).toFixed(1)}%
              </div>
            </>
          )}
          {/* Milestone markers */}
          {[25, 50, 75].map(pct => (
            <div key={pct} className="absolute top-0 bottom-0 group/milestone" style={{ left: `${pct}%` }}>
              <div className="w-px h-full bg-[#333]/40 group-hover/milestone:bg-[#ff6b35]/20 transition-colors duration-300" />
              <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#333]/25 group-hover/milestone:bg-[#ff6b35]/35 rounded-full transition-colors duration-300" />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[11px] text-[#bbb]/0 group-hover/milestone:text-[#ff6b35]/30 transition-colors duration-300 tabular-nums tracking-wider">{pct}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 relative">
          <span className="font-mono text-[11px] text-[#bbb] uppercase tracking-[0.15em] tabular-nums">0%</span>
          {[25, 50, 75].map(pct => (
            <span key={pct} className="font-mono text-[12px] text-[#bbb] uppercase tracking-[0.15em] absolute" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
              {pct}%
            </span>
          ))}
          <span className="font-mono text-[11px] text-[#bbb] uppercase tracking-[0.15em]">100%</span>
        </div>
      </div>

      {/* Burn projections */}
      <BurnProjections
        totalBurned={data?.totalBurned ?? 0}
        totalSupply={data?.totalSupply ?? 0}
        transactions={data?.transactions ?? []}
        isLoading={isLoading}
      />

      {/* Burn flame timeline */}
      <div className="px-5 lg:px-8 py-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3 wr-sub-header">
          <span className="text-[#ff6b35]/70 text-[12px] wr-sub-diamond">◆</span>
          <span>BURN LEDGER</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/55 to-transparent" />
          {!isLoading && !isError && (data?.transactions ?? []).length > 0 && (
            <span className="text-[#bbb] tabular-nums flex items-center gap-1.5">
              <span className="text-[12px] text-[#ff6b35]/65 font-black px-1.5 py-0.5 bg-[#ff6b35]/[0.04] border border-[#ff6b35]/10 rounded-sm">{(data?.transactions ?? []).length}</span>
              RECORDS
            </span>
          )}
        </div>
        <FlameTimeline
          events={(data?.transactions ?? []).map(tx => ({
            txHash: tx.txHash,
            timestamp: tx.timestamp,
            amountSol: tx.amount,
          }))}
          isLoading={isLoading}
          accentColor="#ff6b35"
          maxVisible={10}
        />
      </div>
    </section>
  )
}
