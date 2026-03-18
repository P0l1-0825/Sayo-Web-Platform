"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { ChartCard } from "@/components/dashboard/chart-card"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { portfolioClosings, portfolioTrend } from "@/hooks/use-accounts"
import { formatMoney } from "@/lib/utils"
import type { PortfolioClosing } from "@/lib/types"
import { FileBarChart, CalendarCheck, Eye, Plus, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const statusColor = (status: string) => {
  switch (status) {
    case "generado": return "bg-yellow-100 text-yellow-700"
    case "validado": return "bg-blue-100 text-blue-700"
    case "publicado": return "bg-green-100 text-green-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function CierresPage() {
  const [closings, setClosings] = React.useState(portfolioClosings)
  const [selectedClosing, setSelectedClosing] = React.useState<PortfolioClosing | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [generateOpen, setGenerateOpen] = React.useState(false)
  const [closingDate, setClosingDate] = React.useState("")
  const [closingType, setClosingType] = React.useState<"diario" | "mensual">("diario")

  const handleView = (closing: PortfolioClosing) => {
    setSelectedClosing(closing)
    setDetailOpen(true)
  }

  const handleGenerate = () => {
    if (!closingDate) {
      toast.error("Selecciona una fecha de cierre")
      return
    }
    const newClosing: PortfolioClosing = {
      id: `CIE-${Date.now().toString().slice(-4)}`,
      date: closingDate,
      type: closingType,
      vigente: 45800000 + Math.floor(Math.random() * 1000000),
      preventiva: 3300000 + Math.floor(Math.random() * 200000),
      vencida: 8700000 + Math.floor(Math.random() * 500000),
      castigada: 1200000,
      total: 0,
      status: "generado",
      generatedBy: "Admin Demo",
    }
    newClosing.total = newClosing.vigente + newClosing.preventiva + newClosing.vencida + newClosing.castigada
    setClosings((prev) => [newClosing, ...prev])
    setGenerateOpen(false)
    setClosingDate("")
    toast.success("Cierre generado exitosamente", { description: `${closingType} — ${closingDate}` })
  }

  const latestClosing = closings[0]

  const columns: ColumnDef<PortfolioClosing>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "date", header: "Fecha" },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.type}</Badge>,
    },
    { accessorKey: "vigente", header: "Vigente", cell: ({ row }) => <span className="text-xs tabular-nums text-green-600 font-semibold">{formatMoney(row.original.vigente)}</span> },
    { accessorKey: "preventiva", header: "Preventiva", cell: ({ row }) => <span className="text-xs tabular-nums text-yellow-600 font-semibold">{formatMoney(row.original.preventiva)}</span> },
    { accessorKey: "vencida", header: "Vencida", cell: ({ row }) => <span className="text-xs tabular-nums text-orange-600 font-semibold">{formatMoney(row.original.vencida)}</span> },
    { accessorKey: "castigada", header: "Castigada", cell: ({ row }) => <span className="text-xs tabular-nums text-red-600 font-semibold">{formatMoney(row.original.castigada)}</span> },
    { accessorKey: "total", header: "Total", cell: ({ row }) => <span className="text-sm tabular-nums font-bold">{formatMoney(row.original.total)}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Generación de Cierres</h1>
          <p className="text-sm text-muted-foreground">Cierres de cartera diarios y mensuales</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Generar Cierre
        </Button>
      </div>

      {/* Latest Closing Summary */}
      {latestClosing && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Último Cierre: {latestClosing.date}</span>
              <Badge variant="outline" className="text-[10px]">{latestClosing.type}</Badge>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(latestClosing.status)}`}>
                {latestClosing.status}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                <p className="text-[10px] text-green-600 uppercase">Vigente</p>
                <p className="text-sm font-bold text-green-700 tabular-nums">{formatMoney(latestClosing.vigente)}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                <p className="text-[10px] text-yellow-600 uppercase">Preventiva</p>
                <p className="text-sm font-bold text-yellow-700 tabular-nums">{formatMoney(latestClosing.preventiva)}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center">
                <p className="text-[10px] text-orange-600 uppercase">Vencida</p>
                <p className="text-sm font-bold text-orange-700 tabular-nums">{formatMoney(latestClosing.vencida)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                <p className="text-[10px] text-red-600 uppercase">Castigada</p>
                <p className="text-sm font-bold text-red-700 tabular-nums">{formatMoney(latestClosing.castigada)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                <p className="text-[10px] text-blue-600 uppercase">Total</p>
                <p className="text-sm font-bold text-blue-700 tabular-nums">{formatMoney(latestClosing.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Trend Chart */}
      <ChartCard title="Evolucion de Cartera" description="Tendencia de cartera por categoria — 6 meses">
        <AreaChartComponent data={portfolioTrend} />
      </ChartCard>

      {/* Closings Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Historial de Cierres</h2>
        <DataTable
          columns={columns}
          data={closings}
          searchKey="date"
          searchPlaceholder="Buscar por fecha..."
          exportFilename="cierres_cartera"
          onRowClick={handleView}
        />
      </div>

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Cierre de Cartera</DialogTitle>
            <DialogDescription>Selecciona fecha y tipo de cierre</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Fecha de Cierre</Label>
              <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Cierre</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setClosingType("diario")}
                  className={`p-3 rounded-lg border text-left transition-colors ${closingType === "diario" ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
                >
                  <p className="text-sm font-semibold">Diario</p>
                  <p className="text-xs text-muted-foreground">Cierre de operaciones del dia</p>
                </button>
                <button
                  onClick={() => setClosingType("mensual")}
                  className={`p-3 rounded-lg border text-left transition-colors ${closingType === "mensual" ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
                >
                  <p className="text-sm font-semibold">Mensual</p>
                  <p className="text-xs text-muted-foreground">Cierre de mes completo</p>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleGenerate} className="bg-accent-green hover:bg-accent-green/90 text-white" disabled={!closingDate}>
              <CalendarCheck className="mr-1 h-3.5 w-3.5" /> Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Cierre</DialogTitle>
            <DialogDescription>{selectedClosing?.id} — {selectedClosing?.date}</DialogDescription>
          </DialogHeader>
          {selectedClosing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Badge variant="outline">{selectedClosing.type}</Badge>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedClosing.status)}`}>
                  {selectedClosing.status}
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Vigente", value: selectedClosing.vigente, color: "text-green-600" },
                  { label: "Preventiva", value: selectedClosing.preventiva, color: "text-yellow-600" },
                  { label: "Vencida", value: selectedClosing.vencida, color: "text-orange-600" },
                  { label: "Castigada", value: selectedClosing.castigada, color: "text-red-600" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{item.label}</span>
                    <span className={`text-sm font-bold tabular-nums ${item.color}`}>{formatMoney(item.value)}</span>
                  </div>
                ))}
                <hr />
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm font-semibold">Total Cartera</span>
                  <span className="text-lg font-bold tabular-nums">{formatMoney(selectedClosing.total)}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Generado por: {selectedClosing.generatedBy}</p>
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
