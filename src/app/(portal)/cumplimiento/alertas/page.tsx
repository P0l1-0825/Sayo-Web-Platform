"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
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
import { useComplianceAlerts } from "@/hooks/use-compliance"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney, getSeverityColor } from "@/lib/utils"
import type { ComplianceAlert } from "@/lib/types"
import { Eye, ArrowUpRight, XCircle, AlertTriangle, ShieldAlert, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

const alertStatusColor = (status: string) => {
  switch (status) {
    case "activa": return "bg-red-100 text-red-700"
    case "investigando": return "bg-blue-100 text-blue-700"
    case "escalada": return "bg-purple-100 text-purple-700"
    case "descartada": return "bg-green-100 text-green-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const alertStatusIcon = (status: string) => {
  switch (status) {
    case "activa": return <AlertTriangle className="size-3" />
    case "investigando": return <Clock className="size-3" />
    case "escalada": return <ArrowUpRight className="size-3" />
    case "descartada": return <CheckCircle className="size-3" />
    default: return null
  }
}

export default function AlertasPage() {
  const { data: fetchedAlerts, isLoading, error, refetch } = useComplianceAlerts()
  const [alerts, setAlerts] = React.useState<ComplianceAlert[]>([])
  const [selectedAlert, setSelectedAlert] = React.useState<ComplianceAlert | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [discardOpen, setDiscardOpen] = React.useState(false)

  React.useEffect(() => { if (fetchedAlerts) setAlerts(fetchedAlerts) }, [fetchedAlerts])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (alert: ComplianceAlert) => {
    setSelectedAlert(alert)
    setDetailOpen(true)
  }

  const handleInvestigar = (alert: ComplianceAlert) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status: "investigando" } : a))
    )
    toast.info("Alerta en investigación", { description: `${alert.id} — ${alert.clientName}` })
  }

  const handleEscalar = (alert: ComplianceAlert) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status: "escalada" } : a))
    )
    toast.warning("Alerta escalada", { description: `${alert.id} escalada al Oficial PLD` })
  }

  const handleDiscardConfirm = (alert: ComplianceAlert) => {
    setSelectedAlert(alert)
    setDiscardOpen(true)
  }

  const confirmDiscard = () => {
    if (!selectedAlert) return
    setAlerts((prev) =>
      prev.map((a) => (a.id === selectedAlert.id ? { ...a, status: "descartada" } : a))
    )
    setDiscardOpen(false)
    toast.success("Alerta descartada", { description: `${selectedAlert.id} marcada como falso positivo` })
  }

  const statusTabs = [
    { label: "Activa", value: "activa", count: alerts.filter((a) => a.status === "activa").length },
    { label: "Investigando", value: "investigando", count: alerts.filter((a) => a.status === "investigando").length },
    { label: "Escalada", value: "escalada", count: alerts.filter((a) => a.status === "escalada").length },
    { label: "Descartada", value: "descartada", count: alerts.filter((a) => a.status === "descartada").length },
  ]

  const columns: ColumnDef<ComplianceAlert>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "type", header: "Tipo", cell: ({ row }) => <span className="text-sm font-medium">{row.original.type}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    {
      accessorKey: "severity", header: "Severidad",
      cell: ({ row }) => (
        <Badge className={getSeverityColor(row.original.severity)}>
          {row.original.severity}
        </Badge>
      ),
    },
    {
      accessorKey: "status", header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${alertStatusColor(row.original.status)}`}>
          {alertStatusIcon(row.original.status)}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "riskScore", header: "Score", cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${row.original.riskScore > 80 ? "bg-sayo-red" : row.original.riskScore > 60 ? "bg-sayo-orange" : "bg-sayo-green"}`} style={{ width: `${row.original.riskScore}%` }} />
        </div>
        <span className="text-xs font-semibold tabular-nums">{row.original.riskScore}</span>
      </div>
    )},
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount || 0)}</span> },
    { accessorKey: "assignedTo", header: "Asignado", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedTo}</span> },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          {row.original.status === "activa" && (
            <>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleInvestigar(row.original) }} title="Investigar">
                <ShieldAlert className="size-3.5 text-sayo-blue" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEscalar(row.original) }} title="Escalar">
                <ArrowUpRight className="size-3.5 text-sayo-orange" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleDiscardConfirm(row.original) }} title="Descartar">
                <XCircle className="size-3.5 text-muted-foreground" />
              </Button>
            </>
          )}
          {row.original.status === "investigando" && (
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEscalar(row.original) }} title="Escalar">
              <ArrowUpRight className="size-3.5 text-sayo-orange" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Alertas PLD/FT</h1>
          <p className="text-sm text-muted-foreground">Operaciones inusuales, structuring y coincidencias PEP</p>
        </div>
        <Badge variant="outline" className="gap-1"><AlertTriangle className="size-3" /> {alerts.filter((a) => a.status === "activa").length} activas</Badge>
      </div>

      <DataTable
        columns={columns}
        data={alerts}
        searchKey="clientName"
        searchPlaceholder="Buscar por cliente..."
        exportFilename="alertas_pld"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Alert Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Alerta</DialogTitle>
            <DialogDescription>{selectedAlert?.id} — {selectedAlert?.type}</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${alertStatusColor(selectedAlert.status)}`}>
                    {alertStatusIcon(selectedAlert.status)}
                    {selectedAlert.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedAlert.amount || 0)}</p>
                  <p className="text-[10px] text-muted-foreground">Monto involucrado</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedAlert.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo de Alerta</p>
                  <p>{selectedAlert.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Score de Riesgo</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${selectedAlert.riskScore > 80 ? "bg-sayo-red" : selectedAlert.riskScore > 60 ? "bg-sayo-orange" : "bg-sayo-green"}`} style={{ width: `${selectedAlert.riskScore}%` }} />
                    </div>
                    <span className="text-sm font-bold tabular-nums">{selectedAlert.riskScore}/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedAlert.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selectedAlert.assignedTo}</p>
                </div>
              </div>
              {/* Mock investigation notes */}
              <div className="p-3 rounded-lg border space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Notas de Investigación</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAlert.status === "investigando" ? "Caso bajo revisión. Se solicitó documentación adicional al cliente." :
                   selectedAlert.status === "escalada" ? "Escalada al Oficial PLD. Pendiente de revisión por comité." :
                   selectedAlert.status === "descartada" ? "Investigación concluida. Falso positivo confirmado." :
                   "Alerta pendiente de revisión inicial. Sin notas registradas."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedAlert?.status === "activa" && (
              <>
                <Button variant="outline" size="sm" className="text-sayo-blue" onClick={() => { setDetailOpen(false); handleInvestigar(selectedAlert) }}>
                  <ShieldAlert className="size-3.5 mr-1" /> Investigar
                </Button>
                <Button variant="outline" size="sm" className="text-sayo-orange" onClick={() => { setDetailOpen(false); handleEscalar(selectedAlert) }}>
                  <ArrowUpRight className="size-3.5 mr-1" /> Escalar
                </Button>
              </>
            )}
            {selectedAlert?.status === "investigando" && (
              <Button variant="outline" size="sm" className="text-sayo-orange" onClick={() => { setDetailOpen(false); handleEscalar(selectedAlert) }}>
                <ArrowUpRight className="size-3.5 mr-1" /> Escalar
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Confirmation Dialog */}
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-muted-foreground" />
              Descartar Alerta
            </DialogTitle>
            <DialogDescription>
              ¿Marcar esta alerta como falso positivo? Esta acción la eliminará de las alertas activas.
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alerta:</span>
                <span className="font-mono text-xs">{selectedAlert.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{selectedAlert.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{selectedAlert.type}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={confirmDiscard}>
              <XCircle className="size-3.5 mr-1" /> Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
