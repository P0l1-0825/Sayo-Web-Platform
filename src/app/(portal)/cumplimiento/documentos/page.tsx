"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { FolderOpen, CheckCircle, XCircle, AlertTriangle, Eye, FileText, Clock } from "lucide-react"

type PLDDocument = {
  name: string
  required: boolean
  status: "completo" | "pendiente" | "vencido"
  uploadDate?: string
  expirationDate?: string
}

type ClientExpediente = {
  id: string
  clientName: string
  clientType: "PFAE" | "PM"
  totalDocs: number
  completeDocs: number
  pendingDocs: number
  expiredDocs: number
  lastUpdate: string
  status: "completo" | "incompleto" | "vencido"
  documents: PLDDocument[]
}

const expedientes: ClientExpediente[] = [
  {
    id: "EXP-001", clientName: "Carlos Mendez Lopez", clientType: "PFAE",
    totalDocs: 8, completeDocs: 7, pendingDocs: 1, expiredDocs: 0, lastUpdate: "2025-03-01", status: "incompleto",
    documents: [
      { name: "INE / Identificación oficial", required: true, status: "completo", uploadDate: "2025-01-15" },
      { name: "Comprobante de domicilio", required: true, status: "completo", uploadDate: "2025-01-15" },
      { name: "CURP", required: true, status: "completo", uploadDate: "2025-01-15" },
      { name: "RFC / Constancia SAT", required: true, status: "completo", uploadDate: "2025-01-15" },
      { name: "Comprobante de ingresos", required: true, status: "completo", uploadDate: "2025-02-01" },
      { name: "Estado de cuenta bancario", required: true, status: "completo", uploadDate: "2025-02-01" },
      { name: "Formato PLD - Conoce a tu Cliente", required: true, status: "completo", uploadDate: "2025-01-15" },
      { name: "Declaracion de procedencia de recursos", required: true, status: "pendiente" },
    ],
  },
  {
    id: "EXP-002", clientName: "Grupo Industrial Azteca", clientType: "PM",
    totalDocs: 12, completeDocs: 10, pendingDocs: 1, expiredDocs: 1, lastUpdate: "2025-02-28", status: "vencido",
    documents: [
      { name: "Acta constitutiva", required: true, status: "completo", uploadDate: "2024-12-10" },
      { name: "Poder notarial del rep. legal", required: true, status: "completo", uploadDate: "2024-12-10" },
      { name: "INE del representante legal", required: true, status: "completo", uploadDate: "2024-12-10" },
      { name: "RFC de la empresa", required: true, status: "completo", uploadDate: "2024-12-10" },
      { name: "Comprobante domicilio fiscal", required: true, status: "vencido", uploadDate: "2024-06-15", expirationDate: "2024-12-15" },
      { name: "Estados financieros auditados", required: true, status: "completo", uploadDate: "2025-01-20" },
      { name: "Declaracion anual SAT", required: true, status: "completo", uploadDate: "2025-01-20" },
      { name: "Formato PLD - Conoce a tu Cliente PM", required: true, status: "completo", uploadDate: "2024-12-10" },
      { name: "Formato beneficiario real", required: true, status: "completo", uploadDate: "2024-12-10" },
      { name: "Estructura accionaria", required: true, status: "completo", uploadDate: "2024-12-10" },
      { name: "Opinión cumplimiento SAT", required: true, status: "completo", uploadDate: "2025-02-01" },
      { name: "Contrato social actualizado", required: false, status: "pendiente" },
    ],
  },
  {
    id: "EXP-003", clientName: "Laura Martinez Rios", clientType: "PFAE",
    totalDocs: 8, completeDocs: 8, pendingDocs: 0, expiredDocs: 0, lastUpdate: "2025-03-05", status: "completo",
    documents: [
      { name: "INE / Identificación oficial", required: true, status: "completo", uploadDate: "2025-02-10" },
      { name: "Comprobante de domicilio", required: true, status: "completo", uploadDate: "2025-02-10" },
      { name: "CURP", required: true, status: "completo", uploadDate: "2025-02-10" },
      { name: "RFC / Constancia SAT", required: true, status: "completo", uploadDate: "2025-02-10" },
      { name: "Comprobante de ingresos", required: true, status: "completo", uploadDate: "2025-02-10" },
      { name: "Estado de cuenta bancario", required: true, status: "completo", uploadDate: "2025-02-10" },
      { name: "Formato PLD - Conoce a tu Cliente", required: true, status: "completo", uploadDate: "2025-02-10" },
      { name: "Declaracion de procedencia de recursos", required: true, status: "completo", uploadDate: "2025-02-10" },
    ],
  },
]

