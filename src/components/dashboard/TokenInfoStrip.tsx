'use client'

import { BRAIN_TOKEN_MINT, TREASURY_WALLET, BURN_DESTINATION } from '@/lib/constants'

const LINKS = [
  { label: 'DEXSCREENER', href: `https://dexscreener.com/solana/${BRAIN_TOKEN_MINT}` },
  { label: 'SOLSCAN TOKEN', href: `https://solscan.io/token/${BRAIN_TOKEN_MINT}` },
  { label: 'TREASURY WALLET', href: `https://solscan.io/account/${TREASURY_WALLET}` },
  { label: 'INCINERATOR', href: `https://solscan.io/account/${BURN_DESTINATION}` },
  { label: 'BAGS.FM', href: `https://bags.fm/b/${BRAIN_TOKEN_MINT}` },
]

const TICKER_ITEMS = [
  'DEFLATIONARY SPL TOKEN',
  'SOL REFLECTIONS TO TOP 100',
  '10% BURNED · 20% HOLDERS · 30% INVESTMENTS',
  '100% LP LOCKED',
  'ON-CHAIN TRANSPARENCY',
  'COMMUNITY GOVERNED',
]

export default function TokenInfoStrip() {
  return (
    <div className="w-full bg-[#0a0a0a] border-b border-[#333]/20">
      {/* Quick links row */}
      <div className="flex items-center gap-1 px-5 lg:px-8 py-2.5 overflow-x-auto wr-scroll">
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#333] font-bold mr-2 whitespace-nowrap">
          QUICK INTEL
        </span>
        <div className="w-px h-3 bg-[#333]/30 mr-1" />
        {LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] text-[#555] hover:text-[#d4f000] transition-colors px-2.5 py-1 whitespace-nowrap hover:bg-[#d4f000]/[0.03] rounded-sm"
          >
            {label} <span className="text-[7px] opacity-50">↗</span>
          </a>
        ))}
      </div>

      {/* Ticker tape */}
      <div className="border-t border-[#333]/10 overflow-hidden py-1.5">
        <div className="ticker-track">
          {/* Duplicate for seamless scroll */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#333] mx-6 whitespace-nowrap">
              <span className="text-[#d4f000]/20 mr-2">◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
