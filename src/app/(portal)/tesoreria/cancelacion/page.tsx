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
import { Ban, Search, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const cancellations = [
  { id: "CAN-001", originalFolio: "TES-2025-005", beneficiary: "Roberto Sanchez Villa", amount: 75000, reason: "CLABE invalida — datos incorrectos del beneficiario", status: "completada" as const, cancelledBy: "Patricia Morales", date: "2025-03-09" },
  { id: "CAN-002", originalFolio: "TES-2024-198", beneficiary: "Servicios Externos SA", amount: 230000, reason: "Pago duplicado detectado en conciliación", status: "completada" as const, cancelledBy: "Gabriela Navarro", date: "2025-03-05" },
  { id: "CAN-003", originalFolio: "TES-2024-195", beneficiary: "Proveedor Materiales XYZ", amount: 45000, reason: "Solicitud del area solicitante — factura cancelada", status: "pendiente" as const, cancelledBy: "Gabriela Navarro", date: "2025-03-08" },
]

type Cancellation = typeof cancellations[0]

export default function CancelacionPage() {
  const { data: treasuryPayments, isLoading, error, refetch } = useTreasuryPayments()
  const [searchFolio, setSearchFolio] = React.useState("")
  const [searchRef, setSearchRef] = React.useState("")
  const [searchTracking, setSearchTracking] = React.useState("")
  const [foundPayment, setFoundPayment] = React.useState<TreasuryPayment | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [selectedCancel, setSelectedCancel] = React.useState<Cancellation | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleSearch = () => {
    const result = (treasuryPayments ?? []).find(
      (p) =>
        (searchFolio && p.folio.toLowerCase().includes(searchFolio.toLowerCase())) ||
        (searchRef && p.reference.toLowerCase().includes(searchRef.toLowerCase())) ||
        (searchTracking && p.speiTracking?.toLowerCase().includes(searchTracking.toLowerCase()))
    )
    if (result) {
      setFoundPayment(result)
      toast.info("Operación encontrada", { description: `${result.folio} — ${result.beneficiaryName}` })
    } else {
      setFoundPayment(null)
      toast.error("No encontrado", { description: "No se encontró la operación con los criterios proporcionados" })
    }
  }

  const handleCancelRequest = () => {
    if (!foundPayment) return
    setConfirmOpen(true)
  }

  const confirmCancel = () => {
    if (!foundPayment) return
    toast.success("Cancelación procesada", { description: `${foundPayment.folio} — Motivo: ${cancelReason}` })
    setConfirmOpen(false)
    setFoundPayment(null)
    setCancelReason("")
    setSearchFolio("")
    setSearchRef("")
    setSearchTracking("")
  }

  const handleViewCancel = (cancel: Cancellation) => {
    setSelectedCancel(cancel)
    setDetailOpen(true)
  }

  const canCancel = foundPayment && (foundPayment.status === "pendiente" || foundPayment.status === "autorizado")

  const cancelColumns: ColumnDef<Cancellation>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "originalFolio", header: "Folio Original", cell: ({ row }) => <span className="font-mono text-xs">{row.original.originalFolio}</span> },
    { accessorKey: "beneficiary", header: "Beneficiario" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    { accessorKey: "reason", header: "Motivo", cell: ({ row }) => <span className="text-xs max-w-[200px] truncate block">{row.original.reason}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${row.original.status === "completada" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {row.original.status === "completada" ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "cancelledBy", header: "Cancelado por" },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cancelación / Reversión</h1>
        <p className="text-sm text-muted-foreground">Cancelar o revertir operaciones de pago</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Buscar Operación</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Folio</Label>
              <Input value={searchFolio} onChange={(e) => setSearchFolio(e.target.value)} placeholder="TES-2025-XXX" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Referencia</Label>
              <Input value={searchRef} onChange={(e) => setSearchRef(e.target.value)} placeholder="Referencia del pago" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Clave Rastreo SPEI</Label>
              <Input value={searchTracking} onChange={(e) => setSearchTracking(e.target.value)} placeholder="SAYO250308XXX" className="font-mono" />
            </div>
          </div>
          <Button onClick={handleSearch} className="bg-sayo-cafe hover:bg-sayo-cafe-light">
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </CardContent>
      </Card>

      {/* Found Payment */}
      {foundPayment && (
        <Card className={canCancel ? "border-yellow-200 bg-yellow-50/50" : "border-red-200 bg-red-50/50"}>
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Operación Encontrada</span>
                <Badge variant="outline" className="text-[10px]">{foundPayment.type.toUpperCase()}</Badge>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${foundPayment.status === "procesado" ? "bg-green-100 text-green-700" : foundPayment.status === "pendiente" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                {foundPayment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Folio</p>
                <p className="font-mono text-xs">{foundPayment.folio}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Beneficiario</p>
                <p className="font-medium">{foundPayment.beneficiaryName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Monto</p>
                <p className="font-semibold tabular-nums">{formatMoney(foundPayment.amount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                <p>{foundPayment.date}</p>
              </div>
            </div>

            {!canCancel && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-600" />
                  <p className="text-xs text-red-700">
                    Esta operación no puede cancelarse. Solo se pueden cancelar pagos en estado <strong>pendiente</strong> o <strong>autorizado</strong>.
                    {foundPayment.status === "procesado" && " Los pagos ya procesados via SPEI requieren proceso de devolucion."}
                  </p>
                </div>
              </div>
            )}

            {canCancel && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Motivo de cancelación</Label>
                  <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Indica el motivo de la cancelación" />
                </div>
                <Button variant="destructive" onClick={handleCancelRequest} disabled={!cancelReason}>
                  <Ban className="mr-2 h-4 w-4" /> Cancelar Operación
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancellation History */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Historial de Cancelaciones</h2>
        <DataTable
          columns={cancelColumns}
          data={cancellations}
          searchKey="beneficiary"
          searchPlaceholder="Buscar en historial..."
          exportFilename="cancelaciones"
          onRowClick={handleViewCancel}
        />
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Cancelación</DialogTitle>
            <DialogDescription>Esta accion no se puede deshacer</DialogDescription>
          </DialogHeader>
          {foundPayment && (
            <div className="space-y-3 py-2">
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-center">
                <Ban className="h-10 w-10 mx-auto text-red-500 mb-2" />
                <p className="text-sm text-red-700">Cancelar pago por</p>
                <p className="text-2xl font-bold text-red-700">{formatMoney(foundPayment.amount)}</p>
                <p className="text-xs text-red-600 mt-1">a {foundPayment.beneficiaryName}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase">Motivo</p>
                <p className="text-sm">{cancelReason}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>No, volver</DialogClose>
            <Button variant="destructive" onClick={confirmCancel}>
              <Ban className="size-3.5 mr-1" /> Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Cancelación</DialogTitle>
            <DialogDescription>{selectedCancel?.id}</DialogDescription>
          </DialogHeader>
          {selectedCancel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Folio Original</p>
                  <p className="font-mono text-xs">{selectedCancel.originalFolio}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Beneficiario</p>
                  <p className="font-medium">{selectedCancel.beneficiary}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto</p>
                  <p className="font-semibold tabular-nums">{formatMoney(selectedCancel.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Estado</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedCancel.status === "completada" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {selectedCancel.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Motivo</p>
                  <p>{selectedCancel.reason}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cancelado por</p>
                  <p>{selectedCancel.cancelledBy}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedCancel.date}</p>
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
