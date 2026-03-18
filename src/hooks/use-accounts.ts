// ============================================================
// SAYO — Accounts & Mesa de Control Hooks
// ============================================================
// Wraps accountsService with useServiceData.
// Maps snake_case TransactionRecord → camelCase Transaction.
// Also exports client-facing hooks (movements, stats).
// ============================================================

"use client"

import { useServiceData } from "./use-service-data"
import { accountsService } from "@/lib/accounts-service"
import type {
  Transaction,
  StatCardData,
  ChartDataPoint,
  ActivityItem,
  ClientMovement,
  PortfolioClosing,
  ClientSubstitution,
} from "@/lib/types"

// --- Mapper ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTransaction(t: any): Transaction {
  return {
    id: t.id,
    claveRastreo: t.clave_rastreo ?? t.claveRastreo ?? "",
    type: t.type ?? t.transaction_type ?? "SPEI_IN",
    status: t.status,
    amount: t.amount,
    concept: t.concept ?? t.description ?? "",
    senderName: t.sender_name ?? t.senderName ?? "",
    senderBank: t.sender_bank ?? t.senderBank ?? "",
    senderClabe: t.sender_clabe ?? t.senderClabe ?? "",
    receiverName: t.receiver_name ?? t.receiverName ?? "",
    receiverBank: t.receiver_bank ?? t.receiverBank ?? "",
    receiverClabe: t.receiver_clabe ?? t.receiverClabe ?? "",
    date: t.initiated_at ?? t.date ?? t.created_at ?? "",
    hour: t.initiated_at
      ? new Date(t.initiated_at).toLocaleTimeString("es-MX", { hour12: false })
      : t.hour ?? "",
  }
}

// --- Hooks ---

export function useTransactions(filters?: { status?: string; type?: string }) {
  return useServiceData(
    async () => {
      const raw = await accountsService.getAllTransactions(filters)
      return raw.map(mapTransaction)
    },
    [filters?.status, filters?.type]
  )
}

export function useAccountTransactions(accountId: string) {
  return useServiceData(
    async () => {
      const raw = await accountsService.getTransactions(accountId)
      return raw.map(mapTransaction)
    },
    [accountId],
    { enabled: !!accountId }
  )
}

export function useUserTransactions(userId: string) {
  return useServiceData(
    async () => {
      const raw = await accountsService.getUserTransactions(userId)
      return raw.map(mapTransaction)
    },
    [userId],
    { enabled: !!userId }
  )
}

export function useAccounts(userId?: string) {
  return useServiceData(
    async () => {
      if (userId) return accountsService.getAccounts(userId)
      return accountsService.getAllAccounts()
    },
    [userId]
  )
}

export function useBeneficiaries(userId: string) {
  return useServiceData(
    () => accountsService.getBeneficiaries(userId),
    [userId],
    { enabled: !!userId }
  )
}

export function useBatches(filters?: { status?: string }) {
  return useServiceData(
    () => accountsService.getBatches(filters),
    [filters?.status]
  )
}

// --- Static Data: Mesa de Control ---

export const mesaControlStats: StatCardData[] = [
  { title: "Transacciones Hoy", value: 2847, change: 12.3, icon: "ArrowLeftRight", trend: "up" },
  { title: "Monto Procesado", value: 45_320_000, change: 8.1, icon: "DollarSign", trend: "up", format: "currency" },
  { title: "Pendientes", value: 23, change: -15.2, icon: "Clock", trend: "down" },
  { title: "Rechazadas", value: 7, change: -3.4, icon: "XCircle", trend: "down" },
]

export const transactionsTrend: ChartDataPoint[] = [
  { name: "Lun", value: 2340, spei_in: 1450, spei_out: 890 },
  { name: "Mar", value: 2780, spei_in: 1620, spei_out: 1160 },
  { name: "Mié", value: 2450, spei_in: 1380, spei_out: 1070 },
  { name: "Jue", value: 3100, spei_in: 1890, spei_out: 1210 },
  { name: "Vie", value: 2847, spei_in: 1700, spei_out: 1147 },
  { name: "Sáb", value: 1200, spei_in: 780, spei_out: 420 },
  { name: "Dom", value: 890, spei_in: 560, spei_out: 330 },
]

export const mesaControlActivity: ActivityItem[] = [
  { id: "A1", type: "transaction", title: "SPEI Entrante procesado", description: "$125,000 — Empresa ABC → Juan Pérez", timestamp: "2024-03-06T09:15:32", status: "success" },
  { id: "A2", type: "alert", title: "Transacción rechazada", description: "CLABE destino inválida — TXN-004", timestamp: "2024-03-06T10:02:45", status: "error" },
  { id: "A3", type: "system", title: "Dispersión nómina iniciada", description: "Lote #45 — 35 beneficiarios — $890,000", timestamp: "2024-03-06T10:15:00", status: "info" },
  { id: "A4", type: "transaction", title: "Conciliación automática", description: "142 transacciones conciliadas exitosamente", timestamp: "2024-03-06T08:00:00", status: "success" },
  { id: "A5", type: "alert", title: "Monto inusual detectado", description: "$2,350,000 — Distribuidora XYZ — Pendiente revisión", timestamp: "2024-03-06T09:45:00", status: "warning" },
]

// --- Static Data: Cliente ---

