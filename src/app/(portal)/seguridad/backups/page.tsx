"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, HardDrive, Clock, CheckCircle, AlertTriangle, Shield } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"

interface Backup {
  id: string; nombre: string; tipo: "full" | "incremental" | "snapshot"; base: string; tamano: string; duracion: string; status: "exitoso" | "fallido" | "en-progreso"; fecha: string; rpo: string; rto: string
}

interface DRTest {
  id: string; fecha: string; tipo: string; resultado: "exitoso" | "parcial" | "fallido"; tiempoRecuperacion: string; notas: string
}

const demoBackups: Backup[] = [
  { id: "BK-001", nombre: "DB Principal — Full", tipo: "full", base: "sayo-prod-db", tamano: "45.2 GB", duracion: "2h 15min", status: "exitoso", fecha: "2026-03-18 02:00", rpo: "24h", rto: "4h" },
  { id: "BK-002", nombre: "DB Principal — Incremental", tipo: "incremental", base: "sayo-prod-db", tamano: "2.1 GB", duracion: "12 min", status: "exitoso", fecha: "2026-03-18 14:00", rpo: "12h", rto: "2h" },
  { id: "BK-003", nombre: "Storage — Documentos", tipo: "snapshot", base: "sayo-docs-bucket", tamano: "120 GB", duracion: "45 min", status: "exitoso", fecha: "2026-03-17 03:00", rpo: "24h", rto: "6h" },
  { id: "BK-004", nombre: "DB Analítica — Full", tipo: "full", base: "sayo-analytics-db", tamano: "28.7 GB", duracion: "1h 30min", status: "fallido", fecha: "2026-03-17 02:00", rpo: "24h", rto: "4h" },
  { id: "BK-005", nombre: "Redis Cache — Snapshot", tipo: "snapshot", base: "sayo-redis", tamano: "800 MB", duracion: "3 min", status: "exitoso", fecha: "2026-03-18 06:00", rpo: "6h", rto: "30min" },
]

const demoDRTests: DRTest[] = [
  { id: "DR-001", fecha: "2026-03-01", tipo: "Failover DB completo", resultado: "exitoso", tiempoRecuperacion: "3h 20min", notas: "Recuperación dentro de RTO" },
  { id: "DR-002", fecha: "2026-02-01", tipo: "Restore desde backup", resultado: "exitoso", tiempoRecuperacion: "2h 45min", notas: "Sin pérdida de datos" },
  { id: "DR-003", fecha: "2026-01-15", tipo: "Simulacro zona completa", resultado: "parcial", tiempoRecuperacion: "5h 10min", notas: "Excedió RTO en servicios no críticos" },
]

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-2 pr-4">
          <div className="h-3 bg-muted rounded animate-pulse w-16" />
        </td>
      ))}
    </tr>
  )
}

export default function BackupsPage() {
  const [backups, setBackups] = React.useState<Backup[]>(demoBackups)
  const [drTests, setDRTests] = React.useState<DRTest[]>(demoDRTests)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      if (isDemoMode) { setLoading(false); return }
      try {
        const result = await api.get<{ backups?: Backup[]; dr_tests?: DRTest[] }>("/api/v1/compliance/security/backups")
        if (result?.backups && Array.isArray(result.backups)) setBackups(result.backups)
        if (result?.dr_tests && Array.isArray(result.dr_tests)) setDRTests(result.dr_tests)
      } catch { /* keep demo data */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const exitosos = backups.filter((b) => b.status === "exitoso").length
  const fallidos = backups.filter((b) => b.status === "fallido").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Backups y DR</h1>
        <p className="text-sm text-muted-foreground">Estado de respaldos, RPO/RTO y pruebas de recuperación</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Database className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{backups.length}</p><p className="text-xs text-muted-foreground">Backups Programados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{exitosos}</p><p className="text-xs text-muted-foreground">Exitosos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{fallidos}</p><p className="text-xs text-muted-foreground">Fallidos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{drTests.length}</p><p className="text-xs text-muted-foreground">Pruebas DR (Q1)</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><HardDrive className="size-4" /> Respaldos Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Nombre</th><th className="pb-2">Tipo</th><th className="pb-2">Base</th><th className="pb-2">Tamaño</th><th className="pb-2">Duración</th><th className="pb-2">RPO</th><th className="pb-2">RTO</th><th className="pb-2">Estado</th><th className="pb-2">Fecha</th>
            </tr></thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
                : backups.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 font-medium text-xs">{b.nombre}</td>
                    <td className="py-2"><Badge variant="outline" className="text-[10px]">{b.tipo}</Badge></td>
                    <td className="py-2 font-mono text-xs">{b.base}</td>
                    <td className="py-2 tabular-nums text-xs">{b.tamano}</td>
                    <td className="py-2 text-xs">{b.duracion}</td>
                    <td className="py-2 text-xs">{b.rpo}</td>
                    <td className="py-2 text-xs">{b.rto}</td>
                    <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${b.status === "exitoso" ? "bg-green-100 text-green-700" : b.status === "fallido" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{b.status}</span></td>
                    <td className="py-2 text-xs tabular-nums">{b.fecha}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="size-4" /> Pruebas de Recuperación (DR)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Fecha</th><th className="pb-2">Tipo</th><th className="pb-2">Resultado</th><th className="pb-2">Tiempo Recuperación</th><th className="pb-2">Notas</th>
            </tr></thead>
            <tbody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : drTests.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-2 text-xs">{d.fecha}</td>
                    <td className="py-2 font-medium text-xs">{d.tipo}</td>
                    <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${d.resultado === "exitoso" ? "bg-green-100 text-green-700" : d.resultado === "parcial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{d.resultado}</span></td>
                    <td className="py-2 tabular-nums text-xs">{d.tiempoRecuperacion}</td>
                    <td className="py-2 text-xs text-muted-foreground">{d.notas}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
