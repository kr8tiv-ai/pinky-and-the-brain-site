import type { Metadata } from 'next'
import CommandHeader from '@/components/dashboard/CommandHeader'
import TokenInfoStrip from '@/components/dashboard/TokenInfoStrip'
import TreasuryIntel from '@/components/dashboard/TreasuryIntel'
import BurnOperations from '@/components/dashboard/BurnOperations'
import SectionReveal from '@/components/dashboard/SectionReveal'

export const metadata: Metadata = {
  title: 'War Room | $BRAIN Token',
  description: 'Live treasury analytics and portfolio tracking for the $BRAIN token fund.',
}

export default function WarRoomPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] text-[#cccccc] overflow-x-hidden">
      {/* ── Layer 1: Ambient glow orbs (drifting) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[50vw] h-[40vw] max-w-3xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04] wr-orb-1" />
        <div className="absolute bottom-[-5%] right-[10%] w-[40vw] h-[35vw] max-w-2xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.03] wr-orb-2" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[25vw] max-w-xl bg-[#4a90e2] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.02] wr-orb-3" />
      </div>

      {/* ── Layer 2: Grid background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none wr-grid-bg opacity-40" />

      {/* ── Layer 3: Scanlines ── */}
      <div className="fixed inset-0 z-0 pointer-events-none wr-scanlines" />

      {/* ── Layer 4: Noise texture ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('/noise.gif')] opacity-[0.03] mix-blend-overlay" />

      {/* ── Layer 5: Top vignette ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(212,240,0,0.04),transparent_70%)]" />

      {/* ── Content ── */}
      <div className="relative z-10">
        {/* Command bar */}
        <CommandHeader />

        {/* Quick intel strip with links + ticker */}
        <TokenInfoStrip />

        {/* Decorative divider with label */}
        <div className="relative">
          <div className="wr-divider" />
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-4">
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#333]">▼</span>
          </div>
        </div>

        {/* Treasury Intel — scroll-triggered reveal */}
        <SectionReveal>
          <TreasuryIntel />
        </SectionReveal>

        {/* Decorative fire divider with transition marker */}
        <div className="relative py-4">
          <div className="wr-divider-fire" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-6 flex items-center gap-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#ff6b35]/20" />
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#ff6b35]/30">INCINERATION ZONE</span>
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#ff6b35]/20" />
          </div>
        </div>

        {/* Burn Operations — scroll-triggered reveal */}
        <SectionReveal>
          <BurnOperations />
        </SectionReveal>

        {/* Separator before classified zone */}
        <div className="relative py-2">
          <div className="wr-divider" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-6 flex items-center gap-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#333]/30" />
            <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#333]/50">CLASSIFIED ZONE</span>
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#333]/30" />
          </div>
        </div>

        {/* Staking stub — dramatic classified section */}
        <SectionReveal>
          <section className="w-full bg-[#0a0a0a] py-24 relative overflow-hidden">
            {/* Layered diagonal pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.08) 20px, rgba(255,255,255,0.08) 21px)',
              }}
            />
            {/* Radial glow center */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(212,240,0,0.02),transparent_70%)]" />

            {/* Watermark */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] font-black text-white/[0.01] leading-none select-none pointer-events-none font-sans">
              03
            </div>

            <div className="relative flex flex-col items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-[#333]/40" />
                <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#333] font-bold">
                  SECTION 03 — PHASE 2
                </div>
                <div className="w-8 h-px bg-[#333]/40" />
              </div>

              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1a1a1a] font-sans flicker select-none">
                ████████████████████████
              </h2>

              <div className="flex items-center gap-3">
                <div className="wr-tag border-[#333]/40 text-[#333]">
                  CLASSIFIED
                </div>
                <div className="wr-tag border-[#d4f000]/10 text-[#d4f000]/20">
                  TS/SCI
                </div>
              </div>

              <div className="flex items-center gap-6 mt-2">
                {['STAKING', 'GOVERNANCE', 'YIELD MECHANICS'].map((item, i) => (
                  <div key={item} className="flex items-center gap-3">
                    {i > 0 && <div className="w-px h-3 bg-[#222]" />}
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#222] font-bold">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 wr-burn-bar w-32">
                <div className="wr-burn-bar-fill" style={{ width: '0%' }} />
              </div>
              <div className="font-mono text-[7px] uppercase tracking-[0.3em] text-[#1a1a1a]">
                DEPLOYMENT PROGRESS: 0%
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Footer */}
        <footer className="w-full border-t border-[#333]/15 bg-[#0a0a0a] relative overflow-hidden">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 wr-dot-grid opacity-20 pointer-events-none" />

          {/* Footer ticker */}
          <div className="border-b border-[#333]/10 overflow-hidden py-1.5">
            <div className="ticker-track">
              {['WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED',
                'WAR ROOM v2.0', '$BRAIN INTELLIGENCE COMMAND', 'ALL DATA LIVE ON-CHAIN', 'NARF!', 'DEFLATIONARY SPL TOKEN', 'COMMUNITY GOVERNED'].map((item, i) => (
                <span key={i} className="font-mono text-[7px] uppercase tracking-[0.3em] text-[#222] mx-6 whitespace-nowrap">
                  <span className="text-[#d4f000]/15 mr-2">◆</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative px-5 lg:px-8 py-8">
            {/* Big watermark */}
            <div className="absolute right-8 bottom-4 text-[6rem] font-black text-white/[0.01] leading-none select-none pointer-events-none font-sans tracking-tighter">
              $BRAIN
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-1 h-4 bg-[#d4f000]/20" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#444] font-bold">
                    $BRAIN INTELLIGENCE COMMAND
                  </div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#222] mt-0.5">
                    WAR ROOM — LIVE TREASURY ANALYTICS
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="https://pinkyandthebrain.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#444] hover:text-[#d4f000] transition-colors wr-glitch-hover"
                >
                  PINKYANDTHEBRAIN.FUN ↗
                </a>
                <span className="w-px h-3 bg-[#333]/30" />
                <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#333]">
                  ALL DATA LIVE ON-CHAIN
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
