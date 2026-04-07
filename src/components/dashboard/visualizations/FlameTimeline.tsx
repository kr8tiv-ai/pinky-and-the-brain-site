'use client'

import { useRef, useEffect, useState } from 'react'
import { format, fromUnixTime } from 'date-fns'
import gsap from 'gsap'

/**
 * ⑦ Flame Timeline — Vertical timeline with fire-themed nodes
 * Events as nodes on a central line, flame icon sized by amount.
 * Dates alternate sides. Rising ember CSS effect.
 */

interface TimelineEvent {
  txHash: string
  timestamp: number
  amountSol: number
  toAddress?: string
}

interface FlameTimelineProps {
  events: TimelineEvent[]
  maxVisible?: number
  isLoading?: boolean
  accentColor?: string
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export default function FlameTimeline({
  events,
  maxVisible = 12,
  isLoading = false,
  accentColor = '#ff6b35',
}: FlameTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? events : events.slice(0, maxVisible)

  const maxAmount = events.length > 0 ? Math.max(...events.map(e => e.amountSol)) : 1

  // Stagger entrance
  useEffect(() => {
    if (!containerRef.current || isLoading) return
    const nodes = containerRef.current.querySelectorAll('[data-timeline-node]')
    if (!nodes.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        nodes,
        { opacity: 0, x: (i: number) => i % 2 === 0 ? -20 : 20, scale: 0.9 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.06,
          delay: 0.15,
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [visible.length, isLoading])

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="wr-skeleton h-16 w-full rounded" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-10 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#555]">NO EVENTS RECORDED</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Central timeline line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}60, ${accentColor}20, transparent)`,
        }}
      />

      {/* Ember particles */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 pointer-events-none">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full wr-ember-rise"
            style={{
              width: 2 + i,
              height: 2 + i,
              backgroundColor: accentColor,
              left: `${-4 + i * 4}px`,
              bottom: 0,
              opacity: 0.4,
              animationDelay: `${i * 1.3}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Timeline events */}
      <div className="space-y-0">
        {visible.map((event, i) => {
          const isLeft = i % 2 === 0
          const intensity = event.amountSol / maxAmount
          const flameSize = 14 + intensity * 14

          return (
            <div
              key={`${event.txHash}-${i}`}
              data-timeline-node
              className={`relative flex items-center gap-0 py-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* Content card */}
              <div className={`flex-1 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <div className="inline-block">
                  <div
                    className="rounded-sm border px-3 py-2.5 transition-all duration-300 hover:border-opacity-60 group/tl-card"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accentColor} 3%, #0d0d0d)`,
                      borderColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                    }}
                  >
                    <div className="font-mono text-sm font-black tabular-nums" style={{ color: accentColor }}>
                      {event.amountSol.toFixed(4)} SOL
                    </div>
                    <div className="font-mono text-[10px] text-[#888] tabular-nums mt-1">
                      {format(fromUnixTime(event.timestamp), 'MMM d, yyyy HH:mm')}
                    </div>
                    {event.toAddress && (
                      <a
                        href={`https://solscan.io/account/${event.toAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[9px] uppercase tracking-[0.1em] mt-1 inline-block transition-colors hover:brightness-125"
                        style={{ color: `color-mix(in srgb, ${accentColor} 60%, #888)` }}
                      >
                        {shortenAddress(event.toAddress)} ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Center node */}
              <div className="relative z-10 flex items-center justify-center" style={{ width: 28 }}>
                {/* Glow ring */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: flameSize + 8,
                    height: flameSize + 8,
                    backgroundColor: accentColor,
                    opacity: 0.08 + intensity * 0.12,
                    filter: 'blur(6px)',
                  }}
                />
                {/* Fire dot */}
                <div
                  className="relative rounded-full border-2 flex items-center justify-center"
                  style={{
                    width: flameSize,
                    height: flameSize,
                    backgroundColor: `color-mix(in srgb, ${accentColor} ${20 + intensity * 40}%, #0d0d0d)`,
                    borderColor: accentColor,
                    boxShadow: `0 0 ${4 + intensity * 8}px ${accentColor}${Math.round(30 + intensity * 40).toString(16)}`,
                  }}
                >
                  <span style={{ fontSize: 8 + intensity * 4 }}>
                    🔥
                  </span>
                </div>
              </div>

              {/* Spacer for the other side */}
              <div className="flex-1" />
            </div>
          )
        })}
      </div>

      {/* Show more */}
      {events.length > maxVisible && (
        <div className="text-center mt-4 relative z-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 px-4 py-2 border rounded-sm"
            style={{
              color: `color-mix(in srgb, ${accentColor} 70%, #ccc)`,
              borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
            }}
          >
            {showAll ? '▲ COLLAPSE' : `▼ SHOW ALL (${events.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
