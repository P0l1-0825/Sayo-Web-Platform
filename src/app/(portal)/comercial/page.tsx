"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { comercialStats } from "@/lib/mock-data"

const pipelineValue = [
  { name: "Prospecto", value: 3200000 },
  { name: "Contactado", value: 5100000 },
  { name: "Evaluación", value: 8500000 },
  { name: "Aprobado", value: 6200000 },
  { name: "Dispersado", value: 2800000 },
]

const leadsBySource = [
  { name: "Web", value: 18 },
  { name: "Referido", value: 12 },
  { name: "Campaña", value: 8 },
  { name: "Orgánico", value: 6 },
  { name: "Alianza", value: 3 },
]

export default function ComercialDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Comercial</h1>
        <p className="text-sm text-muted-foreground">Pipeline comercial, leads y conversión</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comercialStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Pipeline por Etapa" description="Valor por fase del funnel" className="lg:col-span-2">
          <BarChartComponent data={pipelineValue} color="var(--chart-2)" formatY="currency" />
        </ChartCard>
        <ChartCard title="Leads por Fuente" description="Distribución de origen">
          <DonutChartComponent data={leadsBySource} />
        </ChartCard>
      </div>
    </div>
  )
}
