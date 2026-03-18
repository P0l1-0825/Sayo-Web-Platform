"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Megaphone, Users, Mail, MousePointerClick, Eye, Send, Pause, CheckCircle } from "lucide-react"

interface Campana {
  id: string; nombre: string; tipo: string; prospectos: number; enviados: number; abiertos: number; conversiones: number; status: "activa" | "pausada" | "completada" | "borrador"; fechaInicio: string; canal: string
}

const demoCampanas: Campana[] = [
  { id: "CMP-001", nombre: "Crédito PyME Q1 2026", tipo: "Outbound", prospectos: 2500, enviados: 2100, abiertos: 840, conversiones: 42, status: "activa", fechaInicio: "2026-01-15", canal: "Email + WhatsApp" },
  { id: "CMP-002", nombre: "Reactivación Cartera Dormida", tipo: "Retención", prospectos: 800, enviados: 750, abiertos: 380, conversiones: 28, status: "activa", fechaInicio: "2026-02-01", canal: "WhatsApp" },
  { id: "CMP-003", nombre: "Referidos Contpaqi", tipo: "Alianza", prospectos: 450, enviados: 420, abiertos: 210, conversiones: 18, status: "completada", fechaInicio: "2025-11-10", canal: "Email" },
  { id: "CMP-004", nombre: "Cross-sell Tarjeta Empresarial", tipo: "Cross-sell", prospectos: 1200, enviados: 0, abiertos: 0, conversiones: 0, status: "borrador", fechaInicio: "2026-04-01", canal: "Email + SMS" },
  { id: "CMP-005", nombre: "Webinar Fintech PyMEs", tipo: "Inbound", prospectos: 600, enviados: 580, abiertos: 320, conversiones: 35, status: "completada", fechaInicio: "2026-01-20", canal: "Email" },
]

export default function CampanasPage() {
  const [campanas] = React.useState(demoCampanas)
  const [selected, setSelected] = React.useState<Campana | null>(null)
  const [open, setOpen] = React.useState(false)

  const totalProspectos = campanas.reduce((s, c) => s + c.prospectos, 0)
  const totalConversiones = campanas.reduce((s, c) => s + c.conversiones, 0)
  const totalEnviados = campanas.reduce((s, c) => s + c.enviados, 0)
  const tasaApertura = totalEnviados > 0 ? Math.round((campanas.reduce((s, c) => s + c.abiertos, 0) / totalEnviados) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Campañas Outbound</h1>
        <p className="text-sm text-muted-foreground">Listas de prospectos, secuencias y seguimiento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Megaphone className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{campanas.length}</p><p className="text-xs text-muted-foreground">Campañas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{totalProspectos.toLocaleString()}</p><p className="text-xs text-muted-foreground">Prospectos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Mail className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{tasaApertura}%</p><p className="text-xs text-muted-foreground">Tasa Apertura</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><MousePointerClick className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{totalConversiones}</p><p className="text-xs text-muted-foreground">Conversiones</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">ID</th><th className="pb-2">Campaña</th><th className="pb-2">Tipo</th><th className="pb-2">Canal</th><th className="pb-2">Prospectos</th><th className="pb-2">Enviados</th><th className="pb-2">Abiertos</th><th className="pb-2">Conv.</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{campanas.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(c); setOpen(true) }}>
                <td className="py-2 font-mono text-xs">{c.id}</td>
                <td className="py-2 font-medium">{c.nombre}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{c.tipo}</Badge></td>
                <td className="py-2 text-xs">{c.canal}</td>
                <td className="py-2 tabular-nums">{c.prospectos.toLocaleString()}</td>
                <td className="py-2 tabular-nums">{c.enviados.toLocaleString()}</td>
                <td className="py-2 tabular-nums">{c.abiertos.toLocaleString()}</td>
                <td className="py-2 tabular-nums font-semibold text-sayo-green">{c.conversiones}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === "activa" ? "bg-green-100 text-green-700" : c.status === "pausada" ? "bg-yellow-100 text-yellow-700" : c.status === "completada" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{c.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Campaña</DialogTitle><DialogDescription>{selected?.nombre}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase">Tipo</p><p>{selected.tipo}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Canal</p><p>{selected.canal}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Prospectos</p><p className="font-bold">{selected.prospectos.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Enviados</p><p className="font-bold">{selected.enviados.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Tasa Apertura</p><p className="font-semibold">{selected.enviados > 0 ? Math.round((selected.abiertos / selected.enviados) * 100) : 0}%</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Conversiones</p><p className="font-bold text-sayo-green">{selected.conversiones}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Fecha Inicio</p><p>{selected.fechaInicio}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Estado</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${selected.status === "activa" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{selected.status}</span></div>
              </div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
