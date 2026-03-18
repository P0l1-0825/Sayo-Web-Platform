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
import { seguridadStats, useSecurityIncidents } from "@/hooks/use-security"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { SecurityIncident } from "@/lib/types"
import { getSeverityColor } from "@/lib/utils"
import { ShieldAlert, Eye, ArrowRight, Clock, CheckCircle, Server, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const loginAttempts = [
  { name: "00h", value: 5 },
  { name: "04h", value: 2 },
  { name: "08h", value: 45 },
  { name: "12h", value: 32 },
  { name: "16h", value: 38 },
  { name: "20h", value: 23 },
]

const incidentsByType = [
  { name: "Brute Force", value: 4 },
  { name: "Phishing", value: 2 },
  { name: "Certificados", value: 1 },
  { name: "DDoS", value: 1 },
  { name: "Otros", value: 2 },
]

const statusColor: Record<string, string> = {
  activo: "bg-red-100 text-red-700",
  investigando: "bg-blue-100 text-blue-700",
  contenido: "bg-yellow-100 text-yellow-700",
  resuelto: "bg-green-100 text-green-700",
}

export default function SeguridadDashboard() {
  const { data: fetchedIncidents, isLoading, error, refetch } = useSecurityIncidents()
  const [incidents, setIncidents] = React.useState<SecurityIncident[]>([])
  const [selectedIncident, setSelectedIncident] = React.useState<SecurityIncident | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  React.useEffect(() => { if (fetchedIncidents) setIncidents(fetchedIncidents) }, [fetchedIncidents])

  if (isLoading) return <DashboardSkeleton />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const activeIncidents = incidents.filter((i) => i.status !== "resuelto")

  const handleView = (inc: SecurityIncident) => {
    setSelectedIncident(inc)
    setDetailOpen(true)
  }

  const handleInvestigate = (inc: SecurityIncident) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === inc.id ? { ...i, status: "investigando" as const } : i))
    )
    toast.info("Investigando incidente", { description: `${inc.id} — ${inc.title}` })
    setDetailOpen(false)
  }

  const handleContain = (inc: SecurityIncident) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === inc.id ? { ...i, status: "contenido" as const } : i))
    )
    toast.success("Incidente contenido", { description: `${inc.id} — Amenaza aislada` })
    setDetailOpen(false)
  }

  const handleResolve = (inc: SecurityIncident) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === inc.id ? { ...i, status: "resuelto" as const, resolvedAt: new Date().toISOString() } : i))
    )
    toast.success("Incidente resuelto", { description: `${inc.id} — ${inc.title}` })
    setDetailOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Seguridad & IT</h1>
        <p className="text-sm text-muted-foreground">Monitoreo de seguridad — incidentes, logs y accesos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {seguridadStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Login Fallidos (24h)" description="Intentos por hora" className="lg:col-span-2">
          <AreaChartComponent data={loginAttempts} color="var(--chart-4)" />
        </ChartCard>
        <ChartCard title="Incidentes por Tipo" description="Últimos 30 días">
          <DonutChartComponent data={incidentsByType} />
        </ChartCard>
      </div>

      {/* Active Incidents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-sayo-red" />
            Incidentes Activos
          </h2>
          <Badge variant="outline">{activeIncidents.length} incidentes</Badge>
        </div>
        <div className="space-y-2">
          {activeIncidents.map((inc) => (
            <Card key={inc.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleView(inc)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`size-4 ${inc.severity === "critica" || inc.severity === "alta" ? "text-sayo-red" : "text-sayo-orange"}`} />
                  <span className="font-mono text-xs">{inc.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{inc.title}</p>
                  <p className="text-xs text-muted-foreground">{inc.type} • {inc.assignedTo} • {new Date(inc.detectedAt).toLocaleDateString("es-MX")}</p>
                </div>
                <Badge className={getSeverityColor(inc.severity)}>{inc.severity}</Badge>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[inc.status]}`}>
                  {inc.status}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleView(inc)} title="Ver detalle">
                    <Eye className="size-3.5" />
                  </Button>
                  {inc.status === "activo" && (
                    <Button variant="ghost" size="icon-xs" onClick={() => handleInvestigate(inc)} title="Investigar">
                      <ArrowRight className="size-3.5 text-sayo-blue" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {activeIncidents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="size-8 mx-auto mb-2 text-sayo-green" />
              <p className="text-sm">No hay incidentes activos</p>
              <p className="text-xs">Todos los incidentes han sido resueltos</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Incidente</DialogTitle>
            <DialogDescription>{selectedIncident?.id} — {selectedIncident?.title}</DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(selectedIncident.severity)}>{selectedIncident.severity}</Badge>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[selectedIncident.status]}`}>
                    {selectedIncident.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{new Date(selectedIncident.detectedAt).toLocaleString("es-MX")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p className="font-medium">{selectedIncident.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selectedIncident.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Detectado</p>
                  <p className="text-xs">{new Date(selectedIncident.detectedAt).toLocaleString("es-MX")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Resuelto</p>
                  <p className="text-xs">{selectedIncident.resolvedAt ? new Date(selectedIncident.resolvedAt).toLocaleString("es-MX") : "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Descripción</p>
                  <p className="text-sm">{selectedIncident.description}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Sistemas Afectados</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Server className="size-3 text-muted-foreground" />
                    {selectedIncident.affectedSystems.map((sys) => (
                      <Badge key={sys} variant="outline" className="text-[10px]">{sys}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedIncident?.status === "activo" && (
              <Button variant="outline" size="sm" className="text-sayo-blue" onClick={() => handleInvestigate(selectedIncident)}>
                <Eye className="size-3.5 mr-1" /> Investigar
              </Button>
            )}
            {selectedIncident?.status === "investigando" && (
              <Button variant="outline" size="sm" className="text-sayo-orange" onClick={() => handleContain(selectedIncident)}>
                <ShieldAlert className="size-3.5 mr-1" /> Contener
              </Button>
            )}
            {selectedIncident && selectedIncident.status !== "resuelto" && (
              <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => handleResolve(selectedIncident)}>
                <CheckCircle className="size-3.5 mr-1" /> Resolver
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
