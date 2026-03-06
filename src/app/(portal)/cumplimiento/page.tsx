"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cumplimientoStats, complianceAlerts } from "@/lib/mock-data"
import { getSeverityColor } from "@/lib/utils"
import { AlertTriangle, Eye, ArrowRight } from "lucide-react"

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

export default function CumplimientoDashboard() {
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

      <div>
        <h2 className="text-sm font-semibold mb-3">Alertas Recientes</h2>
        <div className="space-y-2">
          {complianceAlerts.slice(0, 4).map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`size-4 ${alert.severity === "alta" ? "text-sayo-red" : "text-sayo-orange"}`} />
                  <span className="font-mono text-xs">{alert.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.type}</p>
                  <p className="text-xs text-muted-foreground">{alert.clientName} — {alert.date}</p>
                </div>
                <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  alert.status === "activa" ? "bg-red-100 text-red-700" :
                  alert.status === "investigando" ? "bg-blue-100 text-blue-700" :
                  alert.status === "escalada" ? "bg-purple-100 text-purple-700" :
                  "bg-green-100 text-green-700"
                }`}>{alert.status}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon-xs"><ArrowRight className="size-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
