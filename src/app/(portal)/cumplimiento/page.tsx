"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
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
import { cumplimientoStats, useComplianceAlerts } from "@/hooks/use-compliance"
import { useRealtimeAlerts } from "@/lib/realtime"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney, getSeverityColor } from "@/lib/utils"
import type { ComplianceAlert } from "@/lib/types"
import { AlertTriangle, Eye, ArrowUpRight, ShieldAlert, CheckCircle, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"

const riskTrend = [
  { name: "Oct", value: 65 },
  { name: "Nov", value: 70 },
  { name: "Dic", value: 68 },
  { name: "Ene", value: 72 },
  { name: "Feb", value: 75 },
  { name: "Mar", value: 72 },
]

const alertsByType = [
  { name: "Op. Inusual", value: 5 },
  { name: "Structuring", value: 3 },
  { name: "PEP", value: 2 },
  { name: "País riesgo", value: 1 },
  { name: "Atípico", value: 1 },
]

const alertStatusColor = (status: string) => {
  switch (status) {
    case "activa": return "bg-red-100 text-red-700"
    case "investigando": return "bg-blue-100 text-blue-700"
    case "escalada": return "bg-purple-100 text-purple-700"
    case "descartada": return "bg-green-100 text-green-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function CumplimientoDashboard() {
  const { data: fetchedAlerts, isLoading, error, refetch } = useComplianceAlerts()
  const [alerts, setAlerts] = React.useState<ComplianceAlert[]>([])
  const [selectedAlert, setSelectedAlert] = React.useState<ComplianceAlert | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  React.useEffect(() => { if (fetchedAlerts) setAlerts(fetchedAlerts) }, [fetchedAlerts])

  // Real-time: auto-refresh on new compliance alerts
  const { newAlertCount } = useRealtimeAlerts(() => {
    refetch()
    toast.warning("Nueva alerta PLD detectada", { duration: 5000 })
  })

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

  const recentAlerts = alerts.filter((a) => a.status !== "descartada").slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cumplimiento PLD/FT</h1>
        <p className="text-sm text-muted-foreground">Prevención de lavado de dinero — monitoreo y alertas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cumplimientoStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Score de Riesgo Global" description="Tendencia 6 meses" className="lg:col-span-2">
          <AreaChartComponent data={riskTrend} color="var(--chart-4)" />
        </ChartCard>
        <ChartCard title="Alertas por Tipo" description="Distribución actual">
          <DonutChartComponent data={alertsByType} />
        </ChartCard>
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Alertas Recientes</h2>
          <div className="flex items-center gap-2">
            {newAlertCount > 0 && <Badge className="bg-red-500 text-white animate-pulse">{newAlertCount} nuevas</Badge>}
            <Badge variant="outline">{alerts.filter((a) => a.status === "activa").length} activas</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(alert)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`size-4 ${alert.severity === "alta" || alert.severity === "critica" ? "text-sayo-red" : "text-sayo-orange"}`} />
                  <span className="font-mono text-xs">{alert.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.type}</p>
                  <p className="text-xs text-muted-foreground">{alert.clientName} — {alert.date}</p>
                </div>
                <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${alertStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleView(alert)} title="Ver detalle">
                    <Eye className="size-3.5" />
                  </Button>
                  {alert.status === "activa" && (
                    <>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleInvestigar(alert)} title="Investigar">
                        <ShieldAlert className="size-3.5 text-sayo-blue" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleEscalar(alert)} title="Escalar">
                        <ArrowUpRight className="size-3.5 text-sayo-orange" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${alertStatusColor(selectedAlert.status)}`}>
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
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p>{selectedAlert.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Score de Riesgo</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${selectedAlert.riskScore > 80 ? "bg-sayo-red" : selectedAlert.riskScore > 60 ? "bg-sayo-orange" : "bg-sayo-green"}`} style={{ width: `${selectedAlert.riskScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{selectedAlert.riskScore}/100</span>
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
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
