"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { formatMoney, formatDateTime, getStatusColor } from "@/lib/utils"
import api, { ApiError, isDemoMode } from "@/lib/api-client"
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Layers,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Loader2,
  History,
  Plus,
  Minus,
  Check,
} from "lucide-react"
import { toast } from "sonner"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AccountOverview {
  id: string
  account_number: string
  clabe: string
  alias: string | null
  account_type: string
  status: string
  balance: number
  available_balance: number
  hold_amount: number
  credit_limit: number | null
  user_name: string | null
  user_email: string | null
  opened_at: string
  last_transaction_at: string | null
}

interface BalanceStats {
  total_balance: number
  total_available: number
  total_held: number
  daily_volume_in: number
  daily_volume_out: number
  daily_net: number
  active_accounts: number
  total_accounts: number
}

interface AccountMovement {
  id: string
  account_id: string
  type: string
  direction: "IN" | "OUT"
  amount: number
  balance_after: number | null
  concepto: string | null
  reference: string | null
  status: string
  initiated_at: string
  completed_at: string | null
}

interface AdjustmentPayload {
  amount: number
  direction: "credit" | "debit"
  reason: string
  operator_notes?: string
}

interface TransferPayload {
  source_account_id: string
  destination_account_id: string
  amount: number
  reason: string
}

interface BatchDispersionItem {
  account_id: string
  amount: number
  concept: string
}

interface BatchDispersionPayload {
  items: BatchDispersionItem[]
  description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo fallback data (used when NEXT_PUBLIC_API_URL is not set)
// ─────────────────────────────────────────────────────────────────────────────

const demoAccounts: AccountOverview[] = [
  { id: "acc-001", account_number: "0001234567", clabe: "646180001234567890", alias: "Cuenta Principal", account_type: "debito", status: "active", balance: 47250.80, available_balance: 45000, hold_amount: 2250.80, credit_limit: null, user_name: "Juan Pérez García", user_email: "juan@email.com", opened_at: "2023-06-15", last_transaction_at: "2024-03-06T11:00:00" },
  { id: "acc-002", account_number: "0009876543", clabe: "646180009876543210", alias: "Nómina", account_type: "nomina", status: "active", balance: 35000, available_balance: 35000, hold_amount: 0, credit_limit: null, user_name: "María López", user_email: "maria@email.com", opened_at: "2023-07-01", last_transaction_at: "2024-03-06T10:30:00" },
  { id: "acc-003", account_number: "0005555666", clabe: "646180005555666677", alias: "Crédito SAYO", account_type: "credito", status: "active", balance: -12500, available_balance: 87500, hold_amount: 0, credit_limit: 100000, user_name: "Roberto Díaz", user_email: "roberto@email.com", opened_at: "2023-09-01", last_transaction_at: "2024-03-05T15:00:00" },
  { id: "acc-004", account_number: "0003333444", clabe: "646180003333444455", alias: "Ahorro Meta", account_type: "ahorro", status: "active", balance: 150000, available_balance: 150000, hold_amount: 0, credit_limit: null, user_name: "Ana Torres", user_email: "ana@email.com", opened_at: "2023-10-15", last_transaction_at: "2024-03-04T09:00:00" },
  { id: "acc-005", account_number: "0007777888", clabe: "646180007777888899", alias: "Inversión", account_type: "inversiones", status: "active", balance: 500000, available_balance: 500000, hold_amount: 0, credit_limit: null, user_name: "Carlos Martínez", user_email: "carlos@email.com", opened_at: "2024-01-10", last_transaction_at: "2024-03-03T14:00:00" },
  { id: "acc-006", account_number: "0001111222", clabe: "646180001111222233", alias: null, account_type: "debito", status: "blocked", balance: 8500, available_balance: 0, hold_amount: 8500, credit_limit: null, user_name: "Luis Hernández", user_email: "luis@email.com", opened_at: "2023-05-20", last_transaction_at: "2024-02-15T10:00:00" },
]

const demoStats: BalanceStats = {
  total_balance: demoAccounts.reduce((s, a) => s + a.balance, 0),
  total_available: demoAccounts.reduce((s, a) => s + a.available_balance, 0),
  total_held: demoAccounts.reduce((s, a) => s + a.hold_amount, 0),
  daily_volume_in: 2450000,
  daily_volume_out: 1890000,
  daily_net: 560000,
  active_accounts: demoAccounts.filter((a) => a.status === "active").length,
  total_accounts: demoAccounts.length,
}

const demoMovements: AccountMovement[] = [
  { id: "mov-001", account_id: "acc-001", type: "SPEI_IN", direction: "IN", amount: 125000, balance_after: 172250.80, concepto: "Pago nómina", reference: "SAYO202403060001", status: "completada", initiated_at: "2024-03-06T09:15:32", completed_at: "2024-03-06T09:15:35" },
  { id: "mov-002", account_id: "acc-001", type: "SPEI_OUT", direction: "OUT", amount: 50000, balance_after: 122250.80, concepto: "Transferencia personal", reference: "SAYO202403060002", status: "completada", initiated_at: "2024-03-06T09:23:15", completed_at: "2024-03-06T09:23:18" },
  { id: "mov-003", account_id: "acc-001", type: "ADJUSTMENT", direction: "IN", amount: 5000, balance_after: 127250.80, concepto: "Ajuste administrativo", reference: "ADJ-001", status: "completada", initiated_at: "2024-03-05T14:00:00", completed_at: "2024-03-05T14:00:01" },
  { id: "mov-004", account_id: "acc-001", type: "CODI", direction: "OUT", amount: 1500, balance_after: 125750.80, concepto: "Pago cafetería", reference: "CODI-001", status: "completada", initiated_at: "2024-03-05T11:00:00", completed_at: "2024-03-05T11:00:01" },
]

// ─────────────────────────────────────────────────────────────────────────────
// API helpers (with demo fallback)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAccountsOverview(): Promise<AccountOverview[]> {
  if (isDemoMode) return demoAccounts
  return api.get<AccountOverview[]>("/api/v1/banking/mesa/accounts/overview")
}

