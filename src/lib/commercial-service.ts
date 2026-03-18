import { api, isDemoMode } from "./api-client"

// ============================================================
// SAYO — Commercial (Leads, Pipeline, Commissions) +
//         Support (Tickets, UNE, Knowledge) +
//         Marketing (Campaigns, Templates) Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// When isDemoMode is true, returns inline demo data without network calls.
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

// --- Demo Data ---

const demoLeads: Lead[] = [
  { id: "led-001", name: "Grupo Industrial MX", email: "contacto@gimx.com", phone: "+52 55 1234 5678", source: "web", product_interest: "Crédito Empresarial", requested_amount: 5000000, stage: "evaluacion", score: 82, assigned_to: "exec-001", assigned_name: "María Fernández", notes: "Empresa mediana, 15 años operando", created_at: "2024-03-01", updated_at: "2024-03-05" },
  { id: "led-002", name: "Arturo Mendoza", email: "arturo.m@gmail.com", phone: "+52 33 8765 4321", source: "referido", product_interest: "Crédito Personal", requested_amount: 200000, stage: "contactado", score: 65, assigned_to: "exec-001", assigned_name: "María Fernández", notes: null, created_at: "2024-03-03", updated_at: "2024-03-04" },
  { id: "led-003", name: "Logística Express SA", email: "ventas@logex.mx", phone: "+52 81 2468 1357", source: "campana", product_interest: "Línea de Crédito", requested_amount: 3000000, stage: "aprobado", score: 91, assigned_to: "exec-002", assigned_name: "Carlos Vega", notes: "Cliente recurrente", created_at: "2024-02-15", updated_at: "2024-03-01" },
  { id: "led-004", name: "Sofía Ramírez", email: "sofia.r@outlook.com", phone: "+52 55 9876 5432", source: "organico", product_interest: "Cuenta SAYO", requested_amount: null, stage: "prospecto", score: 45, assigned_to: "exec-001", assigned_name: "María Fernández", notes: null, created_at: "2024-03-06", updated_at: "2024-03-06" },
  { id: "led-005", name: "Restaurante El Buen Sabor", email: "admin@elbuensabor.mx", phone: "+52 55 1357 2468", source: "alianza", product_interest: "Terminal Punto de Venta", requested_amount: 15000, stage: "dispersado", score: 95, assigned_to: "exec-002", assigned_name: "Carlos Vega", notes: "Alianza con Rappi", created_at: "2024-02-01", updated_at: "2024-02-20" },
]

const demoCommissions: Commission[] = [
  { id: "com-001", executive_id: "exec-001", executive_name: "María Fernández", product: "Crédito Empresarial", client_name: "Grupo Industrial MX", credit_amount: 5000000, commission_rate: 0.5, commission_amount: 25000, status: "pendiente", period: "Mar 2024", paid_at: null, created_at: "2024-03-01" },
  { id: "com-002", executive_id: "exec-002", executive_name: "Carlos Vega", product: "Terminal POS", client_name: "El Buen Sabor", credit_amount: 15000, commission_rate: 2.0, commission_amount: 300, status: "pagada", period: "Feb 2024", paid_at: "2024-02-28", created_at: "2024-02-15" },
  { id: "com-003", executive_id: "exec-002", executive_name: "Carlos Vega", product: "Línea de Crédito", client_name: "Logística Express", credit_amount: 3000000, commission_rate: 0.3, commission_amount: 9000, status: "pagada", period: "Feb 2024", paid_at: "2024-02-28", created_at: "2024-02-20" },
  { id: "com-004", executive_id: "exec-001", executive_name: "María Fernández", product: "Crédito Personal", client_name: "Arturo Mendoza", credit_amount: 200000, commission_rate: 1.0, commission_amount: 2000, status: "pendiente", period: "Mar 2024", paid_at: null, created_at: "2024-03-05" },
]

