"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { accountsService } from "@/lib/accounts-service"
import type { StatCardData } from "@/lib/types"
import type { Account, TransactionRecord } from "@/lib/accounts-service"
import { formatMoney } from "@/lib/utils"
import {
  ArrowUpRight, ArrowDownLeft, Copy, Send, QrCode,
  CreditCard, Eye, Clock, Check, Loader2, RefreshCw, Wallet,
} from "lucide-react"
import { toast } from "sonner"

// ─── Movement type from account_movements (banking-service) ──

interface AccountMovement {
  id:                 string
  account_id:         string
  user_id:            string
  type:               string
  direction:          "credit" | "debit"
  amount:             number
  balance_before:     number
  balance_after:      number
  reference_id:       string | null
  reference_type:     string | null
  description:        string | null
  counterparty_name:  string | null
  counterparty_clabe: string | null
  status:             string
  metadata:           Record<string, unknown> | null
  created_at:         string
}

function isCredit(direction: "credit" | "debit"): boolean {
  return direction === "credit"
}

function formatClabe(clabe: string): string {
  if (clabe.length !== 18) return clabe
  return `${clabe.slice(0, 3)} ${clabe.slice(3, 6)} ${clabe.slice(6, 10)} ${clabe.slice(10, 14)} ${clabe.slice(14, 18)}`
}

function movementLabel(type: string): string {
  const map: Record<string, string> = {
    spei_in:              "SPEI Recibido",
    spei_out:             "SPEI Enviado",
    card_fund:            "Carga Tarjeta",
    card_purchase:        "Compra con Tarjeta",
    credit_disbursement:  "Disposición de Crédito",
    credit_payment:       "Pago de Crédito",
    payroll_advance:      "Adelanto de Nómina",
    payroll_repayment:    "Descuento Nómina",
    service_payment:      "Pago de Servicio",
    treasury_dispersion:  "Dispersión Tesorería",
    fee:                  "Comisión",
    adjustment:           "Ajuste",
    qr_payment:           "Pago QR",
  }
  return map[type] ?? type
}

