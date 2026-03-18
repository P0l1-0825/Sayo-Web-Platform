"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
import { Card, CardContent } from "@/components/ui/card"
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
import { marketingStats, useCampaigns } from "@/hooks/use-marketing"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { Campaign } from "@/lib/types"
import { Eye, Rocket, Pause, Play, BarChart3 } from "lucide-react"
import { toast } from "sonner"

const campaignPerformance = [
  { name: "Bienvenida", value: 32, conversiones: 2.0 },
  { name: "Crédito Push", value: 35, conversiones: 1.7 },
  { name: "Pago SMS", value: 95, conversiones: 40.0 },
  { name: "Marketplace", value: 0, conversiones: 0 },
  { name: "Black Friday", value: 42, conversiones: 4.0 },
]

const channelBreakdown = [
  { name: "Email", value: 2 },
  { name: "Push", value: 1 },
  { name: "SMS", value: 1 },
  { name: "In-App", value: 1 },
]

const statusColor: Record<string, string> = {
  activa: "bg-green-100 text-green-700",
  pausada: "bg-yellow-100 text-yellow-700",
  finalizada: "bg-gray-100 text-gray-500",
  borrador: "bg-gray-100 text-gray-500",
  programada: "bg-purple-100 text-purple-700",
}

export default function MarketingDashboard() {
  const { data: fetchedCampaigns, isLoading, error, refetch } = useCampaigns()
  const [campaignsList, setCampaignsList] = React.useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

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
    toast.success(newStatus === "pausada" ? "Campaña pausada" : "Campaña activada", {
      description: `${campaign.id} — ${campaign.name}`,
    })
    setDetailOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Marketing & Notificaciones</h1>
        <p className="text-sm text-muted-foreground">Campañas, notificaciones push, email y SMS</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Tasa Apertura por Campaña" description="% de apertura" className="lg:col-span-2">
          <BarChartComponent data={campaignPerformance} dataKey="value" color="var(--chart-1)" />
        </ChartCard>
        <ChartCard title="Por Canal" description="Distribución de campañas">
          <DonutChartComponent data={channelBreakdown} />
        </ChartCard>
      </div>

      {/* Campaigns List */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Campañas</h2>
        <div className="space-y-2">
          {campaignsList.map((c) => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleView(c)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Rocket className="size-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{c.id}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{c.name}</p>
                    <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Audiencia: {c.audience.toLocaleString()} • Enviados: {c.sent.toLocaleString()} • Abiertos: {c.opened.toLocaleString()} • Conversiones: {c.converted.toLocaleString()}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[c.status]}`}>{c.status}</span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleView(c)} title="Ver detalle">
                    <Eye className="size-3.5" />
                  </Button>
                  {(c.status === "activa" || c.status === "pausada") && (
                    <Button variant="ghost" size="icon-xs" onClick={() => handleTogglePause(c)} title={c.status === "activa" ? "Pausar" : "Activar"}>
                      {c.status === "activa" ? <Pause className="size-3.5 text-sayo-orange" /> : <Play className="size-3.5 text-sayo-green" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                  <p className="tabular-nums">{selectedCampaign.opened.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Conversiones</p>
                  <p className="font-medium tabular-nums text-sayo-green">{selectedCampaign.converted.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Inicio</p>
                  <p className="text-xs">{selectedCampaign.startDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fin</p>
                  <p className="text-xs">{selectedCampaign.endDate || "—"}</p>
                </div>
              </div>

              {/* Funnel */}
              <div className="p-3 rounded-lg border bg-muted/20 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase">Embudo de Conversión</p>
                {[
                  { label: "Audiencia", value: selectedCampaign.audience, pct: 100 },
                  { label: "Enviados", value: selectedCampaign.sent, pct: selectedCampaign.audience > 0 ? (selectedCampaign.sent / selectedCampaign.audience * 100) : 0 },
                  { label: "Abiertos", value: selectedCampaign.opened, pct: selectedCampaign.sent > 0 ? (selectedCampaign.opened / selectedCampaign.sent * 100) : 0 },
                  { label: "Clicks", value: selectedCampaign.clicked, pct: selectedCampaign.opened > 0 ? (selectedCampaign.clicked / selectedCampaign.opened * 100) : 0 },
                  { label: "Conversiones", value: selectedCampaign.converted, pct: selectedCampaign.clicked > 0 ? (selectedCampaign.converted / selectedCampaign.clicked * 100) : 0 },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-muted-foreground">{step.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-sayo-cafe rounded-full h-2 transition-all" style={{ width: `${Math.min(step.pct, 100)}%` }} />
                    </div>
                    <span className="w-16 text-right tabular-nums">{step.value.toLocaleString()}</span>
                    <span className="w-12 text-right tabular-nums text-muted-foreground">{step.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedCampaign && (selectedCampaign.status === "activa" || selectedCampaign.status === "pausada") && (
              <Button variant="outline" size="sm" onClick={() => handleTogglePause(selectedCampaign)}>
                {selectedCampaign.status === "activa"
                  ? <><Pause className="size-3.5 mr-1" /> Pausar</>
                  : <><Play className="size-3.5 mr-1" /> Activar</>
                }
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
