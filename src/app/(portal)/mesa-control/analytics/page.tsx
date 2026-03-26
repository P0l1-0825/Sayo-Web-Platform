"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  ArrowRight,
  BarChart3,
  Activity,
} from "lucide-react"

// ────────────────────────────────────────────────────────────
// Demo Data
// ────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return fmt(n)
}

const txVolumeData = [
  { name: "Sep", value: 18_400_000, spei_out: 12_000_000 },
  { name: "Oct", value: 22_100_000, spei_out: 14_500_000 },
  { name: "Nov", value: 19_800_000, spei_out: 13_200_000 },
  { name: "Dic", value: 28_600_000, spei_out: 19_000_000 },
  { name: "Ene", value: 25_300_000, spei_out: 17_400_000 },
  { name: "Feb", value: 31_200_000, spei_out: 21_600_000 },
  { name: "Mar", value: 34_800_000, spei_out: 24_100_000 },
]

const userGrowthData = [
  { name: "Sep", value: 1_420 },
  { name: "Oct", value: 1_680 },
  { name: "Nov", value: 1_950 },
  { name: "Dic", value: 2_180 },
  { name: "Ene", value: 2_640 },
  { name: "Feb", value: 3_020 },
  { name: "Mar", value: 3_480 },
]

const revenueData = [
  { name: "Sep", value: 920_000 },
  { name: "Oct", value: 1_080_000 },
  { name: "Nov", value: 980_000 },
  { name: "Dic", value: 1_420_000 },
  { name: "Ene", value: 1_250_000 },
  { name: "Feb", value: 1_580_000 },
  { name: "Mar", value: 1_740_000 },
]

const revenueBreakdown = [
  { name: "Comisiones SPEI", value: 620_000 },
  { name: "Anualidad Tarjetas", value: 480_000 },
  { name: "Intereses Créditos", value: 380_000 },
  { name: "Penalizaciones", value: 145_000 },
  { name: "Otros", value: 115_000 },
]

const topServicesByVolume = [
  { name: "SPEI Salida", value: 24_100_000 },
  { name: "SPEI Entrada", value: 10_700_000 },
  { name: "Dispersión Nómina", value: 8_200_000 },
  { name: "Pago de Servicios", value: 4_300_000 },
  { name: "Crédito Disposición", value: 3_800_000 },
]

const kycFunnelData = [
  { etapa: "Registro de usuario", total: 3_480, pct: 100 },
  { etapa: "KYC iniciado", total: 2_940, pct: 84 },
  { etapa: "Documentos enviados", total: 2_210, pct: 75 },
  { etapa: "Liveness completado", total: 1_860, pct: 84 },
  { etapa: "KYC aprobado", total: 1_530, pct: 82 },
  { etapa: "Cuenta activa", total: 1_480, pct: 97 },
]

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  delta?: number
  icon: React.ReactNode
  deltaLabel?: string
}

function KpiCard({ label, value, delta, icon, deltaLabel }: KpiCardProps) {
  const isUp = delta !== undefined && delta >= 0
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {delta !== undefined && (
              <div className="flex items-center gap-1">
                {isUp ? (
                  <TrendingUp className="size-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="size-3.5 text-red-500" />
                )}
                <span className={`text-xs font-medium ${isUp ? "text-green-600" : "text-red-500"}`}>
                  {isUp ? "+" : ""}{delta}%
                </span>
                {deltaLabel && <span className="text-xs text-muted-foreground">{deltaLabel}</span>}
              </div>
            )}
          </div>
          <div className="text-muted-foreground/60">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function MesaControlAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Analytics — Mesa de Control</h1>
        <p className="text-sm text-muted-foreground">
          Volumen transaccional, ingresos, crecimiento de usuarios y funnel KYC
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Volumen Mensual"
          value={fmtCompact(34_800_000)}
          delta={11.5}
          deltaLabel="vs feb"
          icon={<Activity className="size-7" />}
        />
        <KpiCard
          label="Ingresos del Mes"
          value={fmtCompact(1_740_000)}
          delta={10.1}
          deltaLabel="vs feb"
          icon={<DollarSign className="size-7" />}
        />
        <KpiCard
          label="Usuarios Activos"
          value="3,480"
          delta={15.2}
          deltaLabel="vs feb"
          icon={<Users className="size-7" />}
        />
        <KpiCard
          label="Tasa Aprobación KYC"
          value="43.9%"
          delta={2.1}
          deltaLabel="vs feb"
          icon={<CreditCard className="size-7" />}
        />
      </div>

      {/* Volume + Revenue row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Volumen Transaccional"
          description="SPEI entrada vs salida (últimos 7 meses)"
        >
          <AreaChartComponent
            data={txVolumeData}
            dataKey="value"
            secondaryDataKey="spei_out"
            color="var(--chart-2)"
            secondaryColor="var(--chart-4)"
            formatY="currency"
            height={220}
          />
        </ChartCard>

        <ChartCard
          title="Ingresos Mensuales"
          description="Comisiones, intereses y anualidades"
        >
          <AreaChartComponent
            data={revenueData}
            dataKey="value"
            color="var(--chart-1)"
            formatY="currency"
            height={220}
          />
        </ChartCard>
      </div>

      {/* User growth + Revenue breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Crecimiento de Usuarios"
          description="Usuarios activos acumulados"
          className="lg:col-span-2"
        >
          <BarChartComponent
            data={userGrowthData}
            dataKey="value"
            color="var(--chart-3)"
            height={200}
          />
        </ChartCard>

        <ChartCard title="Desglose de Ingresos" description="Por tipo de producto">
          <DonutChartComponent
            data={revenueBreakdown}
            height={200}
            innerRadius={45}
            outerRadius={75}
          />
        </ChartCard>
      </div>

      {/* KYC Funnel + Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KYC Funnel */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="size-4" /> Funnel KYC — Conversión
            </h2>
            <div className="space-y-2">
              {kycFunnelData.map((step, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{step.etapa}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums font-bold">{step.total.toLocaleString("es-MX")}</span>
                      {i > 0 && (
                        <span className="text-[10px] text-muted-foreground">({step.pct}%)</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-[#472913] h-2.5 rounded-full transition-all"
                      style={{ width: `${(step.total / kycFunnelData[0].total) * 100}%` }}
                    />
                  </div>
                  {i < kycFunnelData.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowRight className="size-3 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Services by Volume */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="size-4" /> Top Servicios por Volumen
            </h2>
            <div className="space-y-3">
              {topServicesByVolume.map((s, i) => {
                const maxVal = topServicesByVolume[0].value
                const pct = (s.value / maxVal) * 100
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{s.name}</span>
                      <span className="text-xs tabular-nums font-bold text-[#472913]">{fmt(s.value)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: `hsl(${20 + i * 30}, 60%, ${45 - i * 5}%)`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total procesado (Mar)</span>
                <span className="font-bold">{fmt(topServicesByVolume.reduce((s, d) => s + d.value, 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