export const clienteStats: StatCardData[] = [
  { title: "Saldo Disponible", value: 47_250.80, icon: "Wallet", format: "currency", trend: "neutral" },
  { title: "Ingresos Mes", value: 35_000, change: 5.2, icon: "ArrowDownLeft", trend: "up", format: "currency" },
  { title: "Gastos Mes", value: 22_340, change: -3.1, icon: "ArrowUpRight", trend: "down", format: "currency" },
  { title: "Puntos SAYO", value: "1,250 pts", icon: "Star", trend: "up" },
]

export const clientMovements: ClientMovement[] = [
  { id: "MOV-001", type: "ingreso", concept: "Nómina quincenal", amount: 17500, balance: 47250.80, date: "2024-03-01T12:00:00", reference: "NOM-2024-005" },
  { id: "MOV-002", type: "egreso", concept: "Transferencia a Carlos", amount: 5000, balance: 42250.80, date: "2024-03-02T14:30:00", reference: "SPEI-OUT-001" },
  { id: "MOV-003", type: "egreso", concept: "Pago CFE", amount: 1200, balance: 41050.80, date: "2024-03-03T10:00:00", reference: "PAG-CFE-001" },
  { id: "MOV-004", type: "egreso", concept: "Amazon MX", amount: 2340, balance: 38710.80, date: "2024-03-04T16:45:00", reference: "TDC-AMZ-001" },
  { id: "MOV-005", type: "ingreso", concept: "Transferencia recibida", amount: 8500, balance: 47210.80, date: "2024-03-05T09:15:00", reference: "SPEI-IN-001" },
  { id: "MOV-006", type: "egreso", concept: "Uber", amount: 185, balance: 47025.80, date: "2024-03-06T08:30:00", reference: "TDC-UBR-001" },
  { id: "MOV-007", type: "egreso", concept: "Starbucks", amount: 125, balance: 46900.80, date: "2024-03-06T09:00:00", reference: "TDC-SBX-001" },
  { id: "MOV-008", type: "ingreso", concept: "Devolución", amount: 350, balance: 47250.80, date: "2024-03-06T10:00:00", reference: "DEV-001" },
]

export const monthlyTrend6M: ChartDataPoint[] = [
  { name: "Oct", value: 38200 },
  { name: "Nov", value: 41500 },
  { name: "Dic", value: 44800 },
  { name: "Ene", value: 43200 },
  { name: "Feb", value: 46100 },
  { name: "Mar", value: 48500 },
]

export const productDistribution: ChartDataPoint[] = [
  { name: "Cuenta SAYO", value: 28500 },
  { name: "Crédito Personal", value: 8200 },
  { name: "Crédito Nómina", value: 5400 },
  { name: "Crédito Empresarial", value: 2100 },
  { name: "Tarjeta", value: 4300 },
]

export const channelDistribution: ChartDataPoint[] = [
  { name: "Chat", value: 42 },
  { name: "Teléfono", value: 28 },
  { name: "Email", value: 18 },
  { name: "App", value: 8 },
  { name: "Sucursal", value: 4 },
]

// --- Static Data: Mesa de Control Expanded ---

export const portfolioClosings: PortfolioClosing[] = [
  { id: "CIE-001", date: "2025-03-08", type: "diario", vigente: 45200000, preventiva: 3200000, vencida: 8900000, castigada: 1200000, total: 58500000, status: "publicado", generatedBy: "Carlos Mendoza" },
  { id: "CIE-002", date: "2025-03-07", type: "diario", vigente: 44800000, preventiva: 3100000, vencida: 9100000, castigada: 1200000, total: 58200000, status: "publicado", generatedBy: "Carlos Mendoza" },
  { id: "CIE-003", date: "2025-02-28", type: "mensual", vigente: 43500000, preventiva: 2900000, vencida: 8500000, castigada: 1100000, total: 56000000, status: "publicado", generatedBy: "Carlos Mendoza" },
  { id: "CIE-004", date: "2025-01-31", type: "mensual", vigente: 41200000, preventiva: 2600000, vencida: 7800000, castigada: 1000000, total: 52600000, status: "publicado", generatedBy: "Carlos Mendoza" },
]

export const clientSubstitutions: ClientSubstitution[] = [
  { id: "SUB-001", folio: "SUST-2025-001", originalCreditId: "CRED-2024-005", originalClientName: "Pedro López Hernández", newClientName: "María González Ruiz", substitutionType: "saldo_capital", amount: 350000, date: "2025-03-01", status: "procesada", processedBy: "Carlos Mendoza" },
  { id: "SUB-002", folio: "SUST-2025-002", originalCreditId: "CRED-2024-009", originalClientName: "Comercializadora Norte", newClientName: "Distribuidora Centro SA", substitutionType: "credito_nuevo", amount: 1200000, date: "2025-03-05", status: "pendiente" },
]

export const portfolioTrend: ChartDataPoint[] = [
  { name: "Oct", value: 48000000, vigente: 38000000, vencida: 7200000, preventiva: 1800000, castigada: 1000000 },
  { name: "Nov", value: 50000000, vigente: 39500000, vencida: 7600000, preventiva: 1900000, castigada: 1000000 },
  { name: "Dic", value: 51500000, vigente: 40800000, vencida: 7800000, preventiva: 2000000, castigada: 900000 },
  { name: "Ene", value: 52600000, vigente: 41200000, vencida: 7800000, preventiva: 2600000, castigada: 1000000 },
  { name: "Feb", value: 56000000, vigente: 43500000, vencida: 8500000, preventiva: 2900000, castigada: 1100000 },
  { name: "Mar", value: 58500000, vigente: 45200000, vencida: 8900000, preventiva: 3200000, castigada: 1200000 },
]
