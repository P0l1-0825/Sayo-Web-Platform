// ============================================================
// SAYO — Generic Service Data Hook
// ============================================================
// Reusable hook for async data fetching from service layer.
// Handles loading, error, and refetch states.
// Compatible with isDemoMode (services return demo data instantly).
// ============================================================

"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface UseServiceDataResult<T> {
  /** Fetched data (null while loading or on error) */
  data: T | null
  /** True while the initial or refetch call is in progress */
  isLoading: boolean
  /** Error message if the fetch failed */
  error: string | null
  /** Call to re-execute the fetcher */
  refetch: () => void
}

/**
 * Generic hook to fetch data from any async service function.
 *
 * @param fetcher - Async function that returns data (e.g., `() => complianceService.getAlerts()`)
 * @param deps - Dependency array that triggers re-fetch when values change
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * const { data: alerts, isLoading, error, refetch } = useServiceData(
 *   () => complianceService.getAlerts({ status: "activa" }),
 *   [status]
 * )
 * ```
 */
export function useServiceData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options?: { initialData?: T; enabled?: boolean }
): UseServiceDataResult<T> {
  const { initialData, enabled = true } = options ?? {}
  const [data, setData] = useState<T | null>(initialData ?? null)
  const [isLoading, setIsLoading] = useState(!initialData && enabled)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const mountedRef = useRef(true)

  const execute = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  useEffect(() => {
    mountedRef.current = true
    execute()
    return () => {
      mountedRef.current = false
    }
  }, [execute])

  return { data, isLoading, error, refetch: execute }
}
