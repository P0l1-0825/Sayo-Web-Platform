"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Scale, AlertTriangle, Clock, CheckCircle, FileText, Eye } from "lucide-react"

interface ReclamoRedeco {
  id: string; folioConductef: string; cliente: string; producto: string; monto: number; motivo: string; status: "recibida" | "conciliacion" | "arbitraje" | "resuelta" | "rechazada"; fechaRecepcion: string; diasRestantes: number; resolucion: string
}

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

const demoReclamos: ReclamoRedeco[] = [
  { id: "RED-001", folioConductef: "COND-2026-4521", cliente: "María García López", producto: "Crédito Simple", monto: 45000, motivo: "Cobro indebido de comisión", status: "conciliacion", fechaRecepcion: "2026-02-28", diasRestantes: 12, resolucion: "" },
  { id: "RED-002", folioConductef: "COND-2026-4498", cliente: "Pedro Hernández", producto: "Tarjeta Empresarial", monto: 12500, motivo: "Cargo no reconocido", status: "recibida", fechaRecepcion: "2026-03-10", diasRestantes: 25, resolucion: "" },
  { id: "RED-003", folioConductef: "COND-2026-4312", cliente: "Industrias Regio SA", producto: "Línea Revolvente", monto: 85000, motivo: "Diferencia en tasa aplicada", status: "resuelta", fechaRecepcion: "2026-01-15", diasRestantes: 0, resolucion: "A favor del cliente — devolución parcial" },
  { id: "RED-004", folioConductef: "COND-2026-4405", cliente: "Comercial del Pacífico", producto: "Crédito Simple", monto: 32000, motivo: "Información incorrecta en contrato", status: "arbitraje", fechaRecepcion: "2026-02-05", diasRestantes: 8, resolucion: "" },
  { id: "RED-005", folioConductef: "COND-2026-4550", cliente: "Logística Azteca", producto: "Crédito Simple", monto: 18000, motivo: "Penalización por prepago", status: "rechazada", fechaRecepcion: "2026-03-01", diasRestantes: 0, resolucion: "Sin fundamento — contrato especifica condiciones" },
]

export default function RedecoPage() {
  const [reclamos] = React.useState(demoReclamos)
  const [selected, setSelected] = React.useState<ReclamoRedeco | null>(null)
  const [open, setOpen] = React.useState(false)

  const pendientes = reclamos.filter((r) => !["resuelta", "rechazada"].includes(r.status)).length
  const resueltas = reclamos.filter((r) => r.status === "resuelta").length
  const montoTotal = reclamos.reduce((s, r) => s + r.monto, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">REDECO — CONDUSEF</h1>
        <p className="text-sm text-muted-foreground">Reclamaciones, conciliación y arbitraje</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Scale className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{reclamos.length}</p><p className="text-xs text-muted-foreground">Total Reclamos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{pendientes}</p><p className="text-xs text-muted-foreground">Pendientes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{resueltas}</p><p className="text-xs text-muted-foreground">Resueltas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><FileText className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{fmt(montoTotal)}</p><p className="text-xs text-muted-foreground">Monto en Disputa</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">Folio CONDUSEF</th><th className="pb-2">Cliente</th><th className="pb-2">Producto</th><th className="pb-2">Monto</th><th className="pb-2">Motivo</th><th className="pb-2">Estado</th><th className="pb-2">Días Rest.</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{reclamos.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(r); setOpen(true) }}>
                <td className="py-2 font-mono text-xs">{r.folioConductef}</td>
                <td className="py-2 font-medium">{r.cliente}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{r.producto}</Badge></td>
                <td className="py-2 tabular-nums">{fmt(r.monto)}</td>
                <td className="py-2 text-xs max-w-[200px] truncate">{r.motivo}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${r.status === "resuelta" ? "bg-green-100 text-green-700" : r.status === "rechazada" ? "bg-red-100 text-red-700" : r.status === "arbitraje" ? "bg-purple-100 text-purple-700" : r.status === "conciliacion" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{r.status}</span></td>
                <td className="py-2 tabular-nums"><span className={r.diasRestantes <= 5 && r.diasRestantes > 0 ? "text-sayo-red font-bold" : ""}>{r.diasRestantes > 0 ? r.diasRestantes : "—"}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle REDECO</DialogTitle><DialogDescription>{selected?.folioConductef}</DialogDescription></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase">Cliente</p><p className="font-medium">{selected.cliente}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Producto</p><p>{selected.producto}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Monto</p><p className="font-semibold">{fmt(selected.monto)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Fecha Recepción</p><p>{selected.fechaRecepcion}</p></div>
              <div className="col-span-2"><p className="text-[10px] text-muted-foreground uppercase">Motivo</p><p>{selected.motivo}</p></div>
              {selected.resolucion && <div className="col-span-2"><p className="text-[10px] text-muted-foreground uppercase">Resolución</p><p className="font-medium">{selected.resolucion}</p></div>}
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