const demoTickets: SupportTicket[] = [
  { id: "tkt-001", ticket_number: "TKT-001", subject: "No puedo transferir", description: "Error al intentar SPEI", priority: "alta", status: "en_progreso", channel: "chat", category: "Transferencias", client_name: "Juan Pérez", client_id: "CLI-1001", assigned_to: "agent-001", assigned_name: "Luis Torres", sla_deadline: "2024-03-06T18:00:00", is_une: false, condusef_folio: null, created_at: "2024-03-06T09:00:00", updated_at: "2024-03-06T09:30:00" },
  { id: "tkt-002", ticket_number: "TKT-002", subject: "Cobro duplicado", description: "Me cobraron dos veces la mensualidad", priority: "urgente", status: "abierto", channel: "telefono", category: "Cobros", client_name: "Ana Torres", client_id: "CLI-1002", assigned_to: "agent-001", assigned_name: "Luis Torres", sla_deadline: "2024-03-06T14:00:00", is_une: true, condusef_folio: "CONDUSEF-2024-001", created_at: "2024-03-06T10:00:00", updated_at: "2024-03-06T10:00:00" },
  { id: "tkt-003", ticket_number: "TKT-003", subject: "Actualizar RFC", description: "Necesito actualizar mi RFC en el sistema", priority: "baja", status: "esperando", channel: "email", category: "Datos personales", client_name: "Carlos Díaz", client_id: "CLI-1003", assigned_to: "agent-002", assigned_name: "Mariana Soto", sla_deadline: "2024-03-08T18:00:00", is_une: false, condusef_folio: null, created_at: "2024-03-05T14:00:00", updated_at: "2024-03-06T08:00:00" },
  { id: "tkt-004", ticket_number: "TKT-004", subject: "App no abre", description: "La app se cierra al iniciar sesión", priority: "media", status: "resuelto", channel: "app", category: "App Móvil", client_name: "Sofía Hernández", client_id: "CLI-1004", assigned_to: "agent-001", assigned_name: "Luis Torres", sla_deadline: "2024-03-07T18:00:00", is_une: false, condusef_folio: null, created_at: "2024-03-04T16:00:00", updated_at: "2024-03-05T10:00:00" },
]

const demoMessages: TicketMessage[] = [
  { id: "msg-001", ticket_id: "tkt-001", sender_type: "cliente", sender_name: "Juan Pérez", message: "No puedo hacer transferencias SPEI, me sale error 500", created_at: "2024-03-06T09:00:00" },
  { id: "msg-002", ticket_id: "tkt-001", sender_type: "agente", sender_name: "Luis Torres", message: "Estamos revisando el problema, parece ser un tema con la CLABE destino", created_at: "2024-03-06T09:15:00" },
  { id: "msg-003", ticket_id: "tkt-001", sender_type: "sistema", sender_name: "Sistema", message: "Ticket escalado a nivel 2", created_at: "2024-03-06T09:30:00" },
]

const demoArticles: KnowledgeArticle[] = [
  { id: "art-001", title: "Cómo hacer una transferencia SPEI", content: "Guía paso a paso para realizar transferencias SPEI desde tu cuenta SAYO...", category: "Transferencias", tags: ["spei", "transferencia", "guía"], views: 1250, helpful_count: 890, is_published: true, created_at: "2024-01-15" },
  { id: "art-002", title: "Preguntas frecuentes sobre créditos", content: "Respuestas a las preguntas más comunes sobre nuestros productos de crédito...", category: "Créditos", tags: ["crédito", "faq", "tasas"], views: 980, helpful_count: 720, is_published: true, created_at: "2024-02-01" },
  { id: "art-003", title: "Seguridad de tu cuenta", content: "Consejos para mantener segura tu cuenta SAYO...", category: "Seguridad", tags: ["seguridad", "contraseña", "2fa"], views: 2100, helpful_count: 1650, is_published: true, created_at: "2024-01-20" },
]

const demoCampaigns: Campaign[] = [
  { id: "cmp-001", name: "Bienvenida Q1 2024", channel: "email", status: "activa", audience_size: 12000, sent: 11800, opened: 3820, clicked: 1230, converted: 245, start_date: "2024-01-15", end_date: "2024-03-31", created_at: "2024-01-10" },
  { id: "cmp-002", name: "Crédito Express Push", channel: "push", status: "activa", audience_size: 25000, sent: 24500, opened: 8575, clicked: 2940, converted: 412, start_date: "2024-02-01", end_date: null, created_at: "2024-01-28" },
  { id: "cmp-003", name: "Recordatorio pago SMS", channel: "sms", status: "activa", audience_size: 8200, sent: 8200, opened: 7790, clicked: 0, converted: 3284, start_date: "2024-03-01", end_date: null, created_at: "2024-02-25" },
  { id: "cmp-004", name: "Marketplace Launch", channel: "in_app", status: "programada", audience_size: 50000, sent: 0, opened: 0, clicked: 0, converted: 0, start_date: "2024-03-15", end_date: null, created_at: "2024-03-01" },
  { id: "cmp-005", name: "Black Friday 2023", channel: "email", status: "finalizada", audience_size: 35000, sent: 34800, opened: 14616, clicked: 5568, converted: 1392, start_date: "2023-11-20", end_date: "2023-11-30", created_at: "2023-11-15" },
]

