export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t-2 border-[#e4ff57]/40 py-20 text-[#cccccc] font-mono text-sm relative overflow-hidden">
      {/* Scrolling Ticker */}
      <div className="w-full overflow-hidden border-b border-[#333]/30 mb-16 py-3 bg-[#111]">
        <div className="ticker-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 px-4 whitespace-nowrap text-xs tracking-[0.3em] uppercase font-bold">
              <span className="text-[#d4f000]">$BRAIN</span>
              <span className="text-[#333]">●</span>
              <span className="text-[#cccccc]/40">World Domination Loading</span>
              <span className="text-[#333]">●</span>
              <span className="text-[#ffadad]">NARF!</span>
              <span className="text-[#333]">●</span>
              <span className="text-[#cccccc]/40">Same Thing We Do Every Night</span>
              <span className="text-[#333]">●</span>
              <span className="text-[#d4f000]">$BRAIN</span>
              <span className="text-[#333]">●</span>
              <span className="text-[#cccccc]/40">Highly Deflationary Mouse Ponzi</span>
              <span className="text-[#333]">●</span>
              <span className="text-[#ffadad]">POIT!</span>
              <span className="text-[#333]">●</span>
              <span className="text-[#cccccc]/40">Cheese Reserves Secured</span>
              <span className="text-[#333]">●</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter text-white mb-4">
            $BRAIN
          </h2>
          <p className="max-w-sm opacity-60 text-lg">
            A totally rational accumulation of capital designed to fund the acquisition of all global cheese reserves.
          </p>
        </div>

        <div className="flex flex-col md:items-end justify-between space-y-8">
          <div className="space-y-4 md:text-right flex flex-col items-start md:items-end font-bold">
            <a href="#" className="hover:text-[#ffadad] uppercase tracking-widest transition-colors hover:translate-x-2 md:hover:-translate-x-2 flex items-center gap-2">
              The Lab <span className="text-[9px] font-normal text-[#e4ff57]/70 border border-[#e4ff57]/40 px-1.5 py-0.5 rounded-sm tracking-normal normal-case">coming soon</span>
            </a>
            <a href="#" className="hover:text-[#ffadad] uppercase tracking-widest transition-colors hover:translate-x-2 md:hover:-translate-x-2 flex items-center gap-2">
              Legal Disclaimers (Read) <span className="text-[9px] font-normal text-[#e4ff57]/70 border border-[#e4ff57]/40 px-1.5 py-0.5 rounded-sm tracking-normal normal-case">coming soon</span>
            </a>
            <a href="/brand" className="hover:text-[#ffadad] uppercase tracking-widest transition-colors hover:translate-x-2 md:hover:-translate-x-2">
              Brand Guidelines
            </a>
          </div>

          <div className="text-[#cccccc]/40 text-xs md:text-right max-w-sm border-t border-[#cccccc]/10 pt-4">
            DISCLAIMER: Literally a cartoon mouse meme. Do not invest money you need for rent, food, or cheese. We are not responsible for global domination.
          </div>
        </div>
      </div>

      {/* Big typography background */}
      <h1 className="absolute -bottom-24 left-0 text-[15rem] leading-none font-black text-white/[0.02] tracking-tighter pointer-events-none select-none">
        GOODNIGHT.
      </h1>

      {/* Fan token disclaimer strip */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-white/5 text-center text-[#cccccc]/25 text-[10px] tracking-wider leading-relaxed">
        $BRAIN is a fan-made community token inspired by the animated series <em>Pinky and the Brain</em>. We have absolutely zero affiliation with, endorsement from, or connection to Warner Bros., Amblin Entertainment, or any rights holders of the show. This is a meme token made by fans, for fans. Please don&apos;t sue us — we just like the mouse.
      </div>
    </footer>
  );
}
