import type { Metadata } from 'next'
import CommandHeader from '@/components/dashboard/CommandHeader'
import TokenInfoStrip from '@/components/dashboard/TokenInfoStrip'
import TreasuryIntel from '@/components/dashboard/TreasuryIntel'
import BurnOperations from '@/components/dashboard/BurnOperations'
import SectionReveal from '@/components/dashboard/SectionReveal'
import ScrollProgress from '@/components/dashboard/ScrollProgress'

export const metadata: Metadata = {
  title: 'War Room | $BRAIN Token',
  description: 'Live treasury analytics and portfolio tracking for the $BRAIN token fund.',
}

export default function WarRoomPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] text-[#cccccc] overflow-x-hidden" role="main">
      {/* Skip to content */}
      <a href="#war-room-content" className="wr-skip-link">Skip to content</a>

      {/* ── Layer 1: Ambient glow orbs (drifting) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[50vw] h-[40vw] max-w-3xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04] wr-orb-1" />
        <div className="absolute bottom-[-5%] right-[10%] w-[40vw] h-[35vw] max-w-2xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.03] wr-orb-2" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[25vw] max-w-xl bg-[#4a90e2] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.02] wr-orb-3" />
        <div className="absolute bottom-[20%] left-[5%] w-[25vw] h-[20vw] max-w-lg bg-[#ff6b35] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.015] wr-orb-2" />
      </div>

      {/* ── Layer 2: Grid background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none wr-grid-bg opacity-35" />

      {/* ── Layer 3: Scanlines ── */}
      <div className="fixed inset-0 z-0 pointer-events-none wr-scanlines" />

      {/* ── Layer 4: Noise texture ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('/noise.gif')] opacity-[0.025] mix-blend-overlay" />

      {/* ── Layer 5: Bottom depth gradient ── */}
      <div className="wr-depth-gradient" />

      {/* ── Layer 6: Top vignette ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(212,240,0,0.04),transparent_70%)]" />

      {/* ── Layer 6: Corner vignettes ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_50%_50%_at_0%_0%,rgba(0,0,0,0.3),transparent_70%)]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,rgba(0,0,0,0.3),transparent_70%)]" />

      {/* ── Scroll Progress ── */}
      <ScrollProgress />

      {/* ── Content ── */}
      <div id="war-room-content" className="relative z-10">
        {/* Command bar */}
        <CommandHeader />

        {/* Quick intel strip with links + ticker */}
        <TokenInfoStrip />

        {/* Scroll indicator */}
        <div className="flex flex-col items-center py-4 wr-scroll-hint md:py-5">
          <span className="font-mono text-[7px] uppercase tracking-[0.35em] text-[#333]/60 mb-1.5">SCROLL TO EXPLORE</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d4f000]/20">
            <path d="M12 5v14" />
            <path d="M5 12l7 7 7-7" />
          </svg>
        </div>

        {/* Decorative divider with label */}
        <div className="relative py-4">
          <div className="wr-divider" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.06] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-5 flex items-center gap-2.5">
            <div className="w-5 h-px bg-[#d4f000]/10" />
            <div className="wr-divider-dot text-[#d4f000]" style={{ animationDelay: '0s' }} />
            <span className="font-mono text-[7px] uppercase tracking-[0.5em] text-[#d4f000]/25 font-bold wr-divider-label">▼ INTEL</span>
            <div className="wr-divider-dot text-[#d4f000]" style={{ animationDelay: '1.5s' }} />
            <div className="w-5 h-px bg-[#d4f000]/10" />
          </div>
        </div>

        {/* Treasury Intel — scroll-triggered reveal */}
        <SectionReveal>
          <TreasuryIntel />
        </SectionReveal>

        {/* Transition marker */}
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[2px] h-[2px] bg-[#333]/25 rounded-full" />
            ))}
          </div>
        </div>

        {/* Decorative fire divider with transition marker */}
        <div className="relative py-5">
          <div className="wr-divider-fire" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/[0.06] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-6 flex items-center gap-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#ff6b35]/20" />
            <div className="wr-divider-dot text-[#ff6b35]" />
            <span className="font-mono text-[7px] uppercase tracking-[0.5em] text-[#ff6b35]/35 font-bold wr-divider-label">INCINERATION ZONE</span>
            <div className="wr-divider-dot text-[#ff6b35]" />
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#ff6b35]/20" />
          </div>
        </div>

        {/* Burn Operations — scroll-triggered reveal */}
        <SectionReveal>
          <BurnOperations />
        </SectionReveal>

        {/* Separator before classified zone */}
        <div className="relative py-4">
          <div className="wr-divider" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#333]/[0.08] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-6 flex items-center gap-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#333]/30" />
            <div className="wr-divider-dot text-[#555]" />
            <span className="font-mono text-[7px] uppercase tracking-[0.5em] text-[#333]/60 font-bold wr-divider-label">CLASSIFIED ZONE</span>
            <div className="wr-divider-dot text-[#555]" />
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#333]/30" />
          </div>
        </div>

        {/* Staking stub — dramatic classified section */}
        <SectionReveal>
          <section className="w-full bg-[#0a0a0a] py-24 relative overflow-hidden wr-section-fade-top wr-section-fade-bottom wr-noise wr-classified-border wr-vignette-corners">
            {/* Layered diagonal pattern */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.06) 20px, rgba(255,255,255,0.06) 21px)',
              }}
            />
            {/* Radial glow center — dual layer */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(212,240,0,0.02),transparent_70%)]" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_30%_at_50%_80%,rgba(255,158,158,0.01),transparent_70%)]" />

            {/* Scan line */}
            <div className="wr-scan-line" style={{ animationDelay: '2s' }} />

            {/* Radar sweep */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="wr-radar-glow" />
              <div className="wr-radar" />
              <div className="wr-radar" style={{ width: '300px', height: '300px', animationDelay: '1s' }} />
              <div className="wr-radar" style={{ width: '400px', height: '400px', animationDelay: '2s' }} />
            </div>

            {/* Watermark */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] font-black text-white/[0.01] leading-none select-none pointer-events-none font-sans tracking-tighter wr-breathe wr-watermark" style={{ animationDuration: '6s' }}>
              03
            </div>

            {/* Registration marks */}
            <div className="absolute top-4 left-4 text-[#333]/10 text-[7px] font-mono select-none pointer-events-none transition-colors duration-700">+</div>
            <div className="absolute top-4 right-4 text-[#333]/10 text-[7px] font-mono select-none pointer-events-none transition-colors duration-700">+</div>
            <div className="absolute bottom-4 left-4 text-[#333]/10 text-[7px] font-mono select-none pointer-events-none transition-colors duration-700">+</div>
            <div className="absolute bottom-4 right-4 text-[#333]/10 text-[7px] font-mono select-none pointer-events-none transition-colors duration-700">+</div>

            <div className="relative flex flex-col items-center justify-center gap-6 wr-brackets" style={{ padding: '2.5rem 2rem' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-[#333]/40" />
                <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#333]/80 font-bold wr-section-num">
                  SECTION 03 — PHASE 2
                </div>
                <div className="w-8 h-px bg-[#333]/40" />
              </div>

              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1a1a1a] font-sans wr-classified-glitch select-none">
                ████████████████████████
              </h2>

              <div className="flex items-center gap-2">
                <div className="wr-tag wr-tag-glow border-[#333]/50 text-[#333]/80">
                  CLASSIFIED
                </div>
                <span className="w-1 h-px bg-[#333]/25" />
                <div className="wr-tag wr-tag-glow border-[#d4f000]/15 text-[#d4f000]/25">
                  TS/SCI
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-2">
                {['STAKING', 'GOVERNANCE', 'YIELD MECHANICS'].map((item, i) => (
                  <div key={item} className="flex items-center gap-3">
                    {i > 0 && <div className="hidden md:block w-px h-3 bg-[#222]" />}
                    <span className="font-mono text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-[#222] font-black flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-[#333]/20 rounded-full wr-breathe" style={{ animationDuration: `${4 + i}s` }} />
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 wr-burn-bar w-36" style={{ height: '3px' }}>
                <div className="wr-burn-bar-fill" style={{ width: '0%' }} />
              </div>
              <div className="font-mono text-[7px] uppercase tracking-[0.35em] text-[#1a1a1a]/70 mb-2 wr-cursor">
                DEPLOYMENT PROGRESS: 0%
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#1a1a1a] flex items-center gap-2">
                <span className="text-[#d4f000]/10 wr-breathe" style={{ animationDuration: '6s' }}>◆</span>
                <span className="text-[#1a1a1a]/50">ETA:</span>
                <span className="tabular-nums text-[#222] wr-classified-glitch" style={{ animationDuration: '3s' }}>██:██:██</span>
              </div>
              <div className="mt-3 flex items-center gap-5 font-mono text-[7px] text-[#1a1a1a] tracking-[0.1em]">
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-[#d4f000]/5 rounded-full" /> AUTH REQUIRED</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-[#ff9e9e]/5 rounded-full" /> PENDING REVIEW</span>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Footer */}
        <footer className="w-full bg-[#0a0a0a] relative overflow-hidden wr-footer-border" role="contentinfo" aria-label="War Room footer">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 wr-dot-grid opacity-15 pointer-events-none" />

          {/* Footer ticker with gradient fade edges */}
          <div className="border-b border-[#333]/10 overflow-hidden py-1.5 relative">
            {/* Left/right fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
            <div className="ticker-track">
              {['WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED',
                'WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED'].map((item, i) => (
                <span key={i} className="font-mono text-[6px] md:text-[7px] uppercase tracking-[0.3em] text-[#222] mx-5 md:mx-7 whitespace-nowrap group/ticker-item">
                  <span className="text-[#d4f000]/15 mr-2.5 inline-block transition-transform duration-300 group-hover/ticker-item:rotate-45">◆</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Gradient separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.06] to-transparent" />

          <div className="relative px-5 lg:px-8 py-8">
            {/* Big watermark — breathing glow */}
            <div className="absolute right-8 bottom-4 text-[6rem] font-black text-white/[0.008] leading-none select-none pointer-events-none font-sans tracking-tighter wr-breathe wr-watermark" style={{ WebkitTextStroke: '1px rgba(212, 240, 0, 0.015)' }}>
              $BRAIN
            </div>

            {/* Disclaimer */}
            <div className="text-center mb-4 relative">
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-px bg-gradient-to-r from-transparent via-[#333]/10 to-transparent" />
              <span className="font-mono text-[6px] uppercase tracking-[0.25em] text-[#1a1a1a]/80 font-bold">
                NOT FINANCIAL ADVICE — DYOR — ALL DATA FOR INFORMATIONAL PURPOSES ONLY
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-1 h-4 bg-[#d4f000]/20" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#444] font-bold flex items-center gap-2">
                    $BRAIN INTELLIGENCE COMMAND
                    <span className="w-1.5 h-1.5 bg-[#d4f000]/10 rounded-full" />
                  </div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#222] mt-0.5">
                    WAR ROOM — LIVE TREASURY ANALYTICS
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 md:gap-4 flex-wrap justify-center md:justify-end group/footer-links">
                <a
                  href="https://pinkyandthebrain.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#444] hover:text-[#d4f000] transition-colors wr-glitch-hover wr-footer-link wr-footer-link-grow"
                >
                  PINKYANDTHEBRAIN.FUN <span className="inline-block transition-transform duration-200 group-hover/footer-links:translate-x-0.5">↗</span>
                </a>
                <span className="w-px h-3.5 bg-[#333]/25 hidden md:block" />
                <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-[#222] flex items-center gap-1.5 hover:text-[#555] transition-colors duration-300 cursor-default">
                  <span className="text-[#d4f000]/25 text-[9px] transition-all duration-300 group-hover/footer-links:text-[#d4f000]/40">◎</span> BUILT ON SOLANA
                </span>
                <span className="w-px h-3.5 bg-[#333]/25 hidden md:block" />
                <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-[#222]">
                  ALL DATA LIVE ON-CHAIN
                </span>
                <span className="w-px h-3.5 bg-[#333]/25 hidden md:block" />
                <span className="font-mono text-[7px] uppercase tracking-[0.1em] text-[#1a1a1a] hover:text-[#444] transition-colors duration-300 flex items-center gap-1.5">
                  © 2025–2026 $BRAIN
                  <span className="text-[5px] text-[#333]/20">·</span>
                  <span className="text-[6px] text-[#1a1a1a]/60">v2.0.200</span>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
