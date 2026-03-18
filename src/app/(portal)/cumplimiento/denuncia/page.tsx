"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { WizardSteps, type WizardStep } from "@/components/forms/wizard-steps"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, FileWarning, Send, XCircle } from "lucide-react"
import { toast } from "sonner"

const denuncias = [
  { id: "DEN-001", folio: "ROI-2025-001", type: "ROI" as const, clientName: "Roberto Juarez Pinto", amount: 850000, description: "Depositos en efectivo por montos superiores al umbral regulatorio", status: "enviada" as const, createdBy: "Ana Garcia", date: "2025-03-05" },
  { id: "DEN-002", folio: "ROP-2025-001", type: "ROP" as const, clientName: "Grupo Industrial Azteca", amount: 4500000, description: "Patron transaccional inusual — incremento 350% en volumen", status: "borrador" as const, createdBy: "Ana Garcia", date: "2025-03-08" },
  { id: "DEN-003", folio: "RO24H-2025-001", type: "RO24H" as const, clientName: "Desconocido (efectivo)", amount: 120000, description: "Operación en efectivo >$50K sin relacion comercial aparente", status: "aceptada" as const, createdBy: "Ana Garcia", date: "2025-02-20" },
]

type Denuncia = typeof denuncias[0]

const statusColor = (status: string) => {
  switch (status) {
    case "aceptada": return "bg-green-100 text-green-700"
    case "enviada": return "bg-blue-100 text-blue-700"
    case "borrador": return "bg-gray-100 text-gray-700"
    case "rechazada": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function DenunciaPage() {
  const [tipoReporte, setTipoReporte] = React.useState("")
  const [clientName, setClientName] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [operationType, setOperationType] = React.useState("")
  const [involvedName, setInvolvedName] = React.useState("")
  const [involvedRFC, setInvolvedRFC] = React.useState("")
  const [narrative, setNarrative] = React.useState("")

  const wizardSteps: WizardStep[] = [
    {
      title: "Tipo de Reporte",
      description: "Selecciona el tipo de denuncia",
      content: (
        <div className="space-y-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Reporte Regulatorio</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "ROI", name: "ROI", desc: "Reporte de Operaciones Inusuales" },
              { id: "ROP", name: "ROP", desc: "Reporte de Operaciones Preocupantes" },
              { id: "RO24H", name: "RO24H", desc: "Reporte 24 Horas (efectivo)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTipoReporte(t.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${tipoReporte === t.id ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
              >
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Datos de la Operación",
      description: "Información de la operación sospechosa",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cliente / Persona</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" />
          </div>
          <div className="space-y-2">
            <Label>Monto Involucrado</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tipo de Operación</Label>
            <select value={operationType} onChange={(e) => setOperationType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Seleccionar...</option>
              <option value="efectivo">Deposito en efectivo</option>
              <option value="transferencia">Transferencia SPEI</option>
              <option value="credito">Operación de credito</option>
              <option value="cambio">Compra/venta de divisas</option>
              <option value="otra">Otra</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Involucrados",
      description: "Personas relacionadas con la operación",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre del Involucrado</Label>
            <Input value={involvedName} onChange={(e) => setInvolvedName(e.target.value)} placeholder="Nombre completo" />
          </div>
          <div className="space-y-2">
            <Label>RFC</Label>
            <Input value={involvedRFC} onChange={(e) => setInvolvedRFC(e.target.value)} placeholder="RFC del involucrado" className="font-mono uppercase" maxLength={13} />
          </div>
        </div>
      ),
    },
    {
      title: "Narrativa",
      description: "Descripcion detallada de los hechos",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Narrativa de los hechos</Label>
            <textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Describa detalladamente los hechos que originan esta denuncia, incluyendo fechas, montos, participantes y cualquier otra información relevante..."
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700">La narrativa debe incluir: contexto, descripcion cronologica, montos, involucrados y por que se considera la operación como inusual/preocupante.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Resumen",
      description: "Revisa antes de generar",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tipo Reporte</span>
              <Badge className="bg-sayo-cafe text-white">{tipoReporte || "—"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cliente</span>
              <span className="text-sm font-medium">{clientName || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monto</span>
              <span className="text-sm font-semibold tabular-nums">${Number(amount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tipo Operación</span>
              <span className="text-sm">{operationType || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Involucrado</span>
              <span className="text-sm">{involvedName || "—"}</span>
            </div>
            <hr />
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Narrativa</p>
              <p className="text-sm">{narrative || "Sin narrativa"}</p>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const handleComplete = () => {
    const folio = `${tipoReporte}-${Date.now().toString().slice(-6)}`
    toast.success("Denuncia generada exitosamente", { description: `Folio: ${folio}` })
    setTipoReporte("")
    setClientName("")
    setAmount("")
    setOperationType("")
    setInvolvedName("")
    setInvolvedRFC("")
    setNarrative("")
  }

  const columns: ColumnDef<Denuncia>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    { accessorKey: "type", header: "Tipo", cell: ({ row }) => <Badge className="bg-sayo-cafe text-white text-[10px]">{row.original.type}</Badge> },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">${row.original.amount.toLocaleString("es-MX")}</span> },
    { accessorKey: "description", header: "Descripcion", cell: ({ row }) => <span className="text-xs max-w-[200px] truncate block">{row.original.description}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "aceptada" && <CheckCircle className="size-3" />}
          {row.original.status === "enviada" && <Send className="size-3" />}
          {row.original.status === "borrador" && <Clock className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Generación de Denuncias</h1>
        <p className="text-sm text-muted-foreground">Reportes ROI, ROP y RO24H para CNBV</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileWarning className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{denuncias.filter((d) => d.status === "enviada").length}</p>
              <p className="text-xs text-blue-600">Enviadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-gray-500" />
            <div>
              <p className="text-2xl font-bold text-gray-700">{denuncias.filter((d) => d.status === "borrador").length}</p>
              <p className="text-xs text-gray-600">Borradores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{denuncias.filter((d) => d.status === "aceptada").length}</p>
              <p className="text-xs text-green-600">Aceptadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <WizardSteps
        steps={wizardSteps}
        onComplete={handleComplete}
        completedContent={
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <p className="font-semibold text-green-700">Denuncia generada exitosamente</p>
              <p className="text-sm text-green-600 mt-1">El reporte ha sido creado como borrador</p>
            </CardContent>
          </Card>
        }
      />

      <div>
        <h2 className="text-sm font-semibold mb-3">Denuncias Generadas</h2>
        <DataTable
          columns={columns}
          data={denuncias}
          searchKey="clientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="denuncias_pld"
        />
      </div>
    </div>
  )
}
