"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, Award, AlertTriangle, FileText } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"

interface Certificacion {
  id: string; nombre: string; norma: string; status: "vigente" | "en-proceso" | "por-renovar" | "pendiente"; avance: number; fechaObtencion: string; fechaVencimiento: string; auditor: string; controles: number; controlesCompletos: number
}

const demoCerts: Certificacion[] = [
  { id: "CERT-001", nombre: "ISO 27001:2022", norma: "Seguridad de la Información", status: "vigente", avance: 100, fechaObtencion: "2025-06-15", fechaVencimiento: "2028-06-15", auditor: "BSI Group México", controles: 93, controlesCompletos: 93 },
  { id: "CERT-002", nombre: "PCI-DSS v4.0", norma: "Seguridad de Datos de Tarjeta", status: "en-proceso", avance: 72, fechaObtencion: "", fechaVencimiento: "", auditor: "Trustwave", controles: 264, controlesCompletos: 190 },
  { id: "CERT-003", nombre: "SOC 2 Type II", norma: "Controles de Servicio", status: "vigente", avance: 100, fechaObtencion: "2025-09-01", fechaVencimiento: "2026-09-01", auditor: "Deloitte México", controles: 64, controlesCompletos: 64 },
  { id: "CERT-004", nombre: "ISO 22301", norma: "Continuidad de Negocio", status: "por-renovar", avance: 85, fechaObtencion: "2024-04-10", fechaVencimiento: "2026-04-10", auditor: "TÜV Rheinland", controles: 42, controlesCompletos: 36 },
  { id: "CERT-005", nombre: "CNBV Regulación", norma: "Cumplimiento Regulatorio SOFOM", status: "vigente", avance: 100, fechaObtencion: "2025-12-01", fechaVencimiento: "2026-12-01", auditor: "CNBV", controles: 156, controlesCompletos: 156 },
]

function CertSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-2 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-40 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

export default function CertificacionesPage() {
  const [certs, setCerts] = React.useState<Certificacion[]>(demoCerts)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      if (isDemoMode) { setLoading(false); return }
      try {
        const result = await api.get<Certificacion[]>("/api/v1/compliance/certifications")
        if (Array.isArray(result)) setCerts(result)
      } catch { /* keep demo data */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const vigentes = certs.filter((c) => c.status === "vigente").length
  const enProceso = certs.filter((c) => c.status === "en-proceso").length
  const porRenovar = certs.filter((c) => c.status === "por-renovar").length
  const totalControles = certs.reduce((s, c) => s + c.controles, 0)
  const completados = certs.reduce((s, c) => s + c.controlesCompletos, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Certificaciones</h1>
        <p className="text-sm text-muted-foreground">ISO 27001, PCI-DSS, SOC 2 y cumplimiento regulatorio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Award className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{vigentes}</p><p className="text-xs text-muted-foreground">Vigentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><ShieldCheck className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{enProceso}</p><p className="text-xs text-muted-foreground">En Proceso</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{porRenovar}</p><p className="text-xs text-muted-foreground">Por Renovar</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><FileText className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{completados}/{totalControles}</p><p className="text-xs text-muted-foreground">Controles Cumplidos</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CertSkeleton key={i} />)
          : certs.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{cert.nombre}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cert.status === "vigente" ? "bg-green-100 text-green-700" : cert.status === "en-proceso" ? "bg-blue-100 text-blue-700" : cert.status === "por-renovar" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{cert.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cert.norma}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{cert.auditor}</Badge>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <Progress value={cert.avance} className="flex-1 h-2" />
                  <span className="text-xs font-bold tabular-nums">{cert.avance}%</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Controles: {cert.controlesCompletos}/{cert.controles}</span>
                  {cert.fechaObtencion && <span>Obtenida: {cert.fechaObtencion}</span>}
                  {cert.fechaVencimiento && <span>Vence: {cert.fechaVencimiento}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
