"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { usePaymentBatches } from "@/hooks/use-tesoreria"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { PaymentBatch } from "@/lib/types"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Clock, Eye, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "procesado": return "bg-green-100 text-green-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    case "parcial": return "bg-orange-100 text-orange-700"
    case "error": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function PagosEmpresaPage() {
  const { data: paymentBatches, isLoading, error, refetch } = usePaymentBatches()
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [selectedBatch, setSelectedBatch] = React.useState<PaymentBatch | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!paymentBatches) return null

  const handleUpload = () => {
    setUploadOpen(false)
    toast.success("Layout cargado exitosamente", { description: "15 registros encontrados — $1,250,000 total" })
  }

  const handleView = (batch: PaymentBatch) => {
    setSelectedBatch(batch)
    setDetailOpen(true)
  }

  const columns: ColumnDef<PaymentBatch>[] = [
    { accessorKey: "id", header: "ID Lote", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "name", header: "Nombre del Lote" },
    { accessorKey: "totalRecords", header: "Registros", cell: ({ row }) => <span className="font-semibold">{row.original.totalRecords}</span> },
    { accessorKey: "totalAmount", header: "Monto Total", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.totalAmount)}</span> },
    {
      accessorKey: "successCount",
      header: "Exito / Error",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-green-600">{row.original.successCount} ok</span>
          <span className="text-red-500">{row.original.errorCount} err</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "procesado" && <CheckCircle className="size-3" />}
          {row.original.status === "pendiente" && <Clock className="size-3" />}
          {row.original.status === "parcial" && <AlertTriangle className="size-3" />}
          {row.original.status === "error" && <XCircle className="size-3" />}
          {row.original.status}
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
          <h1 className="text-xl font-bold">Pagos Empresa (Masivos)</h1>
          <p className="text-sm text-muted-foreground">Dispersión masiva mediante carga de layouts</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Cargar Layout
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-indigo-700">{paymentBatches.length}</p>
              <p className="text-xs text-indigo-600">Lotes Procesados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{paymentBatches.reduce((s, b) => s + b.successCount, 0)}</p>
              <p className="text-xs text-green-600">Pagos Exitosos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{paymentBatches.reduce((s, b) => s + b.errorCount, 0)}</p>
              <p className="text-xs text-red-500">Con Error</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={paymentBatches}
        searchKey="name"
        searchPlaceholder="Buscar por nombre del lote..."
        exportFilename="lotes_pago"
        onRowClick={handleView}
      />

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cargar Layout de Pagos</DialogTitle>
            <DialogDescription>Formato: CSV o TXT separado por pipes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Arrastra tu archivo aqui</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, TXT — Max 5MB</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Formato esperado:</p>
              <p className="text-xs font-mono text-muted-foreground">Beneficiario|CLABE|Monto|Concepto|Referencia</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleUpload} className="bg-sayo-cafe hover:bg-sayo-cafe-light">Procesar Layout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Lote</DialogTitle>
            <DialogDescription>{selectedBatch?.id} — {selectedBatch?.name}</DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedBatch.status)}`}>
                  {selectedBatch.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedBatch.totalAmount)}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedBatch.totalRecords} registros</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Exitosos</p>
                  <p className="font-semibold text-green-600">{selectedBatch.successCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Con Error</p>
                  <p className="font-semibold text-red-500">{selectedBatch.errorCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Creado por</p>
                  <p>{selectedBatch.createdBy}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedBatch.date}</p>
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
