"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useCampaigns } from "@/hooks/use-marketing"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { Campaign, CampaignChannel, CampaignStatus } from "@/lib/types"
import { Eye, BarChart3, Pause, Play, Plus, Rocket, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

const statusColor: Record<string, string> = {
  activa: "bg-green-100 text-green-700",
  pausada: "bg-yellow-100 text-yellow-700",
  finalizada: "bg-gray-100 text-gray-500",
  borrador: "bg-gray-100 text-gray-500",
  programada: "bg-purple-100 text-purple-700",
}

const channels: CampaignChannel[] = ["push", "email", "sms", "in_app"]

export default function CampanasPage() {
  const { data: fetchedCampaigns, isLoading, error, refetch } = useCampaigns()
  const [campaignsList, setCampaignsList] = React.useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    name: "",
    channel: "push" as CampaignChannel,
    audience: "",
  })

  React.useEffect(() => { if (fetchedCampaigns) setCampaignsList(fetchedCampaigns) }, [fetchedCampaigns])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setDetailOpen(true)
  }

  const handleTogglePause = (campaign: Campaign) => {
    const newStatus = campaign.status === "activa" ? "pausada" as const : "activa" as const
    setCampaignsList((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
    )
    if (selectedCampaign?.id === campaign.id) {
      setSelectedCampaign({ ...campaign, status: newStatus })
    }
    toast.success(newStatus === "pausada" ? "Campaña pausada" : "Campaña activada", {
      description: `${campaign.id} — ${campaign.name}`,
    })
  }

  const handleFinalize = (campaign: Campaign) => {
    setCampaignsList((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, status: "finalizada" as const, endDate: new Date().toISOString().slice(0, 10) } : c))
    )
    toast.success("Campaña finalizada", { description: `${campaign.id} — ${campaign.name}` })
    setDetailOpen(false)
  }

  const handleNewCampaign = () => {
    if (!newForm.name) {
      toast.error("Ingresa el nombre de la campaña")
      return
    }
    const newCampaign: Campaign = {
      id: `CMP-${String(campaignsList.length + 1).padStart(3, "0")}`,
      name: newForm.name,
      channel: newForm.channel,
      status: "borrador",
      audience: Number(newForm.audience) || 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      startDate: new Date().toISOString().slice(0, 10),
    }
    setCampaignsList([newCampaign, ...campaignsList])
    setNewOpen(false)
    setNewForm({ name: "", channel: "push", audience: "" })
    toast.success("Campaña creada", { description: `${newCampaign.id} — ${newCampaign.name}` })
  }

  const statusTabs = [
    { label: "Activa", value: "activa", count: campaignsList.filter((c) => c.status === "activa").length },
    { label: "Pausada", value: "pausada", count: campaignsList.filter((c) => c.status === "pausada").length },
    { label: "Finalizada", value: "finalizada", count: campaignsList.filter((c) => c.status === "finalizada").length },
    { label: "Borrador", value: "borrador", count: campaignsList.filter((c) => c.status === "borrador").length },
  ]

  const columns: ColumnDef<Campaign>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "name", header: "Campaña" },
    { accessorKey: "channel", header: "Canal", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.channel}</Badge> },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[row.original.status]}`}>{row.original.status}</span>
    )},
    { accessorKey: "audience", header: "Audiencia", cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.audience.toLocaleString()}</span> },
    { accessorKey: "sent", header: "Enviados", cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.sent.toLocaleString()}</span> },
    { accessorKey: "opened", header: "Abiertos", cell: ({ row }) => {
      const rate = row.original.sent > 0 ? ((row.original.opened / row.original.sent) * 100).toFixed(1) : "0"
      return <span className="text-xs tabular-nums">{row.original.opened.toLocaleString()} ({rate}%)</span>
    }},
    { accessorKey: "converted", header: "Conversiones", cell: ({ row }) => (
      <span className="text-xs font-medium tabular-nums text-sayo-green">{row.original.converted.toLocaleString()}</span>
    )},
    { accessorKey: "startDate", header: "Inicio", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.startDate}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          {(row.original.status === "activa" || row.original.status === "pausada") && (
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleTogglePause(row.original) }} title={row.original.status === "activa" ? "Pausar" : "Activar"}>
              {row.original.status === "activa" ? <Pause className="size-3.5 text-sayo-orange" /> : <Play className="size-3.5 text-sayo-green" />}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Campañas</h1>
          <p className="text-sm text-muted-foreground">Gestión de campañas — canal, audiencia, métricas y rendimiento</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nueva Campaña
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Rocket className="size-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{campaignsList.length}</p>
            <p className="text-xs text-muted-foreground">Total Campañas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="size-5 mx-auto text-sayo-green mb-1" />
            <p className="text-2xl font-bold text-sayo-green">{campaignsList.filter((c) => c.status === "activa").length}</p>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="size-5 mx-auto text-sayo-purple mb-1" />
            <p className="text-2xl font-bold text-sayo-purple">{campaignsList.filter((c) => c.status === "programada").length}</p>
            <p className="text-xs text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="size-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{campaignsList.filter((c) => c.status === "finalizada").length}</p>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={campaignsList}
        searchKey="name"
        searchPlaceholder="Buscar campaña..."
        exportFilename="campanas_marketing"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Campaign Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Campaña</DialogTitle>
            <DialogDescription>{selectedCampaign?.id} — {selectedCampaign?.name}</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[selectedCampaign.status]}`}>
                    {selectedCampaign.status}
                  </span>
                  <Badge variant="outline" className="text-[10px]">{selectedCampaign.channel}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Audiencia</p>
                  <p className="font-medium tabular-nums">{selectedCampaign.audience.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Enviados</p>
                  <p className="tabular-nums">{selectedCampaign.sent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Abiertos</p>
                  <p className="tabular-nums">{selectedCampaign.opened.toLocaleString()} ({selectedCampaign.sent > 0 ? ((selectedCampaign.opened / selectedCampaign.sent) * 100).toFixed(1) : 0}%)</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Clicks</p>
                  <p className="tabular-nums">{selectedCampaign.clicked.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Conversiones</p>
                  <p className="font-medium tabular-nums text-sayo-green">{selectedCampaign.converted.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Período</p>
                  <p className="text-xs">{selectedCampaign.startDate} → {selectedCampaign.endDate || "En curso"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedCampaign && (selectedCampaign.status === "activa" || selectedCampaign.status === "pausada") && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleTogglePause(selectedCampaign)}>
                  {selectedCampaign.status === "activa" ? <><Pause className="size-3.5 mr-1" /> Pausar</> : <><Play className="size-3.5 mr-1" /> Activar</>}
                </Button>
                <Button variant="outline" size="sm" className="text-sayo-red" onClick={() => handleFinalize(selectedCampaign)}>
                  <CheckCircle className="size-3.5 mr-1" /> Finalizar
                </Button>
              </>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Campaign Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Campaña</DialogTitle>
            <DialogDescription>Crear nueva campaña de marketing</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre de Campaña *</label>
              <Input placeholder="Ej: Black Friday 2024" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Canal</label>
              <div className="flex gap-2 mt-1">
                {channels.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setNewForm({ ...newForm, channel: ch })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.channel === ch ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Audiencia estimada</label>
              <Input type="number" placeholder="Ej: 10000" value={newForm.audience} onChange={(e) => setNewForm({ ...newForm, audience: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewCampaign}>
              <Plus className="size-3.5 mr-1" /> Crear Campaña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
