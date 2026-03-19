// ============================================================
// SAYO Web — Bill Payments Service (TAPI)
// ============================================================
// API Gateway route: /api/v1/payments/*
// Synced from Flutter sayo_app — same backend, shared API.
// ============================================================

import { api, isDemoMode } from "./api-client"

// ── Types ──

export interface ServiceCatalogItem {
  id: string
  name: string
  category: string
  icon: string
  description: string
  requires: string[]
  min_amount: number
  max_amount: number
}

export interface DebtQuery {
  reference: string
  service_id: string
  company: string
  amount: number
  concept: string
  due_date: string
  status: string
}

export interface ServicePayment {
  id: string
  user_id: string
  service_id: string
  service_name: string
  reference: string
  amount: number
  commission: number
  total: number
  currency: string
  status: string
  confirmation_number: string
  paid_at: string
  created_at: string
}

// ── Demo Data ──

const demoCatalog: ServiceCatalogItem[] = [
  { id: "svc-001", name: "CFE", category: "electricidad", icon: "bolt", description: "Comision Federal de Electricidad", requires: ["numero_servicio"], min_amount: 50, max_amount: 50000 },
  { id: "svc-002", name: "Telmex", category: "telefonia", icon: "phone", description: "Telefonos de Mexico", requires: ["numero_telefono"], min_amount: 100, max_amount: 10000 },
  { id: "svc-003", name: "Telcel", category: "telefonia", icon: "smartphone", description: "Recargas y pagos Telcel", requires: ["numero_celular"], min_amount: 20, max_amount: 5000 },
  { id: "svc-004", name: "Naturgy", category: "gas", icon: "flame", description: "Gas Natural", requires: ["numero_cuenta"], min_amount: 50, max_amount: 20000 },
  { id: "svc-005", name: "SACMEX", category: "agua", icon: "droplet", description: "Sistema de Aguas CDMX", requires: ["numero_cuenta"], min_amount: 50, max_amount: 15000 },
  { id: "svc-006", name: "AT&T", category: "telefonia", icon: "wifi", description: "AT&T Mexico", requires: ["numero_cuenta"], min_amount: 50, max_amount: 8000 },
  { id: "svc-007", name: "Totalplay", category: "internet", icon: "globe", description: "Totalplay Internet y TV", requires: ["numero_cuenta"], min_amount: 200, max_amount: 5000 },
  { id: "svc-008", name: "Izzi", category: "internet", icon: "globe", description: "Izzi Telecom", requires: ["numero_cuenta"], min_amount: 200, max_amount: 5000 },
  { id: "svc-009", name: "Sky", category: "television", icon: "tv", description: "Sky Mexico TV Satelital", requires: ["numero_cuenta"], min_amount: 150, max_amount: 3000 },
  { id: "svc-010", name: "Dish", category: "television", icon: "tv", description: "Dish Mexico", requires: ["numero_cuenta"], min_amount: 150, max_amount: 3000 },
]

const demoPayments: ServicePayment[] = [
  { id: "pay-001", user_id: "demo-user", service_id: "svc-001", service_name: "CFE", reference: "801234567890", amount: 1245, commission: 0, total: 1245, currency: "MXN", status: "completed", confirmation_number: "CFE-2026031801", paid_at: "2026-03-15T10:30:00Z", created_at: "2026-03-15T10:30:00Z" },
  { id: "pay-002", user_id: "demo-user", service_id: "svc-002", service_name: "Telmex", reference: "5512345678", amount: 589, commission: 0, total: 589, currency: "MXN", status: "completed", confirmation_number: "TEL-2026031802", paid_at: "2026-03-10T14:20:00Z", created_at: "2026-03-10T14:20:00Z" },
  { id: "pay-003", user_id: "demo-user", service_id: "svc-003", service_name: "Telcel", reference: "5549876543", amount: 200, commission: 0, total: 200, currency: "MXN", status: "completed", confirmation_number: "TCL-2026031803", paid_at: "2026-03-08T09:45:00Z", created_at: "2026-03-08T09:45:00Z" },
  { id: "pay-004", user_id: "demo-user", service_id: "svc-004", service_name: "Naturgy", reference: "GAS-7654321", amount: 950, commission: 0, total: 950, currency: "MXN", status: "completed", confirmation_number: "NAT-2026030504", paid_at: "2026-03-05T16:00:00Z", created_at: "2026-03-05T16:00:00Z" },
  { id: "pay-005", user_id: "demo-user", service_id: "svc-005", service_name: "SACMEX", reference: "ACM-1234567", amount: 380, commission: 0, total: 380, currency: "MXN", status: "completed", confirmation_number: "SAC-2026030105", paid_at: "2026-03-01T11:15:00Z", created_at: "2026-03-01T11:15:00Z" },
]

