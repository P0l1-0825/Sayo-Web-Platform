"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Handshake, Users, DollarSign, TrendingUp, Eye } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Alianza {
  id: string; nombre: string; tipo: string; referidos: number; conversiones: number; comisionTotal: number; status: "activa" | "pausada" | "finalizada"; contacto: string; fechaInicio: string
}

const demoAlianzas: Alianza[] = [
  { id: "ALI-001", nombre: "Contpaqi Partners", tipo: "Software ERP", referidos: 145, conversiones: 38, comisionTotal: 285000, status: "activa", contacto: "Carlos Méndez", fechaInicio: "2025-06-01" },
  { id: "ALI-002", nombre: "CANACO CDMX", tipo: "Cámara Comercio", referidos: 230, conversiones: 52, comisionTotal: 420000, status: "activa", contacto: "María Torres", fechaInicio: "2025-03-15" },
  { id: "ALI-003", nombre: "Deloitte Referrals", tipo: "Consultoría", referidos: 67, conversiones: 21, comisionTotal: 189000, status: "activa", contacto: "Roberto Sánchez", fechaInicio: "2025-09-01" },
  { id: "ALI-004", nombre: "Aspel Network", tipo: "Software Contable", referidos: 98, conversiones: 15, comisionTotal: 112000, status: "pausada", contacto: "Ana García", fechaInicio: "2025-01-10" },
  { id: "ALI-005", nombre: "CANACINTRA Jalisco", tipo: "Cámara Industrial", referidos: 180, conversiones: 45, comisionTotal: 380000, status: "activa", contacto: "Luis Rodríguez", fechaInicio: "2025-04-20" },
]

export default function AlianzasPage() {
  const [alianzas] = React.useState(demoAlianzas)
  const [selected, setSelected] = React.useState<Alianza | null>(null)
  const [open, setOpen] = React.useState(false)

  const totalReferidos = alianzas.reduce((s, a) => s + a.referidos, 0)
  const totalConversiones = alianzas.reduce((s, a) => s + a.conversiones, 0)
  const totalComisiones = alianzas.reduce((s, a) => s + a.comisionTotal, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Alianzas Comerciales</h1>
        <p className="text-sm text-muted-foreground">Socios comerciales, referidos y comisiones</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Handshake className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{alianzas.length}</p><p className="text-xs text-muted-foreground">Alianzas Activas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{totalReferidos}</p><p className="text-xs text-muted-foreground">Referidos Totales</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{totalConversiones}</p><p className="text-xs text-muted-foreground">Conversiones</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{fmt(totalComisiones)}</p><p className="text-xs text-muted-foreground">Comisiones Pagadas</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">ID</th><th className="pb-2">Socio</th><th className="pb-2">Tipo</th><th className="pb-2">Referidos</th><th className="pb-2">Conversiones</th><th className="pb-2">Comisiones</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{alianzas.map((a) => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(a); setOpen(true) }}>
                <td className="py-2 font-mono text-xs">{a.id}</td>
                <td className="py-2 font-medium">{a.nombre}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{a.tipo}</Badge></td>
                <td className="py-2 tabular-nums">{a.referidos}</td>
                <td className="py-2 tabular-nums">{a.conversiones}</td>
                <td className="py-2 tabular-nums font-semibold text-sayo-green">{fmt(a.comisionTotal)}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${a.status === "activa" ? "bg-green-100 text-green-700" : a.status === "pausada" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{a.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Alianza</DialogTitle><DialogDescription>{selected?.nombre}</DialogDescription></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase">Tipo</p><p>{selected.tipo}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Contacto</p><p>{selected.contacto}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Referidos</p><p className="font-bold text-lg">{selected.referidos}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Conversiones</p><p className="font-bold text-lg">{selected.conversiones}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Tasa Conversión</p><p className="font-semibold">{((selected.conversiones / selected.referidos) * 100).toFixed(1)}%</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Comisión Total</p><p className="font-semibold text-sayo-green">{fmt(selected.comisionTotal)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Fecha Inicio</p><p>{selected.fechaInicio}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Estado</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${selected.status === "activa" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{selected.status}</span></div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
