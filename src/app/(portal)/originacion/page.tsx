"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { AreaChartComponent } from "@/components/charts/area-chart"
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
import { originacionStats, originacionPipeline, originacionTrend, useCreditApplications } from "@/hooks/use-originacion"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { CreditApplication } from "@/lib/types"
import { Eye, FileSignature, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "capturada": return "bg-gray-100 text-gray-700"
    case "por_aprobar": return "bg-blue-100 text-blue-700"
    case "en_comite": return "bg-purple-100 text-purple-700"
    case "por_disponer": return "bg-teal-100 text-teal-700"
    case "activa": return "bg-green-100 text-green-700"
    case "saldada": return "bg-emerald-100 text-emerald-700"
    case "rechazada": return "bg-red-100 text-red-700"
    case "cancelada": return "bg-orange-100 text-orange-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const statusIcon = (status: string) => {
  switch (status) {
    case "activa":
    case "saldada": return <CheckCircle className="size-3" />
    case "rechazada":
    case "cancelada": return <XCircle className="size-3" />
    case "en_comite":
    case "por_disponer": return <Loader2 className="size-3" />
    default: return <Clock className="size-3" />
  }
}

export default function OriginacionDashboard() {
  const { data: creditApplications, isLoading, error, refetch } = useCreditApplications()
  const [selectedApp, setSelectedApp] = React.useState<CreditApplication | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const allApps = creditApplications ?? []

  const handleView = (app: CreditApplication) => {
    setSelectedApp(app)
    setDetailOpen(true)
  }

  const columns: ColumnDef<CreditApplication>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    {
      accessorKey: "clientType",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px]">{row.original.clientType === "PFAE" ? "PFAE" : "PM"}</Badge>
      ),
    },
    { accessorKey: "product", header: "Producto" },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span>,
    },
    {
      accessorKey: "term",
      header: "Plazo",
      cell: ({ row }) => <span className="text-sm">{row.original.term} meses</span>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(s)}`}>
            {statusIcon(s)} {s.replace(/_/g, " ")}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.createdAt}</span>,
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
    { label: "Capturada", value: "capturada", count: allApps.filter((a) => a.status === "capturada").length },
    { label: "Por Aprobar", value: "por_aprobar", count: allApps.filter((a) => a.status === "por_aprobar").length },
    { label: "En Comité", value: "en_comite", count: allApps.filter((a) => a.status === "en_comite").length },
    { label: "Activa", value: "activa", count: allApps.filter((a) => a.status === "activa").length },
    { label: "Rechazada", value: "rechazada", count: allApps.filter((a) => a.status === "rechazada").length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Originacion de Créditos</h1>
        <p className="text-sm text-muted-foreground">Pipeline de solicitudes y gestion de creditos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {originacionStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Pipeline por Etapa" description="Solicitudes en proceso" className="lg:col-span-1">
          <BarChartComponent data={originacionPipeline} color="var(--chart-2)" />
        </ChartCard>
        <ChartCard title="Tendencia de Solicitudes" description="Últimos 30 dias" className="lg:col-span-2">
          <AreaChartComponent data={originacionTrend} color="var(--chart-1)" />
        </ChartCard>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Solicitudes Recientes</h2>
        <DataTable
          columns={columns}
          data={allApps}
          searchKey="clientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="solicitudes_originacion"
          statusTabs={statusTabs}
          statusKey="status"
          onRowClick={handleView}
        />
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud</DialogTitle>
            <DialogDescription>{selectedApp?.folio} — {selectedApp?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedApp.status)}`}>
                  {statusIcon(selectedApp.status)} {selectedApp.status.replace(/_/g, " ")}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedApp.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">{selectedApp.product}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedApp.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p>{selectedApp.clientType === "PFAE" ? "Persona Fisica (PFAE)" : "Persona Moral (PM)"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tasa Anual</p>
                  <p className="font-semibold">{selectedApp.rate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Plazo</p>
                  <p>{selectedApp.term} meses</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Score Buro</p>
                  <p className="font-semibold">{selectedApp.bureauScore || "Pendiente"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selectedApp.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Creacion</p>
                  <p>{selectedApp.createdAt}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Última Actualizacion</p>
                  <p>{selectedApp.updatedAt}</p>
                </div>
              </div>
              {selectedApp.validations && (
                <div className="p-3 rounded-lg border space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Validaciones</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedApp.validations).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        {value ? <CheckCircle className="size-3 text-green-600" /> : <XCircle className="size-3 text-red-500" />}
                        <span>{key.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedApp.notes && (
                <div className="p-3 rounded-lg border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Notas</p>
                  <p className="text-sm mt-1">{selectedApp.notes}</p>
                </div>
              )}
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
