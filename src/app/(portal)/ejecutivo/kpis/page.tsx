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
import { useKPIs } from "@/hooks/use-executive"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { KPI } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus, Target, Download, Eye, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { toast } from "sonner"

const statusColors: Record<string, { bg: string; ring: string; text: string; dot: string }> = {
  verde: { bg: "bg-green-100", ring: "ring-green-300", text: "text-green-700", dot: "bg-green-500" },
  amarillo: { bg: "bg-yellow-100", ring: "ring-yellow-300", text: "text-yellow-700", dot: "bg-yellow-500" },
  rojo: { bg: "bg-red-100", ring: "ring-red-300", text: "text-red-700", dot: "bg-red-500" },
}

const statusIcons: Record<string, typeof CheckCircle> = {
  verde: CheckCircle,
  amarillo: AlertTriangle,
  rojo: XCircle,
}

const statusOptions = ["verde", "amarillo", "rojo"] as const

export default function KPIsPage() {
  const { data: kpis, isLoading, error, refetch } = useKPIs()
  const [selectedKPI, setSelectedKPI] = React.useState<KPI | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!kpis) return null

  const categories = [...new Set(kpis.map((k) => k.category))]

  const filteredKPIs = kpis.filter((k) => {
    const matchesCat = !categoryFilter || k.category === categoryFilter
    const matchesStatus = !statusFilter || k.status === statusFilter
    return matchesCat && matchesStatus
  })

  const filteredCategories = categoryFilter ? [categoryFilter] : categories

  const handleView = (kpi: KPI) => {
    setSelectedKPI(kpi)
    setDetailOpen(true)
  }

  const handleExportCSV = () => {
    const headers = ["ID", "KPI", "Categoría", "Actual", "Meta", "Unidad", "Tendencia", "Estado"]
    const rows = kpis.map((k) => [k.id, k.name, k.category, String(k.actual), String(k.target), k.unit, k.trend, k.status])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "kpis_ejecutivo.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("KPIs exportados", { description: "kpis_ejecutivo.csv" })
  }

  // Summary counts
  const totalVerde = kpis.filter((k) => k.status === "verde").length
  const totalAmarillo = kpis.filter((k) => k.status === "amarillo").length
  const totalRojo = kpis.filter((k) => k.status === "rojo").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">KPIs</h1>
          <p className="text-sm text-muted-foreground">Indicadores clave — meta vs actual, tendencia y semáforo</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="size-3.5 mr-1" /> Exportar CSV
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-green-400 transition-colors" onClick={() => setStatusFilter(statusFilter === "verde" ? null : "verde")}>
          <CardContent className="p-4 text-center">
            <CheckCircle className={`size-5 mx-auto mb-1 ${statusFilter === "verde" ? "text-green-600" : "text-green-400"}`} />
            <p className="text-2xl font-bold text-green-600">{totalVerde}</p>
            <p className="text-xs text-muted-foreground">En meta</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-400 transition-colors" onClick={() => setStatusFilter(statusFilter === "amarillo" ? null : "amarillo")}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`size-5 mx-auto mb-1 ${statusFilter === "amarillo" ? "text-yellow-600" : "text-yellow-400"}`} />
            <p className="text-2xl font-bold text-yellow-600">{totalAmarillo}</p>
            <p className="text-xs text-muted-foreground">Precaución</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-400 transition-colors" onClick={() => setStatusFilter(statusFilter === "rojo" ? null : "rojo")}>
          <CardContent className="p-4 text-center">
            <XCircle className={`size-5 mx-auto mb-1 ${statusFilter === "rojo" ? "text-red-600" : "text-red-400"}`} />
            <p className="text-2xl font-bold text-red-600">{totalRojo}</p>
            <p className="text-xs text-muted-foreground">Fuera de meta</p>
          </CardContent>
        </Card>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              categoryFilter === cat ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat} ({kpis.filter((k) => k.category === cat).length})
          </button>
        ))}
        {(categoryFilter || statusFilter) && (
          <button
            onClick={() => { setCategoryFilter(null); setStatusFilter(null) }}
            className="px-3 py-1.5 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* KPI Cards by Category */}
      {filteredCategories.map((cat) => {
        const catKPIs = filteredKPIs.filter((k) => k.category === cat)
        if (catKPIs.length === 0) return null
        return (
          <div key={cat}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" />
              {cat}
              <Badge variant="outline" className="text-[10px]">{catKPIs.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {catKPIs.map((kpi) => {
                const sc = statusColors[kpi.status]
                const progress = Math.min((kpi.actual / kpi.target) * 100, 100)
                const StatusIcon = statusIcons[kpi.status]
                return (
                  <Card
                    key={kpi.id}
                    className={`ring-1 ${sc.ring} cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => handleView(kpi)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{kpi.name}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                          <StatusIcon className="size-3" />
                          {kpi.status}
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <p className="text-2xl font-bold">{kpi.actual}</p>
                        <p className="text-xs text-muted-foreground mb-1">{kpi.unit}</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${sc.dot}`} style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Meta: {kpi.target} {kpi.unit}</span>
                        <span className="flex items-center gap-0.5">
                          {kpi.trend === "up" ? <TrendingUp className="size-3 text-green-600" /> :
                           kpi.trend === "down" ? <TrendingDown className="size-3 text-red-600" /> :
                           <Minus className="size-3" />}
                          {kpi.trend}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2" onClick={(e) => { e.stopPropagation(); handleView(kpi) }}>
                          <Eye className="size-3 mr-0.5" /> Detalle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {filteredKPIs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="size-8 mx-auto mb-2" />
          <p className="text-sm">No se encontraron KPIs con los filtros seleccionados</p>
        </div>
      )}

      {/* KPI Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedKPI?.name}</DialogTitle>
            <DialogDescription>{selectedKPI?.id} — {selectedKPI?.category}</DialogDescription>
          </DialogHeader>
          {selectedKPI && (() => {
            const sc = statusColors[selectedKPI.status]
            const progress = Math.min((selectedKPI.actual / selectedKPI.target) * 100, 100)
            const gap = selectedKPI.target - selectedKPI.actual
            const StatusIcon = statusIcons[selectedKPI.status]
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>
                    <StatusIcon className="size-3.5" />
                    {selectedKPI.status}
                  </span>
                  <Badge variant="outline" className="text-xs">{selectedKPI.category}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Actual</p>
                    <p className="text-2xl font-bold">{selectedKPI.actual}</p>
                    <p className="text-xs text-muted-foreground">{selectedKPI.unit}</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Meta</p>
                    <p className="text-2xl font-bold">{selectedKPI.target}</p>
                    <p className="text-xs text-muted-foreground">{selectedKPI.unit}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Cumplimiento</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${sc.dot}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Brecha</p>
                    <p className={`font-medium ${gap <= 0 ? "text-green-600" : "text-red-600"}`}>
                      {gap <= 0 ? `+${Math.abs(gap).toFixed(1)}` : `-${gap.toFixed(1)}`} {selectedKPI.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Tendencia</p>
                    <p className="flex items-center gap-1 font-medium">
                      {selectedKPI.trend === "up" ? <TrendingUp className="size-3.5 text-green-600" /> :
                       selectedKPI.trend === "down" ? <TrendingDown className="size-3.5 text-red-600" /> :
                       <Minus className="size-3.5" />}
                      {selectedKPI.trend === "up" ? "Subiendo" : selectedKPI.trend === "down" ? "Bajando" : "Estable"}
                    </p>
                  </div>
                </div>

                {/* Simulated historical trend */}
                <div className="p-3 rounded-lg border space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Historial Simulado (6 meses)</p>
                  <div className="flex items-end gap-1 h-12">
                    {[0.7, 0.75, 0.82, 0.88, 0.92, 1].map((factor, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className={`w-full rounded-t ${sc.dot} opacity-${60 + idx * 8}`}
                          style={{ height: `${factor * 100}%`, opacity: 0.4 + idx * 0.12 }}
                        />
                        <span className="text-[8px] text-muted-foreground">M{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-blue-50">
                  <p className="text-[10px] text-blue-600 uppercase mb-1">Análisis</p>
                  <p className="text-xs">
                    {selectedKPI.status === "verde"
                      ? `El KPI "${selectedKPI.name}" está cumpliendo la meta. Mantener la tendencia actual.`
                      : selectedKPI.status === "amarillo"
                      ? `El KPI "${selectedKPI.name}" está cerca de la meta pero requiere atención. Brecha de ${Math.abs(gap).toFixed(1)} ${selectedKPI.unit}.`
                      : `El KPI "${selectedKPI.name}" está fuera de meta. Se requiere plan de acción inmediato para cerrar la brecha de ${Math.abs(gap).toFixed(1)} ${selectedKPI.unit}.`
                    }
                  </p>
                </div>
              </div>
            )
          })()}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
