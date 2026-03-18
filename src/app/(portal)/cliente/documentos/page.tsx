"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, CheckCircle, Clock, Shield, Eye, File } from "lucide-react"
import { toast } from "sonner"

interface Documento {
  id: string; nombre: string; tipo: "contrato" | "aviso-privacidad" | "pagare" | "estado-cuenta" | "caratula" | "comprobante"; fecha: string; status: "firmado" | "pendiente" | "vigente"; tamano: string
}

const demoDocumentos: Documento[] = [
  { id: "DOC-001", nombre: "Contrato de Crédito Revolvente", tipo: "contrato", fecha: "2025-06-15", status: "firmado", tamano: "2.4 MB" },
  { id: "DOC-002", nombre: "Pagaré — Crédito CRV-2025-0892", tipo: "pagare", fecha: "2025-06-15", status: "firmado", tamano: "1.1 MB" },
  { id: "DOC-003", nombre: "Aviso de Privacidad Integral", tipo: "aviso-privacidad", fecha: "2025-06-15", status: "vigente", tamano: "890 KB" },
  { id: "DOC-004", nombre: "Carátula de Crédito", tipo: "caratula", fecha: "2025-06-15", status: "firmado", tamano: "450 KB" },
  { id: "DOC-005", nombre: "Estado de Cuenta — Marzo 2026", tipo: "estado-cuenta", fecha: "2026-03-01", status: "vigente", tamano: "320 KB" },
  { id: "DOC-006", nombre: "Estado de Cuenta — Febrero 2026", tipo: "estado-cuenta", fecha: "2026-02-01", status: "vigente", tamano: "310 KB" },
  { id: "DOC-007", nombre: "Estado de Cuenta — Enero 2026", tipo: "estado-cuenta", fecha: "2026-01-01", status: "vigente", tamano: "295 KB" },
  { id: "DOC-008", nombre: "Comprobante de Desembolso", tipo: "comprobante", fecha: "2025-06-16", status: "firmado", tamano: "150 KB" },
  { id: "DOC-009", nombre: "Contrato Tarjeta Empresarial", tipo: "contrato", fecha: "2025-09-01", status: "pendiente", tamano: "1.8 MB" },
]

export default function DocumentosPage() {
  const firmados = demoDocumentos.filter((d) => d.status === "firmado").length
  const pendientes = demoDocumentos.filter((d) => d.status === "pendiente").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Documentos</h1>
        <p className="text-sm text-muted-foreground">Contratos firmados, aviso de privacidad y estados de cuenta</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><FileText className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{demoDocumentos.length}</p><p className="text-xs text-muted-foreground">Total Documentos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{firmados}</p><p className="text-xs text-muted-foreground">Firmados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{pendientes}</p><p className="text-xs text-muted-foreground">Pendientes de Firma</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">e.firma</p><p className="text-xs text-muted-foreground">Firma Electrónica</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="space-y-2">
          {demoDocumentos.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50">
              <File className={`size-8 ${d.tipo === "contrato" ? "text-blue-500" : d.tipo === "estado-cuenta" ? "text-sayo-green" : d.tipo === "aviso-privacidad" ? "text-purple-500" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[9px]">{d.tipo}</Badge>
                  <span className="text-[10px] text-muted-foreground">{d.fecha}</span>
                  <span className="text-[10px] text-muted-foreground">{d.tamano}</span>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${d.status === "firmado" ? "bg-green-100 text-green-700" : d.status === "pendiente" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{d.status}</span>
              <Button variant="ghost" size="icon-xs" onClick={() => toast.success(`Descargando ${d.nombre}`)}><Download className="size-3.5" /></Button>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  )
}
