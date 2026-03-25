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
    <main className="relative w-full min-h-screen bg-[#0d0d0d] text-[#cccccc] overflow-x-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[60vw] h-[40vw] max-w-4xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.06]" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[30vw] max-w-3xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.05]" />
        <div className="absolute inset-0 bg-[url('/noise.gif')] opacity-[0.03] mix-blend-screen pointer-events-none" />
      </div>

      <div className="relative z-10">
        <CommandHeader />
        <TreasuryIntel />
        <BurnOperations />
        {/* Phase 7+ sections: <FeeDistribution />, <ReflectionsTerminal />, etc. */}
      </div>
    </main>
  )
}
