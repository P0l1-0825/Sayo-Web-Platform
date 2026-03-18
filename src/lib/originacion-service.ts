import { api, isDemoMode } from "./api-client"
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
// When isDemoMode is true, returns inline demo data without network calls.
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

// --- Demo Data ---

const demoOrigApplications: OriginacionApplication[] = [
  { id: "orig-001", folio: "SOL-2024-001", clientName: "Grupo Industrial MX", clientId: "cli-pm-001", clientType: "PM", product: "Crédito Cuenta Corriente", amount: 5000000, term: 36, rate: 16.5, status: "en_comite", assignedTo: "Ana García", createdAt: "2024-02-15", updatedAt: "2024-03-05", bureauScore: 720, validations: { identidad: true, domicilio: true, ingresos: true, buro: true, pld: true }, notes: "Empresa con 15 años de operación" },
  { id: "orig-002", folio: "SOL-2024-002", clientName: "Arturo Mendoza López", clientId: "cli-pf-001", clientType: "PFAE", product: "Crédito Simple", amount: 200000, term: 24, rate: 24.5, status: "por_aprobar", assignedTo: "María Fernández", createdAt: "2024-03-01", updatedAt: "2024-03-04", bureauScore: 680, validations: { identidad: true, domicilio: true, ingresos: true, buro: true, pld: false }, notes: undefined },
  { id: "orig-003", folio: "SOL-2024-003", clientName: "Logística Express SA", clientId: "cli-pm-002", clientType: "PM", product: "Línea de Crédito", amount: 3000000, term: 12, rate: 22.0, status: "por_disponer", assignedTo: "Carlos Vega", createdAt: "2024-02-20", updatedAt: "2024-03-06", bureauScore: 750, validations: { identidad: true, domicilio: true, ingresos: true, buro: true, pld: true }, notes: "Aprobado en comité 2024-03-01" },
  { id: "orig-004", folio: "SOL-2024-004", clientName: "Carmen Vega Solís", clientId: "cli-pf-002", clientType: "PFAE", product: "Crédito Nómina", amount: 80000, term: 18, rate: 18.0, status: "activa", assignedTo: "Roberto López", createdAt: "2024-01-10", updatedAt: "2024-02-01", bureauScore: 700 },
  { id: "orig-005", folio: "SOL-2024-005", clientName: "Tech Innovate SA", clientId: "cli-pm-003", clientType: "PM", product: "Crédito Empresarial", amount: 8000000, term: 48, rate: 15.0, status: "rechazada", assignedTo: "Ana García", createdAt: "2024-02-01", updatedAt: "2024-02-28", bureauScore: 580, notes: "Score de buró insuficiente para monto solicitado" },
  { id: "orig-006", folio: "SOL-2024-006", clientName: "Fernando Ríos", clientId: "cli-pf-003", clientType: "PFAE", product: "Crédito Personal", amount: 150000, term: 24, rate: 24.5, status: "capturada", assignedTo: "María Fernández", createdAt: "2024-03-06", updatedAt: "2024-03-06" },
]

const demoClientsPFAE: ClientPFAESummary[] = [
  { id: "cli-pf-001", firstName: "Arturo", lastName: "Mendoza López", rfc: "MELA850315XX1", curp: "MELA850315HDFRPN01", monthlyIncome: 45000, occupation: "Ingeniero", isPEP: false },
  { id: "cli-pf-002", firstName: "Carmen", lastName: "Vega Solís", rfc: "VESC900720XX2", curp: "VESC900720MDFGRL02", monthlyIncome: 35000, occupation: "Contadora", isPEP: false },
  { id: "cli-pf-003", firstName: "Fernando", lastName: "Ríos Domínguez", rfc: "RIDF780510XX3", curp: "RIDF780510HDFSMR03", monthlyIncome: 28000, occupation: "Comerciante", isPEP: false },
]

const demoClientsPM: ClientPMSummary[] = [
  { id: "cli-pm-001", legalName: "Grupo Industrial MX SA de CV", rfc: "GIM150420XX1", sector: "Manufactura", annualSales: 85000000, repLegalName: "Jorge Martínez Silva", isPEP: false },
  { id: "cli-pm-002", legalName: "Logística Express SA de CV", rfc: "LEX180601XX2", sector: "Transporte", annualSales: 42000000, repLegalName: "Patricia Guzmán", isPEP: false },
  { id: "cli-pm-003", legalName: "Tech Innovate SA de CV", rfc: "TIN200115XX3", sector: "Tecnología", annualSales: 12000000, repLegalName: "David Ochoa", isPEP: false },
]

