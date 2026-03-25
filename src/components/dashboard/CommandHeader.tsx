'use client'

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { usePrice } from '@/hooks/usePrice'

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSol(n: number): string {
  return `${n.toFixed(8)} ◎`
}

function formatChange(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

// ─── Count-Up Animation Hook ────────────────────────────────────────────────

function useCountUp(
  ref: React.RefObject<HTMLSpanElement | null>,
  value: number,
  formatter: (n: number) => string,
  isReady: boolean
) {
  const prevValue = useRef(0)

  useEffect(() => {
    if (!ref.current || !isReady) return

    const obj = { val: prevValue.current }
    gsap.to(obj, {
      val: value,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = formatter(obj.val)
        }
      },
    })

    prevValue.current = value
  }, [value, isReady, formatter, ref])
}

// ─── Live Pulse Indicator ───────────────────────────────────────────────────

function LiveIndicator({ status }: { status: 'live' | 'connecting' | 'offline' }) {
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status !== 'live' || !ringRef.current) return
    const tl = gsap.timeline({ repeat: -1 })
    tl.fromTo(
      ringRef.current,
      { scale: 1, opacity: 0.6 },
      { scale: 2.8, opacity: 0, duration: 1.5, ease: 'power1.out' }
    )
    return () => { tl.kill() }
  }, [status])

  const colorMap = {
    live: 'bg-[#d4f000]',
    connecting: 'bg-[#cccccc]',
    offline: 'bg-[#ff9e9e]',
  }

  const labelMap = {
    live: 'LIVE',
    connecting: 'CONNECTING...',
    offline: 'OFFLINE',
  }

  const textColorMap = {
    live: 'text-[#d4f000]',
    connecting: 'text-[#cccccc]',
    offline: 'text-[#ff9e9e]',
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center w-4 h-4">
        <div className={`w-2 h-2 rounded-full ${colorMap[status]} relative z-10`}
          style={status === 'live' ? { boxShadow: '0 0 8px #d4f000, 0 0 16px rgba(212, 240, 0, 0.3)' } : undefined}
        />
        {status === 'live' && (
          <div
            ref={ringRef}
            className={`absolute w-2 h-2 rounded-full ${colorMap[status]}`}
          />
        )}
      </div>
      <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${textColorMap[status]}`}>
        {labelMap[status]}
      </span>
    </div>
  )
}

// ─── Data Cell ──────────────────────────────────────────────────────────────

function DataCell({
  label,
  children,
  index,
}: {
  label: string
  children: React.ReactNode
  index: number
}) {
  return (
    <div
      data-wr-reveal
      className="group relative px-5 lg:px-6 py-5 transition-colors duration-300 hover:bg-white/[0.02]"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Hover accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#d4f000] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#666] mb-2 font-bold">
        {label}
      </div>
      <div className="font-mono text-lg md:text-xl font-black text-white tabular-nums leading-none">
        {children}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CommandHeader() {
  const headerRef = useRef<HTMLElement>(null)
  const priceUsdRef = useRef<HTMLSpanElement>(null)
  const priceSolRef = useRef<HTMLSpanElement>(null)
  const changeRef = useRef<HTMLSpanElement>(null)
  const { data, isLoading, isError } = usePrice()

  const isReady = !isLoading && !isError && !!data

  // Determine connection status
  const status = isError ? 'offline' as const : isLoading ? 'connecting' as const : 'live' as const

  // GSAP entrance
  useEffect(() => {
    if (!headerRef.current) return
    const ctx = gsap.context(() => {
      // Header slide down
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )

      // Stagger reveal data cells
      const cells = headerRef.current?.querySelectorAll('[data-wr-reveal]')
      if (cells?.length) {
        gsap.fromTo(
          cells,
          { y: 12, opacity: 0, filter: 'blur(4px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: 'power3.out',
            stagger: 0.08,
            delay: 0.3,
          }
        )
      }
    }, headerRef)
    return () => ctx.revert()
  }, [])

  // Count-up animations
  const fmtUsd = useCallback(formatUsd, [])
  const fmtSol = useCallback(formatSol, [])
  const fmtChange = useCallback(formatChange, [])

  useCountUp(priceUsdRef, data?.priceUsd ?? 0, fmtUsd, isReady)
  useCountUp(priceSolRef, data?.priceSol ?? 0, fmtSol, isReady)
  useCountUp(changeRef, data?.priceChange24h ?? 0, fmtChange, isReady)

  const changeColor =
    !data ? 'text-[#cccccc]'
    : data.priceChange24h > 0 ? 'text-[#d4f000]'
    : data.priceChange24h < 0 ? 'text-[#ff9e9e]'
    : 'text-white'

  return (
    <header ref={headerRef} className="relative w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#333]/40">
      {/* Top bar */}
      <div className="flex justify-between items-center px-5 lg:px-8 py-3 border-b border-[#333]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#d4f000]" />
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#d4f000] font-black">
              $BRAIN
            </div>
          </div>
          <div className="w-px h-3 bg-[#333]/50" />
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#444] font-medium">
            War Room
          </div>
          <div className="hidden md:block w-px h-3 bg-[#333]/30" />
          <div className="hidden md:block font-mono text-[8px] uppercase tracking-[0.2em] text-[#333]">
            Intelligence Dashboard v2.0
          </div>
        </div>
        <LiveIndicator status={status} />
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#333]/20">
        <DataCell label="Price (USD)" index={0}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-24" />
          ) : (
            <span ref={priceUsdRef}>{formatUsd(data?.priceUsd ?? 0)}</span>
          )}
        </DataCell>

        <DataCell label="Price (SOL)" index={1}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-28" />
          ) : (
            <span ref={priceSolRef}>{formatSol(data?.priceSol ?? 0)}</span>
          )}
        </DataCell>

        <DataCell label="24H Change" index={2}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-16" />
          ) : (
            <span ref={changeRef} className={changeColor}>
              {formatChange(data?.priceChange24h ?? 0)}
            </span>
          )}
        </DataCell>

        <DataCell label="Market Cap" index={3}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-20" />
          ) : data?.marketCap != null ? (
            formatUsd(data.marketCap)
          ) : (
            <span className="wr-tag border-[#333]/50 text-[#444]">CLASSIFIED</span>
          )}
        </DataCell>

        <DataCell label="Volume 24H" index={4}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-20" />
          ) : data?.volume24h != null ? (
            formatUsd(data.volume24h)
          ) : (
            <span className="wr-tag border-[#333]/50 text-[#444]">CLASSIFIED</span>
          )}
        </DataCell>
      </div>
    </header>
  )
}
