// ============================================================
// SAYO — Marketing Hooks
// ============================================================
// Wraps marketingService with useServiceData.
// Maps snake_case Campaign → camelCase UI type.
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { marketingService } from "@/lib/commercial-service"
import type {
  Campaign,
  StatCardData,
} from "@/lib/types"

// --- Mapper ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCampaign(c: any): Campaign {
  return {
    id: c.id,
    name: c.name,
    channel: c.channel,
    status: c.status,
    audience: c.audience_size ?? c.audience ?? 0,
    sent: c.sent ?? 0,
    opened: c.opened ?? 0,
    clicked: c.clicked ?? 0,
    converted: c.converted ?? 0,
    startDate: c.start_date ?? c.startDate ?? "",
    endDate: c.end_date ?? c.endDate,
  }
}

// --- Hooks ---

export function useCampaigns() {
  return useServiceData(
    async () => {
      const raw = await marketingService.getCampaigns()
      return raw.map(mapCampaign)
    },
    []
  )
}

export function useNotificationTemplates() {
  return useServiceData(() => marketingService.getNotificationTemplates(), [])
}

// --- Static Data ---

export const marketingStats: StatCardData[] = [
  { title: "Campañas Activas", value: 5, icon: "Rocket", trend: "neutral" },
  { title: "Tasa Apertura", value: "32.4%", change: 4.1, icon: "Mail", trend: "up" },
  { title: "Conversión", value: "8.7%", change: 1.2, icon: "Target", trend: "up" },
  { title: "Usuarios Alcanzados", value: 45200, change: 18.5, icon: "Users", trend: "up" },
]
