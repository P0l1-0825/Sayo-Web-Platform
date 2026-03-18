// ============================================================
// SAYO — Credits & Collections Hooks
// ============================================================
// Wraps creditsService with useServiceData.
// Maps snake_case Credit → camelCase CreditAccount.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { creditsService } from "@/lib/credits-service"
import type {
  CreditAccount,
  CollectionAction,
  StatCardData,
} from "@/lib/types"

// --- Mappers ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCredit(c: any): CreditAccount {
  return {
    id: c.id,
    clientName: c.client_name ?? c.clientName ?? "",
    clientId: c.client_id ?? c.clientId ?? "",
    productType: c.product_name ?? c.productType ?? "",
    originalAmount: c.original_amount ?? c.originalAmount ?? 0,
    currentBalance: c.current_balance ?? c.currentBalance ?? 0,
    pastDueAmount: c.past_due_amount ?? c.pastDueAmount ?? 0,
    daysPastDue: c.days_past_due ?? c.daysPastDue ?? 0,
    moraCategory: c.mora_category ?? c.moraCategory ?? "0-30",
    lastPaymentDate: c.last_payment_date ?? c.lastPaymentDate ?? "",
    nextPaymentDate: c.next_payment_date ?? c.nextPaymentDate ?? "",
    status: c.status,
    assignedAgent: c.assigned_agent ?? c.assignedAgent ?? "",
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCollectionAction(a: any): CollectionAction {
  return {
    id: a.id,
    creditId: a.credit_id ?? a.creditId ?? "",
    type: a.action_type ?? a.type ?? "",
    result: a.result,
    date: a.created_at ?? a.date ?? "",
    agent: a.agent_name ?? a.agent ?? "",
    notes: a.notes ?? "",
  }
}

// --- Hooks ---

export function useCreditAccounts() {
  return useServiceData(
    async () => {
      const raw = await creditsService.getCredits()
      return raw.map(mapCredit)
    },
    []
  )
}

export function useUserCredits(userId: string) {
  return useServiceData(
    async () => {
      const raw = await creditsService.getUserCredits(userId)
      return raw.map(mapCredit)
    },
    [userId],
    { enabled: !!userId }
  )
}

export function useCollectionActions(creditId?: string) {
  return useServiceData(
    async () => {
      const raw = await creditsService.getCollectionActions(creditId)
      return raw.map(mapCollectionAction)
    },
    [creditId]
  )
}

export function useCreditProducts() {
  return useServiceData(() => creditsService.getProducts(), [])
}

// --- Static Data ---

export const cobranzaStats: StatCardData[] = [
  { title: "Cartera Total", value: 185_000_000, icon: "Briefcase", format: "currency", trend: "neutral" },
  { title: "Cartera Vencida", value: 12_450_000, change: -5.2, icon: "AlertCircle", trend: "down", format: "currency" },
  { title: "Recuperación %", value: "78.5%", change: 3.2, icon: "TrendingUp", trend: "up" },
  { title: "Mora 90+", value: 2_100_000, change: -8.1, icon: "Clock", trend: "down", format: "currency" },
]
