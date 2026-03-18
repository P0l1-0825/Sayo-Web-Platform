// ============================================================
// SAYO — Executive Dashboard Hooks
// ============================================================
// Wraps executiveService with useServiceData.
// Maps snake_case PnLItem/KPIRecord → camelCase UI types.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { executiveService } from "@/lib/executive-service"
import type {
  PnLItem,
  KPI,
  StatCardData,
  ChartDataPoint,
} from "@/lib/types"

// --- Mappers ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPnLItem(p: any): PnLItem {
  return {
    category: p.category,
    subcategory: p.subcategory ?? p.name ?? "",
    currentMonth: p.current_month ?? p.currentMonth ?? 0,
    previousMonth: p.previous_month ?? p.previousMonth ?? 0,
    ytd: p.ytd ?? 0,
    budget: p.budget ?? 0,
    variance: p.variance ?? 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapKPI(k: any): KPI {
  return {
    id: k.id,
    name: k.name,
    category: k.category,
    actual: k.actual,
    target: k.target,
    unit: k.unit,
    trend: k.trend,
    status: k.status,
  }
}

// --- Hooks ---

export function usePnL() {
  return useServiceData(
    async () => {
      const raw = await executiveService.getPnL()
      return raw.map(mapPnLItem)
    },
    []
  )
}

export function useKPIs(period?: string) {
  return useServiceData(
    async () => {
      const raw = await executiveService.getKPIs(period)
      return raw.map(mapKPI)
    },
    [period]
  )
}

// --- Static Data ---

export const ejecutivoStats: StatCardData[] = [
  { title: "Ingresos Netos", value: 12_450_000, change: 14.2, icon: "TrendingUp", trend: "up", format: "currency" },
  { title: "AUM", value: 2_340_000_000, change: 8.7, icon: "Landmark", trend: "up", format: "currency" },
  { title: "Usuarios Activos", value: 48500, change: 22.1, icon: "Users", trend: "up" },
  { title: "NPS", value: 72, change: 5, icon: "Heart", trend: "up" },
]

export const revenuetrend: ChartDataPoint[] = [
  { name: "Oct", value: 9200000, gastos: 7100000 },
  { name: "Nov", value: 10500000, gastos: 7800000 },
  { name: "Dic", value: 11800000, gastos: 8200000 },
  { name: "Ene", value: 10900000, gastos: 7500000 },
  { name: "Feb", value: 11200000, gastos: 7900000 },
  { name: "Mar", value: 12450000, gastos: 8100000 },
]
