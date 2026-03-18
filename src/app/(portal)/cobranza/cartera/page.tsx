"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
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
import { useCreditAccounts } from "@/hooks/use-credits"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { CreditAccount } from "@/lib/types"
import { Eye, Phone, Mail, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function CarteraPage() {
  const { data: accounts, isLoading, error, refetch } = useCreditAccounts()
  const [selectedAccount, setSelectedAccount] = React.useState<CreditAccount | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [restructureOpen, setRestructureOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />
  if (!accounts) return null

  const handleView = (account: CreditAccount) => {
    setSelectedAccount(account)
    setDetailOpen(true)
  }

  const handleCall = (account: CreditAccount) => {
    toast.success("Llamada iniciada", { description: `Contactando a ${account.clientName}` })
  }

  const handleEmail = (account: CreditAccount) => {
    toast.success("Email de cobranza enviado", { description: `Notificación enviada a ${account.clientName}` })
  }

  const handleRestructure = (account: CreditAccount) => {
    setSelectedAccount(account)
    setRestructureOpen(true)
  }

  const confirmRestructure = () => {
    if (!selectedAccount) return
    setRestructureOpen(false)
    toast.success("Solicitud de reestructura enviada", {
      description: `${selectedAccount.id} — ${selectedAccount.clientName}. Se notificará al supervisor.`,
    })
  }

  const statusTabs = [
    { label: "Vencido", value: "vencido", count: accounts.filter((a) => a.status === "vencido").length },
    { label: "Castigado", value: "castigado", count: accounts.filter((a) => a.status === "castigado").length },
    { label: "Reestructurado", value: "reestructurado", count: accounts.filter((a) => a.status === "reestructurado").length },
  ]

  const columns: ColumnDef<CreditAccount>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    { accessorKey: "productType", header: "Producto", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.productType}</Badge> },
    { accessorKey: "currentBalance", header: "Saldo Actual", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.currentBalance)}</span> },
    { accessorKey: "pastDueAmount", header: "Monto Vencido", cell: ({ row }) => <span className="font-semibold tabular-nums text-sayo-red">{formatMoney(row.original.pastDueAmount)}</span> },
    { accessorKey: "daysPastDue", header: "Días Mora", cell: ({ row }) => (
      <span className={`font-bold text-sm ${
        row.original.daysPastDue > 90 ? "text-sayo-red" :
        row.original.daysPastDue > 60 ? "text-sayo-orange" :
        "text-sayo-blue"
      }`}>{row.original.daysPastDue}</span>
    )},
    { accessorKey: "moraCategory", header: "Categoría", cell: ({ row }) => (
      <Badge className={`text-[10px] ${
        row.original.moraCategory === "90+" ? "bg-red-100 text-red-700" :
        row.original.moraCategory === "61-90" ? "bg-orange-100 text-orange-700" :
        row.original.moraCategory === "31-60" ? "bg-yellow-100 text-yellow-700" :
        "bg-blue-100 text-blue-700"
      }`}>{row.original.moraCategory}</Badge>
    )},
    { accessorKey: "status", header: "Estado", cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        row.original.status === "castigado" ? "bg-red-100 text-red-700" :
        row.original.status === "vencido" ? "bg-orange-100 text-orange-700" :
        "bg-green-100 text-green-700"
      }`}>{row.original.status}</span>
    )},
    { accessorKey: "assignedAgent", header: "Agente", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.assignedAgent}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleCall(row.original) }} title="Llamar">
            <Phone className="size-3.5 text-sayo-green" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEmail(row.original) }} title="Email">
            <Mail className="size-3.5 text-sayo-blue" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cartera Vencida</h1>
        <p className="text-sm text-muted-foreground">Créditos con atraso — días mora, monto vencido y acciones</p>
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        searchKey="clientName"
        searchPlaceholder="Buscar por cliente..."
        exportFilename="cartera_vencida"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Crédito</DialogTitle>
            <DialogDescription>{selectedAccount?.id} — {selectedAccount?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedAccount.status === "castigado" ? "bg-red-100 text-red-700" :
                  selectedAccount.status === "vencido" ? "bg-orange-100 text-orange-700" :
                  "bg-green-100 text-green-700"
                }`}>{selectedAccount.status}</span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums text-sayo-red">{formatMoney(selectedAccount.pastDueAmount)}</p>
                  <p className="text-[10px] text-muted-foreground">Monto Vencido</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedAccount.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Producto</p>
                  <p>{selectedAccount.productType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Actual</p>
                  <p className="font-semibold">{formatMoney(selectedAccount.currentBalance)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Días de Mora</p>
                  <p className={`font-bold text-lg ${selectedAccount.daysPastDue > 90 ? "text-sayo-red" : "text-sayo-orange"}`}>{selectedAccount.daysPastDue}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Categoría Mora</p>
                  <Badge className={`text-[10px] ${
                    selectedAccount.moraCategory === "90+" ? "bg-red-100 text-red-700" :
                    selectedAccount.moraCategory === "61-90" ? "bg-orange-100 text-orange-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{selectedAccount.moraCategory}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Agente Asignado</p>
                  <p>{selectedAccount.assignedAgent}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedAccount && handleCall(selectedAccount)}>
              <Phone className="size-3.5 mr-1" /> Llamar
            </Button>
            <Button variant="outline" size="sm" onClick={() => selectedAccount && handleEmail(selectedAccount)}>
              <Mail className="size-3.5 mr-1" /> Email
            </Button>
            {selectedAccount && selectedAccount.daysPastDue > 30 && (
              <Button variant="outline" size="sm" className="text-sayo-orange" onClick={() => { setDetailOpen(false); handleRestructure(selectedAccount) }}>
                <RefreshCw className="size-3.5 mr-1" /> Reestructurar
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restructure Confirmation */}
      <Dialog open={restructureOpen} onOpenChange={setRestructureOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-sayo-orange" />
              Solicitar Reestructura
            </DialogTitle>
            <DialogDescription>
              ¿Enviar solicitud de reestructuración de crédito para aprobación del supervisor?
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crédito:</span>
                <span className="font-mono text-xs">{selectedAccount.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{selectedAccount.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto Vencido:</span>
                <span className="font-semibold text-sayo-red">{formatMoney(selectedAccount.pastDueAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días Mora:</span>
                <span className="font-bold">{selectedAccount.daysPastDue}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmRestructure}>
              <RefreshCw className="size-3.5 mr-1" /> Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
