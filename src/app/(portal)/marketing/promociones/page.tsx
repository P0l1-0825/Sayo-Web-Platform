"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Gift, Tag, Percent, Users, Eye, Calendar } from "lucide-react"
import { api, isDemoMode } from "@/lib/api-client"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

interface Promocion {
  id: string; nombre: string; tipo: "codigo" | "tasa-preferencial" | "cashback" | "sin-comision"; codigo: string; descuento: string; usos: number; limite: number; fechaInicio: string; fechaFin: string; status: "activa" | "expirada" | "programada"; segmento: string
}

const demoPromos: Promocion[] = [
  { id: "PRM-001", nombre: "Bienvenida 2026", tipo: "tasa-preferencial", codigo: "BIENVENIDO26", descuento: "Tasa preferencial 18%", usos: 245, limite: 500, fechaInicio: "2026-01-01", fechaFin: "2026-06-30", status: "activa", segmento: "Nuevos Solicitantes" },
  { id: "PRM-002", nombre: "Cashback Marzo", tipo: "cashback", codigo: "CASHMAR26", descuento: "3% cashback en compras", usos: 180, limite: 300, fechaInicio: "2026-03-01", fechaFin: "2026-03-31", status: "activa", segmento: "Clientes Tarjeta" },
  { id: "PRM-003", nombre: "Sin Comisión Apertura", tipo: "sin-comision", codigo: "SINCOM26", descuento: "0% comisión apertura", usos: 420, limite: 400, fechaInicio: "2026-01-15", fechaFin: "2026-03-15", status: "expirada", segmento: "Todos" },
  { id: "PRM-004", nombre: "Referido VIP", tipo: "codigo", codigo: "REFVIP500", descuento: "$500 MXN bono por referido", usos: 0, limite: 1000, fechaInicio: "2026-04-01", fechaFin: "2026-06-30", status: "programada", segmento: "Clientes Activos" },
  { id: "PRM-005", nombre: "Tasa Especial PyME", tipo: "tasa-preferencial", codigo: "PYMEESP", descuento: "Tasa desde 16%", usos: 89, limite: 200, fechaInicio: "2026-02-01", fechaFin: "2026-04-30", status: "activa", segmento: "PyMEs Alto Valor" },
]

export default function PromocionesPage() {
  const [promos, setPromos] = React.useState<Promocion[]>(demoPromos)
  const [selected, setSelected] = React.useState<Promocion | null>(null)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(!isDemoMode)

  React.useEffect(() => {
    if (isDemoMode) return
    async function load() {
      try {
        const result = await api.get<Promocion[]>("/api/v1/marketing/promotions")
        if (result?.length) setPromos(result)
      } catch {
        // fallback to demo data already set
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton variant="stats-and-table" />

  const activas = promos.filter((p) => p.status === "activa").length
  const totalUsos = promos.reduce((s, p) => s + p.usos, 0)
  const tiposUnicos = new Set(promos.map((p) => p.tipo)).size

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Promociones</h1>
        <p className="text-sm text-muted-foreground">Ofertas, códigos y tasas preferenciales</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Gift className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{promos.length}</p><p className="text-xs text-muted-foreground">Promociones</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Tag className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{activas}</p><p className="text-xs text-muted-foreground">Activas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{totalUsos.toLocaleString()}</p><p className="text-xs text-muted-foreground">Usos Totales</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Percent className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{tiposUnicos}</p><p className="text-xs text-muted-foreground">Tipos de Promo</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Nombre</th><th className="pb-2">Código</th><th className="pb-2">Tipo</th><th className="pb-2">Descuento</th><th className="pb-2">Usos</th><th className="pb-2">Vigencia</th><th className="pb-2">Segmento</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{promos.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(p); setOpen(true) }}>
                <td className="py-2 font-medium">{p.nombre}</td>
                <td className="py-2 font-mono text-xs bg-muted/50 rounded px-1">{p.codigo}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{p.tipo}</Badge></td>
                <td className="py-2 text-xs">{p.descuento}</td>
                <td className="py-2 tabular-nums">{p.usos}/{p.limite}</td>
                <td className="py-2 text-xs">{p.fechaInicio} — {p.fechaFin}</td>
                <td className="py-2 text-xs">{p.segmento}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === "activa" ? "bg-green-100 text-green-700" : p.status === "expirada" ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700"}`}>{p.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Promoción</DialogTitle><DialogDescription>{selected?.nombre}</DialogDescription></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase">Código</p><p className="font-mono font-bold">{selected.codigo}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Tipo</p><p>{selected.tipo}</p></div>
              <div className="col-span-2"><p className="text-[10px] text-muted-foreground uppercase">Descuento</p><p className="font-semibold">{selected.descuento}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Usos</p><p className="font-bold">{selected.usos} / {selected.limite}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Segmento</p><p>{selected.segmento}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Inicio</p><p>{selected.fechaInicio}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Fin</p><p>{selected.fechaFin}</p></div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
