"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { FileBarChart, Download, Calendar, Clock, FileText, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ReportType {
  id: string
  name: string
  description: string
  icon: React.ElementType
  frequency: string
  lastGenerated: string
}

interface GeneratedReport {
  id: string
  name: string
  type: string
  format: string
  size: string
  date: string
  status: string
}

const reportTypes: ReportType[] = [
  { id: "diario", name: "Reporte Diario", description: "Resumen de operaciones del día", icon: Calendar, frequency: "Diario", lastGenerated: "2024-03-06 08:00" },
  { id: "semanal", name: "Reporte Semanal", description: "Consolidado semanal de transacciones", icon: FileBarChart, frequency: "Semanal", lastGenerated: "2024-03-04 06:00" },
  { id: "mensual", name: "Reporte Mensual", description: "Estado mensual de operaciones y conciliación", icon: FileText, frequency: "Mensual", lastGenerated: "2024-03-01 06:00" },
  { id: "regulatorio", name: "Reporte Regulatorio", description: "Información para CNBV y Banxico", icon: FileSpreadsheet, frequency: "Mensual", lastGenerated: "2024-03-01 09:00" },
]

const initialReports: GeneratedReport[] = [
  { id: "RPT-001", name: "Operaciones_20240306.csv", type: "Diario", format: "CSV", size: "2.4 MB", date: "2024-03-06 08:00", status: "listo" },
  { id: "RPT-002", name: "Operaciones_20240305.csv", type: "Diario", format: "CSV", size: "2.1 MB", date: "2024-03-05 08:00", status: "listo" },
  { id: "RPT-003", name: "Semanal_W09_2024.pdf", type: "Semanal", format: "PDF", size: "5.8 MB", date: "2024-03-04 06:00", status: "listo" },
  { id: "RPT-004", name: "Mensual_Feb2024.pdf", type: "Mensual", format: "PDF", size: "12.3 MB", date: "2024-03-01 06:00", status: "listo" },
  { id: "RPT-005", name: "CNBV_Feb2024.xlsx", type: "Regulatorio", format: "XLSX", size: "3.7 MB", date: "2024-03-01 09:00", status: "listo" },
]

export default function ReportesPage() {
  const [reports, setReports] = React.useState(initialReports)
  const [generating, setGenerating] = React.useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<ReportType | null>(null)

  const handleGenerate = (report: ReportType) => {
    setSelectedType(report)
    setConfirmOpen(true)
  }

  const confirmGenerate = async () => {
    if (!selectedType) return
    setConfirmOpen(false)
    setGenerating(selectedType.id)
    toast.loading(`Generando ${selectedType.name}...`, { id: `gen-${selectedType.id}` })

    await new Promise((r) => setTimeout(r, 2000))

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "")
    const ext = selectedType.id === "regulatorio" ? "xlsx" : selectedType.id === "diario" ? "csv" : "pdf"
    const newReport: GeneratedReport = {
      id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
      name: `${selectedType.name.replace(/ /g, "_")}_${dateStr}.${ext}`,
      type: selectedType.frequency,
      format: ext.toUpperCase(),
      size: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
      date: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
      status: "listo",
    }

    setReports([newReport, ...reports])
    setGenerating(null)
    toast.success(`${selectedType.name} generado`, {
      id: `gen-${selectedType.id}`,
      description: newReport.name,
    })
  }

  const handleDownload = (report: GeneratedReport) => {
    toast.success("Descargando reporte", { description: `${report.name} (${report.size})` })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Reportes</h1>
        <p className="text-sm text-muted-foreground">Generación y descarga de reportes operativos</p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isGenerating = generating === report.id
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-5 text-sayo-cafe" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{report.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-[10px]">{report.frequency}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        Último: {report.lastGenerated}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleGenerate(report)} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="size-3.5 animate-spin" /> : "Generar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Generated Reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Reportes Generados</h2>
          <Badge variant="outline">{reports.length} reportes</Badge>
        </div>
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{report.name}</p>
                  <p className="text-[10px] text-muted-foreground">{report.date} — {report.size}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{report.format}</Badge>
                <span className="flex items-center gap-0.5 text-[10px] text-sayo-green">
                  <CheckCircle className="size-3" /> Listo
                </span>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDownload(report)} title="Descargar">
                  <Download className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Generate Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generar Reporte</DialogTitle>
            <DialogDescription>
              ¿Generar {selectedType?.name}?
            </DialogDescription>
          </DialogHeader>
          {selectedType && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{selectedType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frecuencia:</span>
                <span>{selectedType.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último generado:</span>
                <span className="text-xs">{selectedType.lastGenerated}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmGenerate}>
              <FileBarChart className="size-3.5 mr-1" /> Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
