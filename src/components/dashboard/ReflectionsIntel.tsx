'use client'

import { useRef, useEffect, useCallback, useState, useMemo, type MouseEvent as ReactMouseEvent } from 'react'
import { format, fromUnixTime } from 'date-fns'
import gsap from 'gsap'
import { useReflections } from '@/hooks/useReflections'
import { BRAIN_TOKEN_MINT, LP_WALLET, BAGS_FEE_SHARE_V2 } from '@/lib/constants'
import ReflectionsCalculator from './ReflectionsCalculator'
import WalletChecker from './WalletChecker'
import { ArcGauge, DonutRingChart, FlameTimeline } from './visualizations'

// ─── Utility formatters ───────────────────────────────────────────────────────

function formatSolShort(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toFixed(2)
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

// ─── Fee split colors & labels ────────────────────────────────────────────────

const FEE_CATEGORIES: Record<string, { label: string; color: string; glow: string }> = {
  holders:     { label: 'Holders',     color: '#d4f000', glow: 'rgba(212,240,0,0.4)' },
  investments: { label: 'Treasury',    color: '#4a90e2', glow: 'rgba(74,144,226,0.4)' },
  dev:         { label: 'Dev',         color: '#ff9e9e', glow: 'rgba(255,158,158,0.4)' },
  burned:      { label: 'Burned',      color: '#ff6b35', glow: 'rgba(255,107,53,0.4)' },
  liquidity:   { label: 'LP Compound', color: '#00d4aa', glow: 'rgba(0,212,170,0.4)' },
  dexBoosts:   { label: 'DEX Boost',   color: '#e4ff57', glow: 'rgba(228,255,87,0.4)' },
  marketing:   { label: 'Marketing',   color: '#c084fc', glow: 'rgba(192,132,252,0.4)' },
}

// ─── SummaryCell ──────────────────────────────────────────────────────────────

function SummaryCell({
  label,
  children,
  isLoading,
  isError,
}: {
  label: string
  children: React.ReactNode
  isLoading: boolean
  isError: boolean
}) {
  const valueRef = useRef<HTMLDivElement>(null)
  const hasFlashed = useRef(false)

  useEffect(() => {
    if (isLoading || isError || hasFlashed.current || !valueRef.current) return
    hasFlashed.current = true
    gsap.fromTo(
      valueRef.current,
      { color: '#d4f000', textShadow: '0 0 14px rgba(212, 240, 0, 0.6)' },
      { color: '#ffffff', textShadow: '0 0 0px transparent', duration: 1.2, ease: 'power2.out' }
    )
  }, [isLoading, isError])

  return (
    <div className="px-5 lg:px-6 py-5 group/cell relative transition-colors duration-300 hover:bg-[#d4f000]/[0.02] wr-stat-scale">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#d4f000]/0 group-hover/cell:bg-[#d4f000]/15 transition-colors duration-300" />
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#e0e0e0] mb-2 font-bold group-hover/cell:text-[#d4f000] transition-colors flex items-center gap-1.5">
        <span className="text-[#d4f000]/70 text-[11px] group-hover/cell:text-[#d4f000] transition-colors" aria-hidden="true">◆</span>
        {label}
      </div>
      <div ref={valueRef} className="font-mono text-xl lg:text-2xl font-black text-white tabular-nums leading-none">
        {isLoading ? (
          <div className="wr-skeleton h-6 w-28" />
        ) : isError ? (
          <span className="text-[#ff9e9e]">&mdash;</span>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// ─── Accrual Progress Meter ───────────────────────────────────────────────────

function AccrualMeter({
  accrued,
  threshold,
  nextPayoutEstimate,
  isLoading,
}: {
  accrued: number
  threshold: number
  nextPayoutEstimate: number | null
  isLoading: boolean
}) {
  const pct = Math.min((accrued / threshold) * 100, 100)
  const isHot = pct > 80

  return (
    <div className="px-5 lg:px-8 py-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>PAYOUT ACCRUAL</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
        <span className="text-[#bbb]">
          {isLoading ? '...' : `${accrued.toFixed(2)} / ${threshold.toFixed(0)} SOL`}
        </span>
      </div>

      <div className="relative h-5 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#333]/20">
        {isLoading ? (
          <div className="wr-skeleton h-full w-full" />
        ) : (
          <>
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${pct}%`,
                background: isHot
                  ? 'linear-gradient(90deg, #d4f000, #e4ff57)'
                  : 'linear-gradient(90deg, #d4f000/60, #d4f000)',
                boxShadow: isHot
                  ? '0 0 20px rgba(212,240,0,0.5), 0 0 40px rgba(212,240,0,0.2)'
                  : '0 0 8px rgba(212,240,0,0.2)',
              }}
            />
            {isHot && (
              <div
                className="absolute inset-y-0 left-0 rounded-full animate-pulse"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, transparent, rgba(228,255,87,0.3))',
                  animationDuration: '1.5s',
                }}
              />
            )}
          </>
        )}
      </div>

      <div className="flex justify-between mt-2">
        <span className="font-mono text-[11px] text-[#bbb] tabular-nums">
          {pct.toFixed(0)}% to threshold
        </span>
        {nextPayoutEstimate && (
          <span className="font-mono text-[11px] text-[#d4f000]/80 tabular-nums">
            Est. {format(fromUnixTime(nextPayoutEstimate), 'MMM d, HH:mm')}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Fee Distribution Bar ─────────────────────────────────────────────────────

function FeeDistributionBar({
  breakdown,
  solPriceUsd,
  isLoading,
}: {
  breakdown: Record<string, { pct: number; sol: number }>
  solPriceUsd: number
  isLoading: boolean
}) {
  const order = ['holders', 'investments', 'dev', 'burned', 'liquidity', 'dexBoosts', 'marketing']

  return (
    <div className="px-5 lg:px-8 py-6 border-t border-[#333]/15">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-5 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>FEE DISTRIBUTION</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
        <span className="text-[#bbb]">SPLIT</span>
      </div>

      {isLoading ? (
        <div className="wr-skeleton h-8 w-full rounded-full mb-4" />
      ) : (
        <>
          {/* Stacked bar */}
          <div className="flex h-6 rounded-full overflow-hidden mb-5 border border-[#333]/15">
            {order.map((key) => {
              const cat = FEE_CATEGORIES[key]
              const entry = breakdown[key]
              if (!cat || !entry) return null
              return (
                <div
                  key={key}
                  className="relative group/seg transition-all duration-300 hover:brightness-125"
                  style={{
                    width: `${entry.pct}%`,
                    backgroundColor: cat.color,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                  title={`${cat.label}: ${entry.pct}% (${entry.sol.toFixed(2)} SOL)`}
                >
                  {entry.pct >= 8 && (
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-black/70">
                      {entry.pct}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {order.map((key) => {
              const cat = FEE_CATEGORIES[key]
              const entry = breakdown[key]
              if (!cat || !entry) return null
              return (
                <div key={key} className="flex items-center gap-2 py-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.glow}` }}
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-[#ccc] font-bold truncate">{cat.label}</div>
                    <div className="font-mono text-[10px] text-[#bbb] tabular-nums">
                      {entry.sol.toFixed(2)} SOL
                      {solPriceUsd > 0 && (
                        <span className="text-[#999] ml-1">
                          ({formatUsd(entry.sol * solPriceUsd)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Distribution History Table ───────────────────────────────────────────────

function DistributionHistory({
  distributions,
  solPriceUsd,
  isLoading,
}: {
  distributions: Array<{ txHash: string; timestamp: number; amountSol: number; toAddress: string }>
  solPriceUsd: number
  isLoading: boolean
}) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? distributions : distributions.slice(0, 15)

  return (
    <div className="px-5 lg:px-8 py-6 border-t border-[#333]/15">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>REFLECTION HISTORY</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
        <span className="text-[#bbb]">{distributions.length} PAYOUTS</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="wr-skeleton h-10 w-full" />
          ))}
        </div>
      ) : distributions.length === 0 ? (
        <div className="py-8 text-center">
          <span className="font-mono text-[12px] text-[#bbb] tracking-[0.2em]">NO DISTRIBUTIONS YET</span>
        </div>
      ) : (
        <>
          <div>
            <table className="w-full font-mono text-[12px]">
              <thead>
                <tr className="text-left text-[#bbb] uppercase tracking-wider border-b border-[#333]/15">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4 text-right">Amount</th>
                  <th className="py-2 pr-4 text-right">USD</th>
                  <th className="py-2 pr-4">To</th>
                  <th className="py-2">Tx</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((d, i) => (
                  <tr
                    key={d.txHash + i}
                    className="border-b border-[#333]/8 hover:bg-[#d4f000]/[0.015] transition-colors"
                  >
                    <td className="py-2.5 pr-4 text-[#ccc] whitespace-nowrap tabular-nums">
                      {format(fromUnixTime(d.timestamp), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-white font-bold tabular-nums">
                      {d.amountSol.toFixed(4)} SOL
                    </td>
                    <td className="py-2.5 pr-4 text-right text-[#bbb] tabular-nums">
                      {solPriceUsd > 0 ? formatUsd(d.amountSol * solPriceUsd) : '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-[#bbb]">
                      <a
                        href={`https://solscan.io/account/${d.toAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#d4f000] transition-colors"
                      >
                        {shortenAddress(d.toAddress)}
                      </a>
                    </td>
                    <td className="py-2.5">
                      <a
                        href={`https://solscan.io/tx/${d.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d4f000]/70 hover:text-[#d4f000] transition-colors"
                      >
                        ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {distributions.length > 15 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d4f000]/70 hover:text-[#d4f000] transition-colors"
            >
              {showAll ? '▲ SHOW LESS' : `▼ SHOW ALL (${distributions.length})`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── DEX Boost & LP Compound Cards ────────────────────────────────────────────

function FeatureCards({
  breakdown,
  solPriceUsd,
  isLoading,
}: {
  breakdown: Record<string, { pct: number; sol: number }>
  solPriceUsd: number
  isLoading: boolean
}) {
  const cards = [
    {
      key: 'dexBoosts',
      title: 'DEX BOOST',
      icon: '⚡',
      accent: '#e4ff57',
      description: 'Automated DEX visibility boosts funded by 5% of trading fees',
    },
    {
      key: 'liquidity',
      title: 'LP COMPOUND',
      icon: '🔄',
      accent: '#00d4aa',
      description: 'Auto-compounding 10% of fees back into Meteora DAMM v2 liquidity',
    },
  ]

  return (
    <div className="px-5 lg:px-8 py-6 border-t border-[#333]/15">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>AUTOMATED FEATURES</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
        <span className="text-[#bbb]">BAGS.FM</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const entry = breakdown[card.key]
          return (
            <div
              key={card.key}
              className="relative p-[1px] overflow-clip rounded-sm group/feature"
            >
              {/* Border gradient */}
              <div
                className="absolute inset-0 rounded-sm opacity-30 group-hover/feature:opacity-60 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${card.accent}40, transparent 60%)`,
                }}
              />
              <div className="relative bg-[#0d0d0d] p-5 rounded-sm">
                {/* Accent bar */}
                <div
                  className="absolute top-0 left-0 w-[3px] h-full rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, ${card.accent}, transparent)`,
                    boxShadow: `0 0 8px ${card.accent}40`,
                  }}
                />
                <div className="pl-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{card.icon}</span>
                      <span className="font-mono text-[12px] uppercase tracking-[0.2em] font-bold" style={{ color: card.accent }}>
                        {card.title}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#bbb] bg-[#1a1a1a] px-2 py-0.5 rounded">
                      {entry?.pct ?? 0}% of fees
                    </span>
                  </div>
                  <div className="font-mono text-lg font-black text-white tabular-nums mb-1">
                    {isLoading ? (
                      <div className="wr-skeleton h-5 w-24" />
                    ) : (
                      <>
                        {(entry?.sol ?? 0).toFixed(2)} SOL
                        {solPriceUsd > 0 && (
                          <span className="text-[13px] text-[#bbb] ml-2">
                            ({formatUsd((entry?.sol ?? 0) * solPriceUsd)})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-[#bbb] leading-relaxed">{card.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Contract Info Footer ─────────────────────────────────────────────────────

function ContractInfo() {
  const links = [
    {
      label: 'Fee Share V2 Program',
      address: BAGS_FEE_SHARE_V2,
      href: `https://explorer.solana.com/address/${BAGS_FEE_SHARE_V2}`,
    },
    {
      label: 'LP Wallet',
      address: LP_WALLET,
      href: `https://solscan.io/account/${LP_WALLET}`,
    },
    {
      label: '$BRAIN on Bags.fm',
      address: BRAIN_TOKEN_MINT,
      href: `https://bags.fm/b/${BRAIN_TOKEN_MINT}`,
    },
  ]

  return (
    <div className="px-5 lg:px-8 py-4 border-t border-[#333]/15 flex flex-wrap gap-x-6 gap-y-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#bbb] hover:text-[#d4f000] transition-colors flex items-center gap-1.5 group/link"
        >
          <span className="text-[#d4f000]/40 group-hover/link:text-[#d4f000]/70 transition-colors">◆</span>
          {link.label}
          <span className="text-[#999]">{shortenAddress(link.address)}</span>
          <span className="text-[#d4f000]/50">↗</span>
        </a>
      ))}
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function ReflectionsIntel() {
  const { data, isLoading, isError, dataUpdatedAt } = useReflections()
  const sectionRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  // Build donut ring segments from fee breakdown
  const donutSegments = useMemo(() => {
    const breakdown = data?.feeBreakdown ?? {}
    const order = ['holders', 'investments', 'dev', 'burned', 'liquidity', 'dexBoosts', 'marketing']
    return order
      .filter(key => breakdown[key])
      .map(key => ({
        key,
        label: FEE_CATEGORIES[key]?.label ?? key,
        value: breakdown[key].sol,
        pct: breakdown[key].pct,
        color: FEE_CATEGORIES[key]?.color ?? '#888',
        glow: FEE_CATEGORIES[key]?.glow ?? 'rgba(136,136,136,0.3)',
      }))
  }, [data?.feeBreakdown])

  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!spotlightRef.current || !sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spotlightRef.current.style.background = `radial-gradient(380px circle at ${x}px ${y}px, rgba(212, 240, 0, 0.06), transparent 60%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!spotlightRef.current) return
    spotlightRef.current.style.background = 'transparent'
  }, [])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full bg-[#0a0a0a] relative overflow-clip wr-noise wr-section-tint wr-inner-shadow wr-section-enter-accent"
      aria-label="Reflections Intelligence"
    >
      {/* Mouse-tracking spotlight */}
      <div ref={spotlightRef} className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300" />

      {/* Edge marker */}
      <div className="wr-edge-marker text-[#d4f000]" />

      {/* Section badge */}
      <div className="wr-section-badge hidden lg:block">SEC 04</div>

      {/* Scanning line */}
      <div className="wr-scan-line" />

      {/* Background effects */}
      <div className="absolute inset-0 wr-dot-grid opacity-30 pointer-events-none" />

      {/* Watermark */}
      <div
        className="absolute -right-4 -top-8 text-[12rem] font-black text-white/[0.012] leading-none select-none pointer-events-none font-sans wr-watermark"
        style={{ WebkitTextStroke: '1px rgba(212, 240, 0, 0.02)' }}
      >
        04
      </div>

      {/* Section header */}
      <div className="px-5 lg:px-8 py-6 border-b border-[#d4f000]/40 wr-brackets wr-header-line text-[#d4f000] wr-glass">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className="w-1.5 bg-[#d4f000] wr-accent-bar wr-accent-bar-pulse"
              style={{ boxShadow: '0 0 8px rgba(212,240,0,0.5)' }}
            />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e0e0e0] font-bold mb-1 wr-section-num">
                SECTION 04
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white font-sans wr-cursor">
                Reflections <span className="wr-gradient-text-lime drop-shadow-[0_0_10px_rgba(212,240,0,0.4)]">Intel</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dataUpdatedAt > 0 && (
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb] tabular-nums hidden md:inline">
                <span className="wr-data-dot" />
                {new Date(dataUpdatedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
              </span>
            )}
            <div className="wr-tag wr-tag-glow border-[#d4f000]/50 text-[#d4f000]">
              BAGS.FM
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-[#333]/20 border-b border-[#555]/30 wr-summary-accent wr-summary-glow-divider"
        role="region"
        aria-label="Reflections summary"
      >
        <SummaryCell label="Total Reflected" isLoading={isLoading} isError={isError}>
          <span className="flex items-baseline gap-1.5">
            {formatSolShort(data?.totalReflectedSol ?? 0)} SOL
            {(data?.solPriceUsd ?? 0) > 0 && (
              <span className="text-[13px] text-[#d4f000]/70">
                ({formatUsd((data?.totalReflectedSol ?? 0) * (data?.solPriceUsd ?? 0))})
              </span>
            )}
          </span>
        </SummaryCell>
        <SummaryCell label="Total Fees Earned" isLoading={isLoading} isError={isError}>
          {formatSolShort(data?.totalFeesLifetimeSol ?? 0)} SOL
        </SummaryCell>
        <SummaryCell label="Est. Volume" isLoading={isLoading} isError={isError}>
          {formatUsd((data?.estimatedVolumeSol ?? 0) * (data?.solPriceUsd ?? 0))}
        </SummaryCell>
        <SummaryCell label="Next Payout" isLoading={isLoading} isError={isError}>
          <span className="flex items-baseline gap-1.5">
            {(data?.currentAccruedSol ?? 0).toFixed(2)}
            <span className="text-[13px] text-[#bbb]">/ {data?.payoutThresholdSol ?? 10} SOL</span>
          </span>
        </SummaryCell>
        <SummaryCell label="Daily Accrual" isLoading={isLoading} isError={isError}>
          {(() => {
            // Compute from actual distribution events — sum distributed / time span
            // This avoids dividing lifetime fees by a short claim window
            const dists = data?.distributions ?? []
            let daily = 0
            if (dists.length >= 2) {
              const totalDist = dists.reduce((s, d) => s + d.amountSol, 0)
              const spanSec = dists[0].timestamp - dists[dists.length - 1].timestamp
              if (spanSec > 3600) daily = (totalDist / spanSec) * 86400
            }
            const trendUp = dists.length >= 2 ? dists[0].amountSol >= dists[1].amountSol : true
            return (
              <span className="flex items-baseline gap-1.5">
                {daily.toFixed(4)} SOL
                <span className={`text-[13px] ${trendUp ? 'text-[#d4f000]' : 'text-[#ff9e9e]'}`}>
                  {trendUp ? '▲' : '▼'}
                </span>
              </span>
            )
          })()}
        </SummaryCell>
        <SummaryCell label="Weekly Avg" isLoading={isLoading} isError={isError}>
          {(() => {
            const dists = data?.distributions ?? []
            let daily = 0
            if (dists.length >= 2) {
              const totalDist = dists.reduce((s, d) => s + d.amountSol, 0)
              const spanSec = dists[0].timestamp - dists[dists.length - 1].timestamp
              if (spanSec > 3600) daily = (totalDist / spanSec) * 86400
            }
            return `${(daily * 7).toFixed(2)} SOL`
          })()}
        </SummaryCell>
      </div>

      {/* Accrual arc gauge */}
      <div className="px-5 lg:px-8 py-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3 wr-sub-header">
          <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
          <span>PAYOUT ACCRUAL</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
          <span className="text-[#bbb]">
            {isLoading ? '...' : `${(data?.currentAccruedSol ?? 0).toFixed(2)} / ${(data?.payoutThresholdSol ?? 10).toFixed(0)} SOL`}
          </span>
        </div>
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="wr-skeleton h-24 w-48 rounded" />
          ) : (
            <ArcGauge
              value={data?.currentAccruedSol ?? 0}
              max={data?.payoutThresholdSol ?? 10}
              unit="SOL"
              size={260}
            />
          )}
          {data?.nextPayoutEstimate && (
            <span className="font-mono text-[11px] text-[#d4f000]/80 tabular-nums mt-2">
              Est. {format(fromUnixTime(data.nextPayoutEstimate), 'MMM d, HH:mm')}
            </span>
          )}
        </div>
      </div>

      {/* Fee distribution donut ring */}
      <div className="px-5 lg:px-8 py-6 border-t border-[#333]/15">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-5 flex items-center gap-3 wr-sub-header">
          <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
          <span>FEE DISTRIBUTION</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
          <span className="text-[#bbb]">SPLIT</span>
        </div>
        <DonutRingChart
          segments={donutSegments}
          totalLabel="FEES"
          totalValue={`${(Object.values(data?.feeBreakdown ?? {}).reduce((s, e) => s + e.sol, 0)).toFixed(1)} SOL`}
          isLoading={isLoading}
        />
      </div>

      {/* DEX Boost & LP Compound feature cards */}
      <FeatureCards
        breakdown={data?.feeBreakdown ?? {}}
        solPriceUsd={data?.solPriceUsd ?? 0}
        isLoading={isLoading}
      />

      {/* Distribution flame timeline */}
      <div className="px-5 lg:px-8 py-6 border-t border-[#333]/15">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-4 flex items-center gap-3 wr-sub-header">
          <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
          <span>REFLECTION HISTORY</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
          <span className="text-[#bbb]">{(data?.distributions ?? []).length} PAYOUTS</span>
        </div>
        <FlameTimeline
          events={(data?.distributions ?? []).map(d => ({
            txHash: d.txHash,
            timestamp: d.timestamp,
            amountSol: d.amountSol,
            toAddress: d.toAddress,
          }))}
          isLoading={isLoading}
          accentColor="#d4f000"
        />
      </div>

      {/* Reflections calculator */}
      <ReflectionsCalculator
        currentAccruedSol={data?.currentAccruedSol ?? 0}
        lastPayoutTimestamp={data?.lastPayoutTimestamp ?? null}
        solPriceUsd={data?.solPriceUsd ?? 0}
        holdersSharePct={data?.feeBreakdown?.holders?.pct ?? 20}
        totalSupply={data?.totalSupply ?? 0}
        isLoading={isLoading}
      />

      {/* Wallet eligibility checker */}
      <WalletChecker
        solPriceUsd={data?.solPriceUsd ?? 0}
        payoutThresholdSol={data?.payoutThresholdSol ?? 7}
      />

      {/* Contract info footer */}
      <ContractInfo />
    </section>
  )
}
