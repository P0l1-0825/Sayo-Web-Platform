"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { useServiceData } from "@/hooks/use-service-data"
import { accountsService } from "@/lib/accounts-service"
import { formatMoney, formatClabe, getStatusColor, copyToClipboard } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { ArrowDownLeft, ArrowUpRight, Eye, Copy, CheckCircle, XCircle, Clock, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// ──────────────────────────────────────────────────────────
// Mapper: TransactionRecord (snake_case) → Transaction (camelCase)
// ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTransaction(t: any): Transaction {
  return {
    id:            t.id,
    claveRastreo:  t.clave_rastreo ?? t.claveRastreo ?? "",
    type:          t.type ?? "SPEI_IN",
    status:        t.status,
    amount:        t.amount,
    concept:       t.concepto ?? t.concept ?? t.description ?? "",
    senderName:    t.sender_name   ?? t.senderName   ?? "",
    senderBank:    t.sender_bank   ?? t.senderBank   ?? "",
    senderClabe:   t.sender_clabe  ?? t.senderClabe  ?? "",
    receiverName:  t.receiver_name ?? t.receiverName ?? "",
    receiverBank:  t.receiver_bank ?? t.receiverBank ?? "",
    receiverClabe: t.receiver_clabe ?? t.receiverClabe ?? "",
    date:          t.initiated_at  ?? t.date ?? t.created_at ?? "",
    hour:          t.initiated_at
      ? new Date(t.initiated_at).toLocaleTimeString("es-MX", { hour12: false })
      : (t.hour ?? ""),
  }
}

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────

