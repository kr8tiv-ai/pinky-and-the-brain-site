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
      {/* ── Layer 1: Ambient glow orbs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[50vw] h-[40vw] max-w-3xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[40vw] h-[35vw] max-w-2xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.03]" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[25vw] max-w-xl bg-[#4a90e2] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.02]" />
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

        {/* Decorative divider */}
        <div className="wr-divider" />

        {/* Treasury Intel — scroll-triggered reveal */}
        <SectionReveal>
          <TreasuryIntel />
        </SectionReveal>

        {/* Decorative fire divider */}
        <div className="wr-divider-fire" />

        {/* Burn Operations — scroll-triggered reveal */}
        <SectionReveal>
          <BurnOperations />
        </SectionReveal>

        {/* Phase 7+ sections */}
        {/* <SectionReveal><FeeDistribution /></SectionReveal> */}
        {/* <SectionReveal><ReflectionsTerminal /></SectionReveal> */}

        {/* Staking stub */}
        <SectionReveal>
          <section className="w-full bg-[#0a0a0a] py-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)',
              }}
            />
            <div className="relative flex flex-col items-center justify-center gap-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#333] font-bold">
                PHASE 2 — COMING SOON
              </div>
              <div className="font-mono text-3xl font-black text-[#1a1a1a] tracking-wider select-none flicker">
                ████████████████████████████
              </div>
              <div className="wr-tag border-[#333]/40 text-[#333]">
                CLASSIFIED
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#222] mt-2">
                STAKING · GOVERNANCE · YIELD MECHANICS
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Footer */}
        <footer className="w-full border-t border-[#333]/15 bg-[#0a0a0a] px-5 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-3 bg-[#d4f000]/30" />
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#333]">
                $BRAIN INTELLIGENCE COMMAND
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#333]">
                ALL DATA LIVE ON-CHAIN
              </span>
              <span className="w-px h-3 bg-[#333]/30" />
              <a
                href="https://pinkyandthebrain.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#444] hover:text-[#d4f000] transition-colors"
              >
                PINKYANDTHEBRAIN.FUN ↗
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
