import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "@/components/SmoothScrolling";
import { QueryProvider } from "@/providers/query-client";
import { SolanaWalletProvider } from "@/providers/wallet-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pinkyandthebrain.fun'),
  title: "Pinky and The Brain | $BRAIN Fund",
  description: "Same thing we do every night, Pinky. A highly deflationary Solana reflecting investment token with SOL reflections to top 100 holders. On-chain transparency, community governed.",
  keywords: ["$BRAIN", "Solana", "DeFi", "deflationary token", "SOL reflections", "Pinky and The Brain", "crypto investment", "SPL token"],
  authors: [{ name: "Brain Fund" }],
  openGraph: {
    title: "Pinky and The Brain | $BRAIN Fund",
    description: "A highly deflationary Solana reflecting investment token. SOL reflections to top 100 holders. 100% LP locked. On-chain transparency.",
    type: "website",
    siteName: "$BRAIN Fund",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pinky and The Brain - $BRAIN Fund",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinky and The Brain | $BRAIN Fund",
    description: "A highly deflationary Solana reflecting investment token. SOL reflections to top 100 holders.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <SolanaWalletProvider>
            <div className="noise-overlay"></div>
            <SmoothScrolling>{children}</SmoothScrolling>
          </SolanaWalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
