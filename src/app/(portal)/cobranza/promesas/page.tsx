"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Handshake, CheckCircle, Clock, XCircle, DollarSign, Eye, Calendar } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Promesa {
  id: string; cliente: string; credito: string; montoPago: number; fechaPromesa: string; status: "cumplida" | "pendiente" | "vencida" | "parcial"; ejecutivo: string; canal: string; notas: string
}

const demoPromesas: Promesa[] = [
  { id: "PRM-001", cliente: "Distribuidora del Norte SA", credito: "CRV-2025-0345", montoPago: 45000, fechaPromesa: "2026-03-20", status: "pendiente", ejecutivo: "Ana López", canal: "Teléfono", notas: "Compromete pago completo el viernes" },
  { id: "PRM-002", cliente: "TechParts Manufacturing SA", credito: "CS-2025-0128", montoPago: 32000, fechaPromesa: "2026-03-15", status: "cumplida", ejecutivo: "Carlos Ruiz", canal: "WhatsApp", notas: "Pagó vía SPEI el 15 de marzo" },
  { id: "PRM-003", cliente: "Alimentos Frescos del Bajío", credito: "CRV-2025-0567", montoPago: 28000, fechaPromesa: "2026-03-10", status: "vencida", ejecutivo: "Diana Flores", canal: "Teléfono", notas: "No realizó pago, reprogramar" },
  { id: "PRM-004", cliente: "Logística Express México", credito: "CS-2025-0892", montoPago: 65000, fechaPromesa: "2026-03-18", status: "parcial", ejecutivo: "Ana López", canal: "Email", notas: "Pagó $30,000 de $65,000" },
  { id: "PRM-005", cliente: "Servicios Médicos Integral", credito: "CRV-2025-0234", montoPago: 18000, fechaPromesa: "2026-03-22", status: "pendiente", ejecutivo: "Eduardo Ramírez", canal: "Teléfono", notas: "Confirma pago para el lunes" },
  { id: "PRM-006", cliente: "Comercial del Pacífico SA", credito: "CS-2025-0456", montoPago: 52000, fechaPromesa: "2026-03-12", status: "vencida", ejecutivo: "Carlos Ruiz", canal: "Visita", notas: "Problemas de flujo, solicita reestructura" },
]

export default function PromesasPage() {
  const [promesas] = React.useState(demoPromesas)
  const [selected, setSelected] = React.useState<Promesa | null>(null)
  const [open, setOpen] = React.useState(false)

  const totalPromesas = promesas.reduce((s, p) => s + p.montoPago, 0)
  const cumplidas = promesas.filter((p) => p.status === "cumplida").length
  const vencidas = promesas.filter((p) => p.status === "vencida").length
  const tasaCumplimiento = Math.round((cumplidas / promesas.length) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Promesas de Pago</h1>
        <p className="text-sm text-muted-foreground">Registro, seguimiento y cumplimiento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Handshake className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{promesas.length}</p><p className="text-xs text-muted-foreground">Total Promesas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{fmt(totalPromesas)}</p><p className="text-xs text-muted-foreground">Monto Comprometido</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{tasaCumplimiento}%</p><p className="text-xs text-muted-foreground">Tasa Cumplimiento</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><XCircle className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{vencidas}</p><p className="text-xs text-muted-foreground">Vencidas</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">ID</th><th className="pb-2">Cliente</th><th className="pb-2">Crédito</th><th className="pb-2">Monto</th><th className="pb-2">Fecha</th><th className="pb-2">Canal</th><th className="pb-2">Ejecutivo</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{promesas.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(p); setOpen(true) }}>
                <td className="py-2 font-mono text-xs">{p.id}</td>
                <td className="py-2 font-medium">{p.cliente}</td>
                <td className="py-2 font-mono text-xs">{p.credito}</td>
                <td className="py-2 tabular-nums font-semibold">{fmt(p.montoPago)}</td>
                <td className="py-2 text-xs">{p.fechaPromesa}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{p.canal}</Badge></td>
                <td className="py-2 text-xs">{p.ejecutivo}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === "cumplida" ? "bg-green-100 text-green-700" : p.status === "pendiente" ? "bg-yellow-100 text-yellow-700" : p.status === "parcial" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{p.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Promesa</DialogTitle><DialogDescription>{selected?.id}</DialogDescription></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase">Cliente</p><p className="font-medium">{selected.cliente}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Crédito</p><p className="font-mono">{selected.credito}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Monto</p><p className="font-bold text-lg">{fmt(selected.montoPago)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Fecha Promesa</p><p>{selected.fechaPromesa}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Canal</p><p>{selected.canal}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Ejecutivo</p><p>{selected.ejecutivo}</p></div>
              <div className="col-span-2"><p className="text-[10px] text-muted-foreground uppercase">Notas</p><p>{selected.notas}</p></div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
