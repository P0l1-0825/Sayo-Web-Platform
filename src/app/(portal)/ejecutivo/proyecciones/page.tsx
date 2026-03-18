"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Proyeccion { periodo: string; cartera: number; ingresos: number; clientes: number; morosidad: number; cambioCartera: number; cambioIngresos: number }

const proyecciones: Proyeccion[] = [
  { periodo: "Abr 2026", cartera: 605000000, ingresos: 12800000, clientes: 950, morosidad: 2.7, cambioCartera: 4.5, cambioIngresos: 5.2 },
  { periodo: "May 2026", cartera: 635000000, ingresos: 13400000, clientes: 1010, morosidad: 2.6, cambioCartera: 5.0, cambioIngresos: 4.7 },
  { periodo: "Jun 2026", cartera: 670000000, ingresos: 14100000, clientes: 1080, morosidad: 2.5, cambioCartera: 5.5, cambioIngresos: 5.2 },
  { periodo: "Sep 2026", cartera: 780000000, ingresos: 16500000, clientes: 1280, morosidad: 2.4, cambioCartera: 16.4, cambioIngresos: 17.0 },
  { periodo: "Dic 2026", cartera: 920000000, ingresos: 19800000, clientes: 1520, morosidad: 2.3, cambioCartera: 17.9, cambioIngresos: 20.0 },
  { periodo: "Mar 2027", cartera: 1050000000, ingresos: 22500000, clientes: 1780, morosidad: 2.2, cambioCartera: 14.1, cambioIngresos: 13.6 },
]

export default function ProyeccionesPage() {
  const p3m = proyecciones[2]
  const p6m = proyecciones[3]
  const p12m = proyecciones[5]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Proyecciones</h1>
        <p className="text-sm text-muted-foreground">Forecast a 3, 6 y 12 meses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{fmt(578000000)}</p><p className="text-xs text-muted-foreground">Cartera Actual</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(p3m.cartera)}</p><p className="text-xs text-muted-foreground">Proyección 3M</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{fmt(p6m.cartera)}</p><p className="text-xs text-muted-foreground">Proyección 6M</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Target className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{fmt(p12m.cartera)}</p><p className="text-xs text-muted-foreground">Proyección 12M</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="text-sm font-semibold mb-3">Proyecciones Detalladas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Período</th><th className="pb-2">Cartera</th><th className="pb-2">Var.</th><th className="pb-2">Ingresos</th><th className="pb-2">Var.</th><th className="pb-2">Clientes</th><th className="pb-2">Morosidad</th>
            </tr></thead>
            <tbody>{proyecciones.map((p) => (
              <tr key={p.periodo} className="border-b last:border-0">
                <td className="py-2 font-medium">{p.periodo}</td>
                <td className="py-2 tabular-nums font-semibold">{fmt(p.cartera)}</td>
                <td className="py-2"><span className="inline-flex items-center text-xs text-sayo-green"><ArrowUpRight className="size-3" />{p.cambioCartera}%</span></td>
                <td className="py-2 tabular-nums">{fmt(p.ingresos)}</td>
                <td className="py-2"><span className="inline-flex items-center text-xs text-sayo-green"><ArrowUpRight className="size-3" />{p.cambioIngresos}%</span></td>
                <td className="py-2 tabular-nums">{p.clientes.toLocaleString()}</td>
                <td className="py-2"><span className="font-semibold text-sayo-green">{p.morosidad}%</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
