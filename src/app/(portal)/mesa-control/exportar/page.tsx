"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileSpreadsheet, FileText, FileBarChart, Clock, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExportRecord {
  id: string
  reportType: string
  format: string
  dateRange: string
  filters: string
  records: number
  fileSize: string
  status: "completado" | "procesando" | "error"
  requestedBy: string
  date: string
}

const reportTypes = [
  { id: "cartera", name: "Cartera", icon: "📊", desc: "Reporte completo de cartera con desglose por categoria" },
  { id: "operaciones", name: "Operaciones", icon: "💸", desc: "Historial de operaciones SPEI, pagos y dispersiones" },
  { id: "clientes", name: "Clientes", icon: "👥", desc: "Base de datos de clientes con información basica" },
  { id: "pld", name: "PLD/FT", icon: "🛡️", desc: "Alertas, evaluaciones EBR y listas de sanciones" },
  { id: "contable", name: "Contable", icon: "📒", desc: "Auxiliares contables, balanza y polizas" },
  { id: "regulatorio", name: "Regulatorio", icon: "📋", desc: "Reportes para CNBV, CONDUSEF, SAT y Banxico" },
]

const formatOptions = [
  { id: "csv", name: "CSV", icon: FileSpreadsheet, desc: "Archivo separado por comas" },
  { id: "xlsx", name: "Excel", icon: FileBarChart, desc: "Hoja de calculo Excel" },
  { id: "pdf", name: "PDF", icon: FileText, desc: "Documento PDF formateado" },
]

const exportHistory: ExportRecord[] = [
  { id: "EXP-001", reportType: "Cartera", format: "xlsx", dateRange: "2025-03-01 a 2025-03-08", filters: "Todas las categorias", records: 1250, fileSize: "2.4 MB", status: "completado", requestedBy: "Carlos Mendoza", date: "2025-03-08 10:30" },
  { id: "EXP-002", reportType: "Operaciones", format: "csv", dateRange: "2025-03-01 a 2025-03-08", filters: "Solo SPEI", records: 3800, fileSize: "1.8 MB", status: "completado", requestedBy: "Carlos Mendoza", date: "2025-03-08 09:15" },
  { id: "EXP-003", reportType: "PLD/FT", format: "pdf", dateRange: "2025-02-01 a 2025-02-28", filters: "Alertas activas", records: 45, fileSize: "850 KB", status: "completado", requestedBy: "Ana Garcia", date: "2025-03-07 16:00" },
  { id: "EXP-004", reportType: "Clientes", format: "xlsx", dateRange: "Todo el historial", filters: "Solo activos", records: 420, fileSize: "980 KB", status: "completado", requestedBy: "Carlos Mendoza", date: "2025-03-07 11:45" },
  { id: "EXP-005", reportType: "Contable", format: "xlsx", dateRange: "2025-02-01 a 2025-02-28", filters: "Balanza de comprobacion", records: 580, fileSize: "1.2 MB", status: "completado", requestedBy: "Gabriela Navarro", date: "2025-03-06 14:30" },
  { id: "EXP-006", reportType: "Regulatorio", format: "pdf", dateRange: "2025-01-01 a 2025-01-31", filters: "Reporte CNBV mensual", records: 12, fileSize: "3.5 MB", status: "completado", requestedBy: "Ana Garcia", date: "2025-02-10 09:00" },
]

export default function ExportarPage() {
  const [selectedReport, setSelectedReport] = React.useState("")
  const [selectedFormat, setSelectedFormat] = React.useState("csv")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = () => {
    if (!selectedReport) {
      toast.error("Selecciona un tipo de reporte")
      return
    }
    if (!dateFrom || !dateTo) {
      toast.error("Selecciona el rango de fechas")
      return
    }

    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      const report = reportTypes.find((r) => r.id === selectedReport)
      toast.success("Exportación completada", {
        description: `${report?.name} en formato ${selectedFormat.toUpperCase()} — ${dateFrom} a ${dateTo}`,
      })
    }, 2000)
  }

  const columns: ColumnDef<ExportRecord>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "reportType", header: "Tipo Reporte", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.reportType}</Badge> },
    {
      accessorKey: "format",
      header: "Formato",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
          row.original.format === "csv" ? "bg-green-100 text-green-700" :
          row.original.format === "xlsx" ? "bg-blue-100 text-blue-700" :
          "bg-red-100 text-red-700"
        }`}>
          {row.original.format.toUpperCase()}
        </span>
      ),
    },
    { accessorKey: "dateRange", header: "Período", cell: ({ row }) => <span className="text-xs">{row.original.dateRange}</span> },
    { accessorKey: "records", header: "Registros", cell: ({ row }) => <span className="text-xs tabular-nums font-semibold">{row.original.records.toLocaleString()}</span> },
    { accessorKey: "fileSize", header: "Tamano", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.fileSize}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
          row.original.status === "completado" ? "bg-green-100 text-green-700" :
          row.original.status === "procesando" ? "bg-yellow-100 text-yellow-700" :
          "bg-red-100 text-red-700"
        }`}>
          {row.original.status === "completado" && <CheckCircle className="size-3" />}
          {row.original.status === "procesando" && <Clock className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "requestedBy", header: "Solicitante", cell: ({ row }) => <span className="text-xs">{row.original.requestedBy}</span> },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Exportar Datos</h1>
        <p className="text-sm text-muted-foreground">Generación de reportes y exportación de información</p>
      </div>

      {/* Report Type Selection */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Reporte</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {reportTypes.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${selectedReport === r.id ? "bg-sayo-cream border-sayo-cafe ring-2 ring-sayo-cafe" : "hover:bg-muted/50"}`}
            >
              <p className="text-lg mb-1">{r.icon}</p>
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range & Format */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Fecha Desde</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Fecha Hasta</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Formato de Salida</Label>
          <div className="flex gap-2">
            {formatOptions.map((f) => {
              const Icon = f.icon
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`flex-1 p-2 rounded-lg border text-center transition-colors ${selectedFormat === f.id ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
                >
                  <Icon className="h-4 w-4 mx-auto mb-0.5 text-muted-foreground" />
                  <p className="text-[10px] font-semibold">{f.name}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          className="bg-accent-green hover:bg-accent-green/90 text-white"
          disabled={!selectedReport || !dateFrom || !dateTo || isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Exportar {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
      </div>

      {/* Export History */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Historial de Exportaciones</h2>
        <DataTable
          columns={columns}
          data={exportHistory}
          searchKey="reportType"
          searchPlaceholder="Buscar por tipo de reporte..."
          exportFilename="historial_exportaciones"
        />
      </div>
    </div>
  )
}