const demoTemplates: NotificationTemplate[] = [
  { id: "tmpl-001", name: "Bienvenida", event_type: "user_registered", channel: "email", subject: "Bienvenido a SAYO", body: "Hola {{name}}, tu cuenta ha sido creada exitosamente...", variables: ["name", "email"], is_active: true },
  { id: "tmpl-002", name: "Transferencia exitosa", event_type: "transfer_completed", channel: "push", subject: null, body: "Tu transferencia de {{amount}} a {{recipient}} fue exitosa", variables: ["amount", "recipient"], is_active: true },
  { id: "tmpl-003", name: "Recordatorio de pago", event_type: "payment_due", channel: "sms", subject: null, body: "SAYO: Tu pago de {{amount}} vence el {{date}}. Evita cargos moratorios.", variables: ["amount", "date"], is_active: true },
]

// --- Service (API-backed with demo fallback) ---

export const commercialService = {
  // Leads
  async getLeads(): Promise<Lead[]> {
    if (isDemoMode) return demoLeads
    return api.get<Lead[]>("/api/v1/commercial/leads")
  },

  async getLeadsByStage(stage: string): Promise<Lead[]> {
    if (isDemoMode) return demoLeads.filter(l => l.stage === stage)
    return api.get<Lead[]>(`/api/v1/commercial/leads${buildQuery({ stage })}`)
  },

  async updateLeadStage(id: string, stage: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/commercial/leads/${id}/stage`, { stage })
  },

  // Commissions
  async getCommissions(filters?: { executive_id?: string; status?: string }): Promise<Commission[]> {
    if (isDemoMode) {
      let result = demoCommissions
      if (filters?.executive_id) result = result.filter(c => c.executive_id === filters.executive_id)
      if (filters?.status) result = result.filter(c => c.status === filters.status)
      return result
    }
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
    if (isDemoMode) return {
      pipeline: [
        { stage: "prospecto", count: 15, value: 2000000 },
        { stage: "contactado", count: 12, value: 3500000 },
        { stage: "evaluacion", count: 8, value: 8000000 },
        { stage: "aprobado", count: 5, value: 6000000 },
        { stage: "dispersado", count: 7, value: 6300000 },
      ],
      totalLeads: 47,
      conversionRate: 18.5,
      pipelineValue: 25800000,
      totalCommissions: 36300,
      pendingCommissions: 27000,
    }
    return api.get("/api/v1/commercial/pipeline/stats")
  },
}

export const supportService = {
  // Tickets
  async getTickets(filters?: { status?: string; priority?: string; is_une?: boolean }): Promise<SupportTicket[]> {
    if (isDemoMode) {
      let result = demoTickets
      if (filters?.status) result = result.filter(t => t.status === filters.status)
      if (filters?.priority) result = result.filter(t => t.priority === filters.priority)
      if (filters?.is_une !== undefined) result = result.filter(t => t.is_une === filters.is_une)
      return result
    }
    return api.get<SupportTicket[]>(`/api/v1/support/tickets${buildQuery({ status: filters?.status, priority: filters?.priority, is_une: filters?.is_une })}`)
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    if (isDemoMode) return demoMessages.filter(m => m.ticket_id === ticketId)
    return api.get<TicketMessage[]>(`/api/v1/support/tickets/${ticketId}/messages`)
  },

  async updateTicketStatus(id: string, status: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/support/tickets/${id}/status`, { status })
  },

  // Knowledge Base
  async getArticles(): Promise<KnowledgeArticle[]> {
    if (isDemoMode) return demoArticles
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
    if (isDemoMode) return { ticketsAbiertos: 23, ticketsUrgentes: 2, slaPercent: 94.2, satisfactionScore: 4.6, uneActivos: 1, porCanal: { chat: 42, telefono: 28, email: 18, app: 8 } }
    return api.get("/api/v1/support/stats")
  },
}

export const marketingService = {
  async getCampaigns(): Promise<Campaign[]> {
    if (isDemoMode) return demoCampaigns
    return api.get<Campaign[]>("/api/v1/marketing/campaigns")
  },

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    if (isDemoMode) return demoTemplates
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
    if (isDemoMode) return { campanasActivas: 5, totalSent: 79300, avgOpenRate: 32.4, avgClickRate: 12.3, totalConversions: 5333, audienceReach: 45200 }
    return api.get("/api/v1/marketing/stats")
  },
}
