import type { Metadata } from 'next'
import CommandHeader from '@/components/dashboard/CommandHeader'
import TreasuryIntel from '@/components/dashboard/TreasuryIntel'
import BurnOperations from '@/components/dashboard/BurnOperations'

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
        <CommandHeader />

        {/* Decorative divider between header and content */}
        <div className="wr-divider" />

        <TreasuryIntel />

        {/* Decorative divider */}
        <div className="wr-divider-fire" />

        <BurnOperations />

        {/* Phase 7+ sections */}
        {/* <FeeDistribution /> */}
        {/* <ReflectionsTerminal /> */}

        {/* Staking stub */}
        <section className="w-full border-b border-[#333]/30 bg-[#0a0a0a] py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#333] font-bold">
              PHASE 2
            </div>
            <div className="font-mono text-2xl font-black text-[#1a1a1a] tracking-wider">
              ████████████████████
            </div>
            <div className="wr-tag border-[#333] text-[#333]">
              CLASSIFIED
            </div>
          </div>
        </section>

        {/* Footer bar */}
        <footer className="w-full border-t border-[#333]/30 bg-[#0a0a0a] px-6 lg:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#333]">
              $BRAIN INTELLIGENCE COMMAND &mdash; ALL DATA LIVE ON-CHAIN
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#333]">
              PINKYANDTHEBRAIN.FUN
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
