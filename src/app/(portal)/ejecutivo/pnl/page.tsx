"use client"

import { Card, CardContent } from "@/components/ui/card"
import { pnlItems } from "@/lib/mock-data"
import { formatMoney } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function PnLPage() {
  const ingresos = pnlItems.filter((i) => i.category === "Ingresos")
  const gastos = pnlItems.filter((i) => i.category === "Gastos")

  const totalIngresosMes = ingresos.reduce((s, i) => s + i.currentMonth, 0)
  const totalGastosMes = gastos.reduce((s, i) => s + i.currentMonth, 0)
  const utilidadNeta = totalIngresosMes - totalGastosMes

  const totalIngresosYTD = ingresos.reduce((s, i) => s + i.ytd, 0)
  const totalGastosYTD = gastos.reduce((s, i) => s + i.ytd, 0)
  const utilidadYTD = totalIngresosYTD - totalGastosYTD

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Estado de Resultados (P&L)</h1>
        <p className="text-sm text-muted-foreground">Ingresos, gastos operativos y utilidad neta</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Ingresos Mes</p><p className="text-xl font-bold text-sayo-green">{formatMoney(totalIngresosMes)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Gastos Mes</p><p className="text-xl font-bold text-sayo-red">{formatMoney(totalGastosMes)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Utilidad Neta Mes</p><p className="text-xl font-bold">{formatMoney(utilidadNeta)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-xs font-semibold">Concepto</th>
                <th className="text-right p-3 text-xs font-semibold">Mes Actual</th>
                <th className="text-right p-3 text-xs font-semibold">Mes Anterior</th>
                <th className="text-right p-3 text-xs font-semibold">YTD</th>
                <th className="text-right p-3 text-xs font-semibold">Presupuesto</th>
                <th className="text-right p-3 text-xs font-semibold">Varianza</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-green-50">
                <td colSpan={6} className="p-3 text-xs font-bold text-green-800">INGRESOS</td>
              </tr>
              {ingresos.map((item) => (
                <tr key={item.subcategory} className="border-b hover:bg-muted/30">
                  <td className="p-3 text-xs pl-6">{item.subcategory}</td>
                  <td className="p-3 text-xs text-right">{formatMoney(item.currentMonth)}</td>
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
                <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(ingresos.reduce((s, i) => s + i.previousMonth, 0))}</td>
                <td className="p-3 text-xs text-right font-bold">{formatMoney(totalIngresosYTD)}</td>
                <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(ingresos.reduce((s, i) => s + i.budget, 0))}</td>
                <td className="p-3"></td>
              </tr>
              <tr className="border-b bg-red-50">
                <td colSpan={6} className="p-3 text-xs font-bold text-red-800">GASTOS</td>
              </tr>
              {gastos.map((item) => (
                <tr key={item.subcategory} className="border-b hover:bg-muted/30">
                  <td className="p-3 text-xs pl-6">{item.subcategory}</td>
                  <td className="p-3 text-xs text-right">{formatMoney(item.currentMonth)}</td>
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
                <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(gastos.reduce((s, i) => s + i.previousMonth, 0))}</td>
                <td className="p-3 text-xs text-right font-bold">{formatMoney(totalGastosYTD)}</td>
                <td className="p-3 text-xs text-right font-bold text-muted-foreground">{formatMoney(gastos.reduce((s, i) => s + i.budget, 0))}</td>
                <td className="p-3"></td>
              </tr>
              <tr className="bg-sayo-cream">
                <td className="p-3 text-sm font-bold">UTILIDAD NETA</td>
                <td className="p-3 text-sm text-right font-bold">{formatMoney(utilidadNeta)}</td>
                <td className="p-3 text-sm text-right font-bold text-muted-foreground">{formatMoney(ingresos.reduce((s, i) => s + i.previousMonth, 0) - gastos.reduce((s, i) => s + i.previousMonth, 0))}</td>
                <td className="p-3 text-sm text-right font-bold">{formatMoney(utilidadYTD)}</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