async function fetchBalanceStats(): Promise<BalanceStats> {
  if (isDemoMode) return demoStats
  return api.get<BalanceStats>("/api/v1/banking/mesa/accounts/stats")
}

async function fetchAccountMovements(accountId: string, limit = 30): Promise<AccountMovement[]> {
  if (isDemoMode) {
    return demoMovements.filter((m) => m.account_id === accountId).slice(0, limit)
  }
  return api.get<AccountMovement[]>(`/api/v1/banking/mesa/accounts/${accountId}/movements?limit=${limit}`)
}

async function applyAdjustment(accountId: string, payload: AdjustmentPayload): Promise<void> {
  if (isDemoMode) return
  await api.post(`/api/v1/banking/mesa/accounts/${accountId}/adjustment`, payload)
}

async function applyTransfer(payload: TransferPayload): Promise<void> {
  if (isDemoMode) return
  await api.post("/api/v1/banking/mesa/accounts/transfer", payload)
}

async function applyBatchDispersion(payload: BatchDispersionPayload): Promise<{ success_count: number; failed_count: number }> {
  if (isDemoMode) return { success_count: payload.items.length, failed_count: 0 }
  return api.post("/api/v1/banking/mesa/accounts/batch-disperse", payload)
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function accountTypeLabel(type: string): string {
  const map: Record<string, string> = {
    debito: "Débito",
    nomina: "Nómina",
    credito: "Crédito",
    ahorro: "Ahorro",
    inversiones: "Inversión",
  }
  return map[type] ?? type
}

function accountStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Activa",
    blocked: "Bloqueada",
    frozen: "Congelada",
    closed: "Cerrada",
    pending: "Pendiente",
  }
  return map[status] ?? status
}

function accountStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
    frozen: "bg-blue-100 text-blue-700",
    closed: "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-700",
  }
  return map[status] ?? "bg-gray-100 text-gray-600"
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type ActionMode = "credit" | "debit" | "transfer" | "batch" | null

