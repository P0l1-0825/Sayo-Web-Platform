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

interface ActiveCredit {
  id: string
  creditNumber: string
  clientName: string
  clientType: "PFAE" | "PM"
  product: string
  originalAmount: number
  currentBalance: number
  monthlyPayment: number
  rate: number
  term: number
  paidPeriods: number
  totalPeriods: number
  nextPaymentDate: string
  status: "vigente" | "vencido" | "reestructurado" | "castigado" | "saldado"
  daysOverdue: number
  clabe: string
  disbursementDate: string
  maturityDate: string
  guaranteeType: string
  guaranteeValue: number
}

interface PaymentHistory {
  period: number
  date: string
  capital: number
  interest: number
  iva: number
  total: number
  status: "pagado" | "pendiente" | "vencido"
}

const statusColor = (status: string) => {
  switch (status) {
    case "vigente": return "bg-green-100 text-green-700"
    case "vencido": return "bg-red-100 text-red-700"
    case "reestructurado": return "bg-blue-100 text-blue-700"
    case "castigado": return "bg-gray-100 text-gray-700"
    case "saldado": return "bg-emerald-100 text-emerald-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const activeCredits: ActiveCredit[] = [
  { id: "CR-001", creditNumber: "CRED-2024-001", clientName: "Carlos Mendez Lopez", clientType: "PFAE", product: "Crédito Cuenta Corriente", originalAmount: 500000, currentBalance: 380000, monthlyPayment: 14500, rate: 24, term: 48, paidPeriods: 8, totalPeriods: 48, nextPaymentDate: "2025-04-01", status: "vigente", daysOverdue: 0, clabe: "012180001234567890", disbursementDate: "2024-08-01", maturityDate: "2028-08-01", guaranteeType: "Hipotecaria", guaranteeValue: 800000 },
  { id: "CR-002", creditNumber: "CRED-2024-003", clientName: "Grupo Industrial Azteca", clientType: "PM", product: "Crédito Empresarial", originalAmount: 5000000, currentBalance: 4200000, monthlyPayment: 145000, rate: 18, term: 60, paidPeriods: 6, totalPeriods: 60, nextPaymentDate: "2025-03-15", status: "vigente", daysOverdue: 0, clabe: "014180009876543210", disbursementDate: "2024-09-15", maturityDate: "2029-09-15", guaranteeType: "Prendaria", guaranteeValue: 7500000 },
  { id: "CR-003", creditNumber: "CRED-2024-005", clientName: "Pedro Lopez Hernandez", clientType: "PFAE", product: "Crédito Cuenta Corriente", originalAmount: 350000, currentBalance: 320000, monthlyPayment: 12800, rate: 28, term: 36, paidPeriods: 3, totalPeriods: 36, nextPaymentDate: "2025-02-01", status: "vencido", daysOverdue: 35, clabe: "072180005566778899", disbursementDate: "2024-11-01", maturityDate: "2027-11-01", guaranteeType: "Fianza", guaranteeValue: 400000 },
  { id: "CR-004", creditNumber: "CRED-2023-012", clientName: "Comercializadora Norte SA", clientType: "PM", product: "Línea de Crédito", originalAmount: 2000000, currentBalance: 1500000, monthlyPayment: 65000, rate: 22, term: 36, paidPeriods: 18, totalPeriods: 36, nextPaymentDate: "2025-03-20", status: "reestructurado", daysOverdue: 0, clabe: "021180002233445566", disbursementDate: "2023-09-20", maturityDate: "2026-09-20", guaranteeType: "Hipotecaria", guaranteeValue: 3500000 },
  { id: "CR-005", creditNumber: "CRED-2023-008", clientName: "Laura Martinez Rios", clientType: "PFAE", product: "Crédito Cuenta Corriente", originalAmount: 200000, currentBalance: 0, monthlyPayment: 0, rate: 26, term: 24, paidPeriods: 24, totalPeriods: 24, nextPaymentDate: "—", status: "saldado", daysOverdue: 0, clabe: "036180007788990011", disbursementDate: "2023-03-01", maturityDate: "2025-03-01", guaranteeType: "Fianza", guaranteeValue: 250000 },
  { id: "CR-006", creditNumber: "CRED-2024-009", clientName: "Distribuidora Centro SA", clientType: "PM", product: "Crédito Empresarial", originalAmount: 1200000, currentBalance: 1200000, monthlyPayment: 42000, rate: 20, term: 36, paidPeriods: 0, totalPeriods: 36, nextPaymentDate: "2025-01-10", status: "vencido", daysOverdue: 58, clabe: "012180004455667788", disbursementDate: "2024-12-10", maturityDate: "2027-12-10", guaranteeType: "Prendaria", guaranteeValue: 1800000 },
  { id: "CR-007", creditNumber: "CRED-2022-015", clientName: "Francisco Gutierrez Soto", clientType: "PFAE", product: "Crédito Cuenta Corriente", originalAmount: 150000, currentBalance: 145000, monthlyPayment: 0, rate: 30, term: 24, paidPeriods: 2, totalPeriods: 24, nextPaymentDate: "—", status: "castigado", daysOverdue: 180, clabe: "072180001122334455", disbursementDate: "2022-06-01", maturityDate: "2024-06-01", guaranteeType: "Sin garantia", guaranteeValue: 0 },
]

const paymentHistoryData: PaymentHistory[] = [
  { period: 1, date: "2024-09-01", capital: 7200, interest: 6500, iva: 1040, total: 14740, status: "pagado" },
  { period: 2, date: "2024-10-01", capital: 7350, interest: 6350, iva: 1016, total: 14716, status: "pagado" },
  { period: 3, date: "2024-11-01", capital: 7500, interest: 6200, iva: 992, total: 14692, status: "pagado" },
  { period: 4, date: "2024-12-01", capital: 7650, interest: 6050, iva: 968, total: 14668, status: "pagado" },
  { period: 5, date: "2025-01-01", capital: 7800, interest: 5900, iva: 944, total: 14644, status: "pagado" },
  { period: 6, date: "2025-02-01", capital: 7950, interest: 5750, iva: 920, total: 14620, status: "pagado" },
  { period: 7, date: "2025-03-01", capital: 8100, interest: 5600, iva: 896, total: 14596, status: "pagado" },
  { period: 8, date: "2025-04-01", capital: 8250, interest: 5450, iva: 872, total: 14572, status: "pendiente" },
]

export default function AdminCreditosPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("todos")
  const [selectedCredit, setSelectedCredit] = React.useState<ActiveCredit | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [actionOpen, setActionOpen] = React.useState(false)
  const [actionType, setActionType] = React.useState("")
  const [actionReason, setActionReason] = React.useState("")

  const filteredCredits = React.useMemo(() => {
    let result = activeCredits
    if (statusFilter !== "todos") {
      result = result.filter((c) => c.status === statusFilter)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) =>
        c.creditNumber.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.clabe.includes(q)
      )
    }
    return result
  }, [searchQuery, statusFilter])

  const handleView = (credit: ActiveCredit) => {
    setSelectedCredit(credit)
    setDetailOpen(true)
  }

  const handleAction = (credit: ActiveCredit, action: string) => {
    setSelectedCredit(credit)
    setActionType(action)
    setActionReason("")
    setActionOpen(true)
  }

  const handleConfirmAction = () => {
    if (!actionReason) {
      toast.error("Ingresa el motivo de la accion")
      return
    }
    const labels: Record<string, string> = {
      reestructurar: "Reestructuracion",
      condonar: "Condonacion de intereses",
      castigo: "Castigo de credito",
      reactivar: "Reactivacion",
    }
    toast.success(`${labels[actionType]} procesada`, { description: `${selectedCredit?.creditNumber} — ${actionReason}` })
    setActionOpen(false)
  }

  const totalVigente = activeCredits.filter((c) => c.status === "vigente").reduce((s, c) => s + c.currentBalance, 0)
  const totalVencido = activeCredits.filter((c) => c.status === "vencido").reduce((s, c) => s + c.currentBalance, 0)
  const totalCredits = activeCredits.filter((c) => c.status !== "saldado").length

  const statusFilters = [
    { id: "todos", label: "Todos", count: activeCredits.length },
    { id: "vigente", label: "Vigente", count: activeCredits.filter((c) => c.status === "vigente").length },
    { id: "vencido", label: "Vencido", count: activeCredits.filter((c) => c.status === "vencido").length },
    { id: "reestructurado", label: "Reestructurado", count: activeCredits.filter((c) => c.status === "reestructurado").length },
    { id: "castigado", label: "Castigado", count: activeCredits.filter((c) => c.status === "castigado").length },
    { id: "saldado", label: "Saldado", count: activeCredits.filter((c) => c.status === "saldado").length },
  ]

  const columns: ColumnDef<ActiveCredit>[] = [
    { accessorKey: "creditNumber", header: "No. Crédito", cell: ({ row }) => <span className="font-mono text-xs">{row.original.creditNumber}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "clientType", header: "Tipo", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.clientType}</Badge> },
    { accessorKey: "product", header: "Producto", cell: ({ row }) => <span className="text-xs">{row.original.product}</span> },
    { accessorKey: "currentBalance", header: "Saldo Actual", cell: ({ row }) => <span className="font-semibold tabular-nums text-sm">{formatMoney(row.original.currentBalance)}</span> },
    {
      accessorKey: "rate",
      header: "Tasa",
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.rate}%</span>,
    },
    {
      id: "progress",
      header: "Avance",
      cell: ({ row }) => {
        const pct = Math.round((row.original.paidPeriods / row.original.totalPeriods) * 100)
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{row.original.paidPeriods}/{row.original.totalPeriods}</span>
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
          {row.original.daysOverdue > 0 && row.original.status !== "castigado" && (
            <span className="text-[10px] text-red-600 font-semibold">{row.original.daysOverdue}d</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

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
              placeholder="Buscar por numero de credito, cliente o CLABE..."
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
              <p className="text-2xl font-bold text-blue-700">{totalCredits}</p>
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
              <p className="text-2xl font-bold text-purple-700">{activeCredits.filter((c) => c.status === "saldado").length}</p>
              <p className="text-xs text-purple-600">Saldados</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
        searchKey="clientName"
        searchPlaceholder="Filtrar por cliente..."
        exportFilename="admin_creditos"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Crédito</DialogTitle>
            <DialogDescription>{selectedCredit?.creditNumber}</DialogDescription>
          </DialogHeader>
          {selectedCredit && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedCredit.clientType}</Badge>
                  <span className="font-medium text-sm">{selectedCredit.clientName}</span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedCredit.status)}`}>
                  {selectedCredit.status}
                  {selectedCredit.daysOverdue > 0 && ` (${selectedCredit.daysOverdue}d)`}
                </span>
              </div>

              {/* General Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Producto", value: selectedCredit.product },
                  { label: "Monto Original", value: formatMoney(selectedCredit.originalAmount) },
                  { label: "Saldo Actual", value: formatMoney(selectedCredit.currentBalance) },
                  { label: "Tasa Anual", value: `${selectedCredit.rate}%` },
                  { label: "Plazo", value: `${selectedCredit.term} meses` },
                  { label: "Pago Mensual", value: formatMoney(selectedCredit.monthlyPayment) },
                  { label: "Fecha Dispersión", value: selectedCredit.disbursementDate },
                  { label: "Vencimiento", value: selectedCredit.maturityDate },
                  { label: "Próximo Pago", value: selectedCredit.nextPaymentDate },
                  { label: "CLABE", value: selectedCredit.clabe },
                  { label: "Garantia", value: selectedCredit.guaranteeType },
                  { label: "Valor Garantia", value: formatMoney(selectedCredit.guaranteeValue) },
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
                  <span className="text-xs text-muted-foreground tabular-nums">{selectedCredit.paidPeriods} de {selectedCredit.totalPeriods} periodos</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.round((selectedCredit.paidPeriods / selectedCredit.totalPeriods) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">{Math.round((selectedCredit.paidPeriods / selectedCredit.totalPeriods) * 100)}% completado</p>
              </div>

              {/* Payment History */}
              <div>
                <p className="text-xs font-semibold mb-2">Historial de Pagos (ultimos 8)</p>
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
                      {paymentHistoryData.map((p) => (
                        <tr key={p.period} className="border-t">
                          <td className="px-2 py-1.5 tabular-nums">{p.period}</td>
                          <td className="px-2 py-1.5">{p.date}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(p.capital)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(p.interest)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(p.iva)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{formatMoney(p.total)}</td>
                          <td className="px-2 py-1.5 text-center">
                            {p.status === "pagado" && <CheckCircle className="size-3.5 text-green-500 mx-auto" />}
                            {p.status === "pendiente" && <Clock className="size-3.5 text-yellow-500 mx-auto" />}
                            {p.status === "vencido" && <AlertTriangle className="size-3.5 text-red-500 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              {selectedCredit.status !== "saldado" && (
                <div>
                  <p className="text-xs font-semibold mb-2">Acciones Disponibles</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCredit.status === "vencido" && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "reestructurar") }}>
                        <RefreshCw className="mr-1 h-3 w-3" /> Reestructurar
                      </Button>
                    )}
                    {(selectedCredit.status === "vencido" || selectedCredit.status === "vigente") && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "condonar") }}>
                        <Settings className="mr-1 h-3 w-3" /> Condonar Intereses
                      </Button>
                    )}
                    {selectedCredit.status === "vencido" && (
                      <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "castigo") }}>
                        <Ban className="mr-1 h-3 w-3" /> Castigo
                      </Button>
                    )}
                    {selectedCredit.status === "castigado" && (
                      <Button variant="outline" size="sm" className="text-xs text-green-600 border-green-200 hover:bg-green-50" onClick={() => { setDetailOpen(false); handleAction(selectedCredit, "reactivar") }}>
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
              {actionType === "condonar" && "Condonar Intereses"}
              {actionType === "castigo" && "Castigo de Crédito"}
              {actionType === "reactivar" && "Reactivar Crédito"}
            </DialogTitle>
            <DialogDescription>{selectedCredit?.creditNumber} — {selectedCredit?.clientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Saldo Actual</span>
                <span className="text-sm font-bold tabular-nums">{formatMoney(selectedCredit?.currentBalance || 0)}</span>
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
              <Input value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Describe el motivo de la accion..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              onClick={handleConfirmAction}
              className={actionType === "castigo" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-sayo-cafe hover:bg-sayo-cafe-light"}
              disabled={!actionReason}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
