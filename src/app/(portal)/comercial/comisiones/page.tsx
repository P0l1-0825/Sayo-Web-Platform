"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useCommissions } from "@/hooks/use-commercial"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { Commission } from "@/lib/types"
import { Eye, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

export default function ComisionesPage() {
  const { data: fetchedCommissions, isLoading, error, refetch } = useCommissions()
  const [comisionesList, setComisionesList] = React.useState<Commission[]>([])
  const [selectedCommission, setSelectedCommission] = React.useState<Commission | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [payOpen, setPayOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)

  React.useEffect(() => { if (fetchedCommissions) setComisionesList(fetchedCommissions) }, [fetchedCommissions])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (commission: Commission) => {
    setSelectedCommission(commission)
    setDetailOpen(true)
  }

  const handleMarkPaid = (commission: Commission) => {
    setSelectedCommission(commission)
    setPayOpen(true)
  }

  const confirmPay = () => {
    if (!selectedCommission) return
    setComisionesList((prev) =>
      prev.map((c) => (c.id === selectedCommission.id ? { ...c, status: "pagada" as const } : c))
    )
    setPayOpen(false)
    setDetailOpen(false)
    toast.success("Comisión marcada como pagada", {
      description: `${selectedCommission.id} — ${formatMoney(selectedCommission.commissionAmount)} para ${selectedCommission.executiveName}`,
    })
  }

  const handleCancel = (commission: Commission) => {
    setSelectedCommission(commission)
    setCancelOpen(true)
  }

  const confirmCancel = () => {
    if (!selectedCommission) return
    setComisionesList((prev) =>
      prev.map((c) => (c.id === selectedCommission.id ? { ...c, status: "cancelada" as const } : c))
    )
    setCancelOpen(false)
    setDetailOpen(false)
    toast.success("Comisión cancelada", {
      description: `${selectedCommission.id} — ${selectedCommission.executiveName}`,
    })
  }

  const totalPagadas = comisionesList.filter((c) => c.status === "pagada").reduce((s, c) => s + c.commissionAmount, 0)
  const totalPendientes = comisionesList.filter((c) => c.status === "pendiente").reduce((s, c) => s + c.commissionAmount, 0)
  const totalCanceladas = comisionesList.filter((c) => c.status === "cancelada").reduce((s, c) => s + c.commissionAmount, 0)

  const statusTabs = [
    { label: "Pendiente", value: "pendiente", count: comisionesList.filter((c) => c.status === "pendiente").length },
    { label: "Pagada", value: "pagada", count: comisionesList.filter((c) => c.status === "pagada").length },
    { label: "Cancelada", value: "cancelada", count: comisionesList.filter((c) => c.status === "cancelada").length },
  ]

  const columns: ColumnDef<Commission>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "executiveName", header: "Ejecutivo" },
    { accessorKey: "product", header: "Producto", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.product}</Badge> },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "amount", header: "Monto Operación", cell: ({ row }) => <span className="tabular-nums">{formatMoney(row.original.amount)}</span> },
    { accessorKey: "commissionRate", header: "Tasa %", cell: ({ row }) => <span className="tabular-nums">{row.original.commissionRate}%</span> },
    { accessorKey: "commissionAmount", header: "Comisión", cell: ({ row }) => <span className="font-semibold tabular-nums text-sayo-green">{formatMoney(row.original.commissionAmount)}</span> },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        row.original.status === "pagada" ? "bg-green-100 text-green-700" :
        row.original.status === "pendiente" ? "bg-yellow-100 text-yellow-700" :
        "bg-red-100 text-red-700"
      }`}>
        {row.original.status === "pagada" && <CheckCircle className="size-3" />}
        {row.original.status === "pendiente" && <Clock className="size-3" />}
        {row.original.status === "cancelada" && <XCircle className="size-3" />}
        {row.original.status}
      </span>
    )},
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          {row.original.status === "pendiente" && (
            <>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleMarkPaid(row.original) }} title="Marcar pagada">
                <CheckCircle className="size-3.5 text-sayo-green" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleCancel(row.original) }} title="Cancelar">
                <XCircle className="size-3.5 text-sayo-red" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Comisiones</h1>
        <p className="text-sm text-muted-foreground">Comisiones por ejecutivo, producto y período</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="size-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{formatMoney(totalPagadas + totalPendientes)}</p>
            <p className="text-xs text-muted-foreground">Total Comisiones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="size-5 mx-auto text-sayo-green mb-1" />
            <p className="text-2xl font-bold text-sayo-green">{formatMoney(totalPagadas)}</p>
            <p className="text-xs text-muted-foreground">Pagadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="size-5 mx-auto text-sayo-orange mb-1" />
            <p className="text-2xl font-bold text-sayo-orange">{formatMoney(totalPendientes)}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="size-5 mx-auto text-sayo-red mb-1" />
            <p className="text-2xl font-bold text-sayo-red">{formatMoney(totalCanceladas)}</p>
            <p className="text-xs text-muted-foreground">Canceladas</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={comisionesList}
        searchKey="executiveName"
        searchPlaceholder="Buscar por ejecutivo..."
        exportFilename="comisiones"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Comisión</DialogTitle>
            <DialogDescription>{selectedCommission?.id}</DialogDescription>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedCommission.status === "pagada" ? "bg-green-100 text-green-700" :
                  selectedCommission.status === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {selectedCommission.status === "pagada" && <CheckCircle className="size-3" />}
                  {selectedCommission.status === "pendiente" && <Clock className="size-3" />}
                  {selectedCommission.status === "cancelada" && <XCircle className="size-3" />}
                  {selectedCommission.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums text-sayo-green">{formatMoney(selectedCommission.commissionAmount)}</p>
                  <p className="text-[10px] text-muted-foreground">Comisión</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Ejecutivo</p>
                  <p className="font-medium">{selectedCommission.executiveName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Producto</p>
                  <p>{selectedCommission.product}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p>{selectedCommission.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedCommission.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto Operación</p>
                  <p className="font-semibold tabular-nums">{formatMoney(selectedCommission.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tasa de Comisión</p>
                  <p className="font-semibold tabular-nums">{selectedCommission.commissionRate}%</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cálculo:</span>
                  <span className="font-mono text-xs">
                    {formatMoney(selectedCommission.amount)} × {selectedCommission.commissionRate}% = {formatMoney(selectedCommission.commissionAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedCommission?.status === "pendiente" && (
              <>
                <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => { setDetailOpen(false); handleMarkPaid(selectedCommission) }}>
                  <CheckCircle className="size-3.5 mr-1" /> Marcar Pagada
                </Button>
                <Button variant="outline" size="sm" className="text-sayo-red" onClick={() => { setDetailOpen(false); handleCancel(selectedCommission) }}>
                  <XCircle className="size-3.5 mr-1" /> Cancelar
                </Button>
              </>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Confirmation Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-sayo-green" />
              Confirmar Pago de Comisión
            </DialogTitle>
            <DialogDescription>
              ¿Marcar esta comisión como pagada?
            </DialogDescription>
          </DialogHeader>
          {selectedCommission && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comisión:</span>
                <span className="font-mono text-xs">{selectedCommission.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ejecutivo:</span>
                <span className="font-medium">{selectedCommission.executiveName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto:</span>
                <span className="font-bold text-sayo-green">{formatMoney(selectedCommission.commissionAmount)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmPay} className="bg-sayo-green hover:bg-sayo-green/90">
              <CheckCircle className="size-3.5 mr-1" /> Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-sayo-red" />
              Cancelar Comisión
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de cancelar esta comisión? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedCommission && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comisión:</span>
                <span className="font-mono text-xs">{selectedCommission.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ejecutivo:</span>
                <span className="font-medium">{selectedCommission.executiveName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto:</span>
                <span className="font-bold">{formatMoney(selectedCommission.commissionAmount)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>No, mantener</DialogClose>
            <Button variant="destructive" onClick={confirmCancel}>
              <XCircle className="size-3.5 mr-1" /> Sí, Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
