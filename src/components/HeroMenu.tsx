"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";

const menuItems = [
  {
    id: "war_room",
    label: "War Room",
    href: "/war-room",
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    id: "bagsapp",
    label: "BagsApp (Token)",
    href: "https://bags.fm/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS",
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "dexscreener",
    label: "DexScreener",
    href: "https://dexscreener.com/solana/gcnk263xzxw3omuvqpg2wc9rs79tsgunknz8r378w3d8",
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "#",
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    ),
  },
  {
    id: "x_account",
    label: "X Account",
    href: "https://x.com/brain52702",
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    id: "x_community",
    label: "X Community",
    href: "https://x.com/i/communities/2035837761907806351",
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];


export default function HeroMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation for the menu container
      gsap.fromTo(menuRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: "expo.out", delay: 0.5 }
      );

      // Animate individual menu items
      gsap.fromTo(".menu-item-container",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.8 }
      );

      // Magnetic Hover logic for items
      const items = gsap.utils.toArray<HTMLElement>(".menu-item-container");
      items.forEach((item) => {
        const move = (e: MouseEvent) => {
          const rect = item.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
          gsap.to(item, { x, y, duration: 0.3, ease: "power2.out" });
        };
        const leave = () => {
          gsap.to(item, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        };
        item.addEventListener("mousemove", move as EventListener);
        item.addEventListener("mouseleave", leave);
      });

      // Dot tracer: smooth orbit around the pill border
      const angle = { val: 0 };
      gsap.to(angle, {
        val: 360,
        duration: 8,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          if (!pillRef.current || !starRef.current) return;
          const rect = pillRef.current.getBoundingClientRect();
          const parentRect = menuRef.current!.getBoundingClientRect();

          const rx = rect.width / 2;
          const ry = rect.height / 2;
          const cx = rect.left - parentRect.left + rx;
          const cy = rect.top - parentRect.top + ry;

          const rad = (angle.val * Math.PI) / 180;
          const x = cx + rx * Math.cos(rad) - 5; // 5 = half of dot size (10px)
          const y = cy + ry * Math.sin(rad) - 5;

          gsap.set(starRef.current, { x, y });
        },
      });

    }, menuRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={menuRef}
      className="absolute top-8 right-6 md:right-12 z-50 hidden sm:flex items-center"
    >
      {/* Glowing dot tracer — positioned absolutely within the menuRef */}
      <div
        ref={starRef}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: 0,
          zIndex: 60,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ff9e9e",
          boxShadow: "0 0 6px 2px #ff9e9e, 0 0 18px 6px rgba(255,110,110,0.6), 0 0 36px 10px rgba(255,110,110,0.2)",
        }}
      />

      <div ref={pillRef} className="bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 rounded-full py-3 px-4 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(212,240,0,0.1)]">
        {menuItems.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="menu-item-container relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 transform-gpu cursor-pointer bg-black/40 hover:bg-[#d4f000]/10 border border-white/5 hover:border-[#d4f000]/50"
          >
            {/* Tooltip */}
            <div
              className={`absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 px-3 py-1.5 rounded bg-black border border-[#333] shadow-lg whitespace-nowrap ${
                hoveredIndex === index
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2"
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#d4f000] font-bold">
                {item.label}
              </span>
            </div>

            {/* Icon */}
            <div className="text-[#cccccc] group-hover:text-[#d4f000] transition-colors duration-300 drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(212,240,0,0.8)]">
              {item.icon}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
