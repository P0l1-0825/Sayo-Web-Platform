"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { ejecutivoStats, revenuetrend, usePnL, useKPIs } from "@/hooks/use-executive"
import { productDistribution } from "@/hooks/use-accounts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import { TrendingUp, TrendingDown, Target, ArrowRight, Download, Eye } from "lucide-react"
import { toast } from "sonner"

const periodOptions = ["Último Mes", "Último Trimestre", "YTD", "12 Meses"]

export default function EjecutivoDashboard() {
  const { data: pnlItems, isLoading: pnlLoading, error: pnlError, refetch: refetchPnl } = usePnL()
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch: refetchKpis } = useKPIs()
  const [period, setPeriod] = React.useState("Último Mes")
  const [productDialogOpen, setProductDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<{ name: string; value: number } | null>(null)
  const [kpiDialogOpen, setKpiDialogOpen] = React.useState(false)

  if (pnlLoading || kpisLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (pnlError) return <ErrorCard message={pnlError} onRetry={refetchPnl} />
  if (kpisError) return <ErrorCard message={kpisError} onRetry={refetchKpis} />
  if (!pnlItems || !kpis) return null

  const ingresos = pnlItems.filter((i) => i.category === "Ingresos")
  const gastos = pnlItems.filter((i) => i.category === "Gastos")
  const totalIngresosMes = ingresos.reduce((s, i) => s + i.currentMonth, 0)
  const totalGastosMes = gastos.reduce((s, i) => s + i.currentMonth, 0)
  const utilidadNeta = totalIngresosMes - totalGastosMes
  const margen = ((utilidadNeta / totalIngresosMes) * 100).toFixed(1)

  const totalUsers = productDistribution.reduce((s, p) => s + p.value, 0)

  const handleProductClick = (product: { name: string; value: number }) => {
    setSelectedProduct(product)
    setProductDialogOpen(true)
  }

  const handleExportDashboard = () => {
    const headers = ["Métrica", "Valor", "Cambio %"]
    const rows = ejecutivoStats.map((s) => [s.title, String(s.value), s.change ? `${s.change}%` : "—"])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dashboard_ejecutivo.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Dashboard exportado", { description: "dashboard_ejecutivo.csv" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard Ejecutivo</h1>
          <p className="text-sm text-muted-foreground">Vista C-Level — P&L, AUM, usuarios y satisfacción</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportDashboard}>
            <Download className="size-3.5 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {periodOptions.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPeriod(p)
              toast.info(`Período: ${p}`, { description: "Datos actualizados" })
            }}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              period === p ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ejecutivoStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* P&L Summary Strip */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Ingresos</p>
              <p className="text-lg font-bold text-sayo-green">{formatMoney(totalIngresosMes)}</p>
            </div>
            <div className="text-muted-foreground">—</div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Gastos</p>
              <p className="text-lg font-bold text-sayo-red">{formatMoney(totalGastosMes)}</p>
            </div>
            <div className="text-muted-foreground">=</div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Utilidad Neta</p>
              <p className="text-lg font-bold">{formatMoney(utilidadNeta)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">Margen: {margen}%</Badge>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.location.href = "/ejecutivo/pnl"}>
              Ver P&L <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Ingresos vs Gastos" description={`Tendencia — ${period}`} className="lg:col-span-2">
          <AreaChartComponent data={revenuetrend} color="var(--chart-2)" secondaryDataKey="gastos" secondaryColor="var(--chart-4)" formatY="currency" />
        </ChartCard>
        <ChartCard title="Distribución por Producto" description="Usuarios activos">
          <DonutChartComponent data={productDistribution} />
        </ChartCard>
      </div>

      {/* Product Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Productos — Participación</h2>
          <span className="text-xs text-muted-foreground">{totalUsers.toLocaleString()} usuarios totales</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {productDistribution.map((p) => {
            const pct = ((p.value / totalUsers) * 100).toFixed(1)
            return (
              <Card key={p.name} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleProductClick(p)}>
                <CardContent className="p-4 text-center">
                  <p className="text-xs font-semibold mb-1">{p.name}</p>
                  <p className="text-2xl font-bold">{p.value.toLocaleString()}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="h-1 rounded-full bg-sayo-cafe" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}% del total</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* KPIs Quick View */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Target className="size-4 text-muted-foreground" />
            KPIs Semáforo
          </h2>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setKpiDialogOpen(true)}>
            <Eye className="size-3 mr-1" /> Ver Todos
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.slice(0, 4).map((kpi) => (
            <Card key={kpi.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setKpiDialogOpen(true)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`size-3 rounded-full shrink-0 ${
                  kpi.status === "verde" ? "bg-green-500" :
                  kpi.status === "amarillo" ? "bg-yellow-500" : "bg-red-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{kpi.name}</p>
                  <p className="text-xs text-muted-foreground">{kpi.actual} / {kpi.target} {kpi.unit}</p>
                </div>
                {kpi.trend === "up" ? <TrendingUp className="size-3 text-green-600 shrink-0" /> :
                 kpi.trend === "down" ? <TrendingDown className="size-3 text-red-600 shrink-0" /> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Producto</DialogTitle>
            <DialogDescription>{selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Usuarios Activos</p>
                  <p className="text-2xl font-bold">{selectedProduct.value.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Participación</p>
                  <p className="text-2xl font-bold">{((selectedProduct.value / totalUsers) * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase">Métricas Simuladas</p>
                {[
                  { label: "Ingresos del producto", value: formatMoney(selectedProduct.value * 250) },
                  { label: "Ticket promedio", value: formatMoney(250) },
                  { label: "Crecimiento mensual", value: "+12.3%" },
                  { label: "Tasa de retención", value: "87.5%" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <span className="text-xs font-medium">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPIs Overview Dialog */}
      <Dialog open={kpiDialogOpen} onOpenChange={setKpiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Todos los KPIs</DialogTitle>
            <DialogDescription>Resumen de indicadores clave de rendimiento</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {kpis.map((kpi) => {
              const progress = Math.min((kpi.actual / kpi.target) * 100, 100)
              return (
                <div key={kpi.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`size-2.5 rounded-full ${
                        kpi.status === "verde" ? "bg-green-500" :
                        kpi.status === "amarillo" ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                      <p className="text-sm font-medium">{kpi.name}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{kpi.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Actual: <strong>{kpi.actual} {kpi.unit}</strong></span>
                    <span className="text-muted-foreground">Meta: {kpi.target} {kpi.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${
                      kpi.status === "verde" ? "bg-green-500" :
                      kpi.status === "amarillo" ? "bg-yellow-500" : "bg-red-500"
                    }`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => {
              setKpiDialogOpen(false)
              window.location.href = "/ejecutivo/kpis"
            }}>
              Ir a KPIs <ArrowRight className="size-3 ml-1" />
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
