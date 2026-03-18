"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
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
import { tesoreriaStats, tesoreriaFlowChart, paymentTypeDistribution, useTreasuryPayments } from "@/hooks/use-tesoreria"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { TreasuryPayment } from "@/lib/types"
import { Eye, CheckCircle, XCircle, Clock, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"

const statusColor = (status: string) => {
  switch (status) {
    case "completado": return "bg-green-100 text-green-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "en_proceso": return "bg-blue-100 text-blue-700"
    case "rechazado": return "bg-red-100 text-red-700"
    case "cancelado": return "bg-gray-100 text-gray-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function TesoreriaDashboard() {
  const { data: treasuryPayments, isLoading, error, refetch } = useTreasuryPayments()
  const [selectedPayment, setSelectedPayment] = React.useState<TreasuryPayment | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!treasuryPayments) return null

  const handleView = (payment: TreasuryPayment) => {
    setSelectedPayment(payment)
    setDetailOpen(true)
  }

  const columns: ColumnDef<TreasuryPayment>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const t = row.original.type
        return (
          <div className="flex items-center gap-1">
            {t === "spei_in" ? <ArrowDownLeft className="size-3 text-green-600" /> : <ArrowUpRight className="size-3 text-red-500" />}
            <Badge variant="outline" className="text-[10px]">{t.replace(/_/g, " ").toUpperCase()}</Badge>
          </div>
        )
      },
    },
    { accessorKey: "beneficiaryName", header: "Beneficiario" },
    { accessorKey: "beneficiaryBank", header: "Banco" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(s)}`}>
            {s === "completado" && <CheckCircle className="size-3" />}
            {s === "pendiente" && <Clock className="size-3" />}
            {s === "en_proceso" && <Loader2 className="size-3" />}
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

  const statusTabs = [
    { label: "Completado", value: "completado", count: treasuryPayments.filter((p) => p.status === "completado").length },
    { label: "Pendiente", value: "pendiente", count: treasuryPayments.filter((p) => p.status === "pendiente").length },
    { label: "En Proceso", value: "en_proceso", count: treasuryPayments.filter((p) => p.status === "en_proceso").length },
    { label: "Rechazado", value: "rechazado", count: treasuryPayments.filter((p) => p.status === "rechazado").length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Tesorería</h1>
        <p className="text-sm text-muted-foreground">
          Operaciones de pago — {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tesoreriaStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Flujo de Efectivo" description="Últimos 7 dias" className="lg:col-span-2">
          <BarChartComponent data={tesoreriaFlowChart} color="var(--chart-2)" />
        </ChartCard>
        <ChartCard title="Tipo de Pago" description="Distribucion">
          <DonutChartComponent data={paymentTypeDistribution} />
        </ChartCard>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Últimos Movimientos</h2>
        <DataTable
          columns={columns}
          data={treasuryPayments}
          searchKey="beneficiaryName"
          searchPlaceholder="Buscar por beneficiario..."
          exportFilename="tesoreria_movimientos"
          statusTabs={statusTabs}
          statusKey="status"
          onRowClick={handleView}
        />
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Pago</DialogTitle>
            <DialogDescription>{selectedPayment?.folio}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedPayment.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">{selectedPayment.type.replace(/_/g, " ").toUpperCase()}</Badge>
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
                  <p className="text-[10px] text-muted-foreground uppercase">Concepto</p>
                  <p>{selectedPayment.concept}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                  <p className="font-mono text-xs">{selectedPayment.reference}</p>
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
                {selectedPayment.speiTracking && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Clave Rastreo SPEI</p>
                    <p className="font-mono text-xs">{selectedPayment.speiTracking}</p>
                  </div>
                )}
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
