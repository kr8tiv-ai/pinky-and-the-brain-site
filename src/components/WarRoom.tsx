"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function WarRoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const treasuryRef = useRef<HTMLSpanElement>(null);
  const escapeAttemptsRef = useRef<HTMLSpanElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const calculateEscapeAttempts = () => {
    // Start date matching requested semantics: yesterday=1, today=2 => 2026-03-21=0
    const start = new Date("2026-03-21T00:00:00Z").getTime();
    const now = Date.now();
    return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  };

  const [stats, setStats] = useState({ treasury: 4291.55, tps: 1204, holders: 12492 });

  useEffect(() => {
    // Fetch live stats from Solscan via internal API route
    fetch('/api/treasury')
      .then(res => res.json())
      .then(data => {
        if (data.treasury != null) setStats(s => ({ ...s, treasury: data.treasury }));
        if (data.holders != null) setStats(s => ({ ...s, holders: data.holders }));
      })
      .catch(err => console.error("Treasury API Error", err));
  }, []);


  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Progress Bar Animation
      gsap.fromTo(barRef.current,
        { width: "0%" },
        {
          width: "98%",
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );

      // Data Panel Animation
      gsap.from(dataRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        }
      });

      // Terminal Entry Animation
      gsap.from(terminalRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        }
      });

      // Animated Counters for Treasury and Escape Attempts
      const animatedObj = { treasury: 0, escapeAttempts: 0 };
      gsap.to(animatedObj, {
        treasury: stats.treasury,
        escapeAttempts: calculateEscapeAttempts(),
        duration: 2.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        onUpdate: () => {
          if (treasuryRef.current) treasuryRef.current.innerHTML = animatedObj.treasury.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (escapeAttemptsRef.current) escapeAttemptsRef.current.innerHTML = Math.floor(animatedObj.escapeAttempts).toLocaleString();
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [stats]);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-[#0d0d0d] py-32 flex flex-col items-center justify-center overflow-hidden border-t border-[#333]/50">

      {/* Fake WebGL Blur background effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-3xl max-h-3xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] max-w-2xl max-h-2xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[150px] opacity-10" />
         <div className="absolute inset-0 bg-[url('/noise.gif')] opacity-[0.04] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-12 flex flex-col h-full">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b-4 border-[#333] pb-6 gap-6">
          <h2 className="text-[4rem] md:text-[6.5rem] leading-[0.85] font-black tracking-tighter uppercase font-sans text-white">
            The War <span className="text-[#d4f000]">Room</span>
          </h2>
          <div className="text-left md:text-right font-mono pb-2 md:pb-4 border-l-4 md:border-l-0 border-[#333] pl-4 md:pl-0">
            <div className="text-[#ff9e9e] text-xl tracking-widest mb-1 uppercase font-bold">Live Node Status</div>
            <div className="text-[#d4f000] font-bold animate-pulse text-lg tracking-tight">● CONNECTED TO HELIUS RPC</div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12" ref={dataRef}>
          <div className="bg-black/40 backdrop-blur-xl p-8 col-span-1 lg:col-span-2 border-2 border-[#333] border-l-[12px] border-l-[#d4f000] relative overflow-hidden shadow-2xl">

             <div className="font-mono text-sm text-[#cccccc] uppercase tracking-widest mb-2 font-bold">Treasury Holdings (Solana)</div>
             <div className="text-6xl md:text-8xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
               <span ref={treasuryRef}>0.00</span><span className="text-[#d4f000] text-4xl align-top ml-2">◎</span>
             </div>

             <div className="mt-12 bg-black/60 p-2 w-full rounded-none overflow-hidden border-2 border-[#333]">
               <div ref={barRef} className="bg-[#d4f000] h-6 rounded-none relative" style={{ width: "0%" }}>
                 <div className="absolute inset-0 bg-[url('/noise.gif')] opacity-20 mix-blend-multiply" />
               </div>
             </div>
             <div className="flex justify-between mt-4 text-sm font-mono text-white tracking-wide font-bold">
               <span>Acquisition Progress</span>
               <span className="text-[#d4f000]">98% to Global Domination</span>
             </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl p-8 border-2 border-[#333] border-t-[12px] border-t-[#ff9e9e] flex flex-col justify-center shadow-2xl">
             <div className="font-mono text-sm text-[#cccccc] uppercase tracking-widest mb-4 font-bold">Escape Attempts (days)</div>
             <div className="text-5xl font-black text-white mb-3 tracking-tighter"><span ref={escapeAttemptsRef}>0</span></div>
             <div className="text-xs font-mono text-[#0d0d0d] font-bold border-2 border-[#ff9e9e] px-3 py-1.5 inline-block w-max bg-[#ff9e9e] uppercase tracking-wider">
               STILL TRAPPED
             </div>

             <div className="mt-10 font-mono text-sm text-[#cccccc] uppercase tracking-widest mb-2 font-bold">Unique Wallets</div>
             <div className="text-4xl font-black text-white tracking-tighter">{stats.holders.toLocaleString()}</div>
          </div>
        </div>

        {/* Terminal Window */}
        <div ref={terminalRef} className="w-full bg-[#050505] p-6 lg:p-8 font-mono text-sm md:text-base text-[#00ff00] h-80 overflow-y-auto border-4 border-[#333] shadow-[0_0_50px_rgba(212,240,0,0.05)] relative before:absolute before:inset-0 before:bg-[url('/noise.gif')] before:opacity-[0.05] before:pointer-events-none before:mix-blend-screen custom-scrollbar">
          <div className="sticky top-0 bg-[#050505] pb-4 mb-4 border-b-2 border-[#333] flex justify-between items-center z-10">
            <span className="font-bold tracking-widest text-[#ff9e9e]">$ tail -f /var/log/brain/domination.log</span>
            <span className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#333]"></span>
              <span className="w-3 h-3 rounded-full bg-[#333]"></span>
              <span className="w-3 h-3 rounded-full bg-[#d4f000]"></span>
            </span>
          </div>
          <div className="opacity-80 pb-2">[10:42:01] INFO  - Parsing Helius RPC webhook payload...</div>
          <div className="opacity-80 pb-2">[10:42:02] INFO  - Indexing Top 100 Reflections ($D_i).</div>
          <div className="text-[#d4f000] font-bold pb-2">[10:42:02] DEBUG - Pinky interrupted the calculus sequence. Recalculating.</div>
          <div className="text-[#d4f000] font-bold pb-2">[10:42:03] DEBUG - Pinky tried to eat the private key. Regenerating.</div>
          <div className="text-[#ff9e9e] font-bold pb-2">[10:42:04] WARN  - Pinky asked if the moon is made of SOL. Ignoring.</div>
          <div className="opacity-80 pb-2">[10:42:05] INFO  - Found 12 new holders. Distributing 0.05 SOL.</div>
          <div className="opacity-80 pb-2">[10:42:06] INFO  - Awaiting next command.</div>
          <div className="animate-pulse mt-4 inline-block w-4 h-6 bg-[#d4f000] shadow-[0_0_10px_#d4f000]"></div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/war-room"
            className="font-mono text-sm uppercase tracking-widest border-2 border-[#d4f000] text-[#d4f000] px-8 py-3 hover:bg-[#d4f000] hover:text-black transition-all duration-300 font-bold"
          >
            ENTER WAR ROOM
          </Link>
        </div>

      </div>
    </section>
  );
}
