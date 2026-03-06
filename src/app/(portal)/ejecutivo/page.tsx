"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { ejecutivoStats, revenuetrend, productDistribution } from "@/lib/mock-data"

export default function EjecutivoDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard Ejecutivo</h1>
        <p className="text-sm text-muted-foreground">Vista C-Level — P&L, AUM, usuarios y satisfacción</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ejecutivoStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Ingresos vs Gastos" description="Tendencia 6 meses" className="lg:col-span-2">
          <AreaChartComponent data={revenuetrend} color="var(--chart-2)" secondaryDataKey="gastos" secondaryColor="var(--chart-4)" formatY="currency" />
        </ChartCard>
        <ChartCard title="Distribución por Producto" description="Usuarios activos">
          <DonutChartComponent data={productDistribution} />
        </ChartCard>
      </div>
    </div>
  )
}
