"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
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
import { useCreditLines } from "@/hooks/use-originacion"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { CreditLine } from "@/lib/types"
import { Eye, CreditCard, TrendingUp } from "lucide-react"

const statusColor = (status: string) => {
  switch (status) {
    case "activa": return "bg-green-100 text-green-700"
    case "suspendida": return "bg-yellow-100 text-yellow-700"
    case "vencida": return "bg-red-100 text-red-700"
    case "liquidada": return "bg-gray-100 text-gray-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function LineasPage() {
  const { data: creditLines, isLoading, error, refetch } = useCreditLines()
  const [selectedLine, setSelectedLine] = React.useState<CreditLine | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const allLines = creditLines ?? []

  const lineStats = React.useMemo(() => {
    const totalLimit = allLines.reduce((s, l) => s + l.limit, 0)
    return [
      { title: "Total Líneas", value: allLines.length, change: 0, icon: "CreditCard" as const, trend: "up" as const },
      { title: "Monto Comprometido", value: totalLimit, change: 5.2, icon: "DollarSign" as const, trend: "up" as const, format: "currency" as const },
      { title: "Disponible", value: allLines.reduce((s, l) => s + l.available, 0), change: -3.1, icon: "CircleDollarSign" as const, trend: "down" as const, format: "currency" as const },
      { title: "Utilizacion %", value: totalLimit > 0 ? Math.round((allLines.reduce((s, l) => s + l.used, 0) / totalLimit) * 100) : 0, change: 2.4, icon: "TrendingUp" as const, trend: "up" as const },
    ]
  }, [allLines])

  const productDistribution = React.useMemo(() => [
    { name: "Cta. Corriente", value: allLines.filter((l) => l.product === "Crédito Cuenta Corriente").length },
    { name: "Simple", value: allLines.filter((l) => l.product === "Crédito Simple").length },
    { name: "Arrendamiento", value: allLines.filter((l) => l.product === "Arrendamiento").length },
  ], [allLines])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (line: CreditLine) => {
    setSelectedLine(line)
    setDetailOpen(true)
  }

  const columns: ColumnDef<CreditLine>[] = [
    { accessorKey: "creditNumber", header: "No. Crédito", cell: ({ row }) => <span className="font-mono text-xs">{row.original.creditNumber}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "product", header: "Producto", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.product}</Badge> },
    { accessorKey: "limit", header: "Limite", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.limit)}</span> },
    {
      accessorKey: "available",
      header: "Disponible",
      cell: ({ row }) => (
        <span className="tabular-nums text-green-600 font-medium">{formatMoney(row.original.available)}</span>
      ),
    },
    {
      accessorKey: "used",
      header: "Utilizado",
      cell: ({ row }) => {
        const pct = Math.round((row.original.used / row.original.limit) * 100)
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs tabular-nums">{pct}%</span>
          </div>
        )
      },
    },
    { accessorKey: "rate", header: "Tasa", cell: ({ row }) => <span className="text-sm">{row.original.rate}%</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status}
        </span>
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

  const statusTabs = [
    { label: "Activa", value: "activa", count: allLines.filter((l) => l.status === "activa").length },
    { label: "Suspendida", value: "suspendida", count: allLines.filter((l) => l.status === "suspendida").length },
    { label: "Vencida", value: "vencida", count: allLines.filter((l) => l.status === "vencida").length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Líneas de Crédito</h1>
        <p className="text-sm text-muted-foreground">Gestion y monitoreo de lineas de credito activas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lineStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={allLines}
            searchKey="clientName"
            searchPlaceholder="Buscar por cliente..."
            exportFilename="lineas_credito"
            statusTabs={statusTabs}
            statusKey="status"
            onRowClick={handleView}
          />
        </div>
        <ChartCard title="Distribucion por Producto" description="Líneas activas">
          <DonutChartComponent data={productDistribution} />
        </ChartCard>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Línea de Crédito</DialogTitle>
            <DialogDescription>{selectedLine?.creditNumber} — {selectedLine?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedLine && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedLine.status)}`}>
                  {selectedLine.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedLine.limit)}</p>
                  <p className="text-[10px] text-muted-foreground">Limite de credito</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Disponible</p>
                  <p className="font-semibold text-green-600">{formatMoney(selectedLine.available)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Utilizado</p>
                  <p className="font-semibold text-orange-600">{formatMoney(selectedLine.used)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tasa Anual</p>
                  <p className="font-semibold">{selectedLine.rate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Producto</p>
                  <p>{selectedLine.product}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Vencimiento</p>
                  <p>{selectedLine.expirationDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Utilizacion</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-sayo-cafe" style={{ width: `${Math.round((selectedLine.used / selectedLine.limit) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums">{Math.round((selectedLine.used / selectedLine.limit) * 100)}%</span>
                  </div>
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
