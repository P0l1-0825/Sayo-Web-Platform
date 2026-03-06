"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { revenuetrend, monthlyTrend6M, ejecutivoStats, kpis } from "@/lib/mock-data"
import { formatMoney } from "@/lib/utils"
import { Download, Presentation, TrendingUp, TrendingDown, Users, Heart, DollarSign, Building } from "lucide-react"

export default function BoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Board Ejecutivo</h1>
          <p className="text-sm text-muted-foreground">Resumen para consejo directivo — Marzo 2024</p>
        </div>
        <Button variant="outline"><Download className="size-4 mr-1.5" /> Exportar</Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="size-4 text-green-700" />
              <span className="text-xs text-green-700 font-medium">Ingresos Netos</span>
            </div>
            <p className="text-xl font-bold text-green-900">{formatMoney(12_450_000)}</p>
            <p className="text-xs text-green-600 flex items-center gap-0.5"><TrendingUp className="size-3" /> +14.2% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="size-4 text-blue-700" />
              <span className="text-xs text-blue-700 font-medium">AUM</span>
            </div>
            <p className="text-xl font-bold text-blue-900">$2,340M</p>
            <p className="text-xs text-blue-600 flex items-center gap-0.5"><TrendingUp className="size-3" /> +8.7%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-4 text-purple-700" />
              <span className="text-xs text-purple-700 font-medium">Usuarios Activos</span>
            </div>
            <p className="text-xl font-bold text-purple-900">48,500</p>
            <p className="text-xs text-purple-600 flex items-center gap-0.5"><TrendingUp className="size-3" /> +22.1%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="size-4 text-orange-700" />
              <span className="text-xs text-orange-700 font-medium">NPS</span>
            </div>
            <p className="text-xl font-bold text-orange-900">72</p>
            <p className="text-xs text-orange-600 flex items-center gap-0.5"><TrendingUp className="size-3" /> +5 pts</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <ChartCard title="Ingresos vs Gastos — 6 Meses" description="Tendencia de P&L">
        <AreaChartComponent data={revenuetrend} color="var(--chart-2)" secondaryDataKey="gastos" secondaryColor="var(--chart-4)" formatY="currency" />
      </ChartCard>

      {/* KPI Summary */}
      <div>
        <h2 className="text-sm font-semibold mb-3">KPIs Clave — Semáforo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`size-3 rounded-full ${
                  kpi.status === "verde" ? "bg-green-500" :
                  kpi.status === "amarillo" ? "bg-yellow-500" :
                  "bg-red-500"
                }`} />
                <div className="flex-1">
                  <p className="text-xs font-medium">{kpi.name}</p>
                  <p className="text-xs text-muted-foreground">{kpi.actual} / {kpi.target} {kpi.unit}</p>
                </div>
                {kpi.trend === "up" ? <TrendingUp className="size-3 text-green-600" /> :
                 kpi.trend === "down" ? <TrendingDown className="size-3 text-red-600" /> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Growth Chart */}
      <ChartCard title="Crecimiento de Usuarios" description="Usuarios activos mensuales — 6 meses">
        <AreaChartComponent data={monthlyTrend6M} color="var(--chart-3)" />
      </ChartCard>
    </div>
  )
}
