"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
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
import { useTreasuryPayments } from "@/hooks/use-tesoreria"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { TreasuryPayment } from "@/lib/types"
import { Eye, Receipt, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

const convenios = [
  { id: "CONV-001", name: "SAT - ISR", reference: "ISR-2025", bank: "Banxico" },
  { id: "CONV-002", name: "SAT - IVA", reference: "IVA-2025", bank: "Banxico" },
  { id: "CONV-003", name: "IMSS", reference: "IMSS-2025", bank: "Banorte" },
  { id: "CONV-004", name: "INFONAVIT", reference: "INFO-2025", bank: "HSBC" },
  { id: "CONV-005", name: "CFE", reference: "CFE-2025", bank: "BBVA" },
  { id: "CONV-006", name: "Telmex", reference: "TEL-2025", bank: "Santander" },
]

const statusColor = (status: string) => {
  switch (status) {
    case "procesado": return "bg-green-100 text-green-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "autorizado": return "bg-blue-100 text-blue-700"
    case "rechazado": return "bg-red-100 text-red-700"
    case "cancelado": return "bg-gray-100 text-gray-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function PagosReferenciadosPage() {
  const { data: treasuryPayments, isLoading, error, refetch } = useTreasuryPayments()
  const [selectedPayment, setSelectedPayment] = React.useState<TreasuryPayment | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newPaymentOpen, setNewPaymentOpen] = React.useState(false)
  const [convenio, setConvenio] = React.useState("")
  const [referencia, setReferencia] = React.useState("")
  const [monto, setMonto] = React.useState(0)
  const [concepto, setConcepto] = React.useState("")

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const referencedPayments = (treasuryPayments ?? []).filter((p) => p.type === "referenciado")

  const handleView = (payment: TreasuryPayment) => {
    setSelectedPayment(payment)
    setDetailOpen(true)
  }

  const handleCreate = () => {
    const folio = `REF-${Date.now().toString().slice(-6)}`
    toast.success("Pago referenciado creado", { description: `Folio: ${folio} — ${formatMoney(monto)}` })
    setNewPaymentOpen(false)
    setConvenio("")
    setReferencia("")
    setMonto(0)
    setConcepto("")
  }

  const selectConvenio = (conv: typeof convenios[0]) => {
    setConvenio(conv.name)
    setReferencia(conv.reference)
    toast.info("Convenio seleccionado", { description: conv.name })
  }

  const columns: ColumnDef<TreasuryPayment>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    { accessorKey: "beneficiaryName", header: "Convenio / Beneficiario" },
    { accessorKey: "beneficiaryBank", header: "Banco" },
    { accessorKey: "reference", header: "Referencia", cell: ({ row }) => <span className="font-mono text-xs">{row.original.reference}</span> },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(s)}`}>
            {s === "procesado" && <CheckCircle className="size-3" />}
            {s === "pendiente" && <Clock className="size-3" />}
            {s === "autorizado" && <Loader2 className="size-3" />}
            {s === "rechazado" && <XCircle className="size-3" />}
            {s}
          </span>
        )
      },
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
          <h1 className="text-xl font-bold">Pagos Referenciados</h1>
          <p className="text-sm text-muted-foreground">Pagos CIE / CLC con referencia de convenio</p>
        </div>
        <Button onClick={() => setNewPaymentOpen(true)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Receipt className="mr-2 h-4 w-4" />
          Nuevo Pago Referenciado
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Receipt className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-indigo-700">{referencedPayments.length}</p>
              <p className="text-xs text-indigo-600">Pagos Referenciados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{formatMoney(referencedPayments.filter(p => p.status === "procesado").reduce((s, p) => s + p.amount, 0))}</p>
              <p className="text-xs text-green-600">Monto Procesado</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{referencedPayments.filter(p => p.status === "pendiente").length}</p>
              <p className="text-xs text-yellow-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={referencedPayments}
        searchKey="beneficiaryName"
        searchPlaceholder="Buscar por convenio..."
        exportFilename="pagos_referenciados"
        onRowClick={handleView}
      />

      {/* New Referenced Payment Dialog */}
      <Dialog open={newPaymentOpen} onOpenChange={setNewPaymentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Pago Referenciado</DialogTitle>
            <DialogDescription>Selecciona un convenio y captura los datos del pago</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Convenios Disponibles</Label>
              <div className="grid grid-cols-2 gap-2">
                {convenios.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConvenio(conv)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors text-left ${convenio === conv.name ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
                  >
                    <Receipt className="size-3 text-indigo-500 shrink-0" />
                    <div>
                      <p className="font-medium text-xs">{conv.name}</p>
                      <p className="text-[10px] text-muted-foreground">{conv.bank}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Convenio</Label>
                <Input value={convenio} onChange={(e) => setConvenio(e.target.value)} placeholder="Nombre del convenio" />
              </div>
              <div className="space-y-2">
                <Label>Referencia CIE/CLC</Label>
                <Input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Referencia numerica" className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input type="number" value={monto || ""} onChange={(e) => setMonto(Number(e.target.value))} placeholder="0.00" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Concepto</Label>
                <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Concepto del pago" />
              </div>
            </div>
            {monto > 0 && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total a pagar:</span>
                  <span className="text-xl font-bold text-sayo-cafe">{formatMoney(monto)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleCreate} className="bg-sayo-cafe hover:bg-sayo-cafe-light">Procesar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Pago Referenciado</DialogTitle>
            <DialogDescription>{selectedPayment?.folio}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedPayment.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">REFERENCIADO</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Convenio</p>
                  <p className="font-medium">{selectedPayment.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Banco</p>
                  <p>{selectedPayment.beneficiaryBank}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                  <p className="font-mono text-xs">{selectedPayment.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Concepto</p>
                  <p>{selectedPayment.concept}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cuenta Origen</p>
                  <p className="font-mono text-xs">{selectedPayment.sourceAccount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Solicitado por</p>
                  <p>{selectedPayment.requestedBy}</p>
                </div>
                {selectedPayment.speiTracking && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Clave Rastreo SPEI</p>
                    <p className="font-mono text-xs">{selectedPayment.speiTracking}</p>
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
