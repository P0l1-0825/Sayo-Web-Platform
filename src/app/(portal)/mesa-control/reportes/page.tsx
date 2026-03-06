"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileBarChart, Download, Calendar, Clock, FileText, FileSpreadsheet } from "lucide-react"

const reportTypes = [
  { id: "diario", name: "Reporte Diario", description: "Resumen de operaciones del día", icon: Calendar, frequency: "Diario", lastGenerated: "2024-03-06 08:00" },
  { id: "semanal", name: "Reporte Semanal", description: "Consolidado semanal de transacciones", icon: FileBarChart, frequency: "Semanal", lastGenerated: "2024-03-04 06:00" },
  { id: "mensual", name: "Reporte Mensual", description: "Estado mensual de operaciones y conciliación", icon: FileText, frequency: "Mensual", lastGenerated: "2024-03-01 06:00" },
  { id: "regulatorio", name: "Reporte Regulatorio", description: "Información para CNBV y Banxico", icon: FileSpreadsheet, frequency: "Mensual", lastGenerated: "2024-03-01 09:00" },
]

const recentReports = [
  { id: "RPT-001", name: "Operaciones_20240306.csv", type: "Diario", format: "CSV", size: "2.4 MB", date: "2024-03-06 08:00", status: "listo" },
  { id: "RPT-002", name: "Operaciones_20240305.csv", type: "Diario", format: "CSV", size: "2.1 MB", date: "2024-03-05 08:00", status: "listo" },
  { id: "RPT-003", name: "Semanal_W09_2024.pdf", type: "Semanal", format: "PDF", size: "5.8 MB", date: "2024-03-04 06:00", status: "listo" },
  { id: "RPT-004", name: "Mensual_Feb2024.pdf", type: "Mensual", format: "PDF", size: "12.3 MB", date: "2024-03-01 06:00", status: "listo" },
  { id: "RPT-005", name: "CNBV_Feb2024.xlsx", type: "Regulatorio", format: "XLSX", size: "3.7 MB", date: "2024-03-01 09:00", status: "listo" },
]

export default function ReportesPage() {
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
                  <Button size="sm">Generar</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Reportes Generados</h2>
        <div className="space-y-2">
          {recentReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{report.name}</p>
                  <p className="text-[10px] text-muted-foreground">{report.date} — {report.size}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{report.format}</Badge>
                <Button variant="ghost" size="icon-sm">
                  <Download className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
