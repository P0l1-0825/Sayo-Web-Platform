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
import { clientSubstitutions } from "@/hooks/use-accounts"
import { formatMoney } from "@/lib/utils"
import type { ClientSubstitution } from "@/lib/types"
import { RefreshCw, CheckCircle, Clock, ArrowRightLeft } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "procesada": return "bg-green-100 text-green-700"
    case "aprobada": return "bg-blue-100 text-blue-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "rechazada": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const substitutionTypeLabel: Record<string, string> = {
  saldo_capital: "Saldo de Capital",
  saldo_liquidar: "Saldo a Liquidar",
  saldo_total: "Saldo Total",
  credito_nuevo: "Crédito Nuevo",
}

export default function SustitucionPage() {
  const [creditId, setCreditId] = React.useState("")
  const [subType, setSubType] = React.useState("")
  const [newClientName, setNewClientName] = React.useState("")
  const [newClientRFC, setNewClientRFC] = React.useState("")
  const [amount, setAmount] = React.useState("")

  const wizardSteps: WizardStep[] = [
    {
      title: "Crédito Origen",
      description: "Selecciona el credito a sustituir",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Número de Crédito</Label>
            <Input value={creditId} onChange={(e) => setCreditId(e.target.value)} placeholder="CRED-2024-XXX" className="font-mono" />
          </div>
          {creditId && (
            <Card className="bg-muted/30">
              <CardContent className="pt-3 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Cliente Actual</span>
                  <span className="text-sm font-medium">Pedro Lopez Hernandez</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Producto</span>
                  <span className="text-sm">Crédito Cuenta Corriente</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Saldo Capital</span>
                  <span className="text-sm font-bold tabular-nums">$350,000.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Saldo Total</span>
                  <span className="text-sm font-bold tabular-nums">$380,250.00</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      title: "Tipo de Sustitución",
      description: "Selecciona como se realizara la sustitución",
      content: (
        <div className="space-y-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Sustitución</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "saldo_capital", name: "Saldo de Capital", desc: "El nuevo titular asume unicamente el saldo de capital" },
              { id: "saldo_liquidar", name: "Saldo a Liquidar", desc: "El nuevo titular paga el saldo para liquidar el credito" },
              { id: "saldo_total", name: "Saldo Total", desc: "Incluye capital, intereses y accesorios" },
              { id: "credito_nuevo", name: "Crédito Nuevo", desc: "Se genera un nuevo credito para el nuevo titular" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSubType(t.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${subType === t.id ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
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
      title: "Nuevo Titular",
      description: "Datos del nuevo titular del credito",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Nombre del nuevo titular" />
          </div>
          <div className="space-y-2">
            <Label>RFC</Label>
            <Input value={newClientRFC} onChange={(e) => setNewClientRFC(e.target.value)} placeholder="RFC del nuevo titular" className="font-mono uppercase" maxLength={13} />
          </div>
          <div className="space-y-2">
            <Label>Monto de Sustitución</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>
      ),
    },
    {
      title: "Confirmacion",
      description: "Revisa los datos antes de procesar",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Crédito</span>
              <span className="text-sm font-mono font-semibold">{creditId || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tipo Sustitución</span>
              <Badge className="bg-sayo-cafe text-white">{substitutionTypeLabel[subType] || "—"}</Badge>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Titular Original</span>
              <span className="text-sm">Pedro Lopez Hernandez</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nuevo Titular</span>
              <span className="text-sm font-medium">{newClientName || "—"}</span>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monto</span>
              <span className="text-lg font-bold tabular-nums">${Number(amount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const handleComplete = () => {
    const folio = `SUST-${Date.now().toString().slice(-6)}`
    toast.success("Sustitución procesada exitosamente", { description: `Folio: ${folio}` })
    setCreditId("")
    setSubType("")
    setNewClientName("")
    setNewClientRFC("")
    setAmount("")
  }

  const columns: ColumnDef<ClientSubstitution>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    { accessorKey: "originalCreditId", header: "Crédito", cell: ({ row }) => <span className="font-mono text-xs">{row.original.originalCreditId}</span> },
    { accessorKey: "originalClientName", header: "Titular Original" },
    { accessorKey: "newClientName", header: "Nuevo Titular" },
    {
      accessorKey: "substitutionType",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{substitutionTypeLabel[row.original.substitutionType]}</Badge>,
    },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "procesada" && <CheckCircle className="size-3" />}
          {row.original.status === "pendiente" && <Clock className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Sustitución de Clientes</h1>
        <p className="text-sm text-muted-foreground">Cambio de titularidad de creditos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{clientSubstitutions.filter((s) => s.status === "procesada").length}</p>
              <p className="text-xs text-green-600">Procesadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{clientSubstitutions.filter((s) => s.status === "pendiente").length}</p>
              <p className="text-xs text-yellow-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{clientSubstitutions.length}</p>
              <p className="text-xs text-blue-600">Total Sustituciones</p>
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
              <p className="font-semibold text-green-700">Sustitución procesada exitosamente</p>
              <p className="text-sm text-green-600 mt-1">El cambio de titularidad ha sido registrado</p>
            </CardContent>
          </Card>
        }
      />

      <div>
        <h2 className="text-sm font-semibold mb-3">Historial de Sustituciones</h2>
        <DataTable
          columns={columns}
          data={clientSubstitutions}
          searchKey="originalClientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="sustituciones_clientes"
        />
      </div>
    </div>
  )
}
