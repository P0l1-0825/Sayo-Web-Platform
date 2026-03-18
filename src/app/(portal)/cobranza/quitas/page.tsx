"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Scissors, DollarSign, CheckCircle, Clock, Users, AlertTriangle, Eye } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Quita {
  id: string; cliente: string; credito: string; saldoOriginal: number; montoQuita: number; montoACobrar: number; porcentajeDescuento: number; diasMora: number; status: "aprobada-comite" | "pendiente-comite" | "rechazada" | "liquidada"; ejecutivo: string; fechaPropuesta: string; justificacion: string
}

const demoQuitas: Quita[] = [
  { id: "QT-001", cliente: "Industrias Regio SA", credito: "CS-2024-0234", saldoOriginal: 850000, montoQuita: 340000, montoACobrar: 510000, porcentajeDescuento: 40, diasMora: 180, status: "aprobada-comite", ejecutivo: "Ana López", fechaPropuesta: "2026-03-01", justificacion: "Cliente en proceso de quiebra, mejor recuperación parcial" },
  { id: "QT-002", cliente: "Textiles del Sureste SA", credito: "CRV-2024-0567", saldoOriginal: 420000, montoQuita: 168000, montoACobrar: 252000, porcentajeDescuento: 40, diasMora: 210, status: "pendiente-comite", ejecutivo: "Carlos Ruiz", fechaPropuesta: "2026-03-10", justificacion: "Empresa cerró operaciones, bienes embargables limitados" },
  { id: "QT-003", cliente: "Construcciones Azteca SA", credito: "CS-2024-0890", saldoOriginal: 1200000, montoQuita: 720000, montoACobrar: 480000, porcentajeDescuento: 60, diasMora: 365, status: "liquidada", ejecutivo: "Diana Flores", fechaPropuesta: "2026-01-15", justificacion: "Recuperación judicial inviable, pago único negociado" },
  { id: "QT-004", cliente: "Farmacia Popular SA", credito: "CRV-2024-0123", saldoOriginal: 280000, montoQuita: 56000, montoACobrar: 224000, porcentajeDescuento: 20, diasMora: 120, status: "rechazada", ejecutivo: "Eduardo Ramírez", fechaPropuesta: "2026-02-20", justificacion: "Comité consideró que el deudor tiene capacidad de pago" },
]

export default function QuitasPage() {
  const [quitas] = React.useState(demoQuitas)
  const [selected, setSelected] = React.useState<Quita | null>(null)
  const [open, setOpen] = React.useState(false)

  const totalQuitas = quitas.reduce((s, q) => s + q.montoQuita, 0)
  const totalRecuperado = quitas.filter((q) => q.status === "liquidada").reduce((s, q) => s + q.montoACobrar, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Quitas</h1>
        <p className="text-sm text-muted-foreground">Propuestas, aprobación por comité y seguimiento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Scissors className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{quitas.length}</p><p className="text-xs text-muted-foreground">Propuestas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{fmt(totalQuitas)}</p><p className="text-xs text-muted-foreground">Total Quitas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(totalRecuperado)}</p><p className="text-xs text-muted-foreground">Recuperado</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{quitas.filter((q) => q.status === "pendiente-comite").length}</p><p className="text-xs text-muted-foreground">Pendientes Comité</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">ID</th><th className="pb-2">Cliente</th><th className="pb-2">Saldo Original</th><th className="pb-2">Quita</th><th className="pb-2">% Desc.</th><th className="pb-2">A Cobrar</th><th className="pb-2">Días Mora</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{quitas.map((q) => (
              <tr key={q.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(q); setOpen(true) }}>
                <td className="py-2 font-mono text-xs">{q.id}</td>
                <td className="py-2 font-medium">{q.cliente}</td>
                <td className="py-2 tabular-nums">{fmt(q.saldoOriginal)}</td>
                <td className="py-2 tabular-nums text-sayo-red">{fmt(q.montoQuita)}</td>
                <td className="py-2 tabular-nums font-semibold">{q.porcentajeDescuento}%</td>
                <td className="py-2 tabular-nums font-semibold text-sayo-green">{fmt(q.montoACobrar)}</td>
                <td className="py-2"><span className={`font-semibold ${q.diasMora > 180 ? "text-sayo-red" : "text-sayo-orange"}`}>{q.diasMora}d</span></td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${q.status === "aprobada-comite" ? "bg-green-100 text-green-700" : q.status === "liquidada" ? "bg-blue-100 text-blue-700" : q.status === "rechazada" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{q.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Quita</DialogTitle><DialogDescription>{selected?.id}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase">Cliente</p><p className="font-medium">{selected.cliente}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Crédito</p><p className="font-mono">{selected.credito}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Saldo Original</p><p className="font-semibold">{fmt(selected.saldoOriginal)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Descuento</p><p className="font-bold text-sayo-red">{selected.porcentajeDescuento}% ({fmt(selected.montoQuita)})</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Monto a Cobrar</p><p className="font-bold text-lg text-sayo-green">{fmt(selected.montoACobrar)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Días Mora</p><p className="font-semibold">{selected.diasMora}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm"><p className="text-[10px] text-muted-foreground uppercase mb-1">Justificación</p><p>{selected.justificacion}</p></div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
