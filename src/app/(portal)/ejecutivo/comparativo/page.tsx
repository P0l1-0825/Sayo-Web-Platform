"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Building2, TrendingUp, DollarSign, Users, ArrowUpRight } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Competidor { nombre: string; cartera: number; clientes: number; morosidad: number; tasaPromedio: number; crecimiento: number; nps: number; productos: string[]; color: string }

const demoCompetidores: Competidor[] = [
  { nombre: "Sayo", cartera: 578000000, clientes: 900, morosidad: 2.8, tasaPromedio: 22, crecimiento: 42, nps: 72, productos: ["Crédito Simple", "Revolvente", "Tarjeta"], color: "text-sayo-green" },
  { nombre: "Konfio", cartera: 12000000000, clientes: 15000, morosidad: 4.5, tasaPromedio: 28, crecimiento: 25, nps: 58, productos: ["Crédito Simple", "Tarjeta", "POS"], color: "text-blue-500" },
  { nombre: "Credijusto", cartera: 8500000000, clientes: 5000, morosidad: 3.8, tasaPromedio: 18, crecimiento: 18, nps: 62, productos: ["Crédito Simple", "Arrendamiento", "Factoraje"], color: "text-purple-500" },
  { nombre: "Clip", cartera: 3200000000, clientes: 25000, morosidad: 5.2, tasaPromedio: 32, crecimiento: 35, nps: 55, productos: ["Adelanto", "POS", "Tarjeta"], color: "text-orange-500" },
  { nombre: "Tribal", cartera: 2100000000, clientes: 3500, morosidad: 3.2, tasaPromedio: 20, crecimiento: 28, nps: 65, productos: ["Crédito", "Tarjeta Corp"], color: "text-teal-500" },
]

export default function ComparativoPage() {
  const [competidores, setCompetidores] = React.useState<Competidor[]>(demoCompetidores)
  const [loading, setLoading] = React.useState(!isDemoMode)

  React.useEffect(() => {
    if (isDemoMode) return
    async function load() {
      try {
        const result = await api.get<{ competidores: Competidor[] }>("/api/v1/analytics/stats/benchmark")
        if (result.competidores?.length) setCompetidores(result.competidores)
      } catch {
        // fallback to demo data already set
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton variant="stats-and-table" />

  const sayo = competidores.find((c) => c.nombre === "Sayo") ?? competidores[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Comparativo de Mercado</h1>
        <p className="text-sm text-muted-foreground">Benchmark vs Konfio, Credijusto y competidores</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Building2 className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{competidores.length}</p><p className="text-xs text-muted-foreground">Competidores Analizados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{sayo.crecimiento}%</p><p className="text-xs text-muted-foreground">Sayo — Crecimiento</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{sayo.tasaPromedio}%</p><p className="text-xs text-muted-foreground">Sayo — Tasa Prom.</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{sayo.nps}</p><p className="text-xs text-muted-foreground">Sayo — NPS</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="size-4" /> Benchmark Comparativo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Fintech</th><th className="pb-2">Cartera</th><th className="pb-2">Clientes</th><th className="pb-2">Morosidad</th><th className="pb-2">Tasa Prom.</th><th className="pb-2">Crecimiento</th><th className="pb-2">NPS</th><th className="pb-2">Productos</th>
            </tr></thead>
            <tbody>{competidores.map((c) => (
              <tr key={c.nombre} className={`border-b last:border-0 ${c.nombre === "Sayo" ? "bg-muted/50 font-medium" : ""}`}>
                <td className={`py-3 font-semibold ${c.color}`}>{c.nombre}</td>
                <td className="py-3 tabular-nums">{fmt(c.cartera)}</td>
                <td className="py-3 tabular-nums">{c.clientes.toLocaleString()}</td>
                <td className="py-3"><span className={c.morosidad <= 3 ? "text-sayo-green font-semibold" : c.morosidad <= 4 ? "text-sayo-orange" : "text-sayo-red"}>{c.morosidad}%</span></td>
                <td className="py-3 tabular-nums">{c.tasaPromedio}%</td>
                <td className="py-3"><span className="inline-flex items-center text-sayo-green"><ArrowUpRight className="size-3" />{c.crecimiento}%</span></td>
                <td className="py-3 tabular-nums font-semibold">{c.nps}</td>
                <td className="py-3"><div className="flex flex-wrap gap-1">{c.productos.map((p) => <Badge key={p} variant="outline" className="text-[9px]">{p}</Badge>)}</div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
