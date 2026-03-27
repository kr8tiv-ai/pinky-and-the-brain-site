'use client'

import { useQuery } from '@tanstack/react-query'
import type { ReflectionsDashboardResponse } from '@/lib/api/types'

export function useReflections() {
  return useQuery<ReflectionsDashboardResponse, Error>({
    queryKey: ['reflections'],
    queryFn: async () => {
      const res = await fetch('/api/reflections')
      if (!res.ok) throw new Error('Reflections fetch failed')
      return res.json() as Promise<ReflectionsDashboardResponse>
    },
    staleTime: 120_000,
    refetchInterval: 120_000,
  })
}
