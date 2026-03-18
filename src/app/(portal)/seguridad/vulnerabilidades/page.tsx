"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { ShieldAlert, Bug, AlertTriangle, CheckCircle, Clock, Eye } from "lucide-react"

interface Vulnerabilidad {
  id: string; titulo: string; fuente: "Snyk" | "SonarQube" | "Dependabot"; severidad: "critica" | "alta" | "media" | "baja"; cvss: number; componente: string; status: "abierta" | "en-remediacion" | "resuelta"; fechaDeteccion: string; descripcion: string; remediacion: string
}

const demoVulns: Vulnerabilidad[] = [
  { id: "VLN-001", titulo: "SQL Injection en endpoint /api/loans", fuente: "SonarQube", severidad: "critica", cvss: 9.8, componente: "sayo-api", status: "en-remediacion", fechaDeteccion: "2026-03-15", descripcion: "Parámetro no sanitizado permite inyección SQL", remediacion: "Usar prepared statements en query builder" },
  { id: "VLN-002", titulo: "Prototype Pollution en lodash < 4.17.21", fuente: "Snyk", severidad: "alta", cvss: 7.4, componente: "sayo-web", status: "abierta", fechaDeteccion: "2026-03-12", descripcion: "Dependencia vulnerable permite manipulación de prototype", remediacion: "Actualizar lodash a >= 4.17.21" },
  { id: "VLN-003", titulo: "XSS Reflejado en búsqueda", fuente: "SonarQube", severidad: "alta", cvss: 7.1, componente: "sayo-portal", status: "resuelta", fechaDeteccion: "2026-03-01", descripcion: "Input de búsqueda no escapa caracteres especiales", remediacion: "Implementar escape de HTML en output" },
  { id: "VLN-004", titulo: "Dependencia axios vulnerable", fuente: "Dependabot", severidad: "media", cvss: 5.3, componente: "sayo-web", status: "abierta", fechaDeteccion: "2026-03-10", descripcion: "SSRF posible en versiones anteriores a 1.6.0", remediacion: "Actualizar axios a >= 1.6.0" },
  { id: "VLN-005", titulo: "Hardcoded credentials en config", fuente: "SonarQube", severidad: "critica", cvss: 9.1, componente: "sayo-api", status: "resuelta", fechaDeteccion: "2026-02-20", descripcion: "Credenciales de DB en archivo de configuración", remediacion: "Mover a variables de entorno / Vault" },
  { id: "VLN-006", titulo: "CORS misconfiguration", fuente: "Snyk", severidad: "media", cvss: 5.0, componente: "sayo-api", status: "en-remediacion", fechaDeteccion: "2026-03-08", descripcion: "Allow-Origin demasiado permisivo", remediacion: "Restringir a dominios permitidos" },
]

export default function VulnerabilidadesPage() {
  const [vulns] = React.useState(demoVulns)
  const [selected, setSelected] = React.useState<Vulnerabilidad | null>(null)
  const [open, setOpen] = React.useState(false)

  const criticas = vulns.filter((v) => v.severidad === "critica" && v.status !== "resuelta").length
  const abiertas = vulns.filter((v) => v.status === "abierta").length
  const resueltas = vulns.filter((v) => v.status === "resuelta").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Vulnerabilidades</h1>
        <p className="text-sm text-muted-foreground">Snyk, SonarQube, CVSS scoring y remediación</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><ShieldAlert className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{vulns.length}</p><p className="text-xs text-muted-foreground">Total Detectadas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Bug className="size-5 mx-auto text-sayo-red mb-1" /><p className="text-2xl font-bold text-sayo-red">{criticas}</p><p className="text-xs text-muted-foreground">Críticas Abiertas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{abiertas}</p><p className="text-xs text-muted-foreground">Pendientes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{resueltas}</p><p className="text-xs text-muted-foreground">Resueltas</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2">ID</th><th className="pb-2">Vulnerabilidad</th><th className="pb-2">Fuente</th><th className="pb-2">CVSS</th><th className="pb-2">Severidad</th><th className="pb-2">Componente</th><th className="pb-2">Estado</th><th className="pb-2"></th>
            </tr></thead>
            <tbody>{vulns.map((v) => (
              <tr key={v.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelected(v); setOpen(true) }}>
                <td className="py-2 font-mono text-xs">{v.id}</td>
                <td className="py-2 font-medium max-w-[250px] truncate">{v.titulo}</td>
                <td className="py-2"><Badge variant="outline" className="text-[10px]">{v.fuente}</Badge></td>
                <td className="py-2 tabular-nums"><span className={`font-bold ${v.cvss >= 9 ? "text-sayo-red" : v.cvss >= 7 ? "text-sayo-orange" : "text-yellow-600"}`}>{v.cvss}</span></td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${v.severidad === "critica" ? "bg-red-100 text-red-700" : v.severidad === "alta" ? "bg-orange-100 text-orange-700" : v.severidad === "media" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{v.severidad}</span></td>
                <td className="py-2 font-mono text-xs">{v.componente}</td>
                <td className="py-2"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${v.status === "resuelta" ? "bg-green-100 text-green-700" : v.status === "en-remediacion" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{v.status}</span></td>
                <td className="py-2"><Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalle de Vulnerabilidad</DialogTitle><DialogDescription>{selected?.id}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="font-medium text-sm">{selected.titulo}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase">Fuente</p><p>{selected.fuente}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">CVSS</p><p className="font-bold text-lg">{selected.cvss}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Componente</p><p className="font-mono">{selected.componente}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Detectada</p><p>{selected.fechaDeteccion}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm"><p className="text-[10px] text-muted-foreground uppercase mb-1">Descripción</p><p>{selected.descripcion}</p></div>
              <div className="p-3 rounded-lg border bg-blue-50 text-sm"><p className="text-[10px] text-blue-600 uppercase mb-1">Remediación</p><p>{selected.remediacion}</p></div>
            </div>
          )}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
