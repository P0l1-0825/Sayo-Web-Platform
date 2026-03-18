"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Building2, FileText, CreditCard, ShieldCheck, History, Eye, Search } from "lucide-react"
import { toast } from "sonner"

interface Cliente {
  id: string
  razonSocial: string
  rfc: string
  sector: string
  satStatus: "activo" | "inactivo" | "suspendido"
  buroScore: number
  facturacionAnual: number
  estado: string
  antiguedad: number
  ultimaActividad: string
}

const demoClientes: Cliente[] = [
  { id: "CLI-001", razonSocial: "Distribuidora del Norte SA de CV", rfc: "DNO200315AB1", sector: "Comercio", satStatus: "activo", buroScore: 720, facturacionAnual: 18500000, estado: "Nuevo León", antiguedad: 5, ultimaActividad: "2026-03-15" },
  { id: "CLI-002", razonSocial: "Alimentos Frescos del Bajío SA de CV", rfc: "AFB190824CD3", sector: "Alimentos", satStatus: "activo", buroScore: 685, facturacionAnual: 9200000, estado: "Guanajuato", antiguedad: 7, ultimaActividad: "2026-03-12" },
  { id: "CLI-003", razonSocial: "Logística Express México SA de CV", rfc: "LEM210510EF5", sector: "Transporte", satStatus: "activo", buroScore: 750, facturacionAnual: 32000000, estado: "CDMX", antiguedad: 4, ultimaActividad: "2026-03-17" },
  { id: "CLI-004", razonSocial: "TechParts Manufacturing SA de CV", rfc: "TPM180612GH7", sector: "Manufactura", satStatus: "suspendido", buroScore: 590, facturacionAnual: 5800000, estado: "Jalisco", antiguedad: 8, ultimaActividad: "2026-02-28" },
  { id: "CLI-005", razonSocial: "Servicios Médicos Integral SC", rfc: "SMI200901IJ9", sector: "Salud", satStatus: "activo", buroScore: 710, facturacionAnual: 14300000, estado: "Puebla", antiguedad: 6, ultimaActividad: "2026-03-10" },
]

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

export default function FichaClientePage() {
  const [clientes] = React.useState(demoClientes)
  const [selected, setSelected] = React.useState<Cliente | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filtered = clientes.filter((c) =>
    c.razonSocial.toLowerCase().includes(search.toLowerCase()) || c.rfc.toLowerCase().includes(search.toLowerCase())
  )

  const avgBuro = Math.round(clientes.reduce((s, c) => s + c.buroScore, 0) / clientes.length)
  const totalFacturacion = clientes.reduce((s, c) => s + c.facturacionAnual, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Ficha de Cliente</h1>
        <p className="text-sm text-muted-foreground">Datos empresariales, SAT, Buró y historial</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Building2 className="size-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{clientes.length}</p>
          <p className="text-xs text-muted-foreground">Total Clientes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <ShieldCheck className="size-5 mx-auto text-sayo-green mb-1" />
          <p className="text-2xl font-bold text-sayo-green">{clientes.filter((c) => c.satStatus === "activo").length}</p>
          <p className="text-xs text-muted-foreground">SAT Activo</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CreditCard className="size-5 mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{avgBuro}</p>
          <p className="text-xs text-muted-foreground">Score Buró Promedio</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <FileText className="size-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{fmt(totalFacturacion)}</p>
          <p className="text-xs text-muted-foreground">Facturación Anual Total</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Buscar por razón social o RFC..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2">ID</th><th className="pb-2">Razón Social</th><th className="pb-2">RFC</th><th className="pb-2">Sector</th><th className="pb-2">SAT</th><th className="pb-2">Buró</th><th className="pb-2">Facturación</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(c); setDetailOpen(true) }}>
                    <td className="py-2 font-mono text-xs">{c.id}</td>
                    <td className="py-2 font-medium">{c.razonSocial}</td>
                    <td className="py-2 font-mono text-xs">{c.rfc}</td>
                    <td className="py-2"><Badge variant="outline" className="text-[10px]">{c.sector}</Badge></td>
                    <td className="py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${c.satStatus === "activo" ? "bg-green-100 text-green-700" : c.satStatus === "suspendido" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{c.satStatus}</span>
                    </td>
                    <td className="py-2 tabular-nums">{c.buroScore}</td>
                    <td className="py-2 tabular-nums">{fmt(c.facturacionAnual)}</td>
                    <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ficha de Cliente</DialogTitle>
            <DialogDescription>{selected?.razonSocial}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase">RFC</p><p className="font-mono">{selected.rfc}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Sector</p><p>{selected.sector}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Estado</p><p>{selected.estado}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Antigüedad</p><p>{selected.antiguedad} años</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Score Buró</p><p className="font-bold text-lg">{selected.buroScore}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Facturación Anual</p><p className="font-semibold">{fmt(selected.facturacionAnual)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Estatus SAT</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${selected.satStatus === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{selected.satStatus}</span>
                </div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Última Actividad</p><p>{selected.ultimaActividad}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
