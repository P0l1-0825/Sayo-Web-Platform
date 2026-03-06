"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileSearch, Clock, CheckCircle, AlertTriangle, Eye, Plus } from "lucide-react"

const investigations = [
  { id: "INV-001", alertId: "ALE-002", title: "Structuring — Empresa Fantasma SA", status: "en_curso", priority: "alta", openDate: "2024-03-05", assignedTo: "Ana García", daysOpen: 1, actions: 3, documents: 5 },
  { id: "INV-002", alertId: "ALE-004", title: "Transferencia país GAFI — Int. Trading LLC", status: "en_curso", priority: "critica", openDate: "2024-03-04", assignedTo: "Ana García", daysOpen: 2, actions: 5, documents: 8 },
  { id: "INV-003", alertId: "ALE-010", title: "Operación inusual — Jorge Méndez", status: "cerrada", priority: "media", openDate: "2024-02-15", assignedTo: "Miguel Ángeles", daysOpen: 15, actions: 8, documents: 12 },
  { id: "INV-004", alertId: "ALE-008", title: "PEP Identificado — Funcionario estatal", status: "cerrada", priority: "alta", openDate: "2024-02-01", assignedTo: "Ana García", daysOpen: 20, actions: 12, documents: 18 },
]

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  en_curso: { label: "En Curso", color: "bg-blue-100 text-blue-700", icon: <Clock className="size-3.5 text-sayo-blue" /> },
  cerrada: { label: "Cerrada", color: "bg-green-100 text-green-700", icon: <CheckCircle className="size-3.5 text-sayo-green" /> },
  escalada: { label: "Escalada", color: "bg-purple-100 text-purple-700", icon: <AlertTriangle className="size-3.5 text-sayo-purple" /> },
}

export default function InvestigacionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Investigaciones</h1>
          <p className="text-sm text-muted-foreground">Casos de investigación PLD/FT — timeline, documentos y resolución</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Nueva Investigación</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-blue">2</p>
            <p className="text-xs text-muted-foreground">En Curso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-green">2</p>
            <p className="text-xs text-muted-foreground">Cerradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">6.5 días</p>
            <p className="text-xs text-muted-foreground">Tiempo promedio resolución</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {investigations.map((inv) => {
          const status = statusMap[inv.status]
          return (
            <Card key={inv.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    {status.icon}
                    <span className="font-mono text-xs">{inv.id}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{inv.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{inv.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alerta: {inv.alertId} • Abierta: {inv.openDate} • {inv.daysOpen} días • Asignado: {inv.assignedTo}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-center">
                    <div>
                      <p className="text-muted-foreground">Acciones</p>
                      <p className="font-bold">{inv.actions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Docs</p>
                      <p className="font-bold">{inv.documents}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm"><Eye className="size-3.5 mr-1" /> Ver</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
