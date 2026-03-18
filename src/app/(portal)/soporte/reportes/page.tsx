"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Clock, CheckCircle, AlertTriangle, TrendingUp, Headphones } from "lucide-react"

interface ReporteSoporte { periodo: string; ticketsRecibidos: number; ticketsResueltos: number; tiempoPromedio: string; sla: number; topIssues: { issue: string; count: number }[] }

const demoReportes: ReporteSoporte[] = [
  { periodo: "Marzo 2026", ticketsRecibidos: 342, ticketsResueltos: 318, tiempoPromedio: "2.4h", sla: 94.2, topIssues: [{ issue: "Estado de cuenta", count: 45 }, { issue: "Problemas de acceso", count: 38 }, { issue: "Consulta de saldo", count: 32 }, { issue: "Aclaración de cargo", count: 28 }, { issue: "Cambio de datos", count: 22 }] },
  { periodo: "Febrero 2026", ticketsRecibidos: 298, ticketsResueltos: 285, tiempoPromedio: "2.8h", sla: 92.1, topIssues: [{ issue: "Problemas de acceso", count: 42 }, { issue: "Estado de cuenta", count: 35 }, { issue: "Aclaración de cargo", count: 30 }, { issue: "Consulta de saldo", count: 25 }, { issue: "Soporte técnico", count: 20 }] },
  { periodo: "Enero 2026", ticketsRecibidos: 275, ticketsResueltos: 268, tiempoPromedio: "3.1h", sla: 90.5, topIssues: [{ issue: "Estado de cuenta", count: 40 }, { issue: "Consulta de saldo", count: 35 }, { issue: "Problemas de acceso", count: 28 }, { issue: "Soporte técnico", count: 22 }, { issue: "Cambio de datos", count: 18 }] },
]

export default function ReportesSoportePage() {
  const current = demoReportes[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Reportes de Soporte</h1>
        <p className="text-sm text-muted-foreground">Volumen, resolución, SLA y principales incidencias</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Headphones className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{current.ticketsRecibidos}</p><p className="text-xs text-muted-foreground">Tickets Recibidos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{current.ticketsResueltos}</p><p className="text-xs text-muted-foreground">Resueltos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{current.tiempoPromedio}</p><p className="text-xs text-muted-foreground">Tiempo Promedio</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{current.sla}%</p><p className="text-xs text-muted-foreground">Cumplimiento SLA</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="size-4" /> Top Incidencias — {current.periodo}</h2>
          <div className="space-y-3">
            {current.topIssues.map((issue, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                  <span className="text-sm">{issue.issue}</span>
                </div>
                <Badge variant="outline" className="text-[10px] tabular-nums">{issue.count} tickets</Badge>
              </div>
            ))}
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="size-4" /> Tendencia Mensual</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2">Período</th><th className="pb-2">Recibidos</th><th className="pb-2">Resueltos</th><th className="pb-2">T. Prom.</th><th className="pb-2">SLA</th>
              </tr></thead>
              <tbody>{demoReportes.map((r) => (
                <tr key={r.periodo} className="border-b last:border-0">
                  <td className="py-2 font-medium">{r.periodo}</td>
                  <td className="py-2 tabular-nums">{r.ticketsRecibidos}</td>
                  <td className="py-2 tabular-nums text-sayo-green">{r.ticketsResueltos}</td>
                  <td className="py-2">{r.tiempoPromedio}</td>
                  <td className="py-2"><span className={`font-semibold ${r.sla >= 93 ? "text-sayo-green" : r.sla >= 90 ? "text-sayo-orange" : "text-sayo-red"}`}>{r.sla}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
