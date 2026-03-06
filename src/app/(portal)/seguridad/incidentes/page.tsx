"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { securityIncidents } from "@/lib/mock-data"
import { getSeverityColor } from "@/lib/utils"
import { ShieldAlert, Clock, Eye, CheckCircle, Server } from "lucide-react"

const statusMap: Record<string, { label: string; color: string; icon: typeof ShieldAlert }> = {
  activo: { label: "Activo", color: "bg-red-100 text-red-700", icon: ShieldAlert },
  investigando: { label: "Investigando", color: "bg-blue-100 text-blue-700", icon: Eye },
  contenido: { label: "Contenido", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  resuelto: { label: "Resuelto", color: "bg-green-100 text-green-700", icon: CheckCircle },
}

export default function IncidentesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Incidentes de Seguridad</h1>
        <p className="text-sm text-muted-foreground">Gestión de incidentes — severidad, estado, sistemas afectados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{securityIncidents.length}</p><p className="text-xs text-muted-foreground">Total Incidentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-red">{securityIncidents.filter(i => i.status === "activo").length}</p><p className="text-xs text-muted-foreground">Activos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-orange">{securityIncidents.filter(i => i.status === "investigando" || i.status === "contenido").length}</p><p className="text-xs text-muted-foreground">En Proceso</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-green">{securityIncidents.filter(i => i.status === "resuelto").length}</p><p className="text-xs text-muted-foreground">Resueltos</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {securityIncidents.map((inc) => {
          const statusInfo = statusMap[inc.status]
          const StatusIcon = statusInfo?.icon || ShieldAlert
          return (
            <Card key={inc.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <StatusIcon className={`size-5 mt-0.5 ${inc.severity === "critica" || inc.severity === "alta" ? "text-sayo-red" : "text-sayo-orange"}`} />
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
                      <span className="text-xs text-muted-foreground">Sistemas afectados:</span>
                      {inc.affectedSystems.map((sys) => (
                        <Badge key={sys} variant="outline" className="text-[10px]">{sys}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Ver Detalle</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
