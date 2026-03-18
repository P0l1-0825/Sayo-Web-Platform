"use client"

import * as React from "react"
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
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { ejecutivoStats, revenuetrend, usePnL, useKPIs } from "@/hooks/use-executive"
import { monthlyTrend6M } from "@/hooks/use-accounts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import { Download, Presentation, TrendingUp, TrendingDown, Users, Heart, DollarSign, Building, Eye, CheckCircle, AlertTriangle, XCircle, Printer } from "lucide-react"
import { toast } from "sonner"

const boardSections = [
  { id: "financiero", label: "Financiero", icon: DollarSign },
  { id: "crecimiento", label: "Crecimiento", icon: TrendingUp },
  { id: "kpis", label: "KPIs", icon: CheckCircle },
  { id: "riesgos", label: "Riesgos", icon: AlertTriangle },
]

const risks = [
  { id: 1, title: "Índice de mora creciente", severity: "alta", description: "Mora a 6.7% vs meta de 5%. Plan de contención en cobranza activado.", status: "Monitoreando" },
  { id: 2, title: "Regulación CNBV nueva", severity: "media", description: "Nuevos requerimientos de capital mínimo para Q2. Cumplimiento al 85%.", status: "En proceso" },
  { id: 3, title: "Concentración de cartera", severity: "baja", description: "Top 10 clientes representan 15% de AUM. Dentro de parámetros aceptables.", status: "OK" },
]

const highlights = [
  "Crecimiento de usuarios +22.1% — récord histórico mensual",
  "Ingresos netos $12.45M — 14.2% arriba del mes anterior",
  "NPS mejoró a 72 puntos (+5 vs mes anterior)",
  "CAC optimizado a $450 MXN — debajo de la meta de $500",
  "Uptime plataforma 99.97% — excediendo SLA",
]

