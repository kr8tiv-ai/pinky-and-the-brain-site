'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export type ToastStatus = 'idle' | 'pending' | 'success' | 'error'

interface TransactionToastProps {
  status: ToastStatus
  successMessage?: string
  errorMessage?: string
  onDismiss: () => void
}

/**
 * TransactionToast — fixed-position toast for staking transaction feedback.
 *
 * Three visual states:
 * - PENDING: pulsing lime border, "TRANSACTION SUBMITTED — AWAITING CONFIRMATION..."
 * - SUCCESS: solid lime border, custom message, auto-dismiss 5s
 * - ERROR: red border, error message, auto-dismiss 8s
 *
 * Renders nothing when status is 'idle'.
 */
export default function TransactionToast({
  status,
  successMessage,
  errorMessage,
  onDismiss,
}: TransactionToastProps) {
  const toastRef = useRef<HTMLDivElement>(null)

  // GSAP enter animation
  useEffect(() => {
    if (status === 'idle' || !toastRef.current) return
    gsap.fromTo(
      toastRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
    )
  }, [status])

  // Auto-dismiss timers
  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(onDismiss, 5000)
      return () => clearTimeout(t)
    }
    if (status === 'error') {
      const t = setTimeout(onDismiss, 8000)
      return () => clearTimeout(t)
    }
  }, [status, onDismiss])

  if (status === 'idle') return null

  const isPending = status === 'pending'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  const borderColor = isError
    ? 'border-[#ff9e9e]/40'
    : 'border-[#d4f000]/30'

  const textColor = isError
    ? 'text-[#ff9e9e]'
    : 'text-[#d4f000]'

  const pulseClass = isPending ? 'animate-pulse' : ''

  const message = isPending
    ? 'TRANSACTION SUBMITTED — AWAITING CONFIRMATION...'
    : isSuccess
      ? (successMessage ?? 'TRANSACTION CONFIRMED')
      : (errorMessage ?? 'TRANSACTION FAILED')

  return (
    <div
      ref={toastRef}
      className={`fixed top-6 right-6 z-50 max-w-[420px] font-mono text-[11px] uppercase tracking-[0.2em] px-4 py-3 bg-[#0a0a0a] border ${borderColor} ${pulseClass} rounded-sm shadow-lg`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isPending && (
            <span className="inline-block w-3 h-3 border border-[#d4f000]/40 border-t-[#d4f000] rounded-full animate-spin" />
          )}
          {isSuccess && <span className="text-[#d4f000] text-[9px]">◆</span>}
          {isError && <span className="text-[#ff9e9e] text-[9px]">⚠</span>}
          <span className={textColor}>{message}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#555] hover:text-[#999] transition-colors text-[14px] leading-none ml-2 flex-shrink-0"
          aria-label="Dismiss toast"
        >
          ×
        </button>
      </div>
    </div>
  )
}
