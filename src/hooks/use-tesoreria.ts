// ============================================================
// SAYO — Tesorería Hooks
// ============================================================
// Wraps tesoreriaService with useServiceData.
// No mapper needed — service imports types from types.ts directly.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { tesoreriaService } from "@/lib/tesoreria-service"
import type {
  TreasuryPayment,
  TreasuryPaymentType,
  TreasuryPaymentStatus,
  PaymentBatch,
  PaymentAuthorization,
  StatCardData,
  ChartDataPoint,
} from "@/lib/types"

// --- Hooks ---

type AuthorizationStatus = "pendiente" | "autorizado" | "rechazado"

export function useTreasuryPayments(filters?: { status?: TreasuryPaymentStatus; type?: TreasuryPaymentType }) {
  return useServiceData(
    () => tesoreriaService.getPayments(filters) as Promise<TreasuryPayment[]>,
    [filters?.status, filters?.type]
  )
}

export function useTreasuryPayment(id: string) {
  return useServiceData(
    () => tesoreriaService.getPayment(id) as Promise<TreasuryPayment | null>,
    [id],
    { enabled: !!id }
  )
}

export function usePaymentBatches() {
  return useServiceData(
    () => tesoreriaService.getBatches() as Promise<PaymentBatch[]>,
    []
  )
}

export function usePaymentAuthorizations(status?: AuthorizationStatus) {
  return useServiceData(
    () => tesoreriaService.getAuthorizations(status) as Promise<PaymentAuthorization[]>,
    [status]
  )
}

// --- Static Data ---

export const tesoreriaStats: StatCardData[] = [
  { title: "Pagos Hoy", value: 156, change: 4.2, icon: "CreditCard", trend: "up" },
  { title: "Monto Dispersado", value: 12_450_000, change: 15.3, icon: "DollarSign", trend: "up", format: "currency" },
  { title: "Pendientes Autorización", value: 8, change: -25, icon: "ShieldCheck", trend: "down" },
  { title: "Rechazados", value: 3, change: -50, icon: "Ban", trend: "up" },
]

export const tesoreriaFlowChart: ChartDataPoint[] = [
  { name: "Lun", value: 3200000, ingresos: 4500000, egresos: 3200000 },
  { name: "Mar", value: 2800000, ingresos: 3800000, egresos: 2800000 },
  { name: "Mié", value: 4100000, ingresos: 5200000, egresos: 4100000 },
  { name: "Jue", value: 1900000, ingresos: 2900000, egresos: 1900000 },
  { name: "Vie", value: 5300000, ingresos: 6100000, egresos: 5300000 },
  { name: "Sáb", value: 800000, ingresos: 1200000, egresos: 800000 },
  { name: "Dom", value: 200000, ingresos: 400000, egresos: 200000 },
]

export const paymentTypeDistribution: ChartDataPoint[] = [
  { name: "Individual", value: 45 },
  { name: "Empresa", value: 25 },
  { name: "Referenciado", value: 15 },
  { name: "Dispersión", value: 15 },
]
