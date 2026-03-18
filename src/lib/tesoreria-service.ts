import { api, isDemoMode } from "./api-client"
import type {
  TreasuryPayment,
  TreasuryPaymentType,
  TreasuryPaymentStatus,
  PaymentBatch,
  PaymentAuthorization,
} from "./types"

// ============================================================
// SAYO — Treasury Service
// Now calls backend API (sayo-platform) instead of Supabase directly.
// When isDemoMode is true, returns inline demo data without network calls.
// ============================================================

// --- Demo Data ---

const demoPayments: TreasuryPayment[] = [
  { id: "tp-001", folio: "PAG-2024-001", type: "individual", beneficiaryName: "Proveedor ABC", beneficiaryBank: "BBVA", beneficiaryClabe: "012180001234567891", amount: 150000, concept: "Pago factura F-2024-001", reference: "REF001", sourceAccount: "646180009999888877", status: "completado", requestedBy: "Carlos Mendoza", authorizedBy: "Ana García", date: "2024-03-06", processedAt: "2024-03-06T10:30:00", speiTracking: "SAYO2024030601" },
  { id: "tp-002", folio: "PAG-2024-002", type: "empresa", beneficiaryName: "CFE Distribución", beneficiaryBank: "Banamex", beneficiaryClabe: "002180007890123456", amount: 85000, concept: "Pago luz oficinas", reference: "REF002", sourceAccount: "646180009999888877", status: "pendiente", requestedBy: "Roberto López", date: "2024-03-06" },
  { id: "tp-003", folio: "PAG-2024-003", type: "dispersion", beneficiaryName: "Nómina Marzo 1Q", beneficiaryBank: "Varios", beneficiaryClabe: "N/A", amount: 890000, concept: "Dispersión nómina primera quincena", reference: "NOM-MAR-1Q", sourceAccount: "646180009999888877", status: "procesado", requestedBy: "RRHH", authorizedBy: "Director Financiero", date: "2024-03-06", processedAt: "2024-03-06T14:00:00" },
  { id: "tp-004", folio: "PAG-2024-004", type: "spei_out", beneficiaryName: "Logística Express", beneficiaryBank: "Banorte", beneficiaryClabe: "072180005678901234", amount: 500000, concept: "Disposición línea crédito", reference: "DISP-001", sourceAccount: "646180009999888877", status: "autorizado", requestedBy: "Ana García", authorizedBy: "Director General", date: "2024-03-06" },
  { id: "tp-005", folio: "PAG-2024-005", type: "referenciado", beneficiaryName: "SAT", beneficiaryBank: "Banxico", beneficiaryClabe: "002180000000000001", amount: 320000, concept: "Pago ISR mensual", reference: "SAT-ISR-FEB", sourceAccount: "646180009999888877", status: "rechazado", requestedBy: "Contabilidad", date: "2024-03-05" },
]

const demoBatches: PaymentBatch[] = [
  { id: "pb-001", name: "Nómina Marzo 1Q", type: "nomina", totalRecords: 35, totalAmount: 890000, successCount: 33, errorCount: 2, status: "completado", uploadedBy: "RRHH", createdBy: "RRHH", date: "2024-03-06", processedAt: "2024-03-06T14:05:00" },
  { id: "pb-002", name: "Proveedores Febrero", type: "proveedores", totalRecords: 12, totalAmount: 1250000, successCount: 12, errorCount: 0, status: "completado", uploadedBy: "Contabilidad", createdBy: "Contabilidad", date: "2024-02-28", processedAt: "2024-02-28T16:00:00" },
  { id: "pb-003", name: "Dispersiones Crédito", type: "dispersiones", totalRecords: 5, totalAmount: 3200000, successCount: 0, errorCount: 0, status: "pendiente", uploadedBy: "Originación", createdBy: "Originación", date: "2024-03-06" },
]

const demoAuthorizations: PaymentAuthorization[] = [
  { id: "pa-001", paymentId: "tp-002", paymentFolio: "PAG-2024-002", beneficiaryName: "CFE Distribución", amount: 85000, requestedBy: "Roberto López", requiredLevel: "L3", status: "pendiente", date: "2024-03-06" },
  { id: "pa-002", paymentId: "tp-004", paymentFolio: "PAG-2024-004", beneficiaryName: "Logística Express", amount: 500000, requestedBy: "Ana García", requiredLevel: "L4", status: "autorizado", authorizedBy: "Director General", date: "2024-03-06" },
  { id: "pa-003", paymentId: "tp-005", paymentFolio: "PAG-2024-005", beneficiaryName: "SAT", amount: 320000, requestedBy: "Contabilidad", requiredLevel: "L3", status: "rechazado", rejectionReason: "Línea de captura vencida", date: "2024-03-05" },
]

