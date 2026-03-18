import { api, isDemoMode } from "./api-client"

// ============================================================
// SAYO — Credits, Payments & Collections Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// When isDemoMode is true, returns inline demo data without network calls.
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

// --- Demo Data ---

const demoProducts: CreditProduct[] = [
  { id: "prod-001", name: "Crédito Personal", description: "Crédito personal con tasa competitiva", min_amount: 10000, max_amount: 500000, min_term: 6, max_term: 48, annual_rate: 24.5, monthly_rate: 2.04, cat: 32.1, commission_rate: 2.0, requirements: ["INE", "Comprobante de domicilio", "Estados de cuenta"], is_active: true },
  { id: "prod-002", name: "Crédito Nómina", description: "Crédito con descuento directo de nómina", min_amount: 5000, max_amount: 300000, min_term: 6, max_term: 36, annual_rate: 18.0, monthly_rate: 1.50, cat: 22.8, commission_rate: 1.5, requirements: ["INE", "Recibo de nómina"], is_active: true },
  { id: "prod-003", name: "Crédito Empresarial", description: "Financiamiento para empresas", min_amount: 100000, max_amount: 10000000, min_term: 12, max_term: 60, annual_rate: 16.5, monthly_rate: 1.375, cat: 20.5, commission_rate: 1.0, requirements: ["Acta constitutiva", "Estados financieros", "RFC"], is_active: true },
  { id: "prod-004", name: "Línea de Crédito", description: "Línea revolvente para capital de trabajo", min_amount: 50000, max_amount: 5000000, min_term: 12, max_term: 36, annual_rate: 22.0, monthly_rate: 1.83, cat: 28.4, commission_rate: 1.5, requirements: ["Acta constitutiva", "Balances"], is_active: true },
]

const demoApplications: CreditApplication[] = [
  { id: "app-001", user_id: "demo-user", product_id: "prod-001", product_name: "Crédito Personal", requested_amount: 150000, approved_amount: 150000, term_months: 24, monthly_rate: 2.04, cat: 32.1, status: "dispersada", rejection_reason: null, approved_by: "Ana García", approved_at: "2024-01-15", created_at: "2024-01-10" },
  { id: "app-002", user_id: "demo-user", product_id: "prod-003", product_name: "Crédito Empresarial", requested_amount: 2000000, approved_amount: null, term_months: 36, monthly_rate: 1.375, cat: 20.5, status: "en_revision", rejection_reason: null, approved_by: null, approved_at: null, created_at: "2024-03-01" },
  { id: "app-003", user_id: "user-002", product_id: "prod-002", product_name: "Crédito Nómina", requested_amount: 80000, approved_amount: 80000, term_months: 18, monthly_rate: 1.50, cat: 22.8, status: "aprobada", rejection_reason: null, approved_by: "Carlos Mendoza", approved_at: "2024-02-20", created_at: "2024-02-15" },
  { id: "app-004", user_id: "user-003", product_id: "prod-001", product_name: "Crédito Personal", requested_amount: 500000, approved_amount: null, term_months: 48, monthly_rate: 2.04, cat: 32.1, status: "rechazada", rejection_reason: "Score de buró insuficiente", approved_by: null, approved_at: null, created_at: "2024-02-28" },
]

const demoCredits: Credit[] = [
  { id: "crd-001", user_id: "demo-user", application_id: "app-001", product_id: "prod-001", product_name: "Crédito Personal", original_amount: 150000, current_balance: 98000, monthly_payment: 8250, term_months: 24, remaining_months: 16, annual_rate: 24.5, monthly_rate: 2.04, cat: 32.1, status: "vigente", days_past_due: 0, mora_category: "al_corriente", next_payment_date: "2024-03-15", last_payment_date: "2024-02-15", disbursed_at: "2024-01-16", created_at: "2024-01-16" },
  { id: "crd-002", user_id: "user-002", application_id: "app-003", product_id: "prod-002", product_name: "Crédito Nómina", original_amount: 80000, current_balance: 45000, monthly_payment: 5200, term_months: 18, remaining_months: 10, annual_rate: 18.0, monthly_rate: 1.50, cat: 22.8, status: "vencido", days_past_due: 45, mora_category: "31-60", next_payment_date: "2024-02-20", last_payment_date: "2024-01-20", disbursed_at: "2023-08-21", created_at: "2023-08-21" },
  { id: "crd-003", user_id: "user-003", application_id: "app-005", product_id: "prod-003", product_name: "Crédito Empresarial", original_amount: 2000000, current_balance: 1500000, monthly_payment: 72000, term_months: 36, remaining_months: 28, annual_rate: 16.5, monthly_rate: 1.375, cat: 20.5, status: "vencido", days_past_due: 95, mora_category: "90+", next_payment_date: "2023-12-01", last_payment_date: "2023-11-01", disbursed_at: "2023-04-01", created_at: "2023-04-01" },
  { id: "crd-004", user_id: "user-004", application_id: "app-006", product_id: "prod-004", product_name: "Línea de Crédito", original_amount: 500000, current_balance: 320000, monthly_payment: 22000, term_months: 36, remaining_months: 24, annual_rate: 22.0, monthly_rate: 1.83, cat: 28.4, status: "vencido", days_past_due: 72, mora_category: "61-90", next_payment_date: "2024-01-05", last_payment_date: "2023-12-05", disbursed_at: "2023-01-05", created_at: "2023-01-05" },
]