// ── Service Functions ──

export async function getServiceCatalog(category?: string): Promise<ServiceCatalogItem[]> {
  if (isDemoMode) {
    if (category) return demoCatalog.filter((s) => s.category === category)
    return demoCatalog
  }
  try {
    const params = category ? `?category=${category}` : ""
    return await api.get<ServiceCatalogItem[]>(`/api/v1/payments/catalog${params}`)
  } catch {
    return category ? demoCatalog.filter((s) => s.category === category) : demoCatalog
  }
}

export async function queryDebt(serviceId: string, reference: string): Promise<DebtQuery> {
  if (isDemoMode) {
    const svc = demoCatalog.find((s) => s.id === serviceId)
    return {
      reference,
      service_id: serviceId,
      company: svc?.name ?? serviceId,
      amount: 847.50,
      concept: "Periodo Ene-Feb 2026",
      due_date: "2026-03-15",
      status: "pending",
    }
  }
  return api.post<DebtQuery>("/api/v1/payments/query", { service_id: serviceId, reference })
}

export async function createPayment(serviceId: string, reference: string, amount: number): Promise<ServicePayment> {
  if (isDemoMode) {
    return {
      id: `pay-${Date.now()}`,
      user_id: "demo-user",
      service_id: serviceId,
      service_name: demoCatalog.find((s) => s.id === serviceId)?.name ?? serviceId,
      reference,
      amount,
      commission: 0,
      total: amount,
      currency: "MXN",
      status: "completed",
      confirmation_number: `SAYO-${Date.now()}`,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
  }
  return api.post<ServicePayment>("/api/v1/payments/payments", { service_id: serviceId, reference, amount })
}

export async function getPaymentHistory(): Promise<ServicePayment[]> {
  if (isDemoMode) return demoPayments
  try {
    return await api.get<ServicePayment[]>("/api/v1/payments/payments/history")
  } catch {
    return demoPayments
  }
}

export async function getPaymentReceipt(paymentId: string): Promise<ServicePayment & { receipt_url: string }> {
  if (isDemoMode) {
    const payment = demoPayments.find((p) => p.id === paymentId) ?? demoPayments[0]
    return {
      ...payment,
      receipt_url: `https://recibos.sayo.mx/${payment.confirmation_number}.pdf`,
    }
  }
  return api.get(`/api/v1/payments/payments/${paymentId}/receipt`)
}

// ── Category helpers (same as Flutter) ──

export const serviceCategories = [
  { id: "electricidad", name: "Electricidad", icon: "Zap", color: "text-yellow-600 bg-yellow-100" },
  { id: "agua", name: "Agua", icon: "Droplets", color: "text-blue-600 bg-blue-100" },
  { id: "gas", name: "Gas", icon: "Flame", color: "text-red-600 bg-red-100" },
  { id: "telefonia", name: "Telefonia", icon: "Phone", color: "text-purple-600 bg-purple-100" },
  { id: "internet", name: "Internet / TV", icon: "Wifi", color: "text-cyan-600 bg-cyan-100" },
  { id: "recargas", name: "Recargas", icon: "Smartphone", color: "text-green-600 bg-green-100" },
  { id: "sat", name: "SAT", icon: "Landmark", color: "text-indigo-600 bg-indigo-100" },
  { id: "otros", name: "Otros", icon: "MoreHorizontal", color: "text-gray-600 bg-gray-100" },
] as const