const demoCreditLines: CreditLine[] = [
  { id: "cl-001", creditNumber: "LC-2024-001", clientName: "Logística Express SA", clientId: "cli-pm-002", product: "Línea de Crédito", limit: 3000000, available: 2200000, used: 800000, rate: 22.0, expirationDate: "2025-03-06", status: "activa", startDate: "2024-03-06" },
  { id: "cl-002", creditNumber: "LC-2023-015", clientName: "Grupo Industrial MX", clientId: "cli-pm-001", product: "Línea Revolvente", limit: 5000000, available: 3500000, used: 1500000, rate: 18.5, expirationDate: "2024-12-31", status: "activa", startDate: "2023-06-15" },
]

const demoCommitteeDecisions: CommitteeDecision[] = [
  { id: "cd-001", applicationId: "orig-003", clientName: "Logística Express SA", amount: 3000000, date: "2024-03-01", members: [{ name: "Director General", vote: "aprobar", comment: "Buen historial crediticio" }, { name: "Director de Riesgos", vote: "aprobar" }, { name: "Director Financiero", vote: "condicionar", comment: "Solicitar garantía hipotecaria" }], decision: "aprobada", conditions: "Garantía hipotecaria sobre inmueble industrial" },
  { id: "cd-002", applicationId: "orig-005", clientName: "Tech Innovate SA", amount: 8000000, date: "2024-02-28", members: [{ name: "Director General", vote: "rechazar", comment: "Empresa muy joven, alto riesgo" }, { name: "Director de Riesgos", vote: "rechazar" }, { name: "Director Financiero", vote: "rechazar" }], decision: "rechazada" },
]

const demoDispositions: Disposition[] = [
  { id: "disp-001", creditLineId: "cl-001", clientName: "Logística Express SA", amount: 500000, destinationAccount: "072180005678901234", date: "2024-03-05", folio: "DISP-2024-001", status: "dispersada", authorizedBy: "Ana García" },
  { id: "disp-002", creditLineId: "cl-002", clientName: "Grupo Industrial MX", amount: 1000000, destinationAccount: "012180001234567891", date: "2024-03-06", folio: "DISP-2024-002", status: "por_autorizar" },
]

// --- Helpers ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

// --- Service (API-backed with demo fallback) ---

export const originacionService = {
  // Applications
  async getApplications(): Promise<OriginacionApplication[]> {
    if (isDemoMode) return demoOrigApplications
    return api.get<OriginacionApplication[]>("/api/v1/origination/applications")
  },

  async getApplicationsByStatus(status: CreditApplicationStatus): Promise<OriginacionApplication[]> {
    if (isDemoMode) return demoOrigApplications.filter(a => a.status === status)
    return api.get<OriginacionApplication[]>(`/api/v1/origination/applications${buildQuery({ status })}`)
  },

  async getApplication(id: string): Promise<OriginacionApplication | null> {
    if (isDemoMode) return demoOrigApplications.find(a => a.id === id) ?? null
    return api.get<OriginacionApplication | null>(`/api/v1/origination/applications/${id}`)
  },

  async updateApplicationStatus(id: string, status: CreditApplicationStatus, notes?: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/origination/applications/${id}/status`, { status, notes })
  },

  // Clients
  async getClientsPFAE(): Promise<ClientPFAESummary[]> {
    if (isDemoMode) return demoClientsPFAE
    return api.get<ClientPFAESummary[]>("/api/v1/origination/clients/pfae")
  },

  async getClientsPM(): Promise<ClientPMSummary[]> {
    if (isDemoMode) return demoClientsPM
    return api.get<ClientPMSummary[]>("/api/v1/origination/clients/pm")
  },

  // Credit Lines
  async getCreditLines(): Promise<CreditLine[]> {
    if (isDemoMode) return demoCreditLines
    return api.get<CreditLine[]>("/api/v1/origination/credit-lines")
  },

  async getCreditLine(id: string): Promise<CreditLine | null> {
    if (isDemoMode) return demoCreditLines.find(l => l.id === id) ?? null
    return api.get<CreditLine | null>(`/api/v1/origination/credit-lines/${id}`)
  },

  // Committee
  async getCommitteeDecisions(): Promise<CommitteeDecision[]> {
    if (isDemoMode) return demoCommitteeDecisions
    return api.get<CommitteeDecision[]>("/api/v1/origination/committee-decisions")
  },

  // Dispositions
  async getDispositions(): Promise<Disposition[]> {
    if (isDemoMode) return demoDispositions
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
    if (isDemoMode) return { total: 6, capturadas: 1, porAprobar: 1, enComite: 1, porDisponer: 1, activas: 1, saldadas: 0, rechazadas: 1, canceladas: 0, montoPipeline: 16430000, montoAprobado: 3280000, tasaAprobacion: 66.7 }
    return api.get("/api/v1/origination/pipeline/stats")
  },
}
