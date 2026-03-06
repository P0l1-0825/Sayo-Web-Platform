"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { adminStats, monthlyTrend6M, productDistribution } from "@/lib/mock-data"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Admin & Configuración</h1>
        <p className="text-sm text-muted-foreground">Administración del sistema — usuarios, roles, catálogos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Crecimiento Usuarios" description="Últimos 6 meses" className="lg:col-span-2">
          <AreaChartComponent data={monthlyTrend6M} color="var(--chart-1)" />
        </ChartCard>
        <ChartCard title="Por Producto" description="Distribución de cuentas">
          <DonutChartComponent data={productDistribution} />
        </ChartCard>
      </div>
    </div>
  )
}
