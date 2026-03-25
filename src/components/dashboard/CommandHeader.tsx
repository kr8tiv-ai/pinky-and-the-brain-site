'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
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
          style={status === 'live' ? { boxShadow: '0 0 8px #d4f000, 0 0 20px rgba(212, 240, 0, 0.4), 0 0 40px rgba(212, 240, 0, 0.1)' } : undefined}
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
      className="group relative px-5 lg:px-6 py-5 transition-all duration-300 hover:bg-white/[0.02]"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Hover accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4f000] to-[#d4f000]/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* Subtle bottom glow on hover */}
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-[#d4f000]/0 group-hover:bg-[#d4f000]/[0.06] transition-colors duration-500" />

      <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#555] mb-2 font-bold group-hover:text-[#888] transition-colors duration-300">
        {label}
      </div>
      <div className="font-mono text-base md:text-xl font-black text-white tabular-nums leading-none group-hover:text-shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300">
        {children}
      </div>
    </div>
  )
}

// ─── Live UTC Clock ──────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toISOString().slice(11, 19))
      setDate(now.toISOString().slice(0, 10))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const parts = time.split(':')

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-[#333] tabular-nums hidden md:inline">
        {date}
      </span>
      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#444] tabular-nums">
        {parts[0]}<span className="wr-colon-blink">:</span>{parts[1]}<span className="wr-colon-blink">:</span>{parts[2]} <span className="text-[#333]">UTC</span>
      </span>
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

  // Price flash on update
  const prevPriceRef = useRef<number | null>(null)
  useEffect(() => {
    if (!isReady || !data || !priceUsdRef.current) return
    if (prevPriceRef.current !== null && prevPriceRef.current !== data.priceUsd) {
      const flashColor = data.priceUsd > prevPriceRef.current ? '#d4f000' : '#ff9e9e'
      gsap.fromTo(
        priceUsdRef.current,
        { textShadow: `0 0 12px ${flashColor}` },
        { textShadow: '0 0 0px transparent', duration: 1.5, ease: 'power2.out' }
      )
    }
    prevPriceRef.current = data.priceUsd
  }, [data?.priceUsd, isReady, data])

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
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4f000]/20 to-transparent z-10" />
      {/* Bottom gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/15 to-transparent z-10" />

      {/* Top bar */}
      <div className="flex justify-between items-center px-5 lg:px-8 py-3 border-b border-[#333]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group/logo cursor-default">
            <div className="w-1.5 h-1.5 bg-[#d4f000] transition-shadow duration-300 group-hover/logo:shadow-[0_0_8px_#d4f000,0_0_16px_rgba(212,240,0,0.3)]" />
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#d4f000] font-black transition-all duration-300 group-hover/logo:text-shadow-[0_0_12px_rgba(212,240,0,0.4)]">
              $BRAIN
            </div>
          </div>
          <div className="w-px h-3 bg-[#333]/50" />
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#444] font-medium">
            War Room
          </div>
          <div className="hidden md:block w-px h-3 bg-[#333]/30" />
          <div className="hidden md:flex md:items-center md:gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#333]">
            <span>Intelligence Dashboard</span>
            <span className="text-[#d4f000]/15">v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LiveClock />
          <div className="w-px h-3 bg-[#333]/30" />
          <LiveIndicator status={status} />
        </div>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-[#333]/20">
        <DataCell label="Price (USD)" index={0}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-24" style={{ animationDelay: '0ms' }} />
          ) : (
            <span ref={priceUsdRef}>{formatUsd(data?.priceUsd ?? 0)}</span>
          )}
        </DataCell>

        <DataCell label="Price (SOL)" index={1}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-28" style={{ animationDelay: '150ms' }} />
          ) : (
            <span ref={priceSolRef}>{formatSol(data?.priceSol ?? 0)}</span>
          )}
        </DataCell>

        <DataCell label="24H Change" index={2}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-16" style={{ animationDelay: '300ms' }} />
          ) : (
            <span className={`flex items-center gap-1.5 ${changeColor}`}>
              {data && data.priceChange24h !== 0 && (
                <span className="text-[10px]">{data.priceChange24h > 0 ? '▲' : '▼'}</span>
              )}
              <span ref={changeRef}>
                {formatChange(data?.priceChange24h ?? 0)}
              </span>
            </span>
          )}
        </DataCell>

        <DataCell label="Market Cap" index={3}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-20" style={{ animationDelay: '450ms' }} />
          ) : data?.marketCap != null ? (
            formatUsd(data.marketCap)
          ) : (
            <span className="wr-tag border-[#333]/50 text-[#444]">CLASSIFIED</span>
          )}
        </DataCell>

        <DataCell label="Volume 24H" index={4}>
          {isLoading ? (
            <div className="wr-skeleton h-5 w-20" style={{ animationDelay: '600ms' }} />
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
