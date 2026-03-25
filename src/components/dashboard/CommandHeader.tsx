'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { usePrice } from '@/hooks/usePrice'

function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSol(n: number): string {
  return `${n.toFixed(8)} \u25ce`
}

function formatChange(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export default function CommandHeader() {
  const headerRef = useRef<HTMLElement>(null)
  const { data, isLoading, isError } = usePrice()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
    }, headerRef)
    return () => ctx.revert()
  }, [])

  const connectionStatus = isError
    ? { label: 'OFFLINE', color: 'text-[#ff9e9e]' }
    : isLoading
    ? { label: 'CONNECTING...', color: 'text-[#cccccc]' }
    : { label: 'LIVE', color: 'text-[#d4f000]' }

  const changeColor =
    isLoading || !data
      ? 'text-[#cccccc]'
      : data.priceChange24h > 0
      ? 'text-[#d4f000]'
      : 'text-[#ff9e9e]'

  return (
    <header ref={headerRef} className="relative w-full border-b border-[#333] bg-[#0d0d0d]">
      {/* Top bar: title + live indicator */}
      <div className="flex justify-between items-center px-6 lg:px-12 py-4 border-b border-[#333]/50">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#cccccc] font-bold">
          WAR ROOM &mdash; $BRAIN INTELLIGENCE DASHBOARD
        </div>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
          <span
            className={`w-2 h-2 rounded-full ${
              isError
                ? 'bg-[#ff9e9e]'
                : 'bg-[#d4f000] animate-pulse shadow-[0_0_6px_#d4f000]'
            }`}
          />
          <span className={connectionStatus.color}>{connectionStatus.label}</span>
        </div>
      </div>

      {/* Data grid: 2 cols on mobile, 5 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#333]/50">
        {/* PRICE (USD) */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            Price (USD)
          </div>
          <div className="font-mono text-lg md:text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">██████</span>
            ) : (
              formatUsd(data?.priceUsd ?? 0)
            )}
          </div>
        </div>

        {/* PRICE (SOL) */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            Price (SOL)
          </div>
          <div className="font-mono text-lg md:text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">████████</span>
            ) : (
              formatSol(data?.priceSol ?? 0)
            )}
          </div>
        </div>

        {/* 24H CHANGE */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            24H Change
          </div>
          <div className={`font-mono text-lg md:text-2xl font-black tabular-nums ${changeColor}`}>
            {isLoading ? (
              <span className="text-[#cccccc]">█████</span>
            ) : (
              formatChange(data?.priceChange24h ?? 0)
            )}
          </div>
        </div>

        {/* MARKET CAP — always undefined from Birdeye */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            Market Cap
          </div>
          <div className="font-mono text-lg md:text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">████████</span>
            ) : data?.marketCap != null ? (
              formatUsd(data.marketCap)
            ) : (
              <span className="text-xs text-[#666] border border-[#333] px-2 py-0.5 tracking-widest font-mono">
                CLASSIFIED
              </span>
            )}
          </div>
        </div>

        {/* VOLUME 24H — always undefined from Birdeye */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            Volume 24H
          </div>
          <div className="font-mono text-lg md:text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">████████</span>
            ) : data?.volume24h != null ? (
              formatUsd(data.volume24h)
            ) : (
              <span className="text-xs text-[#666] border border-[#333] px-2 py-0.5 tracking-widest font-mono">
                CLASSIFIED
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
