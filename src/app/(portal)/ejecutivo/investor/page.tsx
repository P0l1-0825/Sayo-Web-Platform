"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, TrendingUp, FileText, Download, Building2, PieChart } from "lucide-react"
import { toast } from "sonner"
import { api, isDemoMode } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)
const fmtUsd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

interface Investor { nombre: string; tipo: string; participacion: number; montoInvertido: number; ronda: string }
interface InvestorKPI { metrica: string; valor: string; cambio: string; positivo: boolean }

const demoCapTable: Investor[] = [
  { nombre: "Founders", tipo: "Common", participacion: 45.0, montoInvertido: 0, ronda: "Fundación" },
  { nombre: "ALLVP", tipo: "Series A Preferred", participacion: 18.5, montoInvertido: 85000000, ronda: "Serie A" },
  { nombre: "QED Investors", tipo: "Series B Preferred", participacion: 15.0, montoInvertido: 180000000, ronda: "Serie B" },
  { nombre: "IGNIA", tipo: "Series A Preferred", participacion: 8.0, montoInvertido: 35000000, ronda: "Serie A" },
  { nombre: "Angel Investors", tipo: "Seed", participacion: 5.5, montoInvertido: 12000000, ronda: "Seed" },
  { nombre: "ESOP", tipo: "Options Pool", participacion: 8.0, montoInvertido: 0, ronda: "—" },
]

const demoKeyMetrics: InvestorKPI[] = [
  { metrica: "ARR", valor: fmtUsd(8500000), cambio: "+42%", positivo: true },
  { metrica: "MRR", valor: fmtUsd(708000), cambio: "+38%", positivo: true },
  { metrica: "Burn Rate", valor: fmtUsd(320000), cambio: "-12%", positivo: true },
  { metrica: "Runway", valor: "18 meses", cambio: "+3 meses", positivo: true },
  { metrica: "Net Revenue Retention", valor: "125%", cambio: "+5pp", positivo: true },
  { metrica: "Gross Margin", valor: "72%", cambio: "+2pp", positivo: true },
]

const demoValuacion = 850000000

export default function InvestorPage() {
  const [capTable, setCapTable] = React.useState<Investor[]>(demoCapTable)
  const [keyMetrics, setKeyMetrics] = React.useState<InvestorKPI[]>(demoKeyMetrics)
  const [valuacion, setValuacion] = React.useState(demoValuacion)
  const [loading, setLoading] = React.useState(!isDemoMode)

  React.useEffect(() => {
    if (isDemoMode) return
    async function load() {
      try {
        const result = await api.get<{
          cap_table?: Investor[]
          key_metrics?: InvestorKPI[]
          valuacion?: number
        }>("/api/v1/analytics/stats/investor")
        if (result.cap_table?.length) setCapTable(result.cap_table)
        if (result.key_metrics?.length) setKeyMetrics(result.key_metrics)
        if (result.valuacion) setValuacion(result.valuacion)
      } catch {
        // fallback to demo data already set
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton variant="stats-and-table" />

  const totalInvertido = capTable.reduce((s, i) => s + i.montoInvertido, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Investor Relations</h1>
          <p className="text-sm text-muted-foreground">Deck, métricas clave y cap table</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Descargando Investor Deck")}><Download className="size-3.5 mr-1" /> Descargar Deck</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Building2 className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{fmt(valuacion)}</p><p className="text-xs text-muted-foreground">Valuación</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(totalInvertido)}</p><p className="text-xs text-muted-foreground">Capital Levantado</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{capTable.length}</p><p className="text-xs text-muted-foreground">Inversionistas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">2.7x</p><p className="text-xs text-muted-foreground">Revenue Multiple</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="size-4" /> Métricas Clave</h2>
          <div className="grid grid-cols-2 gap-3">
            {keyMetrics.map((k) => (
              <div key={k.metrica} className="p-3 rounded-lg border">
                <p className="text-[10px] text-muted-foreground uppercase">{k.metrica}</p>
                <p className="text-lg font-bold">{k.valor}</p>
                <span className={`text-xs font-medium ${k.positivo ? "text-sayo-green" : "text-sayo-red"}`}>{k.cambio} YoY</span>
              </div>
            ))}
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><PieChart className="size-4" /> Cap Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2">Inversionista</th><th className="pb-2">Tipo</th><th className="pb-2">%</th><th className="pb-2">Invertido</th><th className="pb-2">Ronda</th>
              </tr></thead>
              <tbody>{capTable.map((inv) => (
                <tr key={inv.nombre} className="border-b last:border-0">
                  <td className="py-2 font-medium">{inv.nombre}</td>
                  <td className="py-2"><Badge variant="outline" className="text-[9px]">{inv.tipo}</Badge></td>
                  <td className="py-2 tabular-nums font-semibold">{inv.participacion}%</td>
                  <td className="py-2 tabular-nums">{inv.montoInvertido > 0 ? fmt(inv.montoInvertido) : "—"}</td>
                  <td className="py-2 text-xs">{inv.ronda}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
