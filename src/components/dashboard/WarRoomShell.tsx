'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import gsap from 'gsap'
import CommandHeader from './CommandHeader'
import TokenInfoStrip from './TokenInfoStrip'
import WarRoomTabBar from './WarRoomTabBar'
import SectionReveal from './SectionReveal'
import Governance from './Governance'
import GovernanceAdmin from './GovernanceAdmin'
import Proposals from './Proposals'
import TreasuryIntel from './TreasuryIntel'
import ReflectionsIntel from './ReflectionsIntel'
import BurnOperations from './BurnOperations'

const TABS = [
  { id: 'governance',  label: 'GOVERNANCE',  shortLabel: 'GOV' },
  { id: 'treasury',    label: 'TREASURY',    shortLabel: 'TREASURY' },
  { id: 'reflections', label: 'REFLECTIONS', shortLabel: 'REFLECT' },
  { id: 'burns',       label: 'BURNS',       shortLabel: 'BURNS' },
] as const

type TabId = typeof TABS[number]['id']

const VALID_TABS = new Set<string>(TABS.map(t => t.id))

export default function WarRoomShell() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  // URL-aware tab state
  const paramTab = searchParams.get('tab')
  const initialTab: TabId = paramTab && VALID_TABS.has(paramTab) ? (paramTab as TabId) : 'governance'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  // Sync URL on tab change
  const handleTabChange = useCallback((tab: string) => {
    if (!VALID_TABS.has(tab)) return
    setActiveTab(tab as TabId)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    router.replace(url.pathname + url.search, { scroll: false })
    // Scroll to top of content area
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [router])

  // Tab content entrance animation
  useEffect(() => {
    if (!contentRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 24, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }
      )
    }, contentRef)
    return () => ctx.revert()
  }, [activeTab])

  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] text-[#e0e0e0] overflow-x-hidden" role="main">
      {/* Skip to content */}
      <a href="#war-room-content" className="wr-skip-link">Skip to content</a>

      {/* ── Layer 1: Ambient glow orbs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[50vw] h-[40vw] max-w-3xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.20] animate-pulse wr-orb-1" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-5%] right-[10%] w-[40vw] h-[35vw] max-w-2xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.16] wr-orb-2" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[25vw] max-w-xl bg-[#4a90e2] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.14] wr-orb-3" />
        <div className="absolute bottom-[20%] left-[5%] w-[25vw] h-[20vw] max-w-lg bg-[#ff6b35] rounded-full mix-blend-screen filter blur-[140px] opacity-[0.12] animate-pulse wr-orb-2" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[60%] right-[30%] w-[20vw] h-[15vw] max-w-md bg-[#e4ff57] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.10] wr-orb-1" />
      </div>

      {/* ── Layer 1.5: Atmospheric video underlay ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-[0.18] mix-blend-screen"
          src="/videos/war-room-bg.mp4"
        />
      </div>

      {/* ── Layer 2: Grid background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none wr-grid-bg opacity-30" />

      {/* ── Layer 3: Scanlines ── */}
      <div className="fixed inset-0 z-0 pointer-events-none wr-scanlines" />

      {/* ── Layer 4: Noise texture ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('/noise.gif')] opacity-[0.05] mix-blend-overlay" />

      {/* ── Layer 5: Bottom depth gradient ── */}
      <div className="wr-depth-gradient" />

      {/* ── Layer 6: Top vignette ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(212,240,0,0.14),transparent_70%)]" />

      {/* ── Layer 6: Corner vignettes ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_50%_50%_at_0%_0%,rgba(0,0,0,0.15),transparent_70%)]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,rgba(0,0,0,0.15),transparent_70%)]" />

      {/* ── Content ── */}
      <div id="war-room-content" className="relative z-10">
        {/* Persistent header */}
        <CommandHeader />
        <TokenInfoStrip />

        {/* Tab navigation */}
        <WarRoomTabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab content — key forces remount for entrance animation */}
        <div ref={contentRef} key={activeTab} className="min-h-[60vh]" role="tabpanel" id={`tabpanel-${activeTab}`}>
          <SectionReveal>
            {activeTab === 'governance' && (
              <>
                <Governance />
                <GovernanceAdmin />
                <Proposals />
              </>
            )}
            {activeTab === 'treasury' && <TreasuryIntel />}
            {activeTab === 'reflections' && <ReflectionsIntel />}
            {activeTab === 'burns' && <BurnOperations />}
          </SectionReveal>
        </div>

        {/* Footer */}
        <footer className="w-full bg-[#0a0a0a] relative overflow-hidden wr-footer-border" role="contentinfo" aria-label="War Room footer">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 wr-dot-grid opacity-12 pointer-events-none" />

          {/* Footer ticker */}
          <div className="border-b border-[#444]/20 overflow-hidden py-1.5 relative">
            <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
            <div className="ticker-track">
              {['WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED',
                'WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED'].map((item, i) => (
                <span key={i} className="font-mono text-[12px] md:text-[11px] uppercase tracking-[0.3em] text-[#ddd] mx-5 md:mx-7 whitespace-nowrap group/ticker-item">
                  <span className="text-[#d4f000]/50 mr-2.5 inline-block transition-transform duration-300 group-hover/ticker-item:rotate-45 text-[11px]">{'\u25C6'}</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Gradient separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.25] to-transparent" />

          <div className="relative px-5 lg:px-8 py-8">
            {/* Watermark */}
            <div className="absolute right-8 bottom-4 text-[5rem] font-black text-white/[0.025] leading-none select-none pointer-events-none font-sans tracking-tighter wr-breathe wr-watermark" style={{ WebkitTextStroke: '1px rgba(212, 240, 0, 0.04)' }}>
              $BRAIN
            </div>

            {/* Disclaimer */}
            <div className="text-center mb-4 relative">
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-px bg-gradient-to-r from-transparent via-[#333]/10 to-transparent" />
              <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb] font-bold">
                NOT FINANCIAL ADVICE {'\u2014'} DYOR {'\u2014'} ALL DATA FOR INFORMATIONAL PURPOSES ONLY
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-1 h-4 bg-[#d4f000]/60" />
                <div>
                  <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#ddd] font-bold flex items-center gap-2">
                    $BRAIN INTELLIGENCE COMMAND
                    <span className="w-1.5 h-1.5 bg-[#d4f000]/45 rounded-full" />
                  </div>
                  <div className="font-mono text-[12px] uppercase tracking-[0.15em] text-[#bbb] mt-0.5">
                    WAR ROOM {'\u2014'} LIVE TREASURY ANALYTICS
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 md:gap-4 flex-wrap justify-center md:justify-end group/footer-links">
                <a
                  href="https://pinkyandthebrain.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb] hover:text-[#d4f000] transition-colors wr-glitch-hover wr-footer-link wr-footer-link-grow"
                >
                  PINKYANDTHEBRAIN.FUN <span className="inline-block transition-transform duration-200 group-hover/footer-links:translate-x-0.5">{'\u2197'}</span>
                </a>
                <span className="w-px h-3.5 bg-[#333]/35 hidden md:block" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb] flex items-center gap-1.5 hover:text-[#ddd] transition-colors duration-300 cursor-default">
                  <span className="text-[#d4f000]/45 text-[11px] transition-all duration-300 group-hover/footer-links:text-[#d4f000]/60">{'\u25CE'}</span> BUILT ON SOLANA
                </span>
                <span className="w-px h-3.5 bg-[#333]/35 hidden md:block" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb]">
                  ALL DATA LIVE ON-CHAIN
                </span>
                <span className="w-px h-3.5 bg-[#333]/35 hidden md:block" />
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#bbb] hover:text-[#ddd] transition-colors duration-300 flex items-center gap-1.5">
                  {'\u00A9'} 2025{'\u2013'}2026 $BRAIN
                  <span className="text-[11px] text-[#bbb]/70">{'\u00B7'}</span>
                  <span className="text-[12px] text-[#bbb]">v2.0.389</span>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
