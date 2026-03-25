'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { format, fromUnixTime } from 'date-fns'
import gsap from 'gsap'
import { useBurns } from '@/hooks/useBurns'

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
        duration: 1.8,
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
        <div className="wr-skeleton h-6 w-32" />
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
          <span className="text-[#666] mx-1.5">+</span>
          <span className="text-[#ff6b35]">{LP_LOCKED_PCT}%</span>
          <span className="text-[#444] text-[9px] ml-1.5">LOCKED</span>
        </span>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#333]/20 border-b border-[#333]/20 wr-summary-accent wr-summary-accent-fire wr-summary-glow-divider" role="region" aria-label="Burn statistics summary">
      {cells.map(({ label, content }) => (
        <div key={label} className="px-5 lg:px-6 py-5 group/cell relative transition-colors duration-300 hover:bg-[#ff6b35]/[0.015] wr-stat-scale">
          {/* Hover accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-[#ff6b35]/0 group-hover/cell:bg-[#ff6b35]/10 transition-colors duration-300" />
          <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#555] mb-2 font-bold group-hover/cell:text-[#888] transition-colors flex items-center gap-1.5">
            <span className="text-[#ff6b35]/20 text-[5px]">◆</span>
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
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', delay: index * 0.05 }
    )
  }, [index])

  const intensity = maxAmount > 0 ? (tx.amount / maxAmount) * 100 : 0

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-[24px_1fr_1fr] md:grid-cols-[24px_1fr_1fr_1.2fr] gap-2 md:gap-3 items-center py-3 px-3 md:px-4 wr-row-stripe wr-row-flash wr-row-accent wr-row-glow-intensity border-b border-[#333]/10 font-mono text-[9px] md:text-[10px] transition-colors duration-200 relative"
    >
      {/* Burn intensity bar (background) */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#ff6b35]/[0.03] to-transparent pointer-events-none"
        style={{ width: `${intensity}%` }}
      />
      <div className="wr-row-num">{String(index + 1).padStart(2, '0')}</div>
      <div className="text-[#666] tabular-nums flex items-center gap-2">
        <span className="text-[#ff6b35]/30 text-[8px]">●</span>
        <span>{format(fromUnixTime(tx.timestamp), 'yyyy-MM-dd HH:mm')}</span>
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
          <span className="tabular-nums">{tx.txHash.slice(0, 8)}…{tx.txHash.slice(-6)}</span>
          <span className="text-[8px]">↗</span>
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(tx.txHash)}
          className="text-[#333] hover:text-[#ff6b35]/60 transition-colors"
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
      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold mb-4 flex items-center gap-3 wr-sub-header">
        <span className="text-[#ff6b35]/30 text-[6px] wr-sub-diamond">◆</span>
        <span>BURN LEDGER</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/20 to-transparent" />
        {!isLoading && !isError && (
          <span className="text-[#444] tabular-nums">{transactions.length} RECORDS</span>
        )}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[24px_1fr_1fr] md:grid-cols-[24px_1fr_1fr_1.2fr] gap-2 md:gap-3 px-3 md:px-4 pb-2 wr-table-header">
        <div className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-[#333]">#</div>
        {['DATE', 'AMOUNT'].map(h => (
          <div key={h} className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#444]">
            {h}
          </div>
        ))}
        <div className="hidden md:block font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#444]">
          TX HASH
        </div>
      </div>

      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto wr-scroll">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[24px_1fr_1fr] md:grid-cols-[24px_1fr_1fr_1.2fr] gap-2 md:gap-3 py-3 px-3 md:px-4 border-b border-[#333]/10">
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
            <span className="text-[#ff9e9e]/40 font-mono text-[10px] tracking-[0.2em]">DATA FEED OFFLINE</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border border-[#333]/30 flex items-center justify-center wr-float wr-empty-ring">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#333]">
                <path d="M12 2L2 22h20L12 2z" />
                <path d="M12 10v5" />
                <circle cx="12" cy="18" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[#333] font-mono text-[10px] tracking-[0.2em]">
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
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
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
    glowRef.current.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(255, 107, 53, 0.06), transparent 60%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!glowRef.current) return
    glowRef.current.style.background = 'transparent'
  }, [])

  return (
    <section ref={sectionRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full bg-[#0a0a0a] relative overflow-hidden wr-noise wr-section-tint wr-section-tint-fire wr-inner-shadow" aria-label="Burn Operations">
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
      <div className="absolute -right-4 -top-8 text-[12rem] font-black text-white/[0.015] leading-none select-none pointer-events-none font-sans wr-watermark" style={{ WebkitTextStroke: '1px rgba(255, 107, 53, 0.025)' }}>
        02
      </div>

      {/* Fire glow at top */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#ff6b35]/[0.04] to-transparent pointer-events-none" />

      {/* Fire ember particles */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none overflow-hidden">
        {[10, 25, 40, 60, 75, 88].map((left, i) => (
          <div key={i} className="wr-ember" style={{ left: `${left}%`, bottom: '0', animationDelay: `${i * 0.5}s`, animationDuration: `${2.5 + i * 0.3}s` }} />
        ))}
      </div>

      {/* Animated fire accent line */}
      <div className="h-[2px] wr-fire-line" />

      {/* Section header */}
      <div className="relative flex justify-between items-center px-5 lg:px-8 py-6 border-b border-[#333]/20 wr-brackets wr-brackets-fire wr-header-line text-[#ff6b35]">
        <div className="flex items-center gap-3">
          <div className="w-1 bg-[#ff6b35] wr-accent-bar wr-accent-bar-pulse" />
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555] font-bold mb-0.5 wr-section-num">
              SECTION 02
            </div>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-[#cccccc] font-sans wr-cursor wr-cursor-fire">
              Burn <span className="wr-gradient-text-fire">Operations</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Pulsing fire dot */}
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" style={{ boxShadow: '0 0 6px #ff6b35, 0 0 12px rgba(255, 107, 53, 0.3)' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#ff6b35] wr-pulse-ring" />
          </div>
          <div className="flex items-center gap-3">
            {dataUpdatedAt > 0 && (
              <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-[#333] tabular-nums hidden md:inline flex items-center gap-1.5">
                <span className="wr-data-dot wr-data-dot-fire" />
                {new Date(dataUpdatedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <span className="wr-tag wr-tag-glow border-[#ff6b35]/30 text-[#ff6b35]/80">
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

      {/* Burn progress visualization */}
      <div className="px-5 lg:px-8 py-5 border-b border-[#333]/20">
        <div className="flex items-center justify-between mb-3 wr-sub-header">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] font-bold flex items-center gap-3">
            <span className="text-[#ff6b35]/30 text-[6px] wr-sub-diamond">◆</span>
            <span>TOTAL SUPPLY INCINERATION</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/20 to-transparent" />
          </div>
          <div className="font-mono text-[9px] text-[#ff6b35] font-bold tabular-nums">
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
                className="absolute -top-5 font-mono text-[7px] text-[#ff6b35] font-bold tabular-nums"
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
              <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#333]/30 group-hover/milestone:bg-[#ff6b35]/40 rounded-full transition-colors duration-300" />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 relative">
          <span className="font-mono text-[7px] text-[#333] uppercase tracking-[0.15em]">0%</span>
          {[25, 50, 75].map(pct => (
            <span key={pct} className="font-mono text-[6px] text-[#222] uppercase tracking-[0.1em] absolute" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
              {pct}%
            </span>
          ))}
          <span className="font-mono text-[7px] text-[#333] uppercase tracking-[0.15em]">100%</span>
        </div>
      </div>

      {/* Transactions table */}
      <div className="relative">
        <BurnTransactionsTable
          transactions={data?.transactions ?? []}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </section>
  )
}
