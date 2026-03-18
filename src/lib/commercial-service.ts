import { api } from "./api-client"

// ============================================================
// SAYO — Commercial (Leads, Pipeline, Commissions) +
//         Support (Tickets, UNE, Knowledge) +
//         Marketing (Campaigns, Templates) Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// Demo mode is handled server-side.
// ============================================================

// --- Types ---

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: "web" | "referido" | "campana" | "organico" | "alianza"
  product_interest: string
  requested_amount: number | null
  stage: "prospecto" | "contactado" | "evaluacion" | "aprobado" | "dispersado" | "rechazado"
  score: number
  assigned_to: string | null
  assigned_name?: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  executive_id: string
  executive_name: string
  product: string
  client_name: string
  credit_amount: number
  commission_rate: number
  commission_amount: number
  status: "pendiente" | "pagada" | "cancelada"
  period: string
  paid_at: string | null
  created_at: string
}

export interface SupportTicket {
  id: string
  ticket_number: string
  subject: string
  description: string
  priority: "urgente" | "alta" | "media" | "baja"
  status: "abierto" | "en_progreso" | "esperando" | "resuelto" | "cerrado"
  channel: "chat" | "telefono" | "email" | "app" | "sucursal"
  category: string
  client_name: string
  client_id: string
  assigned_to: string | null
  assigned_name?: string
  sla_deadline: string
  is_une: boolean
  condusef_folio: string | null
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_type: "cliente" | "agente" | "sistema"
  sender_name: string
  message: string
  created_at: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  views: number
  helpful_count: number
  is_published: boolean
  created_at: string
}

export interface Campaign {
  id: string
  name: string
  channel: "push" | "email" | "sms" | "in_app"
  status: "borrador" | "programada" | "activa" | "pausada" | "finalizada"
  audience_size: number
  sent: number
  opened: number
  clicked: number
  converted: number
  start_date: string
  end_date: string | null
  created_at: string
}

export interface NotificationTemplate {
  id: string
  name: string
  event_type: string
  channel: string
  subject: string | null
  body: string
  variables: string[]
  is_active: boolean
}

// --- Helpers ---

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

// --- Service (API-backed) ---

export const commercialService = {
  // Leads
  async getLeads(): Promise<Lead[]> {
    return api.get<Lead[]>("/api/v1/commercial/leads")
  },

  async getLeadsByStage(stage: string): Promise<Lead[]> {
    return api.get<Lead[]>(`/api/v1/commercial/leads${buildQuery({ stage })}`)
  },

  async updateLeadStage(id: string, stage: string): Promise<void> {
    await api.patch<void>(`/api/v1/commercial/leads/${id}/stage`, { stage })
  },

  // Commissions
  async getCommissions(filters?: { executive_id?: string; status?: string }): Promise<Commission[]> {
    return api.get<Commission[]>(`/api/v1/commercial/commissions${buildQuery({ executive_id: filters?.executive_id, status: filters?.status })}`)
  },

  // Pipeline stats
  async getPipelineStats(): Promise<{
    pipeline: Array<{ stage: string; count: number; value: number }>
    totalLeads: number
    conversionRate: number
    pipelineValue: number
    totalCommissions: number
    pendingCommissions: number
  }> {
    return api.get("/api/v1/commercial/pipeline/stats")
  },
}

export const supportService = {
  // Tickets
  async getTickets(filters?: { status?: string; priority?: string; is_une?: boolean }): Promise<SupportTicket[]> {
    return api.get<SupportTicket[]>(`/api/v1/support/tickets${buildQuery({ status: filters?.status, priority: filters?.priority, is_une: filters?.is_une })}`)
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    return api.get<TicketMessage[]>(`/api/v1/support/tickets/${ticketId}/messages`)
  },

  async updateTicketStatus(id: string, status: string): Promise<void> {
    await api.patch<void>(`/api/v1/support/tickets/${id}/status`, { status })
  },

  // Knowledge Base
  async getArticles(): Promise<KnowledgeArticle[]> {
    return api.get<KnowledgeArticle[]>("/api/v1/support/knowledge-articles")
  },

  // Stats
  async getSupportStats(): Promise<{
    ticketsAbiertos: number
    ticketsUrgentes: number
    slaPercent: number
    satisfactionScore: number
    uneActivos: number
    porCanal: { chat: number; telefono: number; email: number; app: number }
  }> {
    return api.get("/api/v1/support/stats")
  },
}

export const marketingService = {
  async getCampaigns(): Promise<Campaign[]> {
    return api.get<Campaign[]>("/api/v1/marketing/campaigns")
  },

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return api.get<NotificationTemplate[]>("/api/v1/marketing/notification-templates")
  },

  async getMarketingStats(): Promise<{
    campanasActivas: number
    totalSent: number
    avgOpenRate: number
    avgClickRate: number
    totalConversions: number
    audienceReach: number
  }> {
    return api.get("/api/v1/marketing/stats")
  },
}