export default function SaldosPage() {
  // ── Data state ────────────────────────────────────────────────
  const [accounts, setAccounts] = React.useState<AccountOverview[]>([])
  const [stats, setStats] = React.useState<BalanceStats | null>(null)
  const [movements, setMovements] = React.useState<AccountMovement[]>([])
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null)

  // ── Loading state ─────────────────────────────────────────────
  const [loadingAccounts, setLoadingAccounts] = React.useState(true)
  const [loadingStats, setLoadingStats] = React.useState(true)
  const [loadingMovements, setLoadingMovements] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  // ── Action/dialog state ───────────────────────────────────────
  const [actionMode, setActionMode] = React.useState<ActionMode>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  // ── Adjustment form ───────────────────────────────────────────
  const [adjAccountId, setAdjAccountId] = React.useState("")
  const [adjAmount, setAdjAmount] = React.useState("")
  const [adjReason, setAdjReason] = React.useState("")
  const [adjNotes, setAdjNotes] = React.useState("")

  // ── Transfer form ─────────────────────────────────────────────
  const [trfSourceId, setTrfSourceId] = React.useState("")
  const [trfDestId, setTrfDestId] = React.useState("")
  const [trfAmount, setTrfAmount] = React.useState("")
  const [trfReason, setTrfReason] = React.useState("")

  // ── Batch form ────────────────────────────────────────────────
  const [batchDescription, setBatchDescription] = React.useState("")
  const [batchRaw, setBatchRaw] = React.useState("")
  // Format: one per line "account_id:amount:concept"
  const [batchItems, setBatchItems] = React.useState<BatchDispersionItem[]>([])
  const [batchParseError, setBatchParseError] = React.useState<string | null>(null)

  // ── Load data ─────────────────────────────────────────────────

  const loadAll = React.useCallback(async () => {
    setLoadingAccounts(true)
    setLoadingStats(true)
    try {
      const [accs, st] = await Promise.all([fetchAccountsOverview(), fetchBalanceStats()])
      setAccounts(accs)
      setStats(st)
    } catch (err) {
      toast.error("Error al cargar datos", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingAccounts(false)
      setLoadingStats(false)
    }
  }, [])

  const loadMovements = React.useCallback(async (accountId: string) => {
    setLoadingMovements(true)
    try {
      const data = await fetchAccountMovements(accountId)
      setMovements(data)
    } catch (err) {
      toast.error("Error al cargar movimientos", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
      setMovements([])
    } finally {
      setLoadingMovements(false)
    }
  }, [])

  React.useEffect(() => {
    loadAll()
  }, [loadAll])

  React.useEffect(() => {
    if (selectedAccountId) {
      loadMovements(selectedAccountId)
    }
  }, [selectedAccountId, loadMovements])

  // ── Batch parser ──────────────────────────────────────────────

  const parseBatchRaw = (raw: string) => {
    setBatchParseError(null)
    if (!raw.trim()) {
      setBatchItems([])
      return
    }
    const lines = raw.trim().split("\n").filter((l) => l.trim())
    const items: BatchDispersionItem[] = []
    const errors: string[] = []

    lines.forEach((line, idx) => {
      const parts = line.split(":").map((p) => p.trim())
      if (parts.length < 2) {
        errors.push(`Línea ${idx + 1}: formato inválido (usa account_id:monto:concepto)`)
        return
      }
      const [account_id, rawAmount, ...conceptParts] = parts
      const amount = parseFloat(rawAmount)
      if (!account_id || isNaN(amount) || amount <= 0) {
        errors.push(`Línea ${idx + 1}: account_id o monto inválido`)
        return
      }
      items.push({
        account_id,
        amount,
        concept: conceptParts.join(":") || "Dispersión",
      })
    })

    if (errors.length > 0) {
      setBatchParseError(errors.join("\n"))
    }
    setBatchItems(items)
  }

  // ── Action handlers ───────────────────────────────────────────

  const openAction = (mode: ActionMode) => {
    setActionMode(mode)
    // Pre-fill account if one is selected
    if (mode === "credit" || mode === "debit") {
      setAdjAccountId(selectedAccountId ?? "")
      setAdjAmount("")
      setAdjReason("")
      setAdjNotes("")
    } else if (mode === "transfer") {
      setTrfSourceId(selectedAccountId ?? "")
      setTrfDestId("")
      setTrfAmount("")
      setTrfReason("")
    } else if (mode === "batch") {
      setBatchDescription("")
      setBatchRaw("")
      setBatchItems([])
      setBatchParseError(null)
    }
    setConfirmOpen(true)
  }

  // Validate before showing confirm
  const validateAction = (): string | null => {
    if (actionMode === "credit" || actionMode === "debit") {
      if (!adjAccountId) return "Selecciona una cuenta"
      if (!adjAmount || parseFloat(adjAmount) <= 0) return "Ingresa un monto válido"
      if (!adjReason.trim()) return "Ingresa el motivo"
    } else if (actionMode === "transfer") {
      if (!trfSourceId) return "Selecciona cuenta origen"
      if (!trfDestId) return "Selecciona cuenta destino"
      if (trfSourceId === trfDestId) return "Origen y destino no pueden ser iguales"
      if (!trfAmount || parseFloat(trfAmount) <= 0) return "Ingresa un monto válido"
      if (!trfReason.trim()) return "Ingresa el motivo"
    } else if (actionMode === "batch") {
      if (!batchDescription.trim()) return "Ingresa una descripción para el lote"
      if (batchItems.length === 0) return "Agrega al menos un ítem al lote"
      if (batchParseError) return "Corrige los errores en el lote"
    }
    return null
  }

  const handleSubmitAction = async () => {
    const err = validateAction()
    if (err) {
      toast.error(err)
      return
    }
    setSubmitting(true)

    try {
      if (actionMode === "credit" || actionMode === "debit") {
        await applyAdjustment(adjAccountId, {
          amount: parseFloat(adjAmount),
          direction: actionMode,
          reason: adjReason.trim(),
          operator_notes: adjNotes.trim() || undefined,
        })

        // Optimistic update on balance
        setAccounts((prev) =>
          prev.map((a) => {
            if (a.id !== adjAccountId) return a
            const delta = actionMode === "credit" ? parseFloat(adjAmount) : -parseFloat(adjAmount)
            return { ...a, balance: a.balance + delta, available_balance: a.available_balance + delta }
          })
        )

        toast.success(
          actionMode === "credit" ? "Balance acreditado exitosamente" : "Débito aplicado exitosamente",
          {
            description: `${formatMoney(parseFloat(adjAmount))} — ${adjReason}`,
          }
        )
      } else if (actionMode === "transfer") {
        await applyTransfer({
          source_account_id: trfSourceId,
          destination_account_id: trfDestId,
          amount: parseFloat(trfAmount),
          reason: trfReason.trim(),
        })

        const amount = parseFloat(trfAmount)
        setAccounts((prev) =>
          prev.map((a) => {
            if (a.id === trfSourceId) return { ...a, balance: a.balance - amount, available_balance: a.available_balance - amount }
            if (a.id === trfDestId) return { ...a, balance: a.balance + amount, available_balance: a.available_balance + amount }
            return a
          })
        )

        toast.success("Transferencia entre cuentas aplicada", {
          description: `${formatMoney(amount)} de ****${accounts.find((a) => a.id === trfSourceId)?.clabe.slice(-4)} a ****${accounts.find((a) => a.id === trfDestId)?.clabe.slice(-4)}`,
        })
      } else if (actionMode === "batch") {
        const result = await applyBatchDispersion({
          items: batchItems,
          description: batchDescription.trim(),
        })
        toast.success("Dispersión por lote procesada", {
          description: `${result.success_count} exitosas, ${result.failed_count} fallidas`,
        })
      }

      setConfirmOpen(false)
      // Refresh real data
      setTimeout(() => loadAll(), 1500)
      if (selectedAccountId) setTimeout(() => loadMovements(selectedAccountId), 1500)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "INSUFFICIENT_FUNDS" || err.status === 402) {
          toast.error("Fondos insuficientes", {
            description: "El saldo disponible en la cuenta origen no es suficiente.",
          })
        } else if (err.code === "ACCOUNT_BLOCKED" || err.status === 403) {
          toast.error("Cuenta bloqueada", {
            description: "La cuenta seleccionada no puede operar en este momento.",
          })
        } else {
          toast.error(`Error al procesar operación (${err.code})`, {
            description: err.message,
          })
        }
      } else {
        toast.error("Error de red", {
          description: "No se pudo conectar con el servidor.",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Derived ───────────────────────────────────────────────────

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Gestión de Saldos</h1>
          <p className="text-sm text-muted-foreground">
            Administración de balances, ajustes y dispersiones
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll} disabled={loadingAccounts || loadingStats}>
          <RefreshCw className={`size-3.5 mr-1.5 ${(loadingAccounts || loadingStats) ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-sayo-cafe/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="size-4 text-sayo-cafe" />
                <p className="text-xs text-muted-foreground">Balance Total</p>
              </div>
              <p className="text-xl font-bold tabular-nums">{formatMoney(stats.total_balance)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Disponible: {formatMoney(stats.total_available)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="size-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Volumen Entrada</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-green-600">
                {formatMoney(stats.daily_volume_in)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="size-4 text-red-600" />
                <p className="text-xs text-muted-foreground">Volumen Salida</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-red-600">
                {formatMoney(stats.daily_volume_out)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="size-4 text-sayo-orange" />
                <p className="text-xs text-muted-foreground">Cuentas Activas</p>
              </div>
              <p className="text-xl font-bold tabular-nums">{stats.active_accounts}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                de {stats.total_accounts} totales
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 border-green-200 hover:bg-green-50 hover:border-green-400"
            onClick={() => openAction("credit")}
          >
            <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
              <Plus className="size-4 text-green-700" />
            </div>
            <span className="text-xs font-medium text-green-700">Asignar Saldo</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 border-red-200 hover:bg-red-50 hover:border-red-400"
            onClick={() => openAction("debit")}
          >
            <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
              <Minus className="size-4 text-red-700" />
            </div>
            <span className="text-xs font-medium text-red-700">Debitar Saldo</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
            onClick={() => openAction("transfer")}
          >
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
              <ArrowLeftRight className="size-4 text-blue-700" />
            </div>
            <span className="text-xs font-medium text-blue-700">Transferir</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 border-purple-200 hover:bg-purple-50 hover:border-purple-400"
            onClick={() => openAction("batch")}
          >
            <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Layers className="size-4 text-purple-700" />
            </div>
            <span className="text-xs font-medium text-purple-700">Dispersión Lote</span>
          </Button>
        </div>
      </div>

      {/* Accounts Overview Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Cuentas</h2>
        {loadingAccounts ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Wallet className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay cuentas disponibles</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1">
            {accounts.map((account) => {
              const isSelected = account.id === selectedAccountId
              return (
                <Card
                  key={account.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 shadow-sm"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedAccountId(isSelected ? null : account.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {account.alias ?? account.account_number}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] flex-shrink-0 ${accountStatusColor(account.status)}`}
                        >
                          {accountStatusLabel(account.status)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {accountTypeLabel(account.account_type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {account.user_name ?? "Sin titular"} • ****{account.clabe.slice(-4)}
                        {account.last_transaction_at && (
                          <> • Último mov: {new Date(account.last_transaction_at).toLocaleDateString("es-MX")}</>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold tabular-nums ${account.balance < 0 ? "text-red-600" : ""}`}>
                        {formatMoney(account.balance)}
                      </p>
                      {account.hold_amount > 0 && (
                        <p className="text-[10px] text-sayo-orange">
                          Retenido: {formatMoney(account.hold_amount)}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className={`size-4 text-muted-foreground flex-shrink-0 transition-transform ${
                        isSelected ? "rotate-90" : ""
                      }`}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Movement History for selected account */}
      {selectedAccountId && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <History className="size-4 text-muted-foreground" />
              Movimientos — {selectedAccount?.alias ?? selectedAccount?.account_number ?? "Cuenta seleccionada"}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAction("credit")}
                className="text-green-700 border-green-200 hover:bg-green-50"
              >
                <Plus className="size-3 mr-1" /> Abonar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAction("debit")}
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                <Minus className="size-3 mr-1" /> Debitar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadMovements(selectedAccountId)}
                disabled={loadingMovements}
              >
                <RefreshCw className={`size-3.5 ${loadingMovements ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {loadingMovements ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p className="text-sm">Sin movimientos registrados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1">
              {movements.map((mov) => (
                <Card key={mov.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div
                      className={`size-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        mov.direction === "IN" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {mov.direction === "IN" ? (
                        <ArrowDownLeft className="size-3.5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="size-3.5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {mov.concepto ?? mov.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(mov.initiated_at)}
                        {mov.reference ? ` • ${mov.reference}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-sm font-semibold tabular-nums ${
                          mov.direction === "IN" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {mov.direction === "IN" ? "+" : "-"}{formatMoney(mov.amount)}
                      </p>
                      {mov.balance_after !== null && (
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          Saldo: {formatMoney(mov.balance_after)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${getStatusColor(mov.status)}`}
                    >
                      {mov.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Dialog — Credit / Debit */}
      <Dialog
        open={confirmOpen && (actionMode === "credit" || actionMode === "debit")}
        onOpenChange={(open) => { if (!submitting) setConfirmOpen(open) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionMode === "credit" ? (
                <Plus className="size-4 text-green-700" />
              ) : (
                <Minus className="size-4 text-red-700" />
              )}
              {actionMode === "credit" ? "Asignar Saldo (Crédito)" : "Debitar Saldo"}
            </DialogTitle>
            <DialogDescription>
              {actionMode === "credit"
                ? "Acredita fondos directamente en la cuenta seleccionada."
                : "Retira fondos de la cuenta seleccionada. Requiere motivo."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cuenta *</Label>
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-1">
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAdjAccountId(a.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                      adjAccountId === a.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium truncate">
                      {a.alias ?? a.account_number}
                      <span className="font-normal text-xs ml-1 opacity-70">
                        {a.user_name ?? ""} ****{a.clabe.slice(-4)}
                      </span>
                    </span>
                    <span className="tabular-nums text-xs flex-shrink-0 ml-2">
                      {formatMoney(a.balance)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Monto *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="$0.00"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Motivo *</Label>
              <Input
                placeholder="Ej: Ajuste por error de captura, Bonificación..."
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Notas internas (opcional)</Label>
              <Textarea
                placeholder="Notas para el equipo de operaciones..."
                value={adjNotes}
                onChange={(e) => setAdjNotes(e.target.value)}
              />
            </div>

            {adjAccountId && adjAmount && parseFloat(adjAmount) > 0 && (
              <div
                className={`p-3 rounded-lg text-sm space-y-1 ${
                  actionMode === "credit" ? "bg-green-50 border-green-200 border" : "bg-red-50 border-red-200 border"
                }`}
              >
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" />
                  Resumen
                </p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cuenta</span>
                  <span className="font-mono text-xs">
                    ****{accounts.find((a) => a.id === adjAccountId)?.clabe.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Operación</span>
                  <span className={actionMode === "credit" ? "text-green-700" : "text-red-700"}>
                    {actionMode === "credit" ? "+" : "-"}{formatMoney(parseFloat(adjAmount))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={submitting} />}>Cancelar</DialogClose>
            <Button
              onClick={handleSubmitAction}
              disabled={submitting}
              className={
                actionMode === "debit"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }
            >
              {submitting ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Check className="size-3.5 mr-1.5" />
              )}
              {submitting
                ? "Procesando..."
                : actionMode === "credit"
                ? "Confirmar Crédito"
                : "Confirmar Débito"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog — Transfer Between Accounts */}
      <Dialog
        open={confirmOpen && actionMode === "transfer"}
        onOpenChange={(open) => { if (!submitting) setConfirmOpen(open) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="size-4 text-blue-700" />
              Transferencia Entre Cuentas
            </DialogTitle>
            <DialogDescription>
              Mueve fondos de una cuenta SAYO a otra dentro del sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cuenta Origen *</Label>
              <div className="space-y-1 max-h-36 overflow-y-auto border rounded-lg p-1">
                {accounts
                  .filter((a) => a.status === "active" && a.id !== trfDestId)
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setTrfSourceId(a.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        trfSourceId === a.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="truncate">
                        {a.alias ?? a.account_number}
                        <span className="font-normal text-xs ml-1 opacity-70">****{a.clabe.slice(-4)}</span>
                      </span>
                      <span className="tabular-nums text-xs flex-shrink-0 ml-2">
                        {formatMoney(a.available_balance)}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cuenta Destino *</Label>
              <div className="space-y-1 max-h-36 overflow-y-auto border rounded-lg p-1">
                {accounts
                  .filter((a) => a.status === "active" && a.id !== trfSourceId)
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setTrfDestId(a.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        trfDestId === a.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="truncate">
                        {a.alias ?? a.account_number}
                        <span className="font-normal text-xs ml-1 opacity-70">****{a.clabe.slice(-4)}</span>
                      </span>
                      <span className="tabular-nums text-xs flex-shrink-0 ml-2">
                        {formatMoney(a.balance)}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Monto *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="$0.00"
                value={trfAmount}
                onChange={(e) => setTrfAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Motivo *</Label>
              <Input
                placeholder="Ej: Rebalanceo de cuentas, Corrección..."
                value={trfReason}
                onChange={(e) => setTrfReason(e.target.value)}
              />
            </div>

            {trfSourceId && trfDestId && trfAmount && parseFloat(trfAmount) > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm space-y-1">
                <p className="font-semibold">Resumen</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">De</span>
                  <span className="font-mono text-xs">****{accounts.find((a) => a.id === trfSourceId)?.clabe.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">A</span>
                  <span className="font-mono text-xs">****{accounts.find((a) => a.id === trfDestId)?.clabe.slice(-4)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Monto</span>
                  <span className="text-blue-700">{formatMoney(parseFloat(trfAmount))}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={submitting} />}>Cancelar</DialogClose>
            <Button onClick={handleSubmitAction} disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <ArrowLeftRight className="size-3.5 mr-1.5" />
              )}
              {submitting ? "Procesando..." : "Confirmar Transferencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog — Batch Dispersion */}
      <Dialog
        open={confirmOpen && actionMode === "batch"}
        onOpenChange={(open) => { if (!submitting) setConfirmOpen(open) }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="size-4 text-purple-700" />
              Dispersión por Lote
            </DialogTitle>
            <DialogDescription>
              Distribuye fondos a múltiples cuentas en una sola operación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Descripción del lote *</Label>
              <Input
                placeholder="Ej: Nómina quincena 1 de abril 2026"
                value={batchDescription}
                onChange={(e) => setBatchDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Destinatarios *
                <span className="font-normal text-muted-foreground ml-1">
                  (formato: account_id:monto:concepto, una por línea)
                </span>
              </Label>
              <Textarea
                className="font-mono text-xs min-h-[120px]"
                placeholder={`acc-001:5000:Sueldo quincenal\nacc-002:3500:Bono productividad\nacc-003:4200:Nómina`}
                value={batchRaw}
                onChange={(e) => {
                  setBatchRaw(e.target.value)
                  parseBatchRaw(e.target.value)
                }}
              />
              {batchParseError && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs text-red-700 whitespace-pre-wrap">{batchParseError}</p>
                </div>
              )}
              {batchItems.length > 0 && !batchParseError && (
                <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs text-green-700 font-medium">
                    {batchItems.length} ítem(s) — Total:{" "}
                    {formatMoney(batchItems.reduce((s, i) => s + i.amount, 0))}
                  </p>
                </div>
              )}
            </div>

            {batchItems.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {batchItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                  >
                    <span className="font-mono text-muted-foreground">{item.account_id}</span>
                    <span>{item.concept}</span>
                    <span className="font-semibold tabular-nums">{formatMoney(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={submitting} />}>Cancelar</DialogClose>
            <Button
              onClick={handleSubmitAction}
              disabled={submitting || batchItems.length === 0 || !!batchParseError}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {submitting ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Layers className="size-3.5 mr-1.5" />
              )}
              {submitting
                ? "Procesando..."
                : `Dispersar ${batchItems.length} cuenta${batchItems.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
