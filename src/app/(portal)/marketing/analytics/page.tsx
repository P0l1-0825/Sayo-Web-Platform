"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, ArrowRight, Repeat } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface FunnelStep { etapa: string; total: number; conversion: number }
interface CohorteData { mes: string; adquiridos: number; m1: number; m3: number; m6: number; m12: number }

interface AnalyticsData {
  ltv?: number
  cac?: number
  churn_rate?: number
  retention_rate?: number
  funnel?: FunnelStep[]
  cohortes?: CohorteData[]
}

const demoFunnelData: FunnelStep[] = [
  { etapa: "Visitantes Web", total: 45000, conversion: 100 },
  { etapa: "Registro", total: 5400, conversion: 12 },
  { etapa: "Solicitud Iniciada", total: 2700, conversion: 50 },
  { etapa: "Documentación Completa", total: 1620, conversion: 60 },
  { etapa: "Aprobado", total: 972, conversion: 60 },
  { etapa: "Desembolsado", total: 875, conversion: 90 },
]

const demoCohorteData: CohorteData[] = [
  { mes: "Sep 2025", adquiridos: 120, m1: 95, m3: 82, m6: 70, m12: 58 },
  { mes: "Oct 2025", adquiridos: 135, m1: 108, m3: 90, m6: 72, m12: 0 },
  { mes: "Nov 2025", adquiridos: 142, m1: 118, m3: 95, m6: 0, m12: 0 },
  { mes: "Dic 2025", adquiridos: 98, m1: 82, m3: 68, m6: 0, m12: 0 },
  { mes: "Ene 2026", adquiridos: 165, m1: 140, m3: 0, m6: 0, m12: 0 },
  { mes: "Feb 2026", adquiridos: 178, m1: 155, m3: 0, m6: 0, m12: 0 },
]

export default function AnalyticsPage() {
  const [ltv, setLtv] = React.useState(285000)
  const [cac, setCac] = React.useState(4200)
  const [churnRate, setChurnRate] = React.useState(3.2)
  const [retentionRate, setRetentionRate] = React.useState(96.8)
  const [funnelData, setFunnelData] = React.useState<FunnelStep[]>(demoFunnelData)
  const [cohorteData, setCohorteData] = React.useState<CohorteData[]>(demoCohorteData)
  const [loading, setLoading] = React.useState(!isDemoMode)

  React.useEffect(() => {
    if (isDemoMode) return
    async function load() {
      try {
        const result = await api.get<AnalyticsData>("/api/v1/analytics/stats")
        if (result.ltv != null) setLtv(result.ltv)
        if (result.cac != null) setCac(result.cac)
        if (result.churn_rate != null) setChurnRate(result.churn_rate)
        if (result.retention_rate != null) setRetentionRate(result.retention_rate)
        if (result.funnel?.length) setFunnelData(result.funnel)
        if (result.cohortes?.length) setCohorteData(result.cohortes)
      } catch {
        // fallback to demo data already set
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton variant="stats-and-table" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Funnel, retención, LTV y predicción de churn</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(ltv)}</p><p className="text-xs text-muted-foreground">LTV Promedio</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{fmt(cac)}</p><p className="text-xs text-muted-foreground">CAC</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{retentionRate}%</p><p className="text-xs text-muted-foreground">Retención</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingDown className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{churnRate}%</p><p className="text-xs text-muted-foreground">Churn Rate</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="size-4" /> Funnel de Conversión</h2>
          <div className="space-y-2">
            {funnelData.map((step, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{step.etapa}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums font-bold">{step.total.toLocaleString()}</span>
                    {i > 0 && <span className="text-[10px] text-muted-foreground">({step.conversion}%)</span>}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${(step.total / funnelData[0].total) * 100}%` }} />
                </div>
                {i < funnelData.length - 1 && <div className="flex justify-center py-0.5"><ArrowRight className="size-3 text-muted-foreground rotate-90" /></div>}
              </div>
            ))}
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Repeat className="size-4" /> Cohortes de Retención</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Cohorte</th><th className="pb-2">Adq.</th><th className="pb-2">M+1</th><th className="pb-2">M+3</th><th className="pb-2">M+6</th><th className="pb-2">M+12</th>
              </tr></thead>
              <tbody>{cohorteData.map((c) => (
                <tr key={c.mes} className="border-b last:border-0">
                  <td className="py-1.5 font-medium">{c.mes}</td>
                  <td className="py-1.5 tabular-nums">{c.adquiridos}</td>
                  <td className="py-1.5 tabular-nums"><span className="bg-green-100 text-green-700 px-1 rounded">{c.m1 > 0 ? `${Math.round((c.m1/c.adquiridos)*100)}%` : "—"}</span></td>
                  <td className="py-1.5 tabular-nums"><span className={`px-1 rounded ${c.m3 > 0 ? "bg-green-50 text-green-700" : ""}`}>{c.m3 > 0 ? `${Math.round((c.m3/c.adquiridos)*100)}%` : "—"}</span></td>
                  <td className="py-1.5 tabular-nums"><span className={`px-1 rounded ${c.m6 > 0 ? "bg-yellow-50 text-yellow-700" : ""}`}>{c.m6 > 0 ? `${Math.round((c.m6/c.adquiridos)*100)}%` : "—"}</span></td>
                  <td className="py-1.5 tabular-nums"><span className={`px-1 rounded ${c.m12 > 0 ? "bg-orange-50 text-orange-700" : ""}`}>{c.m12 > 0 ? `${Math.round((c.m12/c.adquiridos)*100)}%` : "—"}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
