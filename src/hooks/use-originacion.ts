// ============================================================
// SAYO — Originación de Créditos Hooks
// ============================================================
// Wraps originacionService with useServiceData.
// No mapper needed — service already uses camelCase types.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { originacionService } from "@/lib/originacion-service"
import type {
  CreditApplication,
  CreditApplicationStatus,
  CreditLine,
  CommitteeDecision,
  Disposition,
  StatCardData,
  ChartDataPoint,
  ClientPFAE,
  ClientPM,
} from "@/lib/types"

// --- Hooks ---

export function useCreditApplications(filters?: { status?: CreditApplicationStatus }) {
  return useServiceData(
    async () => {
      if (filters?.status) {
        return originacionService.getApplicationsByStatus(filters.status) as Promise<CreditApplication[]>
      }
      return originacionService.getApplications() as Promise<CreditApplication[]>
    },
    [filters?.status]
  )
}

export function useCreditApplication(id: string) {
  return useServiceData(
    () => originacionService.getApplication(id) as Promise<CreditApplication | null>,
    [id],
    { enabled: !!id }
  )
}

export function useCreditLines() {
  return useServiceData(
    () => originacionService.getCreditLines() as Promise<CreditLine[]>,
    []
  )
}

export function useCreditLine(id: string) {
  return useServiceData(
    () => originacionService.getCreditLine(id) as Promise<CreditLine | null>,
    [id],
    { enabled: !!id }
  )
}

export function useCommitteeDecisions() {
  return useServiceData(
    () => originacionService.getCommitteeDecisions() as Promise<CommitteeDecision[]>,
    []
  )
}

export function useDispositions() {
  return useServiceData(
    () => originacionService.getDispositions() as Promise<Disposition[]>,
    []
  )
}

export function useClientsPFAE() {
  return useServiceData(
    () => originacionService.getClientsPFAE() as Promise<ClientPFAE[]>,
    []
  )
}

export function useClientsPM() {
  return useServiceData(
    () => originacionService.getClientsPM() as Promise<ClientPM[]>,
    []
  )
}

// --- Static Data ---

export const originacionStats: StatCardData[] = [
  { title: "Solicitudes Hoy", value: 14, change: 16.7, icon: "FileSignature", trend: "up" },
  { title: "Monto Pipeline", value: 28_500_000, change: 5.2, icon: "CircleDollarSign", trend: "up", format: "currency" },
  { title: "Tasa Aprobación", value: "78%", change: 3.1, icon: "Check", trend: "up" },
  { title: "Tiempo Promedio", value: "4.2 días", change: -8.5, icon: "Clock", trend: "up" },
]

export const originacionPipeline: ChartDataPoint[] = [
  { name: "Capturada", value: 3 },
  { name: "Por Aprobar", value: 4 },
  { name: "En Comité", value: 2 },
  { name: "Por Disponer", value: 2 },
  { name: "Activa", value: 8 },
  { name: "Rechazada", value: 1 },
]

export const originacionTrend: ChartDataPoint[] = [
  { name: "Ene", value: 12 },
  { name: "Feb", value: 18 },
  { name: "Mar", value: 14 },
  { name: "Abr", value: 22 },
  { name: "May", value: 19 },
  { name: "Jun", value: 25 },
]
