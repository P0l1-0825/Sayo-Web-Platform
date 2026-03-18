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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useDispositions, useCreditLines } from "@/hooks/use-originacion"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { Disposition, CreditLine } from "@/lib/types"
import { Eye, CircleDollarSign, Plus, CheckCircle, XCircle, Clock, Loader2, CreditCard, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "por_autorizar": return "bg-yellow-100 text-yellow-700"
    case "autorizada": return "bg-blue-100 text-blue-700"
    case "dispersada": return "bg-green-100 text-green-700"
    case "cancelada": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function DisposicionPage() {
  const { data: dispositions, isLoading: loadingDisp, error: errorDisp, refetch: refetchDisp } = useDispositions()
  const { data: creditLines, isLoading: loadingLines, error: errorLines, refetch: refetchLines } = useCreditLines()
  const [showWizard, setShowWizard] = React.useState(false)
  const [selectedDisp, setSelectedDisp] = React.useState<Disposition | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  // Wizard state
  const [selectedLine, setSelectedLine] = React.useState("")
  const [dispAmount, setDispAmount] = React.useState(0)
  const [destAccount, setDestAccount] = React.useState("")

  if (loadingDisp || loadingLines) return <DashboardSkeleton variant="stats-and-table" />
  if (errorDisp) return <ErrorCard message={errorDisp} onRetry={refetchDisp} />
  if (errorLines) return <ErrorCard message={errorLines} onRetry={refetchLines} />

  const allDispositions = dispositions ?? []
  const allCreditLines = creditLines ?? []

  const activeLines = allCreditLines.filter((l) => l.status === "activa" && l.available > 0)
  const chosenLine = allCreditLines.find((l) => l.id === selectedLine)

  const handleView = (disp: Disposition) => {
    setSelectedDisp(disp)
    setDetailOpen(true)
  }

  const wizardSteps: WizardStep[] = [
    {
      title: "Seleccionar Línea",
      description: "Elegir linea de credito y monto a disponer",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Línea de Crédito</Label>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Seleccionar linea...</option>
              {activeLines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.creditNumber} — {l.clientName} — Disponible: {formatMoney(l.available)}
                </option>
              ))}
            </select>
          </div>
          {chosenLine && (
            <Card className="bg-sayo-cream border-0">
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Limite</p>
                    <p className="font-semibold">{formatMoney(chosenLine.limit)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Disponible</p>
                    <p className="font-semibold text-green-600">{formatMoney(chosenLine.available)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Tasa</p>
                    <p className="font-semibold">{chosenLine.rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="space-y-2">
            <Label>Monto a Disponer</Label>
            <Input
              type="number"
              value={dispAmount || ""}
              onChange={(e) => setDispAmount(Number(e.target.value))}
              placeholder="100000"
              max={chosenLine?.available || 0}
            />
            {chosenLine && dispAmount > chosenLine.available && (
              <p className="text-xs text-red-500">El monto excede el disponible de la linea</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Cuenta Destino (CLABE)</Label>
            <Input
              type="text"
              value={destAccount}
              onChange={(e) => setDestAccount(e.target.value)}
              placeholder="012345678901234567"
              maxLength={18}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Confirmar",
      description: "Verificar datos de la disposición",
      content: (
        <div className="space-y-4">
          {chosenLine && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Línea de Crédito</span>
                  <span className="font-mono text-sm">{chosenLine.creditNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cliente</span>
                  <span className="text-sm font-medium">{chosenLine.clientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monto a Disponer</span>
                  <span className="text-lg font-bold text-sayo-cafe">{formatMoney(dispAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cuenta Destino</span>
                  <span className="font-mono text-sm">{destAccount || "No especificada"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fecha Valor</span>
                  <span className="text-sm">{new Date().toLocaleDateString("es-MX")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasa Anual</span>
                  <span className="text-sm font-semibold">{chosenLine.rate}%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-xs text-yellow-700">Al confirmar, se generara un folio de disposición y se enviara a autorización.</p>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  const handleComplete = () => {
    const folio = `DISP-${Date.now().toString().slice(-6)}`
    toast.success("Disposición creada exitosamente", {
      description: `Folio: ${folio} — ${formatMoney(dispAmount)} — Enviada a autorización`,
    })
    setShowWizard(false)
    setSelectedLine("")
    setDispAmount(0)
    setDestAccount("")
  }

  const columns: ColumnDef<Disposition>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    { accessorKey: "creditLineId", header: "No. Crédito", cell: ({ row }) => <span className="font-mono text-xs">{row.original.creditLineId}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "dispersada" && <CheckCircle className="size-3" />}
          {row.original.status === "por_autorizar" && <Clock className="size-3" />}
          {row.original.status === "autorizada" && <Loader2 className="size-3" />}
          {row.original.status === "cancelada" && <XCircle className="size-3" />}
          {row.original.status.replace(/_/g, " ")}
        </span>
      ),
    },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Disposición de Créditos</h1>
          <p className="text-sm text-muted-foreground">Solicitar disposiciones sobre lineas de credito aprobadas</p>
        </div>
        <Button onClick={() => setShowWizard(!showWizard)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          {showWizard ? "Cancelar" : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Disposición
            </>
          )}
        </Button>
      </div>

      {showWizard && (
        <WizardSteps
          steps={wizardSteps}
          onComplete={handleComplete}
          title="Nueva Disposición"
          completedContent={
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                <p className="font-semibold text-green-700">Disposición creada exitosamente</p>
                <p className="text-sm text-green-600 mt-1">Se ha enviado a autorización</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowWizard(false)}>
                  Cerrar
                </Button>
              </CardContent>
            </Card>
          }
        />
      )}

      <div>
        <h2 className="text-sm font-semibold mb-3">Historial de Disposiciones</h2>
        <DataTable
          columns={columns}
          data={allDispositions}
          searchKey="clientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="disposiciones"
          onRowClick={handleView}
        />
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Disposición</DialogTitle>
            <DialogDescription>{selectedDisp?.folio}</DialogDescription>
          </DialogHeader>
          {selectedDisp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedDisp.status)}`}>
                  {selectedDisp.status.replace(/_/g, " ")}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedDisp.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedDisp.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">No. Crédito</p>
                  <p className="font-mono">{selectedDisp.creditLineId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cuenta Destino</p>
                  <p className="font-mono text-xs">{selectedDisp.destinationAccount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedDisp.date}</p>
                </div>
                {selectedDisp.authorizedBy && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Autorizado por</p>
                    <p>{selectedDisp.authorizedBy}</p>
                  </div>
                )}
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
