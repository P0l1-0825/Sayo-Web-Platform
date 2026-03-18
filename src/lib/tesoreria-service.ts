import { api } from "./api-client"
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
// Demo mode is handled server-side.
// ============================================================

// --- Helpers ---

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
}

// --- Service (API-backed) ---

export const tesoreriaService = {
  // Payments
  async getPayments(filters?: { type?: TreasuryPaymentType; status?: TreasuryPaymentStatus; dateFrom?: string; dateTo?: string }): Promise<TreasuryPayment[]> {
    return api.get<TreasuryPayment[]>(`/api/v1/treasury/payments${buildQuery({
      type: filters?.type,
      status: filters?.status,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    })}`)
  },

  async getPayment(id: string): Promise<TreasuryPayment | null> {
    return api.get<TreasuryPayment | null>(`/api/v1/treasury/payments/${id}`)
  },

  async createPayment(payment: Omit<TreasuryPayment, "id" | "folio">): Promise<TreasuryPayment> {
    return api.post<TreasuryPayment>("/api/v1/treasury/payments", payment)
  },

  async updatePaymentStatus(id: string, status: TreasuryPaymentStatus, authorizedBy?: string): Promise<void> {
    await api.patch<void>(`/api/v1/treasury/payments/${id}/status`, { status, authorizedBy })
  },

  // Batches
  async getBatches(): Promise<PaymentBatch[]> {
    return api.get<PaymentBatch[]>("/api/v1/treasury/batches")
  },

  async getBatch(id: string): Promise<PaymentBatch | null> {
    return api.get<PaymentBatch | null>(`/api/v1/treasury/batches/${id}`)
  },

  // Authorizations
  async getAuthorizations(status?: "pendiente" | "autorizado" | "rechazado"): Promise<PaymentAuthorization[]> {
    return api.get<PaymentAuthorization[]>(`/api/v1/treasury/authorizations${buildQuery({ status })}`)
  },

  async authorizePayment(id: string, authorizedBy: string): Promise<void> {
    await api.post<void>(`/api/v1/treasury/authorizations/${id}/authorize`, { authorizedBy })
  },

  async rejectPayment(id: string, reason: string): Promise<void> {
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
    return api.get("/api/v1/treasury/dashboard-stats")
  },

  // Distribution by type for donut chart
  async getPaymentDistribution(): Promise<Array<{ name: string; value: number }>> {
    return api.get("/api/v1/treasury/payment-distribution")
  },
}