export default function SPEIPage() {
  // Fetch all transactions and filter to SPEI_IN / SPEI_OUT client-side.
  // The API accepts ?type=SPEI_IN,SPEI_OUT but demo mode uses exact-match
  // filtering, so we fetch without a type param and filter locally instead.
  const {
    data: rawTransactions,
    isLoading,
    error,
    refetch,
  } = useServiceData(
    () => accountsService.getAllTransactions(),
    []
  )

  const [selectedTxn, setSelectedTxn] = React.useState<Transaction | null>(null)
  const [detailOpen, setDetailOpen]   = React.useState(false)

  const transactions = React.useMemo<Transaction[]>(() => {
    if (!rawTransactions) return []
    return rawTransactions
      .filter((t) => t.type === "SPEI_IN" || t.type === "SPEI_OUT")
      .map(mapTransaction)
  }, [rawTransactions])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error)     return <ErrorCard message={error} onRetry={refetch} />

  const speiIn  = transactions.filter((t) => t.type === "SPEI_IN")
  const speiOut = transactions.filter((t) => t.type === "SPEI_OUT")

  const handleView = (txn: Transaction) => {
    setSelectedTxn(txn)
    setDetailOpen(true)
  }

  const handleCopyClave = async (clave: string) => {
    const ok = await copyToClipboard(clave)
    if (ok) toast.success("Clave de rastreo copiada", { description: clave })
    else    toast.error("No se pudo copiar")
  }

  const handleCopyClabe = async (clabe: string) => {
    const ok = await copyToClipboard(clabe)
    if (ok) toast.success("CLABE copiada", { description: formatClabe(clabe) })
    else    toast.error("No se pudo copiar")
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "completada":  return <CheckCircle className="size-3" />
      case "rechazada":   return <XCircle className="size-3" />
      case "pendiente":   return <Clock className="size-3" />
      case "en_proceso":  return <Loader2 className="size-3 animate-spin" />
      default:            return null
    }
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "claveRastreo",
      header: "Clave Rastreo",
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); void handleCopyClave(row.original.claveRastreo) }}
          className="font-mono text-xs hover:text-sayo-cafe transition-colors flex items-center gap-1 group"
        >
          {row.original.claveRastreo}
          <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.type.includes("IN") ? (
            <ArrowDownLeft className="size-3.5 text-sayo-green" />
          ) : (
            <ArrowUpRight className="size-3.5 text-sayo-red" />
          )}
          <Badge variant="outline" className="text-[10px]">{row.original.type}</Badge>
        </div>
      ),
    },
    { accessorKey: "senderName",  header: "Origen" },
    { accessorKey: "senderBank",  header: "Banco Origen", cell: ({ row }) => <span className="text-xs">{row.original.senderBank}</span> },
    { accessorKey: "receiverName", header: "Destino" },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(row.original.status)}`}>
          {statusIcon(row.original.status)}
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "hour",
      header: "Hora",
      cell: ({ row }) => <span className="text-muted-foreground text-xs tabular-nums">{row.original.hour}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => { e.stopPropagation(); handleView(row.original) }}
        >
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  const statusTabs = [
    { label: "Completada", value: "completada", count: transactions.filter((t) => t.status === "completada").length },
    { label: "Pendiente",  value: "pendiente",  count: transactions.filter((t) => t.status === "pendiente").length },
    { label: "Rechazada",  value: "rechazada",  count: transactions.filter((t) => t.status === "rechazada").length },
    { label: "En Proceso", value: "en_proceso", count: transactions.filter((t) => t.status === "en_proceso").length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Operaciones SPEI</h1>
          <p className="text-sm text-muted-foreground">Transferencias electrónicas interbancarias</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="size-4 mr-1.5" />
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-50">
              <ArrowDownLeft className="size-5 text-sayo-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SPEI Entrada</p>
              <p className="text-lg font-bold">{speiIn.length} ops</p>
              <p className="text-[10px] text-sayo-green font-medium">
                {formatMoney(speiIn.reduce((s, t) => s + t.amount, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50">
              <ArrowUpRight className="size-5 text-sayo-red" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SPEI Salida</p>
              <p className="text-lg font-bold">{speiOut.length} ops</p>
              <p className="text-[10px] text-sayo-red font-medium">
                {formatMoney(speiOut.reduce((s, t) => s + t.amount, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <span className="text-sayo-blue font-bold text-sm">Σ</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Procesado</p>
              <p className="text-lg font-bold">
                {formatMoney(transactions.reduce((s, t) => s + t.amount, 0))}
              </p>
              <p className="text-[10px] text-muted-foreground">{transactions.length} transacciones</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table with Status Tabs + CSV Export */}
      <DataTable
        columns={columns}
        data={transactions}
        searchKey="claveRastreo"
        searchPlaceholder="Buscar por clave de rastreo..."
        pageSize={20}
        exportFilename="operaciones_spei"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Transaction Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Transacción</DialogTitle>
            <DialogDescription>{selectedTxn?.id} — {selectedTxn?.claveRastreo}</DialogDescription>
          </DialogHeader>

          {selectedTxn && (
            <div className="space-y-4">
              {/* Status + Amount */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedTxn.status)}`}>
                  {statusIcon(selectedTxn.status)}
                  {selectedTxn.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedTxn.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">{selectedTxn.type}</Badge>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Clave Rastreo</p>
                  <button
                    onClick={() => void handleCopyClave(selectedTxn.claveRastreo)}
                    className="font-mono text-sm flex items-center gap-1 hover:text-sayo-cafe"
                  >
                    {selectedTxn.claveRastreo} <Copy className="size-3" />
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fecha / Hora</p>
                  <p>{selectedTxn.date} {selectedTxn.hour}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Concepto</p>
                  <p>{selectedTxn.concept}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tipo</p>
                  <p>{selectedTxn.type}</p>
                </div>
              </div>

              {/* Sender */}
              <div className="p-3 rounded-lg border space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ordenante</p>
                <p className="text-sm font-medium">{selectedTxn.senderName} — {selectedTxn.senderBank}</p>
                <button
                  onClick={() => void handleCopyClabe(selectedTxn.senderClabe)}
                  className="font-mono text-xs text-muted-foreground flex items-center gap-1 hover:text-sayo-cafe"
                >
                  {formatClabe(selectedTxn.senderClabe)} <Copy className="size-3" />
                </button>
              </div>

              {/* Receiver */}
              <div className="p-3 rounded-lg border space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Beneficiario</p>
                <p className="text-sm font-medium">{selectedTxn.receiverName} — {selectedTxn.receiverBank}</p>
                <button
                  onClick={() => void handleCopyClabe(selectedTxn.receiverClabe)}
                  className="font-mono text-xs text-muted-foreground flex items-center gap-1 hover:text-sayo-cafe"
                >
                  {formatClabe(selectedTxn.receiverClabe)} <Copy className="size-3" />
                </button>
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