const statusColor = (status: string) => {
  switch (status) {
    case "completo": return "bg-green-100 text-green-700"
    case "incompleto": return "bg-yellow-100 text-yellow-700"
    case "vencido": return "bg-red-100 text-red-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const docStatusIcon = (status: string) => {
  switch (status) {
    case "completo": return <CheckCircle className="size-4 text-green-600" />
    case "pendiente": return <Clock className="size-4 text-yellow-600" />
    case "vencido": return <XCircle className="size-4 text-red-600" />
    default: return null
  }
}

export default function DocumentosPage() {
  const [selectedExpediente, setSelectedExpediente] = React.useState<ClientExpediente | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const handleView = (exp: ClientExpediente) => {
    setSelectedExpediente(exp)
    setDetailOpen(true)
  }

  const totalComplete = expedientes.filter((e) => e.status === "completo").length
  const totalIncomplete = expedientes.filter((e) => e.status === "incompleto").length
  const totalExpired = expedientes.filter((e) => e.status === "vencido").length

  const columns: ColumnDef<ClientExpediente>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    {
      accessorKey: "clientType",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.clientType}</Badge>,
    },
    {
      accessorKey: "completeDocs",
      header: "Documentos",
      cell: ({ row }) => {
        const e = row.original
        const pct = Math.round((e.completeDocs / e.totalDocs) * 100)
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium tabular-nums">{e.completeDocs}/{e.totalDocs}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "pendingDocs",
      header: "Pendientes",
      cell: ({ row }) => (
        <span className={`text-xs font-semibold ${row.original.pendingDocs > 0 ? "text-yellow-600" : "text-green-600"}`}>
          {row.original.pendingDocs}
        </span>
      ),
    },
    {
      accessorKey: "expiredDocs",
      header: "Vencidos",
      cell: ({ row }) => (
        <span className={`text-xs font-semibold ${row.original.expiredDocs > 0 ? "text-red-600" : "text-green-600"}`}>
          {row.original.expiredDocs}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "completo" && <CheckCircle className="size-3" />}
          {row.original.status === "incompleto" && <AlertTriangle className="size-3" />}
          {row.original.status === "vencido" && <XCircle className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "lastUpdate", header: "Actualizado", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.lastUpdate}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Expedientes PLD</h1>
        <p className="text-sm text-muted-foreground">Documentacion KYC y expedientes de cumplimiento por cliente</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{totalComplete}</p>
              <p className="text-xs text-green-600">Expedientes Completos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{totalIncomplete}</p>
              <p className="text-xs text-yellow-600">Incompletos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{totalExpired}</p>
              <p className="text-xs text-red-500">Con Docs Vencidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Checklists by Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Docs Requeridos — PFAE</span>
            </div>
            <div className="space-y-1.5">
              {["INE / Identificación oficial", "Comprobante de domicilio", "CURP", "RFC / Constancia SAT", "Comprobante de ingresos", "Estado de cuenta bancario", "Formato PLD - KYC", "Procedencia de recursos"].map((doc) => (
                <div key={doc} className="flex items-center gap-2 p-1.5 rounded text-xs">
                  <FileText className="size-3 text-muted-foreground" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Docs Requeridos — PM</span>
            </div>
            <div className="space-y-1.5">
              {["Acta constitutiva", "Poder notarial rep. legal", "INE rep. legal", "RFC empresa", "Comprobante domicilio fiscal", "Estados financieros", "Declaracion anual SAT", "Formato PLD - KYC PM", "Beneficiario real", "Estructura accionaria", "Opinion cumplimiento SAT", "Contrato social"].map((doc) => (
                <div key={doc} className="flex items-center gap-2 p-1.5 rounded text-xs">
                  <FileText className="size-3 text-muted-foreground" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Expedientes de Clientes</h2>
        <DataTable
          columns={columns}
          data={expedientes}
          searchKey="clientName"
          searchPlaceholder="Buscar cliente..."
          exportFilename="expedientes_pld"
          onRowClick={handleView}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Expediente PLD</DialogTitle>
            <DialogDescription>{selectedExpediente?.clientName} — {selectedExpediente?.clientType}</DialogDescription>
          </DialogHeader>
          {selectedExpediente && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Badge variant="outline">{selectedExpediente.clientType}</Badge>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedExpediente.status)}`}>
                  {selectedExpediente.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{selectedExpediente.completeDocs}</p>
                  <p className="text-[10px] text-muted-foreground">Completos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-600">{selectedExpediente.pendingDocs}</p>
                  <p className="text-[10px] text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">{selectedExpediente.expiredDocs}</p>
                  <p className="text-[10px] text-muted-foreground">Vencidos</p>
                </div>
                <div className="flex-1 text-right">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.round((selectedExpediente.completeDocs / selectedExpediente.totalDocs) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round((selectedExpediente.completeDocs / selectedExpediente.totalDocs) * 100)}% completo</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Lista de Documentos</p>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {selectedExpediente.documents.map((doc) => (
                    <div key={doc.name} className={`flex items-center justify-between p-2 rounded border ${doc.status === "vencido" ? "bg-red-50 border-red-200" : doc.status === "pendiente" ? "bg-yellow-50 border-yellow-200" : "bg-green-50/50 border-green-100"}`}>
                      <div className="flex items-center gap-2">
                        {docStatusIcon(doc.status)}
                        <div>
                          <p className="text-xs font-medium">{doc.name}</p>
                          {doc.uploadDate && <p className="text-[10px] text-muted-foreground">Cargado: {doc.uploadDate}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        {doc.required && <Badge variant="outline" className="text-[9px]">Requerido</Badge>}
                        {doc.expirationDate && <p className="text-[10px] text-red-500 mt-0.5">Vence: {doc.expirationDate}</p>}
                      </div>
                    </div>
                  ))}
                </div>
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
