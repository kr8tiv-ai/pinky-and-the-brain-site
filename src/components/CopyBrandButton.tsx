'use client'

import { useState } from 'react'

export default function CopyBrandButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const content = (document.querySelector('#brand-content') as HTMLElement | null)?.innerText
    if (content) {
      try {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = content
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0a0a0a] font-mono text-xs uppercase tracking-widest font-black px-6 py-3 hover:bg-white transition-colors duration-300 shadow-[4px_4px_0px_#ffadad] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Full Document
        </>
      )}
    </button>
  )
}
