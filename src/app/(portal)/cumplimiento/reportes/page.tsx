"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cnbvReports } from "@/lib/mock-data"
import { FileText, Plus, Send, Download, Eye } from "lucide-react"

const statusMap: Record<string, { label: string; color: string }> = {
  borrador: { label: "Borrador", color: "bg-yellow-100 text-yellow-700" },
  enviado: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
  aceptado: { label: "Aceptado", color: "bg-green-100 text-green-700" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700" },
}

export default function ReportesCNBVPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Reportes CNBV</h1>
          <p className="text-sm text-muted-foreground">ROIs, ROPs y reportes de operaciones 24h</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Generar Reporte</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-muted-foreground">Total Reportes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-green">2</p>
            <p className="text-xs text-muted-foreground">Enviados / Aceptados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-orange">1</p>
            <p className="text-xs text-muted-foreground">Borradores</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {cnbvReports.map((r) => {
          const status = statusMap[r.status]
          return (
            <Card key={r.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{r.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.type} — {r.period}</p>
                  <p className="text-xs text-muted-foreground">{r.date} • {r.alertCount} alertas incluidas</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                  {status.label}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
                  {r.status === "borrador" && (
                    <Button variant="ghost" size="icon-xs"><Send className="size-3.5 text-sayo-blue" /></Button>
                  )}
                  <Button variant="ghost" size="icon-xs"><Download className="size-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