export default function BoardPage() {
  const { data: pnlItems, isLoading: pnlLoading, error: pnlError, refetch: refetchPnl } = usePnL()
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch: refetchKpis } = useKPIs()
  const [activeSection, setActiveSection] = React.useState<string | null>(null)
  const [riskDialogOpen, setRiskDialogOpen] = React.useState(false)
  const [selectedRisk, setSelectedRisk] = React.useState<typeof risks[0] | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)

  if (pnlLoading || kpisLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (pnlError) return <ErrorCard message={pnlError} onRetry={refetchPnl} />
  if (kpisError) return <ErrorCard message={kpisError} onRetry={refetchKpis} />
  if (!pnlItems || !kpis) return null

  const ingresos = pnlItems.filter((i) => i.category === "Ingresos")
  const gastos = pnlItems.filter((i) => i.category === "Gastos")
  const totalIngresosMes = ingresos.reduce((s, i) => s + i.currentMonth, 0)
  const totalGastosMes = gastos.reduce((s, i) => s + i.currentMonth, 0)
  const utilidadNeta = totalIngresosMes - totalGastosMes

  const totalVerde = kpis.filter((k) => k.status === "verde").length
  const totalAmarillo = kpis.filter((k) => k.status === "amarillo").length
  const totalRojo = kpis.filter((k) => k.status === "rojo").length

  const handleExportCSV = () => {
    const headers = ["Sección", "Métrica", "Valor"]
    const rows = [
      ["Financiero", "Ingresos Netos", formatMoney(totalIngresosMes)],
      ["Financiero", "Gastos", formatMoney(totalGastosMes)],
      ["Financiero", "Utilidad Neta", formatMoney(utilidadNeta)],
      ["Financiero", "AUM", "$2,340M"],
      ["Crecimiento", "Usuarios Activos", "48,500"],
      ["Crecimiento", "Crecimiento", "+22.1%"],
      ["Satisfacción", "NPS", "72"],
      ...kpis.map((k) => ["KPI", k.name, `${k.actual} ${k.unit} (Meta: ${k.target})`]),
      ...risks.map((r) => ["Riesgo", r.title, r.severity]),
    ]
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "board_ejecutivo.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Board exportado", { description: "board_ejecutivo.csv" })
  }

  const handlePrint = () => {
    window.print()
    toast.info("Preparando impresión", { description: "Se abrirá el diálogo de impresión del navegador" })
  }

  const handleViewRisk = (risk: typeof risks[0]) => {
    setSelectedRisk(risk)
    setRiskDialogOpen(true)
  }

  const severityColor: Record<string, string> = {
    alta: "bg-red-100 text-red-700",
    media: "bg-yellow-100 text-yellow-700",
    baja: "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Board Ejecutivo</h1>
          <p className="text-sm text-muted-foreground">Resumen para consejo directivo — Marzo 2024</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-3.5 mr-1" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
            <Download className="size-3.5 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex gap-2">
        {boardSections.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-1.5 ${
                activeSection === s.id ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="size-3" />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Highlights */}
      {(!activeSection || activeSection === "financiero") && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-transparent">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
              <CheckCircle className="size-3.5" />
              Highlights del Mes
            </p>
            <div className="space-y-1">
              {highlights.map((h, i) => (
                <p key={i} className="text-xs flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  {h}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      {(!activeSection || activeSection === "financiero" || activeSection === "crecimiento") && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-4 text-green-700" />
                <span className="text-xs text-green-700 font-medium">Ingresos Netos</span>
              </div>
              <p className="text-xl font-bold text-green-900">{formatMoney(totalIngresosMes)}</p>
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
      )}

      {/* P&L Summary */}
      {(!activeSection || activeSection === "financiero") && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <DollarSign className="size-4 text-muted-foreground" />
              Resumen P&L
            </p>
            <div className="space-y-2">
              {ingresos.map((item) => (
                <div key={item.subcategory} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-xs">{item.subcategory}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tabular-nums">{formatMoney(item.currentMonth)}</span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.variance >= 0 ? "+" : ""}{item.variance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-1 border-t-2 border-green-300">
                <span className="text-xs font-bold text-green-800">Total Ingresos</span>
                <span className="text-xs font-bold text-green-800 tabular-nums">{formatMoney(totalIngresosMes)}</span>
              </div>
              {gastos.map((item) => (
                <div key={item.subcategory} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-xs">{item.subcategory}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tabular-nums">{formatMoney(item.currentMonth)}</span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] ${item.variance <= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.variance >= 0 ? "+" : ""}{item.variance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-1 border-t-2 border-red-300">
                <span className="text-xs font-bold text-red-800">Total Gastos</span>
                <span className="text-xs font-bold text-red-800 tabular-nums">{formatMoney(totalGastosMes)}</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-sayo-cream rounded px-2 mt-2">
                <span className="text-sm font-bold">Utilidad Neta</span>
                <span className="text-sm font-bold tabular-nums">{formatMoney(utilidadNeta)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Chart */}
      {(!activeSection || activeSection === "financiero") && (
        <ChartCard title="Ingresos vs Gastos — 6 Meses" description="Tendencia de P&L">
          <AreaChartComponent data={revenuetrend} color="var(--chart-2)" secondaryDataKey="gastos" secondaryColor="var(--chart-4)" formatY="currency" />
        </ChartCard>
      )}

      {/* KPI Summary */}
      {(!activeSection || activeSection === "kpis") && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">KPIs Clave — Semáforo</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">{totalVerde} en meta</Badge>
              <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700">{totalAmarillo} precaución</Badge>
              <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">{totalRojo} alerta</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((kpi) => {
              const progress = Math.min((kpi.actual / kpi.target) * 100, 100)
              return (
                <Card key={kpi.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  toast.info(kpi.name, {
                    description: `Actual: ${kpi.actual} ${kpi.unit} | Meta: ${kpi.target} ${kpi.unit} | ${kpi.status === "verde" ? "En meta" : kpi.status === "amarillo" ? "Precaución" : "Fuera de meta"}`,
                  })
                }}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-3">
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
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className={`h-1 rounded-full ${
                        kpi.status === "verde" ? "bg-green-500" :
                        kpi.status === "amarillo" ? "bg-yellow-500" : "bg-red-500"
                      }`} style={{ width: `${progress}%` }} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Growth Chart */}
      {(!activeSection || activeSection === "crecimiento") && (
        <ChartCard title="Crecimiento de Usuarios" description="Usuarios activos mensuales — 6 meses">
          <AreaChartComponent data={monthlyTrend6M} color="var(--chart-3)" />
        </ChartCard>
      )}

      {/* Risks */}
      {(!activeSection || activeSection === "riesgos") && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-sayo-orange" />
            Riesgos y Alertas
          </h2>
          <div className="space-y-2">
            {risks.map((risk) => (
              <Card key={risk.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewRisk(risk)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className={`size-4 shrink-0 ${risk.severity === "alta" ? "text-red-500" : risk.severity === "media" ? "text-yellow-500" : "text-green-500"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{risk.title}</p>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColor[risk.severity]}`}>
                    {risk.severity}
                  </span>
                  <Badge variant="outline" className="text-[10px]">{risk.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Risk Detail Dialog */}
      <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Riesgo</DialogTitle>
            <DialogDescription>{selectedRisk?.title}</DialogDescription>
          </DialogHeader>
          {selectedRisk && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${severityColor[selectedRisk.severity]}`}>
                  {selectedRisk.severity}
                </span>
                <Badge variant="outline">{selectedRisk.status}</Badge>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Descripción</p>
                <p className="text-sm">{selectedRisk.description}</p>
              </div>
              <div className="p-3 rounded-lg border bg-blue-50">
                <p className="text-[10px] text-blue-600 uppercase mb-1">Recomendación</p>
                <p className="text-xs">
                  {selectedRisk.severity === "alta"
                    ? "Se requiere acción inmediata. Escalar al comité de riesgos y definir plan de mitigación con timeline específico."
                    : selectedRisk.severity === "media"
                    ? "Monitorear de cerca y reportar avances semanalmente al comité. Preparar plan de contingencia."
                    : "Riesgo bajo control. Mantener monitoreo mensual y actualizar en próximo board."
                  }
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Exportar Board</DialogTitle>
            <DialogDescription>Selecciona el formato de exportación</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm" onClick={() => { handleExportCSV(); setExportDialogOpen(false) }}>
              <Download className="size-4 mr-2" /> Exportar como CSV
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm" onClick={() => { handlePrint(); setExportDialogOpen(false) }}>
              <Printer className="size-4 mr-2" /> Imprimir / Guardar PDF
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm" onClick={() => {
              toast.success("Presentación generada", { description: "board_ejecutivo_mar2024.pptx (simulado)" })
              setExportDialogOpen(false)
            }}>
              <Presentation className="size-4 mr-2" /> Generar Presentación
            </Button>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
