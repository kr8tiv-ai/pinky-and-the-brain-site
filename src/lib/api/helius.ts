// src/lib/api/helius.ts
// Server-side only — do NOT import in client components
// Helius JSON-RPC wrapper for SOL balance, token accounts, and token supply
// Source: https://www.helius.dev/docs/api-reference/rpc/http/

import { HELIUS_RPC_URL } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenAccount {
  mint: string
  uiAmount: number
  amount: string // raw string, preserves full precision
  decimals: number
}

// Internal raw shape from Helius JSON-RPC getTokenAccountsByOwner with jsonParsed encoding
interface RawTokenAccountInfo {
  mint: string
  owner: string
  tokenAmount: {
    amount: string
    decimals: number
    uiAmount: number | null
  }
}

interface RawTokenAccount {
  account: {
    data: {
      parsed: {
        info: RawTokenAccountInfo
      }
    }
  }
  pubkey: string
}

// ─── Private RPC helper ────────────────────────────────────────────────────────

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    next: { revalidate: 60 }, // Next.js fetch cache — 60 second TTL
  })
  if (!res.ok) {
    throw new Error(`Helius RPC ${method} failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as { result?: T; error?: { message: string } }
  if (json.error) {
    throw new Error(`Helius RPC error in ${method}: ${json.error.message}`)
  }
  return json.result as T
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Returns the SOL balance of a wallet in SOL (not lamports).
 */
export async function getSolBalance(wallet: string): Promise<number> {
  const result = await rpc<{ value: number }>('getBalance', [wallet])
  return result.value / 1_000_000_000
}

/**
 * Returns all SPL token accounts owned by a wallet address.
 * Uses the Token Program ID and jsonParsed encoding for human-readable amounts.
 */
export async function getTokenAccountsByOwner(owner: string): Promise<TokenAccount[]> {
  const result = await rpc<{ value: RawTokenAccount[] }>('getTokenAccountsByOwner', [
    owner,
    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
    { encoding: 'jsonParsed' },
  ])
  return result.value.map((acct) => {
    const info = acct.account.data.parsed.info
    return {
      mint: info.mint,
      uiAmount: info.tokenAmount.uiAmount ?? 0,
      amount: info.tokenAmount.amount,
      decimals: info.tokenAmount.decimals,
    }
  })
}

/**
 * Returns the current token supply for a mint address.
 * amount: raw string (full precision), decimals: number, uiAmount: human-readable number.
 */
export async function getTokenSupply(
  mint: string
): Promise<{ amount: string; decimals: number; uiAmount: number }> {
  const result = await rpc<{
    value: { amount: string; decimals: number; uiAmount: number | null }
  }>('getTokenSupply', [mint])
  return {
    amount: result.value.amount,
    decimals: result.value.decimals,
    uiAmount: result.value.uiAmount ?? 0,
  }
}
