"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Building2, Users, DollarSign, TrendingUp, CheckCircle, Eye, Percent } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Despacho {
  id: string; nombre: string; tipo: "judicial" | "extrajudicial" | "mixto"; casosAsignados: number; montoAsignado: number; recuperado: number; comisionPct: number; comisionPagada: number; efectividad: number; status: "activo" | "pausado"; contacto: string; contrato: string
}

const demoDespachos: Despacho[] = [
  { id: "DSP-001", nombre: "Bufete Jurídico Garza & Asociados", tipo: "judicial", casosAsignados: 45, montoAsignado: 12500000, recuperado: 3750000, comisionPct: 18, comisionPagada: 675000, efectividad: 30, status: "activo", contacto: "Lic. Roberto Garza", contrato: "CON-2025-001" },
  { id: "DSP-002", nombre: "Recuperadora Nacional SA", tipo: "extrajudicial", casosAsignados: 120, montoAsignado: 8200000, recuperado: 4920000, comisionPct: 12, comisionPagada: 590400, efectividad: 60, status: "activo", contacto: "Mariana Vega", contrato: "CON-2025-002" },
  { id: "DSP-003", nombre: "Cobranza Efectiva del Centro", tipo: "mixto", casosAsignados: 85, montoAsignado: 15800000, recuperado: 5530000, comisionPct: 15, comisionPagada: 829500, efectividad: 35, status: "activo", contacto: "Ing. Pedro López", contrato: "CON-2025-003" },
  { id: "DSP-004", nombre: "Despacho Legal Monterrey", tipo: "judicial", casosAsignados: 22, montoAsignado: 6400000, recuperado: 1280000, comisionPct: 20, comisionPagada: 256000, efectividad: 20, status: "pausado", contacto: "Lic. Ana Torres", contrato: "CON-2024-008" },
]

export default function DespachosPage() {
  const [despachos] = React.useState(demoDespachos)
  const [selected, setSelected] = React.useState<Despacho | null>(null)
  const [open, setOpen] = React.useState(false)

  const totalAsignado = despachos.reduce((s, d) => s + d.montoAsignado, 0)
  const totalRecuperado = despachos.reduce((s, d) => s + d.recuperado, 0)
  const totalComisiones = despachos.reduce((s, d) => s + d.comisionPagada, 0)
  const totalCasos = despachos.reduce((s, d) => s + d.casosAsignados, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Despachos Externos</h1>
        <p className="text-sm text-muted-foreground">Asignación, seguimiento y comisiones de despachos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Building2 className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{despachos.length}</p><p className="text-xs text-muted-foreground">Despachos Activos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{totalCasos}</p><p className="text-xs text-muted-foreground">Casos Asignados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(totalRecuperado)}</p><p className="text-xs text-muted-foreground">Total Recuperado</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Percent className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{fmt(totalComisiones)}</p><p className="text-xs text-muted-foreground">Comisiones Pagadas</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Despacho</th><th className="pb-2">Tipo</th><th className="pb-2">Casos</th><th className="pb-2">Asignado</th><th className="pb-2">Recuperado</th><th className="pb-2">Efectividad</th><th className="pb-2">Comisión %</th><th className="pb-2">Comisión $</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{despachos.map((d) => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(d); setOpen(true) }}>
                <td className="py-2 font-medium">{d.nombre}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{d.tipo}</Badge></td>
                <td className="py-2 tabular-nums">{d.casosAsignados}</td>
                <td className="py-2 tabular-nums">{fmt(d.montoAsignado)}</td>
                <td className="py-2 tabular-nums text-sayo-green font-semibold">{fmt(d.recuperado)}</td>
                <td className="py-2"><span className={`font-semibold ${d.efectividad >= 50 ? "text-sayo-green" : d.efectividad >= 30 ? "text-sayo-orange" : "text-sayo-red"}`}>{d.efectividad}%</span></td>
                <td className="py-2 tabular-nums">{d.comisionPct}%</td>
                <td className="py-2 tabular-nums">{fmt(d.comisionPagada)}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${d.status === "activo" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{d.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Despacho</DialogTitle><DialogDescription>{selected?.nombre}</DialogDescription></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase">Tipo</p><p>{selected.tipo}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Contacto</p><p>{selected.contacto}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Contrato</p><p className="font-mono">{selected.contrato}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Casos</p><p className="font-bold">{selected.casosAsignados}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Monto Asignado</p><p className="font-semibold">{fmt(selected.montoAsignado)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Recuperado</p><p className="font-bold text-sayo-green">{fmt(selected.recuperado)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Efectividad</p><p className="font-bold text-lg">{selected.efectividad}%</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Comisión</p><p className="font-semibold">{selected.comisionPct}% = {fmt(selected.comisionPagada)}</p></div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
