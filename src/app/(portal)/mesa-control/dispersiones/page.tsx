"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/utils"
import { Send, Users, Clock, CheckCircle, Eye, Download } from "lucide-react"

const dispersiones = [
  { id: "DISP-045", name: "Nómina Quincenal Mar-1", type: "Nómina", beneficiarios: 35, total: 890000, procesados: 33, pendientes: 2, status: "en_proceso", date: "2024-03-06", hora: "10:15" },
  { id: "DISP-044", name: "Nómina Quincenal Feb-2", type: "Nómina", beneficiarios: 34, total: 865000, procesados: 34, pendientes: 0, status: "completada", date: "2024-02-29", hora: "10:00" },
  { id: "DISP-043", name: "Dispersión Créditos Feb", type: "Créditos", beneficiarios: 12, total: 3200000, procesados: 12, pendientes: 0, status: "completada", date: "2024-02-28", hora: "14:30" },
  { id: "DISP-042", name: "Comisiones Comercial Feb", type: "Comisiones", beneficiarios: 8, total: 145000, procesados: 8, pendientes: 0, status: "completada", date: "2024-02-27", hora: "16:00" },
  { id: "DISP-041", name: "Nómina Quincenal Feb-1", type: "Nómina", beneficiarios: 34, total: 862000, procesados: 34, pendientes: 0, status: "completada", date: "2024-02-15", hora: "10:00" },
]

const statusMap: Record<string, { label: string; color: string }> = {
  en_proceso: { label: "En Proceso", color: "bg-blue-100 text-blue-700" },
  completada: { label: "Completada", color: "bg-green-100 text-green-700" },
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  error: { label: "Error", color: "bg-red-100 text-red-700" },
}

export default function DispersionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dispersiones</h1>
          <p className="text-sm text-muted-foreground">Lotes de dispersión: nómina, créditos y comisiones</p>
        </div>
        <Button>
          <Send className="size-4 mr-1.5" />
          Nueva Dispersión
        </Button>
      </div>

      {/* Dispersión Cards */}
      <div className="space-y-3">
        {dispersiones.map((d) => {
          const status = statusMap[d.status]
          const progress = Math.round((d.procesados / d.beneficiarios) * 100)

          return (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{d.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {d.id} — {d.date} {d.hora}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Beneficiarios</p>
                      <div className="flex items-center gap-1 justify-center">
                        <Users className="size-3.5 text-muted-foreground" />
                        <p className="text-sm font-bold">{d.beneficiarios}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-bold">{formatMoney(d.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Progreso</p>
                      <div className="flex items-center gap-1 justify-center">
                        {progress === 100 ? (
                          <CheckCircle className="size-3.5 text-sayo-green" />
                        ) : (
                          <Clock className="size-3.5 text-sayo-blue" />
                        )}
                        <p className="text-sm font-bold">{progress}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                {d.status === "en_proceso" && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sayo-blue transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {d.procesados} de {d.beneficiarios} procesados — {d.pendientes} pendientes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
