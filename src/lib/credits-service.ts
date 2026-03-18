import { api } from "./api-client"

// ============================================================
// SAYO — Credits, Payments & Collections Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// Demo mode is handled server-side.
// ============================================================

export interface CreditProduct {
  id: string
  name: string
  description: string
  min_amount: number
  max_amount: number
  min_term: number
  max_term: number
  annual_rate: number
  monthly_rate: number
  cat: number
  commission_rate: number
  requirements: string[]
  is_active: boolean
}

export interface CreditApplication {
  id: string
  user_id: string
  product_id: string
  product_name?: string
  requested_amount: number
  approved_amount: number | null
  term_months: number
  monthly_rate: number
  cat: number
  status: "borrador" | "enviada" | "en_revision" | "aprobada" | "rechazada" | "dispersada" | "cancelada"
  rejection_reason: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export interface Credit {
  id: string
  user_id: string
  application_id: string
  product_id: string
  product_name?: string
  original_amount: number
  current_balance: number
  monthly_payment: number
  term_months: number
  remaining_months: number
  annual_rate: number
  monthly_rate: number
  cat: number
  status: "vigente" | "vencido" | "liquidado" | "reestructurado" | "castigado"
  days_past_due: number
  mora_category: string
  next_payment_date: string
  last_payment_date: string | null
  disbursed_at: string
  created_at: string
}

export interface CreditPayment {
  id: string
  credit_id: string
  payment_number: number
  amount: number
  principal: number
  interest: number
  iva_interest: number
  mora_interest: number
  total_paid: number
  due_date: string
  paid_date: string | null
  status: "pendiente" | "pagado" | "vencido" | "parcial"
}

export interface CollectionAction {
  id: string
  credit_id: string
  action_type: "llamada" | "sms" | "email" | "visita" | "carta" | "legal"
  result: "contactado" | "no_contesta" | "promesa_pago" | "negativa" | "buzon" | "numero_equivocado"
  agent_id: string
  agent_name?: string
  notes: string
  promise_date: string | null
  promise_amount: number | null
  created_at: string
}

export interface CollectionStrategy {
  id: string
  name: string
  mora_category: string
  description: string
  actions: string[]
  priority: number
  is_active: boolean
}

// --- Service (API-backed) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const creditsService = {
  // Products
  async getProducts(): Promise<CreditProduct[]> {
    return api.get<CreditProduct[]>("/api/v1/credits/products")
  },

  async getProduct(id: string): Promise<CreditProduct | null> {
    return api.get<CreditProduct | null>(`/api/v1/credits/products/${id}`)
  },

  // Applications
  async getApplications(): Promise<CreditApplication[]> {
    return api.get<CreditApplication[]>("/api/v1/credits/applications")
  },

  async getUserApplications(userId: string): Promise<CreditApplication[]> {
    return api.get<CreditApplication[]>(`/api/v1/credits/applications${buildQuery({ userId })}`)
  },

  async updateApplicationStatus(id: string, status: string, opts?: { approved_amount?: number; rejection_reason?: string; approved_by?: string }): Promise<void> {
    await api.patch<void>(`/api/v1/credits/applications/${id}/status`, { status, ...opts })
  },

  // Active Credits
  async getCredits(): Promise<Credit[]> {
    return api.get<Credit[]>("/api/v1/credits/active")
  },

  async getUserCredits(userId: string): Promise<Credit[]> {
    return api.get<Credit[]>(`/api/v1/credits/active${buildQuery({ userId })}`)
  },

  // Payments
  async getCreditPayments(creditId: string): Promise<CreditPayment[]> {
    return api.get<CreditPayment[]>(`/api/v1/credits/${creditId}/payments`)
  },

  // Collection
  async getCollectionActions(creditId?: string): Promise<CollectionAction[]> {
    return api.get<CollectionAction[]>(`/api/v1/credits/collection/actions${buildQuery({ creditId })}`)
  },

  async getCollectionStrategies(): Promise<CollectionStrategy[]> {
    return api.get<CollectionStrategy[]>("/api/v1/credits/collection/strategies")
  },

  // Portfolio stats for cobranza dashboard
  async getPortfolioStats(): Promise<{
    totalCartera: number
    carteraVencida: number
    carteraVigente: number
    moraPercent: number
    creditosActivos: number
    creditosVencidos: number
    mora30: number
    mora60: number
    mora90: number
    mora90plus: number
  }> {
    return api.get("/api/v1/credits/portfolio/stats")
  },
}
