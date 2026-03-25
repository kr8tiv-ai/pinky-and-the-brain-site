// src/lib/api/jupiter.ts
// Server-side only — do NOT import in client components
// DexScreener-backed price fetcher — FREE, no API key needed
// Source: https://docs.dexscreener.com/api/reference

const DEXSCREENER_BASE = 'https://api.dexscreener.com/tokens/v1/solana'

interface DexScreenerPair {
  baseToken: { address: string; name: string; symbol: string }
  priceUsd: string | null
  priceChange: { h24?: number }
  marketCap?: number
  fdv?: number
  volume: { h24?: number }
  liquidity: { usd?: number }
}

export interface DexTokenMeta {
  name: string
  symbol: string
}

export interface DexScreenerEnriched {
  priceUsd: number
  priceChange24h: number
  marketCap: number
  fdv: number
  volume24h: number
  liquidity: number
}

/**
 * Fetches current USD prices for one or more tokens from DexScreener.
 * Returns a map of mint → USD price. Missing tokens default to 0.
 * Batches up to 30 addresses per request (DexScreener limit).
 */
export async function getJupiterPrices(
  mints: string[]
): Promise<Record<string, number>> {
  if (mints.length === 0) return {}

  const result: Record<string, number> = {}
  // DexScreener supports comma-separated addresses (up to 30)
  const addresses = mints.join(',')
  const res = await fetch(`${DEXSCREENER_BASE}/${addresses}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error(`DexScreener price fetch failed: ${res.status} ${res.statusText}`)
  }
  const pairs = (await res.json()) as DexScreenerPair[]

  // Pick the highest-liquidity pair per token address
  for (const mint of mints) {
    const mintPairs = pairs.filter(
      (p) => p.baseToken.address.toLowerCase() === mint.toLowerCase()
    )
    if (mintPairs.length > 0) {
      // Sort by liquidity desc to get the most reliable price
      mintPairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
      result[mint] = mintPairs[0].priceUsd ? parseFloat(mintPairs[0].priceUsd) : 0
    } else {
      result[mint] = 0
    }
  }
  return result
}

/**
 * Fetches prices AND token metadata (name, symbol) from DexScreener in a single call.
 * Used by the treasury module to resolve names for tokens not in investments.config.
 */
export async function getPricesWithMetadata(
  mints: string[]
): Promise<{ prices: Record<string, number>; metadata: Record<string, DexTokenMeta> }> {
  if (mints.length === 0) return { prices: {}, metadata: {} }

  const prices: Record<string, number> = {}
  const metadata: Record<string, DexTokenMeta> = {}
  const addresses = mints.join(',')
  const res = await fetch(`${DEXSCREENER_BASE}/${addresses}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error(`DexScreener price fetch failed: ${res.status} ${res.statusText}`)
  }
  const pairs = (await res.json()) as DexScreenerPair[]

  for (const mint of mints) {
    const mintPairs = pairs.filter(
      (p) => p.baseToken.address.toLowerCase() === mint.toLowerCase()
    )
    if (mintPairs.length > 0) {
      mintPairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
      prices[mint] = mintPairs[0].priceUsd ? parseFloat(mintPairs[0].priceUsd) : 0
      metadata[mint] = {
        name: mintPairs[0].baseToken.name,
        symbol: mintPairs[0].baseToken.symbol,
      }
    } else {
      prices[mint] = 0
    }
  }
  return { prices, metadata }
}

/**
 * Fetches enriched price data for a single token (price, 24h change, mcap, volume).
 * Returns null if no pairs found.
 */
export async function getDexScreenerToken(
  mint: string
): Promise<DexScreenerEnriched | null> {
  const res = await fetch(`${DEXSCREENER_BASE}/${mint}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  const pairs = (await res.json()) as DexScreenerPair[]
  if (pairs.length === 0) return null

  // Pick highest-liquidity pair
  pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
  const best = pairs[0]

  return {
    priceUsd: best.priceUsd ? parseFloat(best.priceUsd) : 0,
    priceChange24h: best.priceChange?.h24 ?? 0,
    marketCap: best.marketCap ?? best.fdv ?? 0,
    fdv: best.fdv ?? 0,
    volume24h: best.volume?.h24 ?? 0,
    liquidity: best.liquidity?.usd ?? 0,
  }
}
