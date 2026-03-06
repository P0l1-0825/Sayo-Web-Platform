"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { soporteStats } from "@/lib/mock-data"
import { channelDistribution } from "@/lib/mock-data"

const ticketsTrend = [
  { name: "Lun", value: 28, resueltos: 25 },
  { name: "Mar", value: 32, resueltos: 30 },
  { name: "Mié", value: 25, resueltos: 24 },
  { name: "Jue", value: 35, resueltos: 31 },
  { name: "Vie", value: 23, resueltos: 20 },
]

export default function SoporteDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Soporte & UNE</h1>
        <p className="text-sm text-muted-foreground">Atención al cliente — tickets, SLA y satisfacción</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {soporteStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Tickets Semana" description="Abiertos vs resueltos" className="lg:col-span-2">
          <BarChartComponent data={ticketsTrend} dataKey="value" secondaryDataKey="resueltos" color="var(--chart-4)" secondaryColor="var(--chart-2)" />
        </ChartCard>
        <ChartCard title="Por Canal" description="Distribución de tickets">
          <DonutChartComponent data={channelDistribution} />
        </ChartCard>
      </div>
    </div>
  )
}
