'use client'

import { BRAIN_TOKEN_MINT, TREASURY_WALLET, BURN_DESTINATION } from '@/lib/constants'

const LINKS = [
  { label: 'DEXSCREENER', href: `https://dexscreener.com/solana/${BRAIN_TOKEN_MINT}`, accent: false },
  { label: 'SOLSCAN', href: `https://solscan.io/token/${BRAIN_TOKEN_MINT}`, accent: false },
  { label: 'TREASURY', href: `https://solscan.io/account/${TREASURY_WALLET}`, accent: true },
  { label: 'INCINERATOR', href: `https://solscan.io/account/${BURN_DESTINATION}`, accent: false },
  { label: 'BAGS.FM', href: `https://bags.fm/b/${BRAIN_TOKEN_MINT}`, accent: false },
]

const TICKER_ITEMS = [
  { text: '$BRAIN', color: 'text-[#d4f000]/30' },
  { text: 'DEFLATIONARY SPL TOKEN', color: 'text-[#333]' },
  { text: 'NARF!', color: 'text-[#ffadad]/20' },
  { text: 'SOL REFLECTIONS TO TOP 100', color: 'text-[#333]' },
  { text: '$BRAIN', color: 'text-[#d4f000]/30' },
  { text: '10% BURNED · 20% HOLDERS · 30% INVESTMENTS', color: 'text-[#333]' },
  { text: 'POIT!', color: 'text-[#ffadad]/20' },
  { text: '100% LP LOCKED', color: 'text-[#333]' },
  { text: 'ON-CHAIN TRANSPARENCY', color: 'text-[#333]' },
  { text: 'COMMUNITY GOVERNED', color: 'text-[#333]' },
  { text: 'THE SAME THING WE DO EVERY NIGHT', color: 'text-[#333]/60' },
  { text: '$BRAIN', color: 'text-[#d4f000]/30' },
  { text: 'TRY TO TAKE OVER THE WORLD', color: 'text-[#ffadad]/15' },
]

export default function TokenInfoStrip() {
  return (
    <div className="w-full bg-[#0a0a0a] border-b border-[#333]/20">
      {/* Quick links row */}
      <div className="flex items-center gap-1 px-5 lg:px-8 py-2.5 overflow-x-auto wr-scroll">
        <div className="flex items-center gap-2 mr-3">
          <div className="w-0.5 h-3 bg-[#d4f000]/20" />
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#444] font-bold whitespace-nowrap">
            QUICK INTEL
          </span>
        </div>
        <div className="w-px h-3 bg-[#333]/30 mr-1" />
        {LINKS.map(({ label, href, accent }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-mono text-[9px] transition-all px-2.5 py-1 whitespace-nowrap rounded-sm wr-link-scale ${
              accent
                ? 'text-[#d4f000]/70 hover:text-[#d4f000] hover:bg-[#d4f000]/[0.05] border border-[#d4f000]/10 hover:border-[#d4f000]/20'
                : 'text-[#555] hover:text-[#d4f000] hover:bg-[#d4f000]/[0.03]'
            }`}
          >
            {label} <span className="text-[7px] opacity-50">↗</span>
          </a>
        ))}
      </div>

      {/* Ticker tape with gradient fade edges */}
      <div className="border-t border-[#333]/10 overflow-hidden py-1.5 relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="ticker-track">
          {/* Duplicate full set for seamless scroll */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className={`font-mono text-[8px] uppercase tracking-[0.3em] mx-6 whitespace-nowrap ${item.color}`}>
              <span className="text-[#d4f000]/15 mr-2">◆</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
