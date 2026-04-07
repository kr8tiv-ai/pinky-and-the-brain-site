'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import gsap from 'gsap'
import { DataFlowParticles } from './visualizations'

interface Tab {
  id: string
  label: string
  shortLabel: string
}

interface Props {
  tabs: readonly Tab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export default function WarRoomTabBar({ tabs, activeTab, onTabChange }: Props) {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Animate sliding indicator on active tab change
  const updateIndicator = useCallback(() => {
    const activeButton = tabRefs.current.get(activeTab)
    if (!activeButton || !indicatorRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    const offsetLeft = buttonRect.left - containerRect.left + containerRef.current.scrollLeft

    gsap.to(indicatorRef.current, {
      x: offsetLeft,
      width: buttonRect.width,
      duration: 0.4,
      ease: 'power3.out',
    })
  }, [activeTab])

  useEffect(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  // Initial position without animation
  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab)
    if (!activeButton || !indicatorRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    const offsetLeft = buttonRect.left - containerRect.left + containerRef.current.scrollLeft

    gsap.set(indicatorRef.current, { x: offsetLeft, width: buttonRect.width })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <nav className="sticky top-0 z-40 w-full" role="tablist" aria-label="War Room sections">
      <div className="relative bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-[#d4f000]/15">
        {/* Ambient glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/25 to-transparent" />

        {/* Data flow particles — shows money flowing through the system */}
        <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden pointer-events-none opacity-60">
          <DataFlowParticles width={1200} height={3} particleCount={12} speed={0.6} />
        </div>

        {/* Tab buttons */}
        <div ref={containerRef} className="relative flex items-center px-4 sm:px-5 lg:px-8 overflow-x-auto scrollbar-none">
          {/* Sliding indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-[2px] rounded-t-sm pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, #d4f000, #e4ff57)',
              boxShadow: '0 0 12px rgba(212,240,0,0.4), 0 2px 8px rgba(212,240,0,0.2)',
            }}
          />

          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative px-4 sm:px-5 lg:px-6 py-3.5 sm:py-4 font-mono text-[11px] sm:text-[11px] lg:text-[12px]
                  uppercase tracking-[0.2em] sm:tracking-[0.25em] font-bold transition-all duration-300
                  group/tab whitespace-nowrap flex-shrink-0 cursor-pointer
                  ${isActive
                    ? 'text-[#d4f000]'
                    : 'text-[#777] hover:text-[#ccc]'}
                `}
              >
                {/* Hover/active glow */}
                <div className={`
                  absolute inset-0 transition-opacity duration-300
                  ${isActive ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-50'}
                  bg-gradient-to-b from-[#d4f000]/[0.04] to-transparent
                `} />

                {/* Label */}
                <span className="relative flex items-center gap-2">
                  <span className={`text-[9px] sm:text-[10px] transition-all duration-300 ${
                    isActive ? 'text-[#d4f000]' : 'text-[#444] group-hover/tab:text-[#666]'
                  }`}>
                    {tab.id === 'burns' ? '\u25B2' : '\u25C6'}
                  </span>
                  {/* Full label on sm+, short on mobile */}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </span>
              </button>
            )
          })}

          {/* Section counter */}
          <div className="ml-auto hidden lg:flex items-center gap-2 py-4 flex-shrink-0 pl-4">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              activeTab ? 'bg-[#d4f000]/50' : 'bg-[#555]/40'
            }`} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666]">
              {tabs.findIndex(t => t.id === activeTab) + 1}/{tabs.length} SECTIONS
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
