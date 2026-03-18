"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useCNBVReports } from "@/hooks/use-compliance"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import type { CNBVReport } from "@/lib/types"
import { FileText, Plus, Send, Download, Eye, Loader2, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { toast } from "sonner"

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  borrador: { label: "Borrador", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="size-3" /> },
  enviado: { label: "Enviado", color: "bg-blue-100 text-blue-700", icon: <Send className="size-3" /> },
  aceptado: { label: "Aceptado", color: "bg-green-100 text-green-700", icon: <CheckCircle className="size-3" /> },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700", icon: <AlertTriangle className="size-3" /> },
}

export default function ReportesCNBVPage() {
  const { data: fetchedReports, isLoading, error, refetch } = useCNBVReports()
  const [reports, setReports] = React.useState<CNBVReport[]>([])
  const [selectedReport, setSelectedReport] = React.useState<CNBVReport | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [sendOpen, setSendOpen] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [newForm, setNewForm] = React.useState({ type: "ROI", period: "", alertCount: "" })

  React.useEffect(() => { if (fetchedReports) setReports(fetchedReports) }, [fetchedReports])

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={refetch} />

  const handleView = (report: CNBVReport) => {
    setSelectedReport(report)
    setDetailOpen(true)
  }

  const handleDownload = (report: CNBVReport) => {
    toast.success("Descargando reporte", { description: `${report.id} — ${report.type}_${report.period}.pdf` })
  }

  const handleSendConfirm = (report: CNBVReport) => {
    setSelectedReport(report)
    setSendOpen(true)
  }

  const confirmSend = () => {
    if (!selectedReport) return
    setReports((prev) =>
      prev.map((r) => (r.id === selectedReport.id ? { ...r, status: "enviado" } : r))
    )
    setSendOpen(false)
    toast.success("Reporte enviado a CNBV", { description: `${selectedReport.id} — ${selectedReport.type}` })
  }

  const handleGenerate = async () => {
    if (!newForm.period) {
      toast.error("Ingresa el período del reporte")
      return
    }
    setGenerating(true)
    toast.loading("Generando reporte CNBV...", { id: "gen-cnbv" })

    await new Promise((r) => setTimeout(r, 2000))

    const newReport: CNBVReport = {
      id: `CNBV-${String(reports.length + 1).padStart(3, "0")}`,
      type: newForm.type as CNBVReport["type"],
      period: newForm.period,
      date: new Date().toISOString().slice(0, 10),
      alertCount: parseInt(newForm.alertCount) || Math.floor(Math.random() * 10 + 1),
      status: "borrador",
    }
    setReports([newReport, ...reports])
    setGenerating(false)
    setNewOpen(false)
    setNewForm({ type: "ROI", period: "", alertCount: "" })
    toast.success("Reporte CNBV generado", {
      id: "gen-cnbv",
      description: `${newReport.id} — ${newReport.type} ${newReport.period}`,
    })
  }

  const totalReports = reports.length
  const sentAccepted = reports.filter((r) => r.status === "enviado" || r.status === "aceptado").length
  const drafts = reports.filter((r) => r.status === "borrador").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Reportes CNBV</h1>
          <p className="text-sm text-muted-foreground">ROIs, ROPs y reportes de operaciones 24h</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Generar Reporte
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalReports}</p>
            <p className="text-xs text-muted-foreground">Total Reportes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-green">{sentAccepted}</p>
            <p className="text-xs text-muted-foreground">Enviados / Aceptados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sayo-orange">{drafts}</p>
            <p className="text-xs text-muted-foreground">Borradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-2">
        {reports.map((r) => {
          const status = statusMap[r.status] || statusMap.borrador
          return (
            <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(r)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{r.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.type} — {r.period}</p>
                  <p className="text-xs text-muted-foreground">{r.date} • {r.alertCount} alertas incluidas</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                  {status.icon}
                  {status.label}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleView(r)} title="Ver detalle">
                    <Eye className="size-3.5" />
                  </Button>
                  {r.status === "borrador" && (
                    <Button variant="ghost" size="icon-xs" onClick={() => handleSendConfirm(r)} title="Enviar a CNBV">
                      <Send className="size-3.5 text-sayo-blue" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDownload(r)} title="Descargar">
                    <Download className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Reporte</DialogTitle>
            <DialogDescription>{selectedReport?.id} — {selectedReport?.type}</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[selectedReport.status]?.color}`}>
                  {statusMap[selectedReport.status]?.icon}
                  {statusMap[selectedReport.status]?.label}
                </span>
                <Badge variant="outline">{selectedReport.type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo de Reporte</p>
                  <p className="font-medium">{selectedReport.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Período</p>
                  <p>{selectedReport.period}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha de Generación</p>
                  <p>{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Alertas Incluidas</p>
                  <p className="font-semibold">{selectedReport.alertCount}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Contenido del Reporte</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {selectedReport.alertCount} operaciones relevantes identificadas</li>
                  <li>• Análisis de patrones de riesgo</li>
                  <li>• Clasificación por tipo de alerta</li>
                  <li>• Documentación soporte adjunta</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedReport?.status === "borrador" && (
              <Button size="sm" onClick={() => { setDetailOpen(false); handleSendConfirm(selectedReport) }}>
                <Send className="size-3.5 mr-1" /> Enviar a CNBV
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => selectedReport && handleDownload(selectedReport)}>
              <Download className="size-3.5 mr-1" /> Descargar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5 text-sayo-blue" />
              Enviar Reporte a CNBV
            </DialogTitle>
            <DialogDescription>
              ¿Confirmar el envío de este reporte a la Comisión Nacional Bancaria y de Valores?
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reporte:</span>
                <span className="font-mono text-xs">{selectedReport.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{selectedReport.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Período:</span>
                <span>{selectedReport.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alertas:</span>
                <span className="font-semibold">{selectedReport.alertCount}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmSend}>
              <Send className="size-3.5 mr-1" /> Confirmar Envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate New Report Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Reporte CNBV</DialogTitle>
            <DialogDescription>Crear un nuevo reporte regulatorio</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo de Reporte</label>
              <div className="flex gap-2 mt-1">
                {["ROI", "ROP", "Op. 24h", "Trimestral"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewForm({ ...newForm, type: t })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.type === t ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Período</label>
              <Input
                placeholder="Ej: Febrero 2024"
                value={newForm.period}
                onChange={(e) => setNewForm({ ...newForm, period: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Alertas a incluir (opcional)</label>
              <Input
                type="number"
                placeholder="Se calculan automáticamente"
                value={newForm.alertCount}
                onChange={(e) => setNewForm({ ...newForm, alertCount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <FileText className="size-3.5 mr-1" />}
              {generating ? "Generando..." : "Generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
