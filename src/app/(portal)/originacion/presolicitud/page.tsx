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
import { useCreditApplications } from "@/hooks/use-originacion"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { formatMoney } from "@/lib/utils"
import type { CreditApplication } from "@/lib/types"
import { Eye, Plus, FileSignature, User, Building2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const statusColor = (status: string) => {
  switch (status) {
    case "capturada": return "bg-gray-100 text-gray-700"
    case "por_aprobar": return "bg-blue-100 text-blue-700"
    case "en_comite": return "bg-purple-100 text-purple-700"
    case "por_disponer": return "bg-teal-100 text-teal-700"
    case "activa": return "bg-green-100 text-green-700"
    case "saldada": return "bg-emerald-100 text-emerald-700"
    case "rechazada": return "bg-red-100 text-red-700"
    case "cancelada": return "bg-orange-100 text-orange-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function PresolicitudPage() {
  const router = useRouter()
  const { data: creditApplications, isLoading, error, refetch } = useCreditApplications()
  const [selectedApp, setSelectedApp] = React.useState<CreditApplication | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const allApps = creditApplications ?? []

  const handleView = (app: CreditApplication) => {
    setSelectedApp(app)
    setDetailOpen(true)
  }

  const handleNewPFAE = () => {
    setNewOpen(false)
    router.push("/originacion/solicitud-pfae")
  }

  const handleNewPM = () => {
    setNewOpen(false)
    router.push("/originacion/solicitud-pm")
  }

  const columns: ColumnDef<CreditApplication>[] = [
    { accessorKey: "folio", header: "Folio", cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    {
      accessorKey: "clientType",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px]">{row.original.clientType === "PFAE" ? "PFAE" : "PM"}</Badge>
      ),
    },
    { accessorKey: "product", header: "Producto" },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(s)}`}>
            {s.replace(/_/g, " ")}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.createdAt}</span>,
    },
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

  const statusTabs = [
    { label: "Capturada", value: "capturada", count: allApps.filter((a) => a.status === "capturada").length },
    { label: "Por Aprobar", value: "por_aprobar", count: allApps.filter((a) => a.status === "por_aprobar").length },
    { label: "En Comité", value: "en_comite", count: allApps.filter((a) => a.status === "en_comite").length },
    { label: "Activa", value: "activa", count: allApps.filter((a) => a.status === "activa").length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Presolicitudes</h1>
          <p className="text-sm text-muted-foreground">Solicitudes de credito capturadas y en proceso</p>
        </div>
        <Button onClick={() => setNewOpen(true)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Solicitud
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={allApps}
        searchKey="clientName"
        searchPlaceholder="Buscar por cliente..."
        exportFilename="presolicitudes"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resumen de Presolicitud</DialogTitle>
            <DialogDescription>{selectedApp?.folio} — {selectedApp?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedApp.status)}`}>
                  {selectedApp.status.replace(/_/g, " ")}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedApp.amount)}</p>
                  <Badge variant="outline" className="text-[10px]">{selectedApp.product}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedApp.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p>{selectedApp.clientType === "PFAE" ? "Persona Fisica (PFAE)" : "Persona Moral (PM)"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tasa</p>
                  <p className="font-semibold">{selectedApp.rate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Plazo</p>
                  <p>{selectedApp.term} meses</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Asignado a</p>
                  <p>{selectedApp.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedApp.createdAt}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Application Type Selector */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud de Crédito</DialogTitle>
            <DialogDescription>Selecciona el tipo de persona para la solicitud</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={handleNewPFAE}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed hover:border-sayo-cafe hover:bg-sayo-cream transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Persona Fisica</p>
                <p className="text-xs text-muted-foreground">PFAE — 7 secciones</p>
              </div>
            </button>
            <button
              onClick={handleNewPM}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed hover:border-sayo-cafe hover:bg-sayo-cream transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Persona Moral</p>
                <p className="text-xs text-muted-foreground">PM — 8 secciones</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