const demoPayments: CreditPayment[] = [
  { id: "pay-001", credit_id: "crd-001", payment_number: 1, amount: 8250, principal: 5100, interest: 3060, iva_interest: 489.60, mora_interest: 0, total_paid: 8649.60, due_date: "2024-02-15", paid_date: "2024-02-15", status: "pagado" },
  { id: "pay-002", credit_id: "crd-001", payment_number: 2, amount: 8250, principal: 5204, interest: 2956, iva_interest: 472.96, mora_interest: 0, total_paid: 8632.96, due_date: "2024-03-15", paid_date: null, status: "pendiente" },
  { id: "pay-003", credit_id: "crd-002", payment_number: 8, amount: 5200, principal: 3500, interest: 1350, iva_interest: 216, mora_interest: 450, total_paid: 5516, due_date: "2024-01-20", paid_date: "2024-01-20", status: "pagado" },
  { id: "pay-004", credit_id: "crd-002", payment_number: 9, amount: 5200, principal: 3570, interest: 1280, iva_interest: 204.80, mora_interest: 0, total_paid: 5054.80, due_date: "2024-02-20", paid_date: null, status: "vencido" },
]

const demoCollectionActions: CollectionAction[] = [
  { id: "col-001", credit_id: "crd-002", action_type: "llamada", result: "promesa_pago", agent_id: "agent-001", agent_name: "Roberto López", notes: "Cliente promete pagar $15,000 el viernes 8/mar", promise_date: "2024-03-08", promise_amount: 15000, created_at: "2024-03-05" },
  { id: "col-002", credit_id: "crd-003", action_type: "email", result: "no_contesta", agent_id: "agent-001", agent_name: "Roberto López", notes: "Correo enviado, sin respuesta", promise_date: null, promise_amount: null, created_at: "2024-03-04" },
  { id: "col-003", credit_id: "crd-002", action_type: "sms", result: "contactado", agent_id: "agent-002", agent_name: "Mariana Cruz", notes: "SMS recordatorio enviado, cliente confirmó lectura", promise_date: null, promise_amount: null, created_at: "2024-03-06" },
  { id: "col-004", credit_id: "crd-003", action_type: "legal", result: "contactado", agent_id: "agent-003", agent_name: "Legal SAYO", notes: "Carta de requerimiento enviada vía notario", promise_date: null, promise_amount: null, created_at: "2024-03-03" },
]

const demoStrategies: CollectionStrategy[] = [
  { id: "str-001", name: "Cobranza Preventiva", mora_category: "0-30", description: "Recordatorios amigables antes y después del vencimiento", actions: ["sms", "email", "llamada"], priority: 1, is_active: true },
  { id: "str-002", name: "Cobranza Administrativa", mora_category: "31-60", description: "Gestión activa con llamadas y visitas", actions: ["llamada", "email", "visita"], priority: 2, is_active: true },
  { id: "str-003", name: "Cobranza Intensiva", mora_category: "61-90", description: "Negociación de reestructura o pago", actions: ["llamada", "visita", "carta"], priority: 3, is_active: true },
  { id: "str-004", name: "Cobranza Legal", mora_category: "90+", description: "Proceso legal y recuperación judicial", actions: ["carta", "legal"], priority: 4, is_active: true },
]

const demoPortfolioStats = {
  totalCartera: 185000000,
  carteraVencida: 12450000,
  carteraVigente: 172550000,
  moraPercent: 6.7,
  creditosActivos: 1240,
  creditosVencidos: 86,
  mora30: 4200000,
  mora60: 3100000,
  mora90: 2050000,
  mora90plus: 3100000,
}

// --- Service (API-backed with demo fallback) ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

export const creditsService = {
  // Products
  async getProducts(): Promise<CreditProduct[]> {
    if (isDemoMode) return demoProducts
    return api.get<CreditProduct[]>("/api/v1/credits/products")
  },

  async getProduct(id: string): Promise<CreditProduct | null> {
    if (isDemoMode) return demoProducts.find(p => p.id === id) ?? null
    return api.get<CreditProduct | null>(`/api/v1/credits/products/${id}`)
  },

  // Applications
  async getApplications(): Promise<CreditApplication[]> {
    if (isDemoMode) return demoApplications
    return api.get<CreditApplication[]>("/api/v1/credits/applications")
  },

  async getUserApplications(userId: string): Promise<CreditApplication[]> {
    if (isDemoMode) return demoApplications.filter(a => a.user_id === userId || userId === "demo-user")
    return api.get<CreditApplication[]>(`/api/v1/credits/applications${buildQuery({ userId })}`)
  },

  async updateApplicationStatus(id: string, status: string, opts?: { approved_amount?: number; rejection_reason?: string; approved_by?: string }): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/credits/applications/${id}/status`, { status, ...opts })
  },

  // Active Credits
  async getCredits(): Promise<Credit[]> {
    if (isDemoMode) return demoCredits
    return api.get<Credit[]>("/api/v1/credits/active")
  },

  async getUserCredits(userId: string): Promise<Credit[]> {
    if (isDemoMode) return demoCredits.filter(c => c.user_id === userId || userId === "demo-user")
    return api.get<Credit[]>(`/api/v1/credits/active${buildQuery({ userId })}`)
  },

  // Payments
  async getCreditPayments(creditId: string): Promise<CreditPayment[]> {
    if (isDemoMode) return demoPayments.filter(p => p.credit_id === creditId)
    return api.get<CreditPayment[]>(`/api/v1/credits/${creditId}/payments`)
  },

  // Collection
  async getCollectionActions(creditId?: string): Promise<CollectionAction[]> {
    if (isDemoMode) return creditId ? demoCollectionActions.filter(a => a.credit_id === creditId) : demoCollectionActions
    return api.get<CollectionAction[]>(`/api/v1/credits/collection/actions${buildQuery({ creditId })}`)
  },

  async getCollectionStrategies(): Promise<CollectionStrategy[]> {
    if (isDemoMode) return demoStrategies
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
    if (isDemoMode) return demoPortfolioStats
    return api.get("/api/v1/credits/portfolio/stats")
  },
}
