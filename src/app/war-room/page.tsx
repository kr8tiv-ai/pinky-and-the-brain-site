import type { Metadata } from 'next'
import CommandHeader from '@/components/dashboard/CommandHeader'
import TokenInfoStrip from '@/components/dashboard/TokenInfoStrip'
import TreasuryIntel from '@/components/dashboard/TreasuryIntel'
import BurnOperations from '@/components/dashboard/BurnOperations'
import ReflectionsIntel from '@/components/dashboard/ReflectionsIntel'
import SectionReveal from '@/components/dashboard/SectionReveal'
import ScrollProgress from '@/components/dashboard/ScrollProgress'
import Governance from '@/components/dashboard/Governance'
import GovernanceAdmin from '@/components/dashboard/GovernanceAdmin'

export const metadata: Metadata = {
  title: 'War Room | Pinky and The Brain $BRAIN Fund',
  description: 'Live treasury analytics, portfolio P&L tracking, and on-chain intelligence for the $BRAIN deflationary Solana token fund.',
  openGraph: {
    title: 'War Room | $BRAIN Fund Intelligence Dashboard',
    description: 'Live treasury analytics, portfolio P&L tracking, and on-chain intelligence for the $BRAIN deflationary Solana token fund.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function WarRoomPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] text-[#e0e0e0] overflow-x-hidden" role="main">
      {/* Skip to content */}
      <a href="#war-room-content" className="wr-skip-link">Skip to content</a>

      {/* ── Layer 1: Ambient glow orbs (vibrant, drifting) ── */}
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

      {/* ── Layer 6: Top vignette — warm lime glow ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(212,240,0,0.14),transparent_70%)]" />

      {/* ── Layer 6: Corner vignettes ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_50%_50%_at_0%_0%,rgba(0,0,0,0.15),transparent_70%)]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,rgba(0,0,0,0.15),transparent_70%)]" />

      {/* ── Scroll Progress ── */}
      <ScrollProgress />

      {/* ── Content ── */}
      <div id="war-room-content" className="relative z-10">
        {/* Command bar */}
        <CommandHeader />

        {/* Quick intel strip with links + ticker */}
        <TokenInfoStrip />

        {/* Governance divider */}
        <div className="relative py-4">
          <div className="wr-divider" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.35] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-6 flex items-center gap-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#d4f000]/60" />
            <div className="wr-divider-dot text-[#d4f000]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-[#d4f000] font-bold wr-divider-label drop-shadow-[0_0_12px_rgba(212,240,0,0.6)]">GOVERNANCE</span>
            <div className="wr-divider-dot text-[#d4f000]" />
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#d4f000]/60" />
          </div>
        </div>

        {/* Governance — Treasury Purchase Vote */}
        <SectionReveal>
          <Governance />
        </SectionReveal>

        {/* Admin Panel — hidden behind password gate */}
        <GovernanceAdmin />

        {/* Scroll indicator */}
        <div className="flex flex-col items-center py-4 wr-scroll-hint md:py-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#ddd] mb-1.5">SCROLL TO EXPLORE</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d4f000]/90">
            <path d="M12 5v14" />
            <path d="M5 12l7 7 7-7" />
          </svg>
        </div>

        {/* Decorative divider with label */}
        <div className="relative py-4">
          <div className="wr-divider" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.35] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-5 flex items-center gap-2.5">
            <div className="w-5 h-px bg-[#d4f000]/45" />
            <div className="wr-divider-dot text-[#d4f000]" style={{ animationDelay: '0s' }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-[#d4f000] font-bold wr-divider-label drop-shadow-[0_0_12px_rgba(212,240,0,0.6)]">▼ INTEL</span>
            <div className="wr-divider-dot text-[#d4f000]" style={{ animationDelay: '1.5s' }} />
            <div className="w-5 h-px bg-[#d4f000]/45" />
          </div>
        </div>

        {/* Treasury Intel — scroll-triggered reveal */}
        <SectionReveal>
          <TreasuryIntel />
        </SectionReveal>

        {/* Reflections divider */}
        <div className="relative py-4">
          <div className="wr-divider" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.35] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-5 flex items-center gap-2.5">
            <div className="w-5 h-px bg-[#d4f000]/45" />
            <div className="wr-divider-dot text-[#d4f000]" style={{ animationDelay: '0s' }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-[#d4f000] font-bold wr-divider-label drop-shadow-[0_0_12px_rgba(212,240,0,0.6)]">◆ REFLECTIONS</span>
            <div className="wr-divider-dot text-[#d4f000]" style={{ animationDelay: '1.5s' }} />
            <div className="w-5 h-px bg-[#d4f000]/45" />
          </div>
        </div>

        {/* Reflections Intel — scroll-triggered reveal */}
        <SectionReveal>
          <ReflectionsIntel />
        </SectionReveal>

        {/* Transition marker */}
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[2px] h-[2px] bg-[#555]/40 rounded-full" />
            ))}
          </div>
        </div>

        {/* Decorative fire divider with transition marker */}
        <div className="relative py-5">
          <div className="wr-divider-fire" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/[0.35] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-6 flex items-center gap-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#ff6b35]/60" />
            <div className="wr-divider-dot text-[#ff6b35]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-[#ff6b35] font-bold wr-divider-label drop-shadow-[0_0_12px_rgba(255,107,53,0.65)]">INCINERATION ZONE</span>
            <div className="wr-divider-dot text-[#ff6b35]" />
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#ff6b35]/60" />
          </div>
        </div>

        {/* Burn Operations — scroll-triggered reveal */}
        <SectionReveal>
          <BurnOperations />
        </SectionReveal>

        {/* Footer */}
        <footer className="w-full bg-[#0a0a0a] relative overflow-hidden wr-footer-border" role="contentinfo" aria-label="War Room footer">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 wr-dot-grid opacity-12 pointer-events-none" />

          {/* Footer ticker with gradient fade edges */}
          <div className="border-b border-[#444]/20 overflow-hidden py-1.5 relative">
            {/* Left/right fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
            <div className="ticker-track">
              {['WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED',
                'WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED'].map((item, i) => (
                <span key={i} className="font-mono text-[12px] md:text-[11px] uppercase tracking-[0.3em] text-[#ddd] mx-5 md:mx-7 whitespace-nowrap group/ticker-item">
                  <span className="text-[#d4f000]/50 mr-2.5 inline-block transition-transform duration-300 group-hover/ticker-item:rotate-45 text-[11px]">◆</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Gradient separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.25] to-transparent" />

          <div className="relative px-5 lg:px-8 py-8">
            {/* Big watermark — breathing glow */}
            <div className="absolute right-8 bottom-4 text-[5rem] font-black text-white/[0.025] leading-none select-none pointer-events-none font-sans tracking-tighter wr-breathe wr-watermark" style={{ WebkitTextStroke: '1px rgba(212, 240, 0, 0.04)' }}>
              $BRAIN
            </div>

            {/* Disclaimer */}
            <div className="text-center mb-4 relative">
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-px bg-gradient-to-r from-transparent via-[#333]/10 to-transparent" />
              <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#bbb] font-bold">
                NOT FINANCIAL ADVICE — DYOR — ALL DATA FOR INFORMATIONAL PURPOSES ONLY
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
                    WAR ROOM — LIVE TREASURY ANALYTICS
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
                  PINKYANDTHEBRAIN.FUN <span className="inline-block transition-transform duration-200 group-hover/footer-links:translate-x-0.5">↗</span>
                </a>
                <span className="w-px h-3.5 bg-[#333]/35 hidden md:block" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb] flex items-center gap-1.5 hover:text-[#ddd] transition-colors duration-300 cursor-default">
                  <span className="text-[#d4f000]/45 text-[11px] transition-all duration-300 group-hover/footer-links:text-[#d4f000]/60">◎</span> BUILT ON SOLANA
                </span>
                <span className="w-px h-3.5 bg-[#333]/35 hidden md:block" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#bbb]">
                  ALL DATA LIVE ON-CHAIN
                </span>
                <span className="w-px h-3.5 bg-[#333]/35 hidden md:block" />
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#bbb] hover:text-[#ddd] transition-colors duration-300 flex items-center gap-1.5">
                  © 2025–2026 $BRAIN
                  <span className="text-[11px] text-[#bbb]/70">·</span>
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
