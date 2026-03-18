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
import { usePnL } from "@/hooks/use-executive"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { PnLItem } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus, Download, Eye, BarChart3, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

type SortField = "subcategory" | "currentMonth" | "previousMonth" | "ytd" | "budget" | "variance"
type SortDir = "asc" | "desc"

export default function PnLPage() {
  const { data: pnlItems, isLoading, error, refetch } = usePnL()
  const [selectedItem, setSelectedItem] = React.useState<PnLItem | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [sortField, setSortField] = React.useState<SortField>("subcategory")
  const [sortDir, setSortDir] = React.useState<SortDir>("asc")
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table")

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!pnlItems) return null

  const ingresos = pnlItems.filter((i) => i.category === "Ingresos")
  const gastos = pnlItems.filter((i) => i.category === "Gastos")

  const totalIngresosMes = ingresos.reduce((s, i) => s + i.currentMonth, 0)
  const totalGastosMes = gastos.reduce((s, i) => s + i.currentMonth, 0)
  const utilidadNeta = totalIngresosMes - totalGastosMes

  const totalIngresosPrev = ingresos.reduce((s, i) => s + i.previousMonth, 0)
  const totalGastosPrev = gastos.reduce((s, i) => s + i.previousMonth, 0)
  const utilidadPrev = totalIngresosPrev - totalGastosPrev

  const totalIngresosYTD = ingresos.reduce((s, i) => s + i.ytd, 0)
  const totalGastosYTD = gastos.reduce((s, i) => s + i.ytd, 0)
  const utilidadYTD = totalIngresosYTD - totalGastosYTD

  const totalIngresosBudget = ingresos.reduce((s, i) => s + i.budget, 0)
  const totalGastosBudget = gastos.reduce((s, i) => s + i.budget, 0)

  const margen = ((utilidadNeta / totalIngresosMes) * 100).toFixed(1)
  const margenPrev = ((utilidadPrev / totalIngresosPrev) * 100).toFixed(1)
  const cambioUtilidad = utilidadPrev > 0 ? (((utilidadNeta - utilidadPrev) / utilidadPrev) * 100).toFixed(1) : "0"

  const sortItems = (items: PnLItem[]) => {
    return [...items].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const handleRowClick = (item: PnLItem) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  const handleExportCSV = () => {
    const headers = ["Categoría", "Concepto", "Mes Actual", "Mes Anterior", "YTD", "Presupuesto", "Varianza %"]
    const rows = pnlItems.map((i) => [
      i.category, i.subcategory, String(i.currentMonth), String(i.previousMonth),
      String(i.ytd), String(i.budget), `${i.variance}%`,
    ])
    rows.push(["", "UTILIDAD NETA", String(utilidadNeta), String(utilidadPrev), String(utilidadYTD), "", ""])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "estado_resultados_pnl.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("P&L exportado", { description: "estado_resultados_pnl.csv" })
  }

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="text-right p-3 text-xs font-semibold cursor-pointer hover:text-sayo-cafe select-none"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {sortField === field && <ArrowUpDown className="size-3" />}
      </span>
    </th>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Estado de Resultados (P&L)</h1>
          <p className="text-sm text-muted-foreground">Ingresos, gastos operativos y utilidad neta</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${viewMode === "table" ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground"}`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${viewMode === "cards" ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground"}`}
            >
              Cards
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="size-3.5 mr-1" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Ingresos Mes</p>
            <p className="text-xl font-bold text-sayo-green">{formatMoney(totalIngresosMes)}</p>
            <p className="text-[10px] text-muted-foreground">Budget: {formatMoney(totalIngresosBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Gastos Mes</p>
            <p className="text-xl font-bold text-sayo-red">{formatMoney(totalGastosMes)}</p>
            <p className="text-[10px] text-muted-foreground">Budget: {formatMoney(totalGastosBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Utilidad Neta</p>
            <p className="text-xl font-bold">{formatMoney(utilidadNeta)}</p>
            <p className={`text-[10px] flex items-center justify-center gap-0.5 ${Number(cambioUtilidad) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {Number(cambioUtilidad) >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Number(cambioUtilidad) >= 0 ? "+" : ""}{cambioUtilidad}% vs anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Margen</p>
            <p className="text-xl font-bold">{margen}%</p>
            <p className="text-[10px] text-muted-foreground">Anterior: {margenPrev}%</p>
          </CardContent>
        </Card>
      </div>

      {viewMode === "table" ? (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-xs font-semibold cursor-pointer hover:text-sayo-cafe" onClick={() => handleSort("subcategory")}>
                    <span className="inline-flex items-center gap-0.5">Concepto {sortField === "subcategory" && <ArrowUpDown className="size-3" />}</span>
                  </th>
                  <SortHeader field="currentMonth" label="Mes Actual" />
                  <SortHeader field="previousMonth" label="Mes Anterior" />
                  <SortHeader field="ytd" label="YTD" />
                  <SortHeader field="budget" label="Presupuesto" />
                  <SortHeader field="variance" label="Varianza" />
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-green-50">
                  <td colSpan={6} className="p-3 text-xs font-bold text-green-800">INGRESOS</td>
                </tr>
                {sortItems(ingresos).map((item) => (
                  <tr
                    key={item.subcategory}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="p-3 text-xs pl-6 flex items-center gap-1">
                      <Eye className="size-3 text-muted-foreground" />
                      {item.subcategory}
                    </td>
                    <td className="p-3 text-xs text-right font-medium">{formatMoney(item.currentMonth)}</td>
                    <td className="p-3 text-xs text-right text-muted-foreground">{formatMoney(item.previousMonth)}</td>
                    <td className="p-3 text-xs text-right">{formatMoney(item.ytd)}</td>
                    <td className="p-3 text-xs text-right text-muted-foreground">{formatMoney(item.budget)}</td>
                    <td className="p-3 text-xs text-right">
                      <span className={`inline-flex items-center gap-0.5 ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.variance > 0 ? <TrendingUp className="size-3" /> : item.variance < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                        {item.variance >= 0 ? "+" : ""}{item.variance.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-b bg-green-100">
                  <td className="p-3 text-xs font-bold">Total Ingresos</td>
                  <td className="p-3 text-xs text-right font-bold">{formatMoney(totalIngresosMes)}</td>
                  <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(totalIngresosPrev)}</td>
                  <td className="p-3 text-xs text-right font-bold">{formatMoney(totalIngresosYTD)}</td>
                  <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(totalIngresosBudget)}</td>
                  <td className="p-3"></td>
                </tr>
                <tr className="border-b bg-red-50">
                  <td colSpan={6} className="p-3 text-xs font-bold text-red-800">GASTOS</td>
                </tr>
                {sortItems(gastos).map((item) => (
                  <tr
                    key={item.subcategory}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="p-3 text-xs pl-6 flex items-center gap-1">
                      <Eye className="size-3 text-muted-foreground" />
                      {item.subcategory}
                    </td>
                    <td className="p-3 text-xs text-right font-medium">{formatMoney(item.currentMonth)}</td>
                    <td className="p-3 text-xs text-right text-muted-foreground">{formatMoney(item.previousMonth)}</td>
                    <td className="p-3 text-xs text-right">{formatMoney(item.ytd)}</td>
                    <td className="p-3 text-xs text-right text-muted-foreground">{formatMoney(item.budget)}</td>
                    <td className="p-3 text-xs text-right">
                      <span className={`inline-flex items-center gap-0.5 ${item.variance <= 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.variance > 0 ? <TrendingUp className="size-3" /> : item.variance < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                        {item.variance >= 0 ? "+" : ""}{item.variance.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-b bg-red-100">
                  <td className="p-3 text-xs font-bold">Total Gastos</td>
                  <td className="p-3 text-xs text-right font-bold">{formatMoney(totalGastosMes)}</td>
                  <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(totalGastosPrev)}</td>
                  <td className="p-3 text-xs text-right font-bold">{formatMoney(totalGastosYTD)}</td>
                  <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(totalGastosBudget)}</td>
                  <td className="p-3"></td>
                </tr>
                <tr className="bg-sayo-cream">
                  <td className="p-3 text-sm font-bold">UTILIDAD NETA</td>
                  <td className="p-3 text-sm text-right font-bold">{formatMoney(utilidadNeta)}</td>
                  <td className="p-3 text-sm text-right font-bold text-muted-foreground">{formatMoney(utilidadPrev)}</td>
                  <td className="p-3 text-sm text-right font-bold">{formatMoney(utilidadYTD)}</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        /* Cards View */
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-green-800 mb-2">Ingresos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ingresos.map((item) => {
                const pctTotal = ((item.currentMonth / totalIngresosMes) * 100).toFixed(1)
                return (
                  <Card key={item.subcategory} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleRowClick(item)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.subcategory}</p>
                        <span className={`inline-flex items-center gap-0.5 text-xs ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {item.variance > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          {item.variance >= 0 ? "+" : ""}{item.variance.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xl font-bold text-sayo-green">{formatMoney(item.currentMonth)}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pctTotal}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{pctTotal}% de ingresos totales • Budget: {formatMoney(item.budget)}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-red-800 mb-2">Gastos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gastos.map((item) => {
                const pctTotal = ((item.currentMonth / totalGastosMes) * 100).toFixed(1)
                return (
                  <Card key={item.subcategory} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleRowClick(item)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.subcategory}</p>
                        <span className={`inline-flex items-center gap-0.5 text-xs ${item.variance <= 0 ? "text-green-600" : "text-red-600"}`}>
                          {item.variance > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          {item.variance >= 0 ? "+" : ""}{item.variance.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xl font-bold text-sayo-red">{formatMoney(item.currentMonth)}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${pctTotal}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{pctTotal}% de gastos totales • Budget: {formatMoney(item.budget)}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* P&L Item Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle — {selectedItem?.subcategory}</DialogTitle>
            <DialogDescription>{selectedItem?.category}</DialogDescription>
          </DialogHeader>
          {selectedItem && (() => {
            const cambioMes = selectedItem.previousMonth > 0
              ? (((selectedItem.currentMonth - selectedItem.previousMonth) / selectedItem.previousMonth) * 100).toFixed(1)
              : "0"
            const ejecucionBudget = ((selectedItem.currentMonth / selectedItem.budget) * 100).toFixed(1)
            const isIngreso = selectedItem.category === "Ingresos"
            return (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">{selectedItem.category}</Badge>
                  <span className={`inline-flex items-center gap-0.5 text-xs ${
                    (isIngreso ? selectedItem.variance >= 0 : selectedItem.variance <= 0) ? "text-green-600" : "text-red-600"
                  }`}>
                    {selectedItem.variance > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    Varianza: {selectedItem.variance >= 0 ? "+" : ""}{selectedItem.variance.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Mes Actual</p>
                    <p className="font-bold text-lg">{formatMoney(selectedItem.currentMonth)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Mes Anterior</p>
                    <p className="font-medium">{formatMoney(selectedItem.previousMonth)}</p>
                    <p className={`text-[10px] ${Number(cambioMes) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Number(cambioMes) >= 0 ? "+" : ""}{cambioMes}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">YTD</p>
                    <p className="font-medium">{formatMoney(selectedItem.ytd)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Presupuesto</p>
                    <p className="font-medium">{formatMoney(selectedItem.budget)}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Ejecución Presupuestal</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${Number(ejecucionBudget) <= 100 ? "bg-green-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(Number(ejecucionBudget), 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium">{ejecucionBudget}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {Number(ejecucionBudget) <= 100
                      ? `Dentro del presupuesto — ${formatMoney(selectedItem.budget - selectedItem.currentMonth)} disponible`
                      : `Sobre presupuesto por ${formatMoney(selectedItem.currentMonth - selectedItem.budget)}`
                    }
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-blue-50 space-y-1">
                  <p className="text-[10px] text-blue-600 uppercase">Proyección Anual</p>
                  <p className="text-sm font-medium">{formatMoney(selectedItem.currentMonth * 12)}</p>
                  <p className="text-[10px] text-muted-foreground">Basado en el mes actual x 12</p>
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
