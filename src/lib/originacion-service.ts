import { api } from "./api-client"
import type {
  CreditApplicationStatus,
  ClientType,
  CreditLine,
  CommitteeDecision,
  Disposition,
  AmortizationRow,
} from "./types"

// ============================================================
// SAYO — Credit Origination Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// Demo mode is handled server-side.
// ============================================================

export interface OriginacionApplication {
  id: string
  folio: string
  clientName: string
  clientId: string
  clientType: ClientType
  product: string
  amount: number
  term: number
  rate: number
  status: CreditApplicationStatus
  assignedTo: string
  createdAt: string
  updatedAt: string
  bureauScore?: number
  validations?: Record<string, boolean>
  notes?: string
}

export interface OriginacionSimulation {
  id: string
  product: string
  amount: number
  rate: number
  term: number
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  cat: number
  amortization: AmortizationRow[]
  createdAt: string
}

export interface ClientPFAESummary {
  id: string
  firstName: string
  lastName: string
  rfc: string
  curp: string
  monthlyIncome: number
  occupation: string
  isPEP: boolean
}

export interface ClientPMSummary {
  id: string
  legalName: string
  rfc: string
  sector: string
  annualSales: number
  repLegalName: string
  isPEP: boolean
}

// --- Amortization Generator ---

export function generateAmortization(amount: number, annualRate: number, termMonths: number): AmortizationRow[] {
  const monthlyRate = annualRate / 100 / 12
  const ivaRate = 0.16
  const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)

  const rows: AmortizationRow[] = []
  let balance = amount

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate
    const iva = interest * ivaRate
    const capital = monthlyPayment - interest
    const totalPayment = capital + interest + iva
    const finalBalance = Math.max(0, balance - capital)

    rows.push({
      period: i,
      initialBalance: Math.round(balance * 100) / 100,
      capital: Math.round(capital * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      finalBalance: Math.round(finalBalance * 100) / 100,
    })

    balance = finalBalance
  }

  return rows
}

// --- Helpers ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

// --- Service (API-backed) ---

export const originacionService = {
  // Applications
  async getApplications(): Promise<OriginacionApplication[]> {
    return api.get<OriginacionApplication[]>("/api/v1/origination/applications")
  },

  async getApplicationsByStatus(status: CreditApplicationStatus): Promise<OriginacionApplication[]> {
    return api.get<OriginacionApplication[]>(`/api/v1/origination/applications${buildQuery({ status })}`)
  },

  async getApplication(id: string): Promise<OriginacionApplication | null> {
    return api.get<OriginacionApplication | null>(`/api/v1/origination/applications/${id}`)
  },

  async updateApplicationStatus(id: string, status: CreditApplicationStatus, notes?: string): Promise<void> {
    await api.patch<void>(`/api/v1/origination/applications/${id}/status`, { status, notes })
  },

  // Clients
  async getClientsPFAE(): Promise<ClientPFAESummary[]> {
    return api.get<ClientPFAESummary[]>("/api/v1/origination/clients/pfae")
  },

  async getClientsPM(): Promise<ClientPMSummary[]> {
    return api.get<ClientPMSummary[]>("/api/v1/origination/clients/pm")
  },

  // Credit Lines
  async getCreditLines(): Promise<CreditLine[]> {
    return api.get<CreditLine[]>("/api/v1/origination/credit-lines")
  },

  async getCreditLine(id: string): Promise<CreditLine | null> {
    return api.get<CreditLine | null>(`/api/v1/origination/credit-lines/${id}`)
  },

  // Committee
  async getCommitteeDecisions(): Promise<CommitteeDecision[]> {
    return api.get<CommitteeDecision[]>("/api/v1/origination/committee-decisions")
  },

  // Dispositions
  async getDispositions(): Promise<Disposition[]> {
    return api.get<Disposition[]>("/api/v1/origination/dispositions")
  },

  // Simulation (runs client-side, no API call needed)
  simulate(amount: number, annualRate: number, termMonths: number): OriginacionSimulation {
    const amortization = generateAmortization(amount, annualRate, termMonths)
    const totalInterest = amortization.reduce((s, r) => s + r.interest, 0)
    const totalPayment = amortization.reduce((s, r) => s + r.totalPayment, 0)
    const monthlyPayment = amortization[0]?.totalPayment ?? 0
    const cat = annualRate * 1.35 // Simplified CAT approximation

    return {
      id: `sim-${Date.now()}`,
      product: "Crédito Cuenta Corriente",
      amount,
      rate: annualRate,
      term: termMonths,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      cat: Math.round(cat * 10) / 10,
      amortization,
      createdAt: new Date().toISOString(),
    }
  },

  // Pipeline stats
  async getPipelineStats(): Promise<{
    total: number
    capturadas: number
    porAprobar: number
    enComite: number
    porDisponer: number
    activas: number
    saldadas: number
    rechazadas: number
    canceladas: number
    montoPipeline: number
    montoAprobado: number
    tasaAprobacion: number
  }> {
    return api.get("/api/v1/origination/pipeline/stats")
  },
}
