"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Users, Filter, Layers, TrendingUp, Eye } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

interface Segmento {
  id: string; nombre: string; descripcion: string; filtros: string[]; tamano: number; tasaConversion: number; ltv: number; status: "activo" | "borrador" | "archivado"; ultimaActualizacion: string
}

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

const demoSegmentos: Segmento[] = [
  { id: "SEG-001", nombre: "PyMEs Alto Valor", descripcion: "Empresas con facturación > $10M y score buró > 700", filtros: ["facturacion > 10M", "buro > 700", "antiguedad > 3 años"], tamano: 1250, tasaConversion: 12.5, ltv: 450000, status: "activo", ultimaActualizacion: "2026-03-15" },
  { id: "SEG-002", nombre: "Nuevos Solicitantes", descripcion: "Leads que completaron solicitud en últimos 30 días", filtros: ["tipo = lead", "solicitud_completa = true", "dias < 30"], tamano: 340, tasaConversion: 28.3, ltv: 180000, status: "activo", ultimaActualizacion: "2026-03-18" },
  { id: "SEG-003", nombre: "Clientes Dormidos", descripcion: "Sin actividad en últimos 90 días con crédito vigente", filtros: ["tipo = cliente", "ultima_actividad > 90d", "credito_vigente = true"], tamano: 580, tasaConversion: 5.2, ltv: 320000, status: "activo", ultimaActualizacion: "2026-03-10" },
  { id: "SEG-004", nombre: "Cross-sell Tarjeta", descripcion: "Clientes actuales sin tarjeta empresarial", filtros: ["tipo = cliente", "tiene_tarjeta = false", "credito_al_corriente = true"], tamano: 890, tasaConversion: 15.8, ltv: 280000, status: "activo", ultimaActualizacion: "2026-03-12" },
  { id: "SEG-005", nombre: "Riesgo Churn", descripcion: "Clientes con señales de abandono", filtros: ["nps < 7", "tickets > 3", "uso_plataforma < 2/sem"], tamano: 210, tasaConversion: 0, ltv: 520000, status: "activo", ultimaActualizacion: "2026-03-17" },
]

export default function SegmentosPage() {
  const [segmentos, setSegmentos] = React.useState<Segmento[]>(demoSegmentos)
  const [selected, setSelected] = React.useState<Segmento | null>(null)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(!isDemoMode)

  React.useEffect(() => {
    if (isDemoMode) return
    async function load() {
      try {
        const result = await api.get<Segmento[]>("/api/v1/marketing/segments")
        if (result?.length) setSegmentos(result)
      } catch {
        // fallback to demo data already set
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton variant="stats-and-table" />

  const totalContactos = segmentos.reduce((s, sg) => s + sg.tamano, 0)
  const activeWithConversion = segmentos.filter(s => s.tasaConversion > 0)
  const avgConversion = activeWithConversion.length > 0
    ? (activeWithConversion.reduce((s, sg) => s + sg.tasaConversion, 0) / activeWithConversion.length).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Segmentos</h1>
        <p className="text-sm text-muted-foreground">Constructor visual de segmentos, filtros y cohortes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Layers className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{segmentos.length}</p><p className="text-xs text-muted-foreground">Segmentos Activos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{totalContactos.toLocaleString()}</p><p className="text-xs text-muted-foreground">Contactos Totales</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{avgConversion}%</p><p className="text-xs text-muted-foreground">Conv. Promedio</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Filter className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{segmentos.reduce((s, sg) => s + sg.filtros.length, 0)}</p><p className="text-xs text-muted-foreground">Filtros Aplicados</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {segmentos.map((seg) => (
          <Card key={seg.id} className="cursor-pointer hover:bg-muted/30" onClick={() => { setSelected(seg); setOpen(true) }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{seg.nombre}</h3>
                    <Badge variant="outline" className="text-[10px]">{seg.tamano.toLocaleString()} contactos</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{seg.descripcion}</p>
                </div>
                <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {seg.filtros.map((f, i) => (
                  <span key={i} className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-[10px] font-mono">{f}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Conversión: <span className="font-semibold text-foreground">{seg.tasaConversion}%</span></span>
                <span>LTV: <span className="font-semibold text-foreground">{fmt(seg.ltv)}</span></span>
                <span>Actualizado: {seg.ultimaActualizacion}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Segmento</DialogTitle><DialogDescription>{selected?.nombre}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selected.descripcion}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase">Tamaño</p><p className="font-bold text-lg">{selected.tamano.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Tasa Conversión</p><p className="font-bold text-lg">{selected.tasaConversion}%</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">LTV Promedio</p><p className="font-semibold">{fmt(selected.ltv)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Última Actualización</p><p>{selected.ultimaActualizacion}</p></div>
              </div>
              <div><p className="text-[10px] text-muted-foreground uppercase mb-2">Filtros</p>
                <div className="flex flex-wrap gap-1.5">{selected.filtros.map((f, i) => (<span key={i} className="inline-flex items-center rounded bg-muted px-2 py-1 text-xs font-mono">{f}</span>))}</div>
              </div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
