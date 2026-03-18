"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useSecurityIncidents } from "@/hooks/use-security"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { SecurityIncident, IncidentSeverity } from "@/lib/types"
import { getSeverityColor } from "@/lib/utils"
import { ShieldAlert, Clock, Eye, CheckCircle, Server, Plus, Search, ArrowLeft, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const statusMap: Record<string, { label: string; color: string; icon: typeof ShieldAlert }> = {
  activo: { label: "Activo", color: "bg-red-100 text-red-700", icon: ShieldAlert },
  investigando: { label: "Investigando", color: "bg-blue-100 text-blue-700", icon: Eye },
  contenido: { label: "Contenido", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  resuelto: { label: "Resuelto", color: "bg-green-100 text-green-700", icon: CheckCircle },
}

const incidentTypes = ["Brute Force", "Phishing", "DDoS", "Certificate", "Malware", "Data Breach", "Unauthorized Access", "Otro"]
const severities: IncidentSeverity[] = ["critica", "alta", "media", "baja"]
const systemOptions = ["Auth Service", "API Gateway", "Core Banking", "Database", "CDN", "Payment Service", "Web Portal", "App Mobile"]

export default function IncidentesPage() {
  const { data: fetchedIncidents, isLoading, error, refetch } = useSecurityIncidents()
  const [incidents, setIncidents] = React.useState<SecurityIncident[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => { if (fetchedIncidents) setIncidents(fetchedIncidents) }, [fetchedIncidents])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [selectedIncident, setSelectedIncident] = React.useState<SecurityIncident | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    title: "",
    description: "",
    type: "Brute Force",
    severity: "media" as IncidentSeverity,
    assignedTo: "",
    affectedSystems: [] as string[],
  })

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch = searchTerm === "" ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || inc.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const toggleSystem = (sys: string) => {
    setNewForm((prev) => ({
      ...prev,
      affectedSystems: prev.affectedSystems.includes(sys)
        ? prev.affectedSystems.filter((s) => s !== sys)
        : [...prev.affectedSystems, sys],
    }))
  }

  const handleNewIncident = () => {
    if (!newForm.title || !newForm.description || !newForm.assignedTo) {
      toast.error("Completa los campos requeridos")
      return
    }
    const newInc: SecurityIncident = {
      id: `INC-${String(incidents.length + 1).padStart(3, "0")}`,
      title: newForm.title,
      description: newForm.description,
      severity: newForm.severity,
      status: "activo",
      type: newForm.type,
      detectedAt: new Date().toISOString(),
      assignedTo: newForm.assignedTo,
      affectedSystems: newForm.affectedSystems.length > 0 ? newForm.affectedSystems : ["Sin especificar"],
    }
    setIncidents([newInc, ...incidents])
    setNewOpen(false)
    setNewForm({ title: "", description: "", type: "Brute Force", severity: "media", assignedTo: "", affectedSystems: [] })
    toast.success("Incidente registrado", { description: `${newInc.id} — ${newInc.title}` })
  }

  const statusCounts = {
    activo: incidents.filter((i) => i.status === "activo").length,
    investigando: incidents.filter((i) => i.status === "investigando").length,
    contenido: incidents.filter((i) => i.status === "contenido").length,
    resuelto: incidents.filter((i) => i.status === "resuelto").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Incidentes de Seguridad</h1>
          <p className="text-sm text-muted-foreground">Gestión de incidentes — severidad, estado, sistemas afectados</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Registrar Incidente
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="size-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{incidents.length}</p>
            <p className="text-xs text-muted-foreground">Total Incidentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldAlert className="size-5 mx-auto text-sayo-red mb-1" />
            <p className="text-2xl font-bold text-sayo-red">{statusCounts.activo}</p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="size-5 mx-auto text-sayo-blue mb-1" />
            <p className="text-2xl font-bold text-sayo-blue">{statusCounts.investigando + statusCounts.contenido}</p>
            <p className="text-xs text-muted-foreground">En Proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="size-5 mx-auto text-sayo-green mb-1" />
            <p className="text-2xl font-bold text-sayo-green">{statusCounts.resuelto}</p>
            <p className="text-xs text-muted-foreground">Resueltos</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Status Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar incidentes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(statusMap) as [string, { label: string; color: string }][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? null : key)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                statusFilter === key ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {val.label} ({statusCounts[key as keyof typeof statusCounts]})
            </button>
          ))}
        </div>

        {statusFilter && (
          <button
            onClick={() => setStatusFilter(null)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="size-3" /> Todos los incidentes
          </button>
        )}
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredIncidents.map((inc) => {
          const statusInfo = statusMap[inc.status]
          const StatusIcon = statusInfo?.icon || ShieldAlert
          return (
            <Card key={inc.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleView(inc)}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <StatusIcon className={`size-5 mt-0.5 shrink-0 ${inc.severity === "critica" || inc.severity === "alta" ? "text-sayo-red" : "text-sayo-orange"}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                      <h3 className="text-sm font-semibold">{inc.title}</h3>
                      <Badge className={getSeverityColor(inc.severity)}>{inc.severity}</Badge>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{inc.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Tipo: <strong>{inc.type}</strong></span>
                      <span>Detectado: <strong>{new Date(inc.detectedAt).toLocaleString("es-MX")}</strong></span>
                      <span>Asignado: <strong>{inc.assignedTo}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Server className="size-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Sistemas:</span>
                      {inc.affectedSystems.map((sys) => (
                        <Badge key={sys} variant="outline" className="text-[10px]">{sys}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {inc.status === "activo" && (
                      <Button variant="outline" size="sm" onClick={() => handleInvestigate(inc)}>
                        <Eye className="size-3.5 mr-1" /> Investigar
                      </Button>
                    )}
                    {inc.status === "investigando" && (
                      <Button variant="outline" size="sm" onClick={() => handleContain(inc)}>
                        <ShieldAlert className="size-3.5 mr-1" /> Contener
                      </Button>
                    )}
                    {inc.status !== "resuelto" && (
                      <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => handleResolve(inc)}>
                        <CheckCircle className="size-3.5 mr-1" /> Resolver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredIncidents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldAlert className="size-8 mx-auto mb-2" />
            <p className="text-sm">No se encontraron incidentes</p>
            <p className="text-xs">Intenta con otra búsqueda o filtro</p>
          </div>
        )}
      </div>

      {/* Incident Detail Dialog */}
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
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[selectedIncident.status]?.color}`}>
                    {statusMap[selectedIncident.status]?.label}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px]">{selectedIncident.type}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p className="font-medium">{selectedIncident.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Detectado</p>
                  <p className="text-xs">{new Date(selectedIncident.detectedAt).toLocaleString("es-MX")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Resuelto</p>
                  <p className="text-xs">{selectedIncident.resolvedAt ? new Date(selectedIncident.resolvedAt).toLocaleString("es-MX") : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Duración</p>
                  <p className="text-xs">
                    {selectedIncident.resolvedAt
                      ? `${Math.round((new Date(selectedIncident.resolvedAt).getTime() - new Date(selectedIncident.detectedAt).getTime()) / 3600000)}h`
                      : `${Math.round((Date.now() - new Date(selectedIncident.detectedAt).getTime()) / 3600000)}h (en curso)`
                    }
                  </p>
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

              {/* Status Progress */}
              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Progreso del Incidente</p>
                <div className="flex items-center gap-1">
                  {["activo", "investigando", "contenido", "resuelto"].map((step, i) => {
                    const stepOrder = ["activo", "investigando", "contenido", "resuelto"]
                    const currentIdx = stepOrder.indexOf(selectedIncident.status)
                    const isActive = i <= currentIdx
                    return (
                      <React.Fragment key={step}>
                        {i > 0 && <div className={`flex-1 h-0.5 ${isActive ? "bg-sayo-green" : "bg-muted"}`} />}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${
                          isActive ? statusMap[step]?.color : "bg-muted text-muted-foreground"
                        }`}>
                          {statusMap[step]?.label}
                        </div>
                      </React.Fragment>
                    )
                  })}
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

      {/* New Incident Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Incidente</DialogTitle>
            <DialogDescription>Crear nuevo incidente de seguridad</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título *</label>
              <Input placeholder="Ej: Intento de acceso no autorizado" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción *</label>
              <Input placeholder="Detalle del incidente..." value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo de Incidente</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {incidentTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewForm({ ...newForm, type: t })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.type === t ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Severidad</label>
              <div className="flex gap-2 mt-1">
                {severities.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewForm({ ...newForm, severity: s })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.severity === s ? getSeverityColor(s) : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asignado a *</label>
              <Input placeholder="Nombre del responsable" value={newForm.assignedTo} onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Sistemas Afectados</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {systemOptions.map((sys) => (
                  <button
                    key={sys}
                    onClick={() => toggleSystem(sys)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.affectedSystems.includes(sys) ? "bg-sayo-blue text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewIncident}>
              <Plus className="size-3.5 mr-1" /> Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
