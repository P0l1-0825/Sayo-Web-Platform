"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { seguridadStats, securityIncidents } from "@/lib/mock-data"
import { getSeverityColor } from "@/lib/utils"
import { ShieldAlert, Eye, ArrowRight } from "lucide-react"

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

export default function SeguridadDashboard() {
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

      <div>
        <h2 className="text-sm font-semibold mb-3">Incidentes Activos</h2>
        <div className="space-y-2">
          {securityIncidents.map((inc) => (
            <Card key={inc.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`size-4 ${inc.severity === "critica" || inc.severity === "alta" ? "text-sayo-red" : "text-sayo-orange"}`} />
                  <span className="font-mono text-xs">{inc.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{inc.title}</p>
                  <p className="text-xs text-muted-foreground">{inc.description}</p>
                </div>
                <Badge className={getSeverityColor(inc.severity)}>{inc.severity}</Badge>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  inc.status === "activo" ? "bg-red-100 text-red-700" :
                  inc.status === "investigando" ? "bg-blue-100 text-blue-700" :
                  inc.status === "contenido" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>{inc.status}</span>
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
