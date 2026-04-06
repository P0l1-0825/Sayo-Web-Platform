"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { useServiceData } from "@/hooks/use-service-data"
import { creditsService } from "@/lib/credits-service"
import type { Credit, CreditApplication, CreditPayment } from "@/lib/credits-service"
import { formatMoney } from "@/lib/utils"
import {
  Search,
  Eye,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Ban,
  Settings,
} from "lucide-react"
import { toast } from "sonner"

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const statusColor = (status: string) => {
  switch (status) {
    case "vigente":      return "bg-green-100 text-green-700"
    case "vencido":      return "bg-red-100 text-red-700"
    case "reestructurado": return "bg-blue-100 text-blue-700"
    case "castigado":    return "bg-gray-100 text-gray-700"
    case "liquidado":    return "bg-emerald-100 text-emerald-700"
    case "saldado":      return "bg-emerald-100 text-emerald-700"
    default:             return "bg-gray-100 text-gray-700"
  }
}

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────

export default function AdminCreditosPage() {
  // ── Data ──────────────────────────────────────────────
  const {
    data: credits,
    isLoading: creditsLoading,
    error: creditsError,
    refetch: refetchCredits,
  } = useServiceData(() => creditsService.getCredits(), [])

  const {
    data: applications,
    isLoading: appsLoading,
    error: appsError,
    refetch: refetchApps,
  } = useServiceData(() => creditsService.getApplications(), [])

  // ── Local state ────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("todos")
  const [selectedCredit, setSelectedCredit]     = React.useState<Credit | null>(null)
  const [detailOpen, setDetailOpen]     = React.useState(false)
  const [actionOpen, setActionOpen]     = React.useState(false)
  const [actionType, setActionType]     = React.useState("")
  const [actionReason, setActionReason] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState(false)
  const [paymentHistory, setPaymentHistory] = React.useState<CreditPayment[]>([])
  const [historyLoading, setHistoryLoading] = React.useState(false)

  const isLoading = creditsLoading || appsLoading
  const error     = creditsError   || appsError

  // ── Derived data ───────────────────────────────────────
  const allCredits = credits ?? []
  const _applications = applications ?? []

  const filteredCredits = React.useMemo(() => {
    let result = allCredits
    if (statusFilter !== "todos") result = result.filter((c) => c.status === statusFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) =>
        c.id.toLowerCase().includes(q) ||
        (c.product_name ?? "").toLowerCase().includes(q) ||
        c.user_id.toLowerCase().includes(q)
      )
    }
    return result
  }, [allCredits, searchQuery, statusFilter])

  const totalVigente  = allCredits.filter((c) => c.status === "vigente").reduce((s, c) => s + c.current_balance, 0)
  const totalVencido  = allCredits.filter((c) => c.status === "vencido").reduce((s, c) => s + c.current_balance, 0)
  const totalActive   = allCredits.filter((c) => c.status !== "liquidado").length
  const totalSaldados = allCredits.filter((c) => c.status === "liquidado").length

  const statusFilters = [
    { id: "todos",          label: "Todos",          count: allCredits.length },
    { id: "vigente",        label: "Vigente",        count: allCredits.filter((c) => c.status === "vigente").length },
    { id: "vencido",        label: "Vencido",        count: allCredits.filter((c) => c.status === "vencido").length },
    { id: "reestructurado", label: "Reestructurado", count: allCredits.filter((c) => c.status === "reestructurado").length },
    { id: "castigado",      label: "Castigado",      count: allCredits.filter((c) => c.status === "castigado").length },
    { id: "liquidado",      label: "Saldado",        count: allCredits.filter((c) => c.status === "liquidado").length },
  ]

  // Pending applications from the applications endpoint
  const pendingApps = _applications.filter((a) => a.status === "en_revision" || a.status === "enviada")

  // ── Handlers ───────────────────────────────────────────
  const handleView = async (credit: Credit) => {
    setSelectedCredit(credit)
    setDetailOpen(true)
    setHistoryLoading(true)
    try {
      const history = await creditsService.getCreditPayments(credit.id)
      setPaymentHistory(history)
    } catch {
      setPaymentHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleAction = (credit: Credit, action: string) => {
    setSelectedCredit(credit)
    setActionType(action)
    setActionReason("")
    setActionOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!actionReason) {
      toast.error("Ingresa el motivo de la accion")
      return
    }
    if (!selectedCredit) return
    setActionLoading(true)
    try {
      const statusMap: Record<string, string> = {
        reestructurar: "reestructurado",
        castigo:       "castigado",
        reactivar:     "vigente",
      }
      const labels: Record<string, string> = {
        reestructurar: "Reestructuracion",
        condonar:      "Condonacion de intereses",
        castigo:       "Castigo de credito",
        reactivar:     "Reactivacion",
      }
      // Use applications status update when we have the application id
      if (selectedCredit.application_id && statusMap[actionType]) {
        await creditsService.updateApplicationStatus(selectedCredit.application_id, statusMap[actionType], {
          rejection_reason: actionType === "castigo" ? actionReason : undefined,
          approved_by: "Mesa Control",
        })
      }
      toast.success(`${labels[actionType]} procesada`, {
        description: `${selectedCredit.id} — ${actionReason}`,
      })
      setActionOpen(false)
      refetchCredits()
    } catch (err) {
      toast.error("Error al procesar accion", {
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveApplication = async (app: CreditApplication) => {
    try {
      await creditsService.updateApplicationStatus(app.id, "aprobada", {
        approved_amount: app.requested_amount,
        approved_by: "Mesa Control",
      })
      toast.success("Solicitud aprobada", { description: app.id })
      refetchApps()
    } catch (err) {
      toast.error("Error al aprobar", { description: err instanceof Error ? err.message : "Intenta de nuevo" })
    }
  }

  const handleRejectApplication = async (app: CreditApplication) => {
    try {
      await creditsService.updateApplicationStatus(app.id, "rechazada", {
        rejection_reason: "Rechazada por Mesa Control",
        approved_by: "Mesa Control",
      })
      toast.success("Solicitud rechazada", { description: app.id })
      refetchApps()
    } catch (err) {
      toast.error("Error al rechazar", { description: err instanceof Error ? err.message : "Intenta de nuevo" })
    }
  }

  // ── Table columns ──────────────────────────────────────
  const columns: ColumnDef<Credit>[] = [
    {
      accessorKey: "id",
      header: "No. Crédito",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
    },
    {
      accessorKey: "user_id",
      header: "Cliente",
      cell: ({ row }) => <span className="text-sm">{row.original.user_id}</span>,
    },
    {
      accessorKey: "product_name",
      header: "Producto",
      cell: ({ row }) => <span className="text-xs">{row.original.product_name ?? row.original.product_id}</span>,
    },
    {
      accessorKey: "current_balance",
      header: "Saldo Actual",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-sm">
          {formatMoney(row.original.current_balance)}
        </span>
      ),
    },
    {
      accessorKey: "annual_rate",
      header: "Tasa",
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.annual_rate}%</span>,
    },
    {
      id: "progress",
      header: "Avance",
      cell: ({ row }) => {
        const paid = row.original.term_months - row.original.remaining_months
        const pct  = Math.round((paid / row.original.term_months) * 100)
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {paid}/{row.original.term_months}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
            {row.original.status}
          </span>
          {row.original.days_past_due > 0 && row.original.status !== "castigado" && (
            <span className="text-[10px] text-red-600 font-semibold">{row.original.days_past_due}d</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => { e.stopPropagation(); void handleView(row.original) }}
        >
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────
  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error)     return <ErrorCard message={error} onRetry={() => { refetchCredits(); refetchApps() }} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Administración de Créditos</h1>
        <p className="text-sm text-muted-foreground">Busqueda, detalle y acciones sobre creditos activos</p>
      </div>

      {/* Search Bar */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID de credito, producto o cliente..."
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalActive}</p>
              <p className="text-xs text-blue-600">Créditos Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-lg font-bold text-green-700">{formatMoney(totalVigente)}</p>
              <p className="text-xs text-green-600">Cartera Vigente</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-lg font-bold text-red-700">{formatMoney(totalVencido)}</p>
              <p className="text-xs text-red-600">Cartera Vencida</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalSaldados}</p>
              <p className="text-xs text-purple-600">Saldados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Banner */}
      {pendingApps.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-yellow-700" />
                <p className="text-sm font-semibold text-yellow-800">
                  {pendingApps.length} solicitud{pendingApps.length !== 1 ? "es" : ""} pendiente{pendingApps.length !== 1 ? "s" : ""} de revisión
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {pendingApps.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-yellow-100 text-sm">
                  <div>
                    <p className="font-medium text-xs">{app.product_name ?? app.product_id}</p>
                    <p className="text-[10px] text-muted-foreground">{app.id} — {formatMoney(app.requested_amount)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => void handleApproveApplication(app)}
                    >
                      <CheckCircle className="size-3 mr-1" /> Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => void handleRejectApplication(app)}
                    >
                      <Ban className="size-3 mr-1" /> Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusFilter === f.id ? "bg-sayo-cream border-sayo-cafe text-sayo-cafe" : "hover:bg-muted/50"}`}
          >
            {f.label} <span className="text-muted-foreground">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Credits Table */}
      <DataTable
        columns={columns}
        data={filteredCredits}
        searchKey="user_id"
        searchPlaceholder="Filtrar por cliente..."
        exportFilename="admin_creditos"
        onRowClick={(row) => void handleView(row)}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Crédito</DialogTitle>
            <DialogDescription>{selectedCredit?.id}</DialogDescription>
          </DialogHeader>
          {selectedCredit && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedCredit.product_name ?? selectedCredit.product_id}</Badge>
                  <span className="font-medium text-sm font-mono">{selectedCredit.user_id}</span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedCredit.status)}`}>
                  {selectedCredit.status}
                  {selectedCredit.days_past_due > 0 && ` (${selectedCredit.days_past_due}d)`}
                </span>
              </div>

              {/* General Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Monto Original",   value: formatMoney(selectedCredit.original_amount) },
                  { label: "Saldo Actual",      value: formatMoney(selectedCredit.current_balance) },
                  { label: "Pago Mensual",      value: formatMoney(selectedCredit.monthly_payment) },
                  { label: "Tasa Anual",        value: `${selectedCredit.annual_rate}%` },
                  { label: "Plazo",             value: `${selectedCredit.term_months} meses` },
                  { label: "Meses Restantes",   value: `${selectedCredit.remaining_months}` },
                  { label: "Fecha Dispersión",  value: selectedCredit.disbursed_at?.slice(0, 10) ?? "—" },
                  { label: "Próximo Pago",      value: selectedCredit.next_payment_date },
                  { label: "Último Pago",       value: selectedCredit.last_payment_date ?? "—" },
                  { label: "Mora",              value: selectedCredit.mora_category },
                  { label: "Días Vencidos",     value: selectedCredit.days_past_due > 0 ? `${selectedCredit.days_past_due} días` : "Al corriente" },
                  { label: "CAT",               value: `${selectedCredit.cat}%` },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">Avance del Crédito</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {selectedCredit.term_months - selectedCredit.remaining_months} de {selectedCredit.term_months} periodos
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.round(((selectedCredit.term_months - selectedCredit.remaining_months) / selectedCredit.term_months) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {Math.round(((selectedCredit.term_months - selectedCredit.remaining_months) / selectedCredit.term_months) * 100)}% completado
                </p>
              </div>

              {/* Payment History */}
              <div>
                <p className="text-xs font-semibold mb-2">Historial de Pagos</p>
                {historyLoading ? (
                  <p className="text-xs text-muted-foreground">Cargando historial...</p>
                ) : paymentHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin pagos registrados.</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-2 py-1.5">#</th>
                          <th className="text-left px-2 py-1.5">Fecha</th>
                          <th className="text-right px-2 py-1.5">Capital</th>
                          <th className="text-right px-2 py-1.5">Interes</th>
                          <th className="text-right px-2 py-1.5">IVA</th>
                          <th className="text-right px-2 py-1.5">Total</th>
                          <th className="text-center px-2 py-1.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((p) => (
                          <tr key={p.id} className="border-t">
                            <td className="px-2 py-1.5 tabular-nums">{p.payment_number}</td>
                            <td className="px-2 py-1.5">{p.due_date}</td>
                            <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(p.principal)}</td>
                            <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(p.interest)}</td>
                            <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(p.iva_interest)}</td>
                            <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{formatMoney(p.total_paid)}</td>
                            <td className="px-2 py-1.5 text-center">
                              {p.status === "pagado"   && <CheckCircle className="size-3.5 text-green-500 mx-auto" />}
                              {p.status === "pendiente" && <Clock className="size-3.5 text-yellow-500 mx-auto" />}
                              {p.status === "vencido"  && <AlertTriangle className="size-3.5 text-red-500 mx-auto" />}
                              {p.status === "parcial"  && <Clock className="size-3.5 text-orange-500 mx-auto" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedCredit.status !== "liquidado" && (
                <div>
                  <p className="text-xs font-semibold mb-2">Acciones Disponibles</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCredit.status === "vencido" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "reestructurar") }}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" /> Reestructurar
                      </Button>
                    )}
                    {(selectedCredit.status === "vencido" || selectedCredit.status === "vigente") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "condonar") }}
                      >
                        <Settings className="mr-1 h-3 w-3" /> Condonar Intereses
                      </Button>
                    )}
                    {selectedCredit.status === "vencido" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "castigo") }}
                      >
                        <Ban className="mr-1 h-3 w-3" /> Castigo
                      </Button>
                    )}
                    {selectedCredit.status === "castigado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "reactivar") }}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" /> Reactivar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "reestructurar" && "Reestructurar Crédito"}
              {actionType === "condonar"      && "Condonar Intereses"}
              {actionType === "castigo"       && "Castigo de Crédito"}
              {actionType === "reactivar"     && "Reactivar Crédito"}
            </DialogTitle>
            <DialogDescription>
              {selectedCredit?.id} — {selectedCredit?.product_name ?? selectedCredit?.product_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Saldo Actual</span>
                <span className="text-sm font-bold tabular-nums">{formatMoney(selectedCredit?.current_balance ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-[10px]">{selectedCredit?.status}</Badge>
              </div>
            </div>

            {actionType === "castigo" && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-xs text-red-700 font-medium">Esta accion marcara el credito como irrecuperable</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label>Motivo / Justificacion</Label>
              <Input
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Describe el motivo de la accion..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              onClick={() => void handleConfirmAction()}
              className={actionType === "castigo" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-sayo-cafe hover:bg-sayo-cafe-light"}
              disabled={!actionReason || actionLoading}
            >
              {actionLoading ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
