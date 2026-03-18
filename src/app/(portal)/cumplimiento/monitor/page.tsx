"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { Card, CardContent } from "@/components/ui/card"
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
import { pldMonitorRules, pldMonitorAlerts } from "@/hooks/use-compliance"
import { formatMoney } from "@/lib/utils"
import type { PLDMonitorRule, PLDMonitorAlert } from "@/lib/types"
import { Eye, ShieldAlert, Activity, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"

const severityColor = (severity: string) => {
  switch (severity) {
    case "critica": return "bg-red-100 text-red-700 border-red-200"
    case "alta": return "bg-orange-100 text-orange-700 border-orange-200"
    case "media": return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "baja": return "bg-blue-100 text-blue-700 border-blue-200"
    default: return "bg-gray-100 text-gray-700"
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case "activa": return "bg-red-100 text-red-700"
    case "investigando": return "bg-yellow-100 text-yellow-700"
    case "resuelta": return "bg-green-100 text-green-700"
    case "descartada": return "bg-gray-100 text-gray-500"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function MonitorPage() {
  const [rules, setRules] = React.useState(pldMonitorRules)
  const [selectedAlert, setSelectedAlert] = React.useState<PLDMonitorAlert | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const toggleRule = (ruleId: string) => {
    setRules((prev) => prev.map((r) => r.id === ruleId ? { ...r, active: !r.active } : r))
    const rule = rules.find((r) => r.id === ruleId)
    toast.info(`Regla ${rule?.active ? "desactivada" : "activada"}`, { description: rule?.name })
  }

  const handleViewAlert = (alert: PLDMonitorAlert) => {
    setSelectedAlert(alert)
    setDetailOpen(true)
  }

  const alertsByRule = rules.map((r) => ({ name: r.name.slice(0, 15), value: r.alertsGenerated }))

  const ruleColumns: ColumnDef<PLDMonitorRule>[] = [
    { accessorKey: "name", header: "Regla" },
    { accessorKey: "description", header: "Descripcion", cell: ({ row }) => <span className="text-xs max-w-[250px] truncate block">{row.original.description}</span> },
    { accessorKey: "threshold", header: "Umbral", cell: ({ row }) => <Badge variant="outline" className="text-[10px] font-mono">{row.original.threshold}</Badge> },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.type}</Badge>,
    },
    {
      accessorKey: "alertsGenerated",
      header: "Alertas",
      cell: ({ row }) => <span className="font-semibold">{row.original.alertsGenerated}</span>,
    },
    {
      accessorKey: "active",
      header: "Estado",
      cell: ({ row }) => (
        <button onClick={(e) => { e.stopPropagation(); toggleRule(row.original.id) }} className="flex items-center gap-1">
          {row.original.active ? (
            <ToggleRight className="size-5 text-green-600" />
          ) : (
            <ToggleLeft className="size-5 text-gray-400" />
          )}
          <span className={`text-[10px] font-medium ${row.original.active ? "text-green-600" : "text-gray-400"}`}>
            {row.original.active ? "Activa" : "Inactiva"}
          </span>
        </button>
      ),
    },
  ]

  const alertColumns: ColumnDef<PLDMonitorAlert>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "ruleName", header: "Regla" },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "description", header: "Descripcion", cell: ({ row }) => <span className="text-xs max-w-[200px] truncate block">{row.original.description}</span> },
    { accessorKey: "triggeredAmount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.triggeredAmount)}</span> },
    {
      accessorKey: "severity",
      header: "Severidad",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColor(row.original.severity)}`}>
          {row.original.severity === "critica" && <AlertTriangle className="size-3" />}
          {row.original.severity}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleViewAlert(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Monitor Transaccional</h1>
        <p className="text-sm text-muted-foreground">Reglas de monitoreo y alertas PLD/FT en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{pldMonitorAlerts.filter((a) => a.severity === "critica").length}</p>
              <p className="text-xs text-red-600">Alertas Criticas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{pldMonitorAlerts.length}</p>
              <p className="text-xs text-orange-600">Alertas Totales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{rules.filter((r) => r.active).length}/{rules.length}</p>
              <p className="text-xs text-green-600">Reglas Activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChartCard title="Alertas por Regla" description="Distribucion de alertas generadas">
        <BarChartComponent data={alertsByRule} color="var(--chart-4)" />
      </ChartCard>

      <div>
        <h2 className="text-sm font-semibold mb-3">Reglas de Monitoreo</h2>
        <DataTable
          columns={ruleColumns}
          data={rules}
          searchKey="name"
          searchPlaceholder="Buscar regla..."
          exportFilename="reglas_monitoreo"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Alertas Generadas</h2>
        <DataTable
          columns={alertColumns}
          data={pldMonitorAlerts}
          searchKey="clientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="alertas_monitor"
          onRowClick={handleViewAlert}
        />
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Alerta</DialogTitle>
            <DialogDescription>{selectedAlert?.id} — {selectedAlert?.ruleName}</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${severityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedAlert.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto</p>
                  <p className="font-semibold tabular-nums">{formatMoney(selectedAlert.triggeredAmount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Descripcion</p>
                  <p>{selectedAlert.description}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Umbral</p>
                  <p className="font-mono text-xs">{selectedAlert.threshold}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Operaciones Relacionadas</p>
                  <p className="font-semibold">{selectedAlert.relatedOperations}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedAlert.date}</p>
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
