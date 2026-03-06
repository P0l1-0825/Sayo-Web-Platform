"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { cobranzaStats } from "@/lib/mock-data"

const moraTrend = [
  { name: "Oct", value: 14200000 },
  { name: "Nov", value: 13800000 },
  { name: "Dic", value: 15100000 },
  { name: "Ene", value: 13500000 },
  { name: "Feb", value: 12900000 },
  { name: "Mar", value: 12450000 },
]

const moraDistribution = [
  { name: "0-30 días", value: 5200000 },
  { name: "31-60 días", value: 3100000 },
  { name: "61-90 días", value: 2050000 },
  { name: "90+ días", value: 2100000 },
]

export default function CobranzaDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cobranza</h1>
        <p className="text-sm text-muted-foreground">Gestión de cartera vencida y recuperación</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cobranzaStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Cartera Vencida" description="Tendencia 6 meses" className="lg:col-span-2">
          <BarChartComponent data={moraTrend} color="var(--chart-4)" formatY="currency" />
        </ChartCard>
        <ChartCard title="Distribución por Mora" description="Días de atraso">
          <DonutChartComponent data={moraDistribution} />
        </ChartCard>
      </div>
    </div>
  )
}