export default function ClienteDashboard() {
  const { user } = useAuth()

  // ── Account state ────────────────────────────────────────────
  const [account,        setAccount]        = React.useState<Account | null>(null)
  const [movements,      setMovements]       = React.useState<AccountMovement[]>([])
  const [loadingAccount, setLoadingAccount]  = React.useState(true)
  const [loadingMovs,    setLoadingMovs]     = React.useState(false)
  const [clabeCopied,    setClabeCopied]     = React.useState(false)

  // ── Dialog state ─────────────────────────────────────────────
  const [selectedMov,  setSelectedMov]  = React.useState<AccountMovement | null>(null)
  const [detailOpen,   setDetailOpen]   = React.useState(false)

  // ── Load account ─────────────────────────────────────────────
  const loadAccount = React.useCallback(async () => {
    if (!user?.id) return
    setLoadingAccount(true)
    try {
      const accounts = await accountsService.getAccounts(user.id)
      const primary  = accounts.find((a) => a.status === "active") ?? accounts[0] ?? null
      setAccount(primary)
    } catch (err) {
      toast.error("Error al cargar cuenta", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingAccount(false)
    }
  }, [user?.id])

  // ── Load movements ────────────────────────────────────────────
  const loadMovements = React.useCallback(async (accountId: string) => {
    setLoadingMovs(true)
    try {
      // Use the mesa_control movements endpoint which returns account_movements
      const hdrs: Record<string, string> = { "Content-Type": "application/json" }
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem("sayo-auth") : null
        const tok = raw ? JSON.parse(raw)?.access_token : null
        if (tok) hdrs["Authorization"] = `Bearer ${tok}`
      } catch { /* ignore */ }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/banking/mesa/accounts/${accountId}/movements?limit=20`,
        { headers: hdrs }
      )
      if (res.ok) {
        const body = await res.json() as { data: AccountMovement[] }
        setMovements(body.data ?? [])
      }
      // If the fetch fails in demo mode, we leave movements empty (no fallback needed
      // because the account itself shows demo balance already)
    } catch {
      // non-fatal — movements section simply shows empty state
    } finally {
      setLoadingMovs(false)
    }
  }, [])

  React.useEffect(() => {
    loadAccount()
  }, [loadAccount])

  React.useEffect(() => {
    if (account?.id) {
      loadMovements(account.id)
    }
  }, [account?.id, loadMovements])

  // ── Computed stats ────────────────────────────────────────────
  const stats: StatCardData[] = account
    ? [
        {
          title:  "Saldo Disponible",
          value:  account.available_balance,
          icon:   "Wallet",
          format: "currency",
          trend:  "neutral",
        },
        {
          title:  "Saldo Total",
          value:  account.balance,
          icon:   "DollarSign",
          format: "currency",
          trend:  "neutral",
        },
        {
          title:  "Retenido",
          value:  account.hold_amount,
          icon:   "Lock",
          format: "currency",
          trend:  "neutral",
        },
        {
          title: "Movimientos",
          value: movements.length,
          icon:  "ArrowLeftRight",
          trend: "neutral",
        },
      ]
    : []

  const totalIngresos = movements.filter((m) => m.direction === "credit").reduce((s, m) => s + m.amount, 0)
  const totalEgresos  = movements.filter((m) => m.direction === "debit").reduce((s, m) => s + m.amount, 0)

  // ── Handlers ──────────────────────────────────────────────────
  const handleCopyClabe = async () => {
    if (!account?.clabe) return
    try {
      await navigator.clipboard.writeText(account.clabe)
      setClabeCopied(true)
      toast.success("CLABE copiada", { description: formatClabe(account.clabe) })
      setTimeout(() => setClabeCopied(false), 2000)
    } catch {
      toast.info(`CLABE: ${account?.clabe ?? ""}`)
    }
  }

  const handleViewMov = (mov: AccountMovement) => {
    setSelectedMov(mov)
    setDetailOpen(true)
  }

  const handleQuickAction = (action: string) => {
    const routes: Record<string, string> = {
      transferir:      "/cliente/transferencias",
      pagar_qr:        "/cliente/qr",
      pagar_servicio:  "/cliente/pagos",
      recibir:         "/cliente/qr",
      fondear_tarjeta: "/cliente/tarjetas",
    }
    if (routes[action]) window.location.href = routes[action]
  }

  // ── Loading skeleton ─────────────────────────────────────────
  if (loadingAccount) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded mt-1" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-20" />
            </Card>
          ))}
        </div>
        <Card className="animate-pulse h-24" />
      </div>
    )
  }

  // ── No account state ──────────────────────────────────────────
  if (!account) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Wallet SAYO</h1>
          <p className="text-sm text-muted-foreground">
            {user?.fullName ?? "Usuario"} — Tu saldo virtual
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Eye className="size-10 text-muted-foreground mx-auto" />
            <p className="font-semibold">No tienes una cuenta SAYO aún</p>
            <p className="text-sm text-muted-foreground">
              Completa tu perfil y verificación KYC para activar tu cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Wallet SAYO</h1>
          <p className="text-sm text-muted-foreground">
            {user?.fullName ?? "Usuario"} — Tu saldo virtual
          </p>
        </div>
        <Button
          variant="ghost" size="icon"
          onClick={() => { loadAccount(); if (account?.id) loadMovements(account.id) }}
          title="Actualizar"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* CLABE card */}
      <Card className="bg-gradient-to-r from-sayo-cafe to-sayo-cafe-light text-white">
        <CardContent className="p-5">
          <p className="text-xs text-white/70 mb-1">CLABE Interbancaria</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-mono font-bold tracking-wider">
              {formatClabe(account.clabe)}
            </p>
            <Button
              variant="ghost" size="icon-xs"
              className="text-white hover:bg-white/20"
              onClick={handleCopyClabe}
            >
              {clabeCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
          <p className="text-xs text-white/70 mt-1">
            Banco Transfer (OPM) • {(account as unknown as {sayo_id?: string}).sayo_id ?? account.account_number}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("transferir")}>
          <Send className="size-5 text-sayo-cafe" />
          <span className="text-xs">Transferir</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("pagar_qr")}>
          <QrCode className="size-5 text-purple-600" />
          <span className="text-xs">QR Pagar</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("recibir")}>
          <ArrowDownLeft className="size-5 text-green-600" />
          <span className="text-xs">QR Cobrar</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("pagar_servicio")}>
          <CreditCard className="size-5 text-blue-600" />
          <span className="text-xs">Pagar Servicio</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => handleQuickAction("fondear_tarjeta")}>
          <Wallet className="size-5 text-emerald-600" />
          <span className="text-xs">Fondear Tarjeta</span>
        </Button>
      </div>

      {/* Monthly summary strip */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="text-lg font-bold text-green-600">+{formatMoney(totalIngresos)}</p>
            <p className="text-[10px] text-muted-foreground">
              {movements.filter((m) => m.direction === "credit").length} movimientos
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Egresos</p>
            <p className="text-lg font-bold text-red-600">-{formatMoney(totalEgresos)}</p>
            <p className="text-[10px] text-muted-foreground">
              {movements.filter((m) => m.direction === "debit").length} movimientos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent movements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="size-4 text-muted-foreground" />
            Movimientos Recientes
          </h2>
          <Button
            variant="ghost" size="sm" className="text-xs"
            onClick={() => window.location.href = "/cliente/estados-cuenta"}
          >
            Ver todos
          </Button>
        </div>

        {loadingMovs ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3 h-14" />
              </Card>
            ))}
          </div>
        ) : movements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              <Loader2 className="size-6 mx-auto mb-2 text-muted-foreground/50" />
              Sin movimientos recientes
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1">
            {movements.slice(0, 10).map((mov) => {
              const credit = isCredit(mov.direction)
              const label  = mov.description ?? movementLabel(mov.type)
              return (
                <Card
                  key={mov.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleViewMov(mov)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center ${credit ? "bg-green-100" : "bg-red-100"}`}>
                      {credit
                        ? <ArrowDownLeft className="size-4 text-green-600" />
                        : <ArrowUpRight  className="size-4 text-red-600"   />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(mov.created_at).toLocaleDateString("es-MX", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                        {mov.reference_id && ` • ${mov.reference_id}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${credit ? "text-green-600" : "text-red-600"}`}>
                        {credit ? "+" : "-"}{formatMoney(mov.amount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Saldo: {formatMoney(mov.balance_after)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Movement Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Movimiento</DialogTitle>
            <DialogDescription>
              {selectedMov?.id} — {selectedMov ? movementLabel(selectedMov.type) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedMov && (
            <div className="space-y-4">
              {/* Amount header */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${isCredit(selectedMov.direction) ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  <div className={`size-8 rounded-full flex items-center justify-center ${isCredit(selectedMov.direction) ? "bg-green-100" : "bg-red-100"}`}>
                    {isCredit(selectedMov.direction)
                      ? <ArrowDownLeft className="size-4 text-green-600" />
                      : <ArrowUpRight  className="size-4 text-red-600"   />
                    }
                  </div>
                  <span className={`text-sm font-semibold capitalize ${isCredit(selectedMov.direction) ? "text-green-700" : "text-red-700"}`}>
                    {isCredit(selectedMov.direction) ? "Ingreso" : "Egreso"}
                  </span>
                </div>
                <p className={`text-xl font-bold ${isCredit(selectedMov.direction) ? "text-green-600" : "text-red-600"}`}>
                  {isCredit(selectedMov.direction) ? "+" : "-"}{formatMoney(selectedMov.amount)}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p className="font-medium">{movementLabel(selectedMov.type)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                  <p className="font-mono text-xs">{selectedMov.reference_id ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha y Hora</p>
                  <p className="text-xs">
                    {new Date(selectedMov.created_at).toLocaleString("es-MX")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Posterior</p>
                  <p className="font-semibold">{formatMoney(selectedMov.balance_after)}</p>
                </div>
                {selectedMov.counterparty_name && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Contraparte</p>
                    <p className="text-xs font-medium">{selectedMov.counterparty_name}</p>
                  </div>
                )}
                {selectedMov.counterparty_clabe && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">CLABE Contraparte</p>
                    <p className="font-mono text-xs">{formatClabe(selectedMov.counterparty_clabe)}</p>
                  </div>
                )}
              </div>

              {/* Extra info */}
              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Información Adicional</p>
                <div className="text-xs space-y-1 text-muted-foreground">
                  {selectedMov.description && <p>Concepto: {selectedMov.description}</p>}
                  <p>Estado: <span className="text-green-600 font-medium capitalize">{selectedMov.status}</span></p>
                  <p>Tipo SPEI: {isCredit(selectedMov.direction) ? "Entrada" : "Salida"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline" size="sm"
              onClick={() => {
                if (selectedMov) {
                  const credit = isCredit(selectedMov.direction)
                  const text = [
                    "Movimiento SAYO",
                    movementLabel(selectedMov.type),
                    `${credit ? "+" : "-"}${formatMoney(selectedMov.amount)}`,
                    `Ref: ${selectedMov.reference_id ?? "—"}`,
                    `Fecha: ${new Date(selectedMov.created_at).toLocaleString("es-MX")}`,
                    `Saldo: ${formatMoney(selectedMov.balance_after)}`,
                  ].join("\n")
                  navigator.clipboard.writeText(text)
                    .then(() => toast.success("Detalles copiados"))
                    .catch(() => toast.info("No se pudo copiar"))
                }
              }}
            >
              <Copy className="size-3.5 mr-1" /> Copiar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
