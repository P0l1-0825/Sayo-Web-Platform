"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Cpu, CheckCircle, AlertTriangle, Server } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"

interface Servicio {
  nombre: string; status: "healthy" | "degraded" | "down"; cpu: number; memoria: number; latencia: string; errores: number; uptime: string; region: string
}

const demoServicios: Servicio[] = [
  { nombre: "sayo-api", status: "healthy", cpu: 42, memoria: 68, latencia: "45ms", errores: 2, uptime: "99.98%", region: "us-central1" },
  { nombre: "sayo-web", status: "healthy", cpu: 18, memoria: 45, latencia: "120ms", errores: 0, uptime: "99.99%", region: "us-central1" },
  { nombre: "sayo-auth", status: "healthy", cpu: 25, memoria: 52, latencia: "32ms", errores: 1, uptime: "99.99%", region: "us-central1" },
  { nombre: "sayo-payments", status: "degraded", cpu: 78, memoria: 82, latencia: "250ms", errores: 15, uptime: "99.85%", region: "us-central1" },
  { nombre: "sayo-notifications", status: "healthy", cpu: 12, memoria: 35, latencia: "28ms", errores: 0, uptime: "99.97%", region: "us-central1" },
  { nombre: "sayo-analytics", status: "healthy", cpu: 55, memoria: 72, latencia: "180ms", errores: 3, uptime: "99.92%", region: "us-east1" },
  { nombre: "sayo-docs", status: "down", cpu: 0, memoria: 0, latencia: "—", errores: 450, uptime: "98.50%", region: "us-central1" },
  { nombre: "sayo-cron", status: "healthy", cpu: 8, memoria: 22, latencia: "15ms", errores: 0, uptime: "99.99%", region: "us-central1" },
]

function ServiceSkeleton() {
  return (
    <div className="p-3 rounded-lg border animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-10 bg-muted rounded mb-1" />
            <div className="h-4 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="mt-1 h-3 w-24 bg-muted rounded" />
    </div>
  )
}

export default function MonitoreoPage() {
  const [servicios, setServicios] = React.useState<Servicio[]>(demoServicios)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      if (isDemoMode) { setLoading(false); return }
      try {
        const result = await api.get<Servicio[]>("/api/v1/analytics/monitoring/services")
        if (Array.isArray(result)) setServicios(result)
      } catch { /* keep demo data */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const healthy = servicios.filter((s) => s.status === "healthy").length
  const degraded = servicios.filter((s) => s.status === "degraded").length
  const down = servicios.filter((s) => s.status === "down").length
  const activeServices = servicios.filter((s) => s.status !== "down")
  const avgCpu = activeServices.length > 0
    ? Math.round(activeServices.reduce((s, sv) => s + sv.cpu, 0) / activeServices.length)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Monitoreo</h1>
        <p className="text-sm text-muted-foreground">Dashboards Datadog — CPU, latencia, errores y disponibilidad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{healthy}</p><p className="text-xs text-muted-foreground">Servicios Healthy</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{degraded}</p><p className="text-xs text-muted-foreground">Degradados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Activity className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{down}</p><p className="text-xs text-muted-foreground">Caídos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Cpu className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{avgCpu}%</p><p className="text-xs text-muted-foreground">CPU Promedio</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Server className="size-4" /> Estado de Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
            : servicios.map((s) => (
              <div key={s.nombre} className={`p-3 rounded-lg border ${s.status === "down" ? "border-red-200 bg-red-50" : s.status === "degraded" ? "border-yellow-200 bg-yellow-50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${s.status === "healthy" ? "bg-green-500" : s.status === "degraded" ? "bg-yellow-500" : "bg-red-500"}`} />
                    <span className="font-mono text-sm font-medium">{s.nombre}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{s.region}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div><p className="text-muted-foreground">CPU</p><p className={`font-semibold tabular-nums ${s.cpu > 70 ? "text-sayo-red" : ""}`}>{s.cpu}%</p></div>
                  <div><p className="text-muted-foreground">Memoria</p><p className={`font-semibold tabular-nums ${s.memoria > 80 ? "text-sayo-red" : ""}`}>{s.memoria}%</p></div>
                  <div><p className="text-muted-foreground">Latencia</p><p className="font-semibold tabular-nums">{s.latencia}</p></div>
                  <div><p className="text-muted-foreground">Errores</p><p className={`font-semibold tabular-nums ${s.errores > 10 ? "text-sayo-red" : ""}`}>{s.errores}</p></div>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">Uptime: <span className="font-semibold">{s.uptime}</span></div>
              </div>
            ))
          }
        </div>
      </CardContent></Card>
    </div>
  )
}
