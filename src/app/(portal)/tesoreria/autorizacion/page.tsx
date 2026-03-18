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
import { usePaymentAuthorizations } from "@/hooks/use-tesoreria"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { PaymentAuthorization } from "@/lib/types"
import { ShieldCheck, ShieldAlert, Clock, CheckCircle, XCircle, Eye, Lock } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "autorizado": return "bg-green-100 text-green-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "rechazado": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function AutorizacionPage() {
  const { data: fetchedAuths, isLoading, error, refetch } = usePaymentAuthorizations()
  const [auths, setAuths] = React.useState<PaymentAuthorization[]>([])
  const [selectedAuth, setSelectedAuth] = React.useState<PaymentAuthorization | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  React.useEffect(() => { if (fetchedAuths) setAuths(fetchedAuths) }, [fetchedAuths])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const pendingAuths = auths.filter((a) => a.status === "pendiente")

  const handleView = (auth: PaymentAuthorization) => {
    setSelectedAuth(auth)
    setDetailOpen(true)
  }

  const handleAuthorize = (auth: PaymentAuthorization) => {
    setSelectedAuth(auth)
    setAuthDialogOpen(true)
  }

  const confirmAuthorize = () => {
    if (!selectedAuth) return
    setAuths((prev) => prev.map((a) => a.id === selectedAuth.id ? { ...a, status: "autorizado" as const, authorizedBy: "Patricia Morales" } : a))
    setAuthDialogOpen(false)
    toast.success("Pago autorizado", { description: `${selectedAuth.paymentFolio} — ${formatMoney(selectedAuth.amount)}` })
  }

  const handleReject = (auth: PaymentAuthorization) => {
    setSelectedAuth(auth)
    setRejectDialogOpen(true)
  }

  const confirmReject = () => {
    if (!selectedAuth) return
    setAuths((prev) => prev.map((a) => a.id === selectedAuth.id ? { ...a, status: "rechazado" as const, rejectionReason: rejectReason } : a))
    setRejectDialogOpen(false)
    setRejectReason("")
    toast.error("Pago rechazado", { description: `${selectedAuth.paymentFolio} — ${selectedAuth.beneficiaryName}` })
  }

  const handleBatchAuthorize = () => {
    const pendingSelected = selectedIds.filter((id) => auths.find((a) => a.id === id)?.status === "pendiente")
    if (pendingSelected.length === 0) {
      toast.error("Sin seleccion", { description: "Selecciona pagos pendientes para autorizar" })
      return
    }
    setAuths((prev) => prev.map((a) => pendingSelected.includes(a.id) ? { ...a, status: "autorizado" as const, authorizedBy: "Patricia Morales" } : a))
    setSelectedIds([])
    toast.success(`${pendingSelected.length} pagos autorizados`, { description: "Autorización masiva completada" })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const columns: ColumnDef<PaymentAuthorization>[] = [
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={pendingAuths.length > 0 && pendingAuths.every((a) => selectedIds.includes(a.id))}
          onChange={() => {
            if (pendingAuths.every((a) => selectedIds.includes(a.id))) {
              setSelectedIds([])
            } else {
              setSelectedIds(pendingAuths.map((a) => a.id))
            }
          }}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => row.original.status === "pendiente" ? (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.original.id)}
          onChange={() => toggleSelect(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300"
        />
      ) : null,
    },
    { accessorKey: "paymentFolio", header: "Folio Pago", cell: ({ row }) => <span className="font-mono text-xs">{row.original.paymentFolio}</span> },
    { accessorKey: "beneficiaryName", header: "Beneficiario" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
    {
      accessorKey: "requiredLevel",
      header: "Nivel",
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-[10px] ${row.original.requiredLevel === "L4" ? "border-red-300 text-red-600" : "border-blue-300 text-blue-600"}`}>
          {row.original.requiredLevel}
        </Badge>
      ),
    },
    { accessorKey: "requestedBy", header: "Solicitante" },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(s)}`}>
            {s === "autorizado" && <CheckCircle className="size-3" />}
            {s === "pendiente" && <Clock className="size-3" />}
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
      cell: ({ row }) => row.original.status === "pendiente" ? (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-xs" onClick={() => handleView(row.original)} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => handleAuthorize(row.original)} title="Autorizar">
            <CheckCircle className="size-3.5 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => handleReject(row.original)} title="Rechazar">
            <XCircle className="size-3.5 text-red-500" />
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  const statusTabs = [
    { label: "Pendiente", value: "pendiente", count: auths.filter((a) => a.status === "pendiente").length },
    { label: "Autorizado", value: "autorizado", count: auths.filter((a) => a.status === "autorizado").length },
    { label: "Rechazado", value: "rechazado", count: auths.filter((a) => a.status === "rechazado").length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Autorización de Pagos</h1>
          <p className="text-sm text-muted-foreground">Pagos que requieren autorización por monto</p>
        </div>
        {selectedIds.length > 0 && (
          <Button onClick={handleBatchAuthorize} className="bg-accent-green hover:bg-accent-green/90 text-white">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Autorizar {selectedIds.length} seleccionados
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{auths.filter((a) => a.status === "pendiente").length}</p>
              <p className="text-xs text-yellow-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{auths.filter((a) => a.status === "autorizado").length}</p>
              <p className="text-xs text-green-600">Autorizados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{auths.filter((a) => a.status === "rechazado").length}</p>
              <p className="text-xs text-red-500">Rechazados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <Lock className="size-3.5" />
          <span className="font-medium">Reglas de autorización:</span>
          <span>Pagos &gt; $50,000 requieren nivel L3 — Pagos &gt; $500,000 requieren nivel L4</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={auths}
        searchKey="beneficiaryName"
        searchPlaceholder="Buscar por beneficiario..."
        exportFilename="autorizaciones_pago"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Autorización</DialogTitle>
            <DialogDescription>{selectedAuth?.paymentFolio}</DialogDescription>
          </DialogHeader>
          {selectedAuth && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedAuth.status)}`}>
                  {selectedAuth.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedAuth.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">Nivel {selectedAuth.requiredLevel}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Beneficiario</p>
                  <p className="font-medium">{selectedAuth.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Solicitante</p>
                  <p>{selectedAuth.requestedBy}</p>
                </div>
                {selectedAuth.authorizedBy && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Autorizado por</p>
                    <p>{selectedAuth.authorizedBy}</p>
                  </div>
                )}
                {selectedAuth.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Motivo Rechazo</p>
                    <p className="text-red-600">{selectedAuth.rejectionReason}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedAuth.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Authorize Confirmation Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Autorización</DialogTitle>
            <DialogDescription>Esta accion no se puede deshacer</DialogDescription>
          </DialogHeader>
          {selectedAuth && (
            <div className="space-y-3 py-2">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                <p className="text-sm text-green-700">Autorizar pago por</p>
                <p className="text-2xl font-bold text-green-700">{formatMoney(selectedAuth.amount)}</p>
                <p className="text-xs text-green-600 mt-1">a {selectedAuth.beneficiaryName}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Token de autorización (mock)</Label>
                <Input type="password" placeholder="••••••" defaultValue="123456" className="font-mono" />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmAuthorize} className="bg-accent-green hover:bg-accent-green/90 text-white">
              <ShieldCheck className="size-3.5 mr-1" /> Autorizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rechazar Pago</DialogTitle>
            <DialogDescription>{selectedAuth?.paymentFolio}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
              <p className="text-sm text-red-700">Rechazar pago por</p>
              <p className="text-2xl font-bold text-red-700">{selectedAuth ? formatMoney(selectedAuth.amount) : ""}</p>
            </div>
            <div className="space-y-2">
              <Label>Motivo de rechazo</Label>
              <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Indica el motivo del rechazo" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={confirmReject}>
              <XCircle className="size-3.5 mr-1" /> Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
