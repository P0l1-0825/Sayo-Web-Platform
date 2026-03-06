"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { marketingStats, campaigns } from "@/lib/mock-data"
import { Eye, Rocket } from "lucide-react"

const campaignPerformance = [
  { name: "Bienvenida", value: 32, conversiones: 2.0 },
  { name: "Crédito Push", value: 35, conversiones: 1.7 },
  { name: "Pago SMS", value: 95, conversiones: 40.0 },
  { name: "Marketplace", value: 0, conversiones: 0 },
  { name: "Black Friday", value: 42, conversiones: 4.0 },
]

const channelBreakdown = [
  { name: "Email", value: 2 },
  { name: "Push", value: 1 },
  { name: "SMS", value: 1 },
  { name: "In-App", value: 1 },
]

const statusColor: Record<string, string> = {
  activa: "bg-green-100 text-green-700",
  pausada: "bg-yellow-100 text-yellow-700",
  finalizada: "bg-gray-100 text-gray-500",
  borrador: "bg-gray-100 text-gray-500",
  programada: "bg-purple-100 text-purple-700",
}

export default function MarketingDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Marketing & Notificaciones</h1>
        <p className="text-sm text-muted-foreground">Campañas, notificaciones push, email y SMS</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Tasa Apertura por Campaña" description="% de apertura" className="lg:col-span-2">
          <BarChartComponent data={campaignPerformance} dataKey="value" color="var(--chart-1)" />
        </ChartCard>
        <ChartCard title="Por Canal" description="Distribución de campañas">
          <DonutChartComponent data={channelBreakdown} />
        </ChartCard>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Campañas</h2>
        <div className="space-y-2">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Rocket className="size-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{c.id}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{c.name}</p>
                    <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Audiencia: {c.audience.toLocaleString()} • Enviados: {c.sent.toLocaleString()} • Abiertos: {c.opened.toLocaleString()} • Conversiones: {c.converted.toLocaleString()}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[c.status]}`}>{c.status}</span>
                <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