// --- Helpers ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

// --- Service (API-backed with demo fallback) ---

export const tesoreriaService = {
  // Payments
  async getPayments(filters?: { type?: TreasuryPaymentType; status?: TreasuryPaymentStatus; dateFrom?: string; dateTo?: string }): Promise<TreasuryPayment[]> {
    if (isDemoMode) {
      let result = demoPayments
      if (filters?.type) result = result.filter(p => p.type === filters.type)
      if (filters?.status) result = result.filter(p => p.status === filters.status)
      return result
    }
    return api.get<TreasuryPayment[]>(`/api/v1/treasury/payments${buildQuery({
      type: filters?.type,
      status: filters?.status,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    })}`)
  },

  async getPayment(id: string): Promise<TreasuryPayment | null> {
    if (isDemoMode) return demoPayments.find(p => p.id === id) ?? null
    return api.get<TreasuryPayment | null>(`/api/v1/treasury/payments/${id}`)
  },

  async createPayment(payment: Omit<TreasuryPayment, "id" | "folio">): Promise<TreasuryPayment> {
    if (isDemoMode) return { ...payment, id: `tp-${Date.now()}`, folio: `PAG-${Date.now()}` } as TreasuryPayment
    return api.post<TreasuryPayment>("/api/v1/treasury/payments", payment)
  },

  async updatePaymentStatus(id: string, status: TreasuryPaymentStatus, authorizedBy?: string): Promise<void> {
    if (isDemoMode) return
    await api.patch<void>(`/api/v1/treasury/payments/${id}/status`, { status, authorizedBy })
  },

  // Batches
  async getBatches(): Promise<PaymentBatch[]> {
    if (isDemoMode) return demoBatches
    return api.get<PaymentBatch[]>("/api/v1/treasury/batches")
  },

  async getBatch(id: string): Promise<PaymentBatch | null> {
    if (isDemoMode) return demoBatches.find(b => b.id === id) ?? null
    return api.get<PaymentBatch | null>(`/api/v1/treasury/batches/${id}`)
  },

  // Authorizations
  async getAuthorizations(status?: "pendiente" | "autorizado" | "rechazado"): Promise<PaymentAuthorization[]> {
    if (isDemoMode) return status ? demoAuthorizations.filter(a => a.status === status) : demoAuthorizations
    return api.get<PaymentAuthorization[]>(`/api/v1/treasury/authorizations${buildQuery({ status })}`)
  },

  async authorizePayment(id: string, authorizedBy: string): Promise<void> {
    if (isDemoMode) return
    await api.post<void>(`/api/v1/treasury/authorizations/${id}/authorize`, { authorizedBy })
  },

  async rejectPayment(id: string, reason: string): Promise<void> {
    if (isDemoMode) return
    await api.post<void>(`/api/v1/treasury/authorizations/${id}/reject`, { reason })
  },

  // Dashboard stats
  async getDashboardStats(): Promise<{
    pagosHoy: number
    montoHoy: number
    totalDispersado: number
    pendientesAutorizacion: number
    montoPendiente: number
    rechazados: number
    lotesPendientes: number
    ingresos7d: number
    egresos7d: number
  }> {
    if (isDemoMode) return { pagosHoy: 15, montoHoy: 1945000, totalDispersado: 890000, pendientesAutorizacion: 2, montoPendiente: 585000, rechazados: 1, lotesPendientes: 1, ingresos7d: 12500000, egresos7d: 8700000 }
    return api.get("/api/v1/treasury/dashboard-stats")
  },

  // Distribution by type for donut chart
  async getPaymentDistribution(): Promise<Array<{ name: string; value: number }>> {
    if (isDemoMode) return [
      { name: "Individual", value: 150000 },
      { name: "Empresa", value: 85000 },
      { name: "Dispersión", value: 890000 },
      { name: "SPEI", value: 500000 },
      { name: "Referenciado", value: 320000 },
    ]
    return api.get("/api/v1/treasury/payment-distribution")
  },
}
