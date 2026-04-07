'use client'

import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import SectionReveal from '@/components/dashboard/SectionReveal'
import PoolOverview from '@/components/dashboard/staking/PoolOverview'
import PersonalPosition from '@/components/dashboard/staking/PersonalPosition'
import DlmmExits from '@/components/dashboard/staking/DlmmExits'
import AdminPanel from '@/components/dashboard/staking/AdminPanel'

/**
 * StakingSection — the top-level component for the STAKING tab.
 *
 * Loaded via next/dynamic (ssr: false) to keep Anchor out of the
 * initial bundle. All Anchor-dependent code lives in this tree.
 */
export default function StakingSection() {
  const { connected } = useAnchorProvider()

  return (
    <SectionReveal>
      <div className="px-4 sm:px-5 lg:px-8 py-8">
        {/* Section header matching war-room aesthetic */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-5 bg-[#d4f000]/60" />
            <h2 className="font-mono text-[13px] sm:text-[14px] uppercase tracking-[0.25em] text-[#d4f000] font-bold">
              ◆ STAKING OPERATIONS
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#777] ml-4">
            {connected
              ? 'WALLET LINKED — STAKING INTERFACE ACTIVE'
              : 'CONNECT WALLET TO ACCESS STAKING OPERATIONS'}
          </p>
        </div>

        {/* Pool Overview — visible to all (no wallet required) */}
        <PoolOverview />

        {/* Personal Position — wallet-gated staking position dashboard */}
        <PersonalPosition />

        {/* DLMM Exits — public transparency section (no wallet required) */}
        <DlmmExits />

        {/* Admin Panel — owner-gated emergency controls */}
        <AdminPanel />
      </div>
    </SectionReveal>
  )
}
