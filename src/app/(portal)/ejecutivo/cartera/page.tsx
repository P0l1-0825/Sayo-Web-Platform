"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp, AlertTriangle, PieChart, DollarSign, Building2, Shield } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface SectorData { sector: string; monto: number; porcentaje: number; creditos: number; morosidad: number }
interface RiesgoData { calificacion: string; monto: number; porcentaje: number; creditos: number; color: string }

const sectorData: SectorData[] = [
  { sector: "Comercio", monto: 185000000, porcentaje: 32, creditos: 245, morosidad: 2.8 },
  { sector: "Manufactura", monto: 128000000, porcentaje: 22, creditos: 89, morosidad: 3.5 },
  { sector: "Servicios", monto: 98000000, porcentaje: 17, creditos: 312, morosidad: 1.9 },
  { sector: "Transporte", monto: 75000000, porcentaje: 13, creditos: 56, morosidad: 4.2 },
  { sector: "Alimentos", monto: 52000000, porcentaje: 9, creditos: 78, morosidad: 2.1 },
  { sector: "Tecnología", monto: 40000000, porcentaje: 7, creditos: 120, morosidad: 1.5 },
]

const riesgoData: RiesgoData[] = [
  { calificacion: "A1 — Mínimo", monto: 280000000, porcentaje: 48, creditos: 420, color: "bg-green-100 text-green-700" },
  { calificacion: "A2 — Bajo", monto: 145000000, porcentaje: 25, creditos: 210, color: "bg-green-50 text-green-600" },
  { calificacion: "B — Moderado", monto: 87000000, porcentaje: 15, creditos: 125, color: "bg-yellow-100 text-yellow-700" },
  { calificacion: "C — Alto", monto: 46000000, porcentaje: 8, creditos: 85, color: "bg-orange-100 text-orange-700" },
  { calificacion: "D — Crítico", monto: 20000000, porcentaje: 4, creditos: 60, color: "bg-red-100 text-red-700" },
]

export default function CarteraPage() {
  const totalCartera = sectorData.reduce((s, d) => s + d.monto, 0)
  const totalCreditos = sectorData.reduce((s, d) => s + d.creditos, 0)
  const morosidadPromedio = (sectorData.reduce((s, d) => s + d.morosidad * d.porcentaje, 0) / 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cartera de Crédito</h1>
        <p className="text-sm text-muted-foreground">Composición por sector, riesgo y evolución</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Briefcase className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{fmt(totalCartera)}</p><p className="text-xs text-muted-foreground">Cartera Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Building2 className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{totalCreditos.toLocaleString()}</p><p className="text-xs text-muted-foreground">Créditos Vigentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{morosidadPromedio}%</p><p className="text-xs text-muted-foreground">Morosidad Prom.</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">73%</p><p className="text-xs text-muted-foreground">Cartera A1+A2</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><PieChart className="size-4" /> Composición por Sector</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2">Sector</th><th className="pb-2">Monto</th><th className="pb-2">%</th><th className="pb-2">Créditos</th><th className="pb-2">Morosidad</th>
              </tr></thead>
              <tbody>{sectorData.map((s) => (
                <tr key={s.sector} className="border-b last:border-0">
                  <td className="py-2 font-medium">{s.sector}</td>
                  <td className="py-2 tabular-nums">{fmt(s.monto)}</td>
                  <td className="py-2 tabular-nums font-semibold">{s.porcentaje}%</td>
                  <td className="py-2 tabular-nums">{s.creditos}</td>
                  <td className="py-2"><span className={`font-semibold ${s.morosidad > 3.5 ? "text-sayo-red" : s.morosidad > 2.5 ? "text-sayo-orange" : "text-sayo-green"}`}>{s.morosidad}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="size-4" /> Distribución por Riesgo</h2>
          <div className="space-y-3">
            {riesgoData.map((r) => (
              <div key={r.calificacion} className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${r.color}`}>{r.calificacion}</span>
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${r.porcentaje}%` }} />
                  </div>
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-xs font-semibold tabular-nums">{fmt(r.monto)}</p>
                  <p className="text-[10px] text-muted-foreground">{r.creditos} créditos ({r.porcentaje}%)</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
