"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { DataTable } from "@/components/dashboard/data-table"
import { AreaChartComponent } from "@/components/charts/area-chart"
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
import { mesaControlStats, transactionsTrend, mesaControlActivity, useTransactions } from "@/hooks/use-accounts"
import { useRealtimeTransactions } from "@/lib/realtime"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney, formatClabe, getStatusColor, copyToClipboard } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { Eye, Copy, CheckCircle, XCircle, Clock, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"

export default function MesaControlDashboard() {
  const { data: transactions, isLoading, error, refetch } = useTransactions()
  const [selectedTxn, setSelectedTxn] = React.useState<Transaction | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  // Real-time: auto-refresh when new transactions arrive
  const { latestTransaction } = useRealtimeTransactions(null, () => {
    refetch()
    toast.info("Nueva transacción recibida", { duration: 3000 })
  })

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!transactions) return null

  const handleView = (txn: Transaction) => {
    setSelectedTxn(txn)
    setDetailOpen(true)
  }

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text)
    if (ok) toast.success(`${label} copiado`, { description: text })
  }

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.type.includes("IN") ? <ArrowDownLeft className="size-3 text-sayo-green" /> : <ArrowUpRight className="size-3 text-sayo-red" />}
          <Badge variant="outline" className="text-[10px]">{row.original.type}</Badge>
        </div>
      ),
    },
    { accessorKey: "senderName", header: "Origen" },
    { accessorKey: "receiverName", header: "Destino" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(s)}`}>
            {s === "completada" && <CheckCircle className="size-3" />}
            {s === "rechazada" && <XCircle className="size-3" />}
            {s === "pendiente" && <Clock className="size-3" />}
            {s === "en_proceso" && <Loader2 className="size-3 animate-spin" />}
            {s}
          </span>
        )
      },
    },
    { accessorKey: "hour", header: "Hora", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.hour}</span> },
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
    { label: "Completada", value: "completada", count: transactions.filter((t) => t.status === "completada").length },
    { label: "Pendiente", value: "pendiente", count: transactions.filter((t) => t.status === "pendiente").length },
    { label: "Rechazada", value: "rechazada", count: transactions.filter((t) => t.status === "rechazada").length },
    { label: "En Proceso", value: "en_proceso", count: transactions.filter((t) => t.status === "en_proceso").length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Mesa de Control</h1>
        <p className="text-sm text-muted-foreground">
          Operaciones del día — {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mesaControlStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Transacciones 7 días" description="SPEI Entrada vs Salida" className="lg:col-span-2">
          <AreaChartComponent
            data={transactionsTrend}
            dataKey="spei_in"
            secondaryDataKey="spei_out"
            color="var(--chart-2)"
            secondaryColor="var(--chart-4)"
          />
        </ChartCard>
        <ActivityFeed items={mesaControlActivity} />
      </div>

      {/* Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Últimas Transacciones</h2>
        <DataTable
          columns={columns}
          data={transactions}
          searchKey="senderName"
          searchPlaceholder="Buscar por origen..."
          exportFilename="transacciones_mesa_control"
          statusTabs={statusTabs}
          statusKey="status"
          onRowClick={handleView}
        />
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Transacción</DialogTitle>
            <DialogDescription>{selectedTxn?.id} — {selectedTxn?.claveRastreo}</DialogDescription>
          </DialogHeader>
          {selectedTxn && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedTxn.status)}`}>
                  {selectedTxn.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedTxn.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">{selectedTxn.type}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Clave Rastreo</p>
                  <button onClick={() => handleCopy(selectedTxn.claveRastreo, "Clave")} className="font-mono text-sm flex items-center gap-1 hover:text-sayo-cafe">
                    {selectedTxn.claveRastreo} <Copy className="size-3" />
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha / Hora</p>
                  <p>{selectedTxn.date} {selectedTxn.hour}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Concepto</p>
                  <p>{selectedTxn.concept}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p>{selectedTxn.type}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Ordenante</p>
                <p className="text-sm font-medium">{selectedTxn.senderName} — {selectedTxn.senderBank}</p>
                <button onClick={() => handleCopy(selectedTxn.senderClabe, "CLABE")} className="font-mono text-xs text-muted-foreground flex items-center gap-1 hover:text-sayo-cafe">
                  {formatClabe(selectedTxn.senderClabe)} <Copy className="size-3" />
                </button>
              </div>
              <div className="p-3 rounded-lg border space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Beneficiario</p>
                <p className="text-sm font-medium">{selectedTxn.receiverName} — {selectedTxn.receiverBank}</p>
                <button onClick={() => handleCopy(selectedTxn.receiverClabe, "CLABE")} className="font-mono text-xs text-muted-foreground flex items-center gap-1 hover:text-sayo-cafe">
                  {formatClabe(selectedTxn.receiverClabe)} <Copy className="size-3" />
                </button>
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
