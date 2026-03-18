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
import { useTreasuryPayments } from "@/hooks/use-tesoreria"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { TreasuryPayment } from "@/lib/types"
import { Search, Eye, CheckCircle, Clock, XCircle, Loader2, ArrowDownLeft, ArrowUpRight, Download, Filter } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "procesado": return "bg-green-100 text-green-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "autorizado": return "bg-blue-100 text-blue-700"
    case "rechazado": return "bg-red-100 text-red-700"
    case "cancelado": return "bg-gray-100 text-gray-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function ConsultaPage() {
  const { data: treasuryPayments, isLoading, error, refetch } = useTreasuryPayments()
  const [selectedPayment, setSelectedPayment] = React.useState<TreasuryPayment | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  // Filter states
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [minAmount, setMinAmount] = React.useState("")
  const [maxAmount, setMaxAmount] = React.useState("")
  const [beneficiary, setBeneficiary] = React.useState("")

  const allPayments = treasuryPayments ?? []

  const filteredPayments = React.useMemo(() => {
    let results = [...allPayments]
    if (dateFrom) results = results.filter((p) => p.date >= dateFrom)
    if (dateTo) results = results.filter((p) => p.date <= dateTo)
    if (typeFilter) results = results.filter((p) => p.type === typeFilter)
    if (statusFilter) results = results.filter((p) => p.status === statusFilter)
    if (minAmount) results = results.filter((p) => p.amount >= Number(minAmount))
    if (maxAmount) results = results.filter((p) => p.amount <= Number(maxAmount))
    if (beneficiary) results = results.filter((p) => p.beneficiaryName.toLowerCase().includes(beneficiary.toLowerCase()))
    return results
  }, [allPayments, dateFrom, dateTo, typeFilter, statusFilter, minAmount, maxAmount, beneficiary])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (payment: TreasuryPayment) => {
    setSelectedPayment(payment)
    setDetailOpen(true)
  }

  const handleExportCSV = () => {
    toast.success("Exportación CSV generada", { description: `${filteredPayments.length} registros exportados` })
  }

  const handleExportPDF = () => {
    toast.success("Reporte PDF generado", { description: `${filteredPayments.length} registros incluidos` })
  }

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setTypeFilter("")
    setStatusFilter("")
    setMinAmount("")
    setMaxAmount("")
    setBeneficiary("")
    toast.info("Filtros limpiados")
  }

  const activeFiltersCount = [dateFrom, dateTo, typeFilter, statusFilter, minAmount, maxAmount, beneficiary].filter(Boolean).length

  const columns: ColumnDef<TreasuryPayment>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px]">{row.original.type.toUpperCase()}</Badge>
      ),
    },
    { accessorKey: "beneficiaryName", header: "Beneficiario" },
    { accessorKey: "beneficiaryBank", header: "Banco" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    { accessorKey: "reference", header: "Referencia", cell: ({ row }) => <span className="font-mono text-xs">{row.original.reference}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(s)}`}>
            {s === "procesado" && <CheckCircle className="size-3" />}
            {s === "pendiente" && <Clock className="size-3" />}
            {s === "autorizado" && <Loader2 className="size-3" />}
            {s === "rechazado" && <XCircle className="size-3" />}
            {s}
          </span>
        )
      },
    },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Consulta de Operaciones</h1>
          <p className="text-sm text-muted-foreground">Busqueda avanzada y exportación de movimientos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-1 h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filtros Avanzados</span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-sayo-cafe text-white text-[10px]">{activeFiltersCount} activos</Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Limpiar filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">Fecha Desde</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">Fecha Hasta</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">Tipo Pago</Label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                <option value="">Todos</option>
                <option value="individual">Individual</option>
                <option value="empresa">Empresa</option>
                <option value="referenciado">Referenciado</option>
                <option value="dispersión">Dispersión</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">Estado</Label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="autorizado">Autorizado</option>
                <option value="procesado">Procesado</option>
                <option value="rechazado">Rechazado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">Monto Min</Label>
              <Input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">Monto Max</Label>
              <Input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="999,999" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">Beneficiario</Label>
              <Input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="Nombre..." className="h-8 text-xs" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredPayments.length}</span> resultados encontrados
          {activeFiltersCount > 0 && <span> (filtrado de {allPayments.length} total)</span>}
        </p>
        <p className="text-muted-foreground">
          Monto total: <span className="font-semibold text-foreground tabular-nums">{formatMoney(filteredPayments.reduce((s, p) => s + p.amount, 0))}</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        searchKey="beneficiaryName"
        searchPlaceholder="Buscar por beneficiario..."
        exportFilename="consulta_operaciones"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Operación</DialogTitle>
            <DialogDescription>{selectedPayment?.folio}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                  <Badge variant="outline" className="text-[10px]">{selectedPayment.type.toUpperCase()}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedPayment.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Beneficiario</p>
                  <p className="font-medium">{selectedPayment.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Banco</p>
                  <p>{selectedPayment.beneficiaryBank}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">CLABE</p>
                  <p className="font-mono text-xs">{selectedPayment.beneficiaryClabe}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                  <p className="font-mono text-xs">{selectedPayment.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Concepto</p>
                  <p>{selectedPayment.concept}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cuenta Origen</p>
                  <p className="font-mono text-xs">{selectedPayment.sourceAccount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Solicitado por</p>
                  <p>{selectedPayment.requestedBy}</p>
                </div>
                {selectedPayment.authorizedBy && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Autorizado por</p>
                    <p>{selectedPayment.authorizedBy}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedPayment.date}</p>
                </div>
                {selectedPayment.processedAt && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Procesado</p>
                    <p>{selectedPayment.processedAt}</p>
                  </div>
                )}
                {selectedPayment.speiTracking && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Clave Rastreo SPEI</p>
                    <p className="font-mono text-xs">{selectedPayment.speiTracking}</p>
                  </div>
                )}
              </div>

              {/* Trazabilidad */}
              <div className="p-3 rounded-lg border space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Trazabilidad</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">{selectedPayment.date}</span>
                    <span>Solicitud creada por {selectedPayment.requestedBy}</span>
                  </div>
                  {selectedPayment.authorizedBy && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">{selectedPayment.date}</span>
                      <span>Autorizado por {selectedPayment.authorizedBy}</span>
                    </div>
                  )}
                  {selectedPayment.processedAt && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">{selectedPayment.processedAt}</span>
                      <span>Procesado via SPEI — {selectedPayment.speiTracking}</span>
                    </div>
                  )}
                  {selectedPayment.status === "rechazado" && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">{selectedPayment.date}</span>
                      <span className="text-red-600">Pago rechazado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
