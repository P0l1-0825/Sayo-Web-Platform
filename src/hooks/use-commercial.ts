// ============================================================
// SAYO — Commercial Hooks
// ============================================================
// Wraps commercialService with useServiceData.
// Maps snake_case Lead/Commission → camelCase UI types.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { commercialService } from "@/lib/commercial-service"
import type {
  Lead,
  Commission,
  StatCardData,
} from "@/lib/types"

// --- Mappers ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLead(l: any): Lead {
  return {
    id: l.id,
    name: l.name,
    email: l.email ?? "",
    phone: l.phone ?? "",
    source: l.source,
    product: l.product_interest ?? l.product ?? "",
    amount: l.requested_amount ?? l.amount ?? 0,
    stage: l.stage ?? l.status ?? "",
    score: l.score ?? 0,
    assignedTo: l.assigned_name ?? l.assigned_to ?? l.assignedTo ?? "",
    date: l.created_at ?? l.date ?? "",
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCommission(c: any): Commission {
  return {
    id: c.id,
    executiveName: c.executive_name ?? c.executiveName ?? "",
    product: c.product ?? "",
    clientName: c.client_name ?? c.clientName ?? "",
    amount: c.credit_amount ?? c.amount ?? 0,
    commissionRate: c.commission_rate ?? c.commissionRate ?? 0,
    commissionAmount: c.commission_amount ?? c.commissionAmount ?? 0,
    status: c.status,
    date: c.created_at ?? c.date ?? "",
  }
}

// --- Hooks ---

export function useLeads(stage?: string) {
  return useServiceData(
    async () => {
      const raw = stage
        ? await commercialService.getLeadsByStage(stage)
        : await commercialService.getLeads()
      return raw.map(mapLead)
    },
    [stage]
  )
}

export function useCommissions(filters?: { status?: string; executiveId?: string }) {
  return useServiceData(
    async () => {
      const serviceFilters = filters ? {
        status: filters.status,
        executive_id: filters.executiveId,
      } : undefined
      const raw = await commercialService.getCommissions(serviceFilters)
      return raw.map(mapCommission)
    },
    [filters?.status, filters?.executiveId]
  )
}

// --- Static Data ---

export const comercialStats: StatCardData[] = [
  { title: "Pipeline Value", value: 25_800_000, change: 15.4, icon: "TrendingUp", trend: "up", format: "currency" },
  { title: "Leads Nuevos", value: 47, change: 22.0, icon: "UserPlus", trend: "up" },
  { title: "Conversión", value: "18.5%", change: 2.3, icon: "Target", trend: "up" },
  { title: "Comisiones Mes", value: 342_000, change: 8.7, icon: "DollarSign", trend: "up", format: "currency" },
]
