// ============================================================
// SAYO — Support Hooks
// ============================================================
// Wraps supportService with useServiceData.
// Maps snake_case SupportTicket → camelCase UI type.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { supportService } from "@/lib/commercial-service"
import type {
  SupportTicket,
  StatCardData,
} from "@/lib/types"

// --- Mapper ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTicket(t: any): SupportTicket {
  return {
    id: t.ticket_number ?? t.id ?? "",
    subject: t.subject,
    description: t.description ?? "",
    priority: t.priority,
    status: t.status,
    channel: t.channel ?? "",
    clientName: t.client_name ?? t.clientName ?? "",
    clientId: t.client_id ?? t.clientId ?? "",
    assignedTo: t.assigned_name ?? t.assigned_to ?? t.assignedTo ?? "",
    slaDeadline: t.sla_deadline ?? t.slaDeadline ?? "",
    createdAt: t.created_at ?? t.createdAt ?? "",
    updatedAt: t.updated_at ?? t.updatedAt ?? "",
    category: t.category ?? "",
  }
}

// --- Hooks ---

export function useSupportTickets(filters?: { status?: string; priority?: string }) {
  return useServiceData(
    async () => {
      const raw = await supportService.getTickets(filters)
      return raw.map(mapTicket)
    },
    [filters?.status, filters?.priority]
  )
}

export function useKnowledgeBase() {
  return useServiceData(() => supportService.getArticles(), [])
}

// --- Static Data ---

export const soporteStats: StatCardData[] = [
  { title: "Tickets Abiertos", value: 23, change: -12, icon: "Ticket", trend: "down" },
  { title: "SLA Cumplido", value: "94.2%", change: 1.8, icon: "Clock", trend: "up" },
  { title: "Satisfacción", value: "4.6/5", change: 0.2, icon: "Star", trend: "up" },
  { title: "Tiempo Resp. Prom.", value: "12 min", change: -3, icon: "Zap", trend: "down" },
]
