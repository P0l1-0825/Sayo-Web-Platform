"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { DonutChartComponent } from "@/components/charts/donut-chart"
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
import { formatMoney } from "@/lib/utils"
import { FileBarChart, CalendarCheck, AlertTriangle, TrendingDown, Clock, CheckCircle, Plus, Eye } from "lucide-react"
import { toast } from "sonner"

interface CollectionClosing {
  id: string
  date: string
  type: "diario" | "semanal" | "mensual"
  bucket030: number
  bucket3160: number
  bucket6190: number
  bucket90plus: number
  totalVencida: number
  provision030: number
  provision3160: number
  provision6190: number
  provision90plus: number
  totalProvision: number
  creditCount: number
  status: "generado" | "validado" | "publicado"
  generatedBy: string
}

const statusColor = (status: string) => {
  switch (status) {
    case "generado": return "bg-yellow-100 text-yellow-700"
    case "validado": return "bg-blue-100 text-blue-700"
    case "publicado": return "bg-green-100 text-green-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const provisionRates: Record<string, number> = {
  "0-30": 0.05,
  "31-60": 0.20,
  "61-90": 0.45,
  "90+": 0.85,
}

const collectionClosings: CollectionClosing[] = [
  {
    id: "COB-001", date: "2025-03-08", type: "diario",
    bucket030: 3200000, bucket3160: 1800000, bucket6190: 950000, bucket90plus: 2950000,
    totalVencida: 8900000,
    provision030: 160000, provision3160: 360000, provision6190: 427500, provision90plus: 2507500,
    totalProvision: 3455000, creditCount: 42, status: "publicado", generatedBy: "Ricardo Mora",
  },
  {
    id: "COB-002", date: "2025-03-07", type: "diario",
    bucket030: 3350000, bucket3160: 1750000, bucket6190: 900000, bucket90plus: 3100000,
    totalVencida: 9100000,
    provision030: 167500, provision3160: 350000, provision6190: 405000, provision90plus: 2635000,
    totalProvision: 3557500, creditCount: 44, status: "publicado", generatedBy: "Ricardo Mora",
  },
  {
    id: "COB-003", date: "2025-02-28", type: "mensual",
    bucket030: 2900000, bucket3160: 1600000, bucket6190: 1100000, bucket90plus: 2900000,
    totalVencida: 8500000,
    provision030: 145000, provision3160: 320000, provision6190: 495000, provision90plus: 2465000,
    totalProvision: 3425000, creditCount: 40, status: "publicado", generatedBy: "Ricardo Mora",
  },
  {
    id: "COB-004", date: "2025-01-31", type: "mensual",
    bucket030: 2500000, bucket3160: 1400000, bucket6190: 1200000, bucket90plus: 2700000,
    totalVencida: 7800000,
    provision030: 125000, provision3160: 280000, provision6190: 540000, provision90plus: 2295000,
    totalProvision: 3240000, creditCount: 38, status: "publicado", generatedBy: "Ricardo Mora",
  },
]

const agingTrend = [
  { name: "Oct", value: 6400000, "0-30": 2100000, "31-60": 1200000, "61-90": 800000, "90+": 2300000 },
  { name: "Nov", value: 6900000, "0-30": 2300000, "31-60": 1300000, "61-90": 900000, "90+": 2400000 },
  { name: "Dic", value: 7350000, "0-30": 2400000, "31-60": 1350000, "61-90": 1000000, "90+": 2600000 },
  { name: "Ene", value: 7800000, "0-30": 2500000, "31-60": 1400000, "61-90": 1200000, "90+": 2700000 },
  { name: "Feb", value: 8500000, "0-30": 2900000, "31-60": 1600000, "61-90": 1100000, "90+": 2900000 },
  { name: "Mar", value: 8900000, "0-30": 3200000, "31-60": 1800000, "61-90": 950000, "90+": 2950000 },
]

export default function CierresCobranzaPage() {
  const [closings, setClosings] = React.useState(collectionClosings)
  const [selectedClosing, setSelectedClosing] = React.useState<CollectionClosing | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [generateOpen, setGenerateOpen] = React.useState(false)
  const [closingDate, setClosingDate] = React.useState("")
  const [closingType, setClosingType] = React.useState<"diario" | "semanal" | "mensual">("diario")

  const handleView = (closing: CollectionClosing) => {
    setSelectedClosing(closing)
    setDetailOpen(true)
  }

  const handleGenerate = () => {
    if (!closingDate) {
      toast.error("Selecciona una fecha de cierre")
      return
    }
    const b030 = 3200000 + Math.floor(Math.random() * 300000)
    const b3160 = 1800000 + Math.floor(Math.random() * 200000)
    const b6190 = 950000 + Math.floor(Math.random() * 150000)
    const b90 = 2950000 + Math.floor(Math.random() * 300000)
    const p030 = Math.round(b030 * provisionRates["0-30"])
    const p3160 = Math.round(b3160 * provisionRates["31-60"])
    const p6190 = Math.round(b6190 * provisionRates["61-90"])
    const p90 = Math.round(b90 * provisionRates["90+"])

    const newClosing: CollectionClosing = {
      id: `COB-${Date.now().toString().slice(-4)}`,
      date: closingDate,
      type: closingType,
      bucket030: b030, bucket3160: b3160, bucket6190: b6190, bucket90plus: b90,
      totalVencida: b030 + b3160 + b6190 + b90,
      provision030: p030, provision3160: p3160, provision6190: p6190, provision90plus: p90,
      totalProvision: p030 + p3160 + p6190 + p90,
      creditCount: 40 + Math.floor(Math.random() * 10),
      status: "generado",
      generatedBy: "Admin Demo",
    }
    setClosings((prev) => [newClosing, ...prev])
    setGenerateOpen(false)
    setClosingDate("")
    toast.success("Cierre de cobranza generado", { description: `${closingType} — ${closingDate}` })
  }

  const latest = closings[0]

  const agingDistribution = latest ? [
    { name: "0-30 dias", value: latest.bucket030 },
    { name: "31-60 dias", value: latest.bucket3160 },
    { name: "61-90 dias", value: latest.bucket6190 },
    { name: "90+ dias", value: latest.bucket90plus },
  ] : []

  const columns: ColumnDef<CollectionClosing>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "date", header: "Fecha" },
    { accessorKey: "type", header: "Tipo", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.type}</Badge> },
    { accessorKey: "bucket030", header: "0-30d", cell: ({ row }) => <span className="text-xs tabular-nums text-yellow-600 font-semibold">{formatMoney(row.original.bucket030)}</span> },
    { accessorKey: "bucket3160", header: "31-60d", cell: ({ row }) => <span className="text-xs tabular-nums text-orange-600 font-semibold">{formatMoney(row.original.bucket3160)}</span> },
    { accessorKey: "bucket6190", header: "61-90d", cell: ({ row }) => <span className="text-xs tabular-nums text-red-500 font-semibold">{formatMoney(row.original.bucket6190)}</span> },
    { accessorKey: "bucket90plus", header: "90+d", cell: ({ row }) => <span className="text-xs tabular-nums text-red-700 font-semibold">{formatMoney(row.original.bucket90plus)}</span> },
    { accessorKey: "totalVencida", header: "Total", cell: ({ row }) => <span className="text-sm tabular-nums font-bold">{formatMoney(row.original.totalVencida)}</span> },
    { accessorKey: "totalProvision", header: "Provision", cell: ({ row }) => <span className="text-xs tabular-nums text-purple-600 font-semibold">{formatMoney(row.original.totalProvision)}</span> },
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
          <h1 className="text-xl font-bold">Cierres de Cobranza</h1>
          <p className="text-sm text-muted-foreground">Análisis de cartera vencida por antiguedad — Aging Analysis</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Generar Cierre
        </Button>
      </div>

      {/* Aging Summary */}
      {latest && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Último Cierre: {latest.date}</span>
            <Badge variant="outline" className="text-[10px]">{latest.type}</Badge>
            <Badge className="text-[10px] bg-muted-foreground/10 text-muted-foreground">{latest.creditCount} creditos</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-yellow-600 uppercase font-medium">0 - 30 dias</p>
                <p className="text-sm font-bold text-yellow-700 tabular-nums">{formatMoney(latest.bucket030)}</p>
                <p className="text-[10px] text-yellow-500 mt-0.5">Provision: {formatMoney(latest.provision030)}</p>
                <p className="text-[10px] text-muted-foreground">{(provisionRates["0-30"] * 100).toFixed(0)}% reserva</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-orange-600 uppercase font-medium">31 - 60 dias</p>
                <p className="text-sm font-bold text-orange-700 tabular-nums">{formatMoney(latest.bucket3160)}</p>
                <p className="text-[10px] text-orange-500 mt-0.5">Provision: {formatMoney(latest.provision3160)}</p>
                <p className="text-[10px] text-muted-foreground">{(provisionRates["31-60"] * 100).toFixed(0)}% reserva</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-red-500 uppercase font-medium">61 - 90 dias</p>
                <p className="text-sm font-bold text-red-600 tabular-nums">{formatMoney(latest.bucket6190)}</p>
                <p className="text-[10px] text-red-400 mt-0.5">Provision: {formatMoney(latest.provision6190)}</p>
                <p className="text-[10px] text-muted-foreground">{(provisionRates["61-90"] * 100).toFixed(0)}% reserva</p>
              </CardContent>
            </Card>
            <Card className="bg-red-100 border-red-300">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-red-700 uppercase font-medium">90+ dias</p>
                <p className="text-sm font-bold text-red-800 tabular-nums">{formatMoney(latest.bucket90plus)}</p>
                <p className="text-[10px] text-red-600 mt-0.5">Provision: {formatMoney(latest.provision90plus)}</p>
                <p className="text-[10px] text-muted-foreground">{(provisionRates["90+"] * 100).toFixed(0)}% reserva</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-purple-600 uppercase font-medium">Provision Total</p>
                <p className="text-sm font-bold text-purple-700 tabular-nums">{formatMoney(latest.totalProvision)}</p>
                <p className="text-[10px] text-purple-500 mt-0.5">Cobertura: {((latest.totalProvision / latest.totalVencida) * 100).toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground">Total: {formatMoney(latest.totalVencida)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Evolucion Aging" description="Tendencia de cartera vencida por antiguedad — 6 meses">
          <BarChartComponent data={agingTrend} />
        </ChartCard>
        <ChartCard title="Distribucion Actual" description="Distribucion de cartera vencida por bucket">
          <DonutChartComponent data={agingDistribution} />
        </ChartCard>
      </div>

      {/* Closings Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Historial de Cierres</h2>
        <DataTable
          columns={columns}
          data={closings}
          searchKey="date"
          searchPlaceholder="Buscar por fecha..."
          exportFilename="cierres_cobranza"
          onRowClick={handleView}
        />
      </div>

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Cierre de Cobranza</DialogTitle>
            <DialogDescription>Selecciona fecha y tipo de cierre</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Fecha de Cierre</Label>
              <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Cierre</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["diario", "semanal", "mensual"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setClosingType(t)}
                    className={`p-3 rounded-lg border text-center transition-colors ${closingType === t ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
                  >
                    <p className="text-sm font-semibold capitalize">{t}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Provision Rate Legend */}
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Tasas de Provision Aplicadas</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(provisionRates).map(([bucket, rate]) => (
                  <div key={bucket} className="flex items-center justify-between">
                    <span className="text-xs">{bucket} dias</span>
                    <span className="text-xs font-bold tabular-nums">{(rate * 100).toFixed(0)}%</span>
                  </div>
                ))}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Cierre Cobranza</DialogTitle>
            <DialogDescription>{selectedClosing?.id} — {selectedClosing?.date}</DialogDescription>
          </DialogHeader>
          {selectedClosing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedClosing.type}</Badge>
                  <span className="text-xs text-muted-foreground">{selectedClosing.creditCount} creditos</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedClosing.status)}`}>
                  {selectedClosing.status}
                </span>
              </div>

              {/* Aging Breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold">Desglose por Antiguedad</p>
                {[
                  { label: "0 - 30 dias", value: selectedClosing.bucket030, provision: selectedClosing.provision030, rate: provisionRates["0-30"], color: "text-yellow-600" },
                  { label: "31 - 60 dias", value: selectedClosing.bucket3160, provision: selectedClosing.provision3160, rate: provisionRates["31-60"], color: "text-orange-600" },
                  { label: "61 - 90 dias", value: selectedClosing.bucket6190, provision: selectedClosing.provision6190, rate: provisionRates["61-90"], color: "text-red-500" },
                  { label: "90+ dias", value: selectedClosing.bucket90plus, provision: selectedClosing.provision90plus, rate: provisionRates["90+"], color: "text-red-700" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <span className="text-sm">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">({(item.rate * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold tabular-nums ${item.color}`}>{formatMoney(item.value)}</span>
                      <p className="text-[10px] text-purple-500 tabular-nums">Prov: {formatMoney(item.provision)}</p>
                    </div>
                  </div>
                ))}
                <hr />
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm font-semibold">Total Cartera Vencida</span>
                  <span className="text-lg font-bold tabular-nums">{formatMoney(selectedClosing.totalVencida)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-purple-50 border border-purple-200">
                  <span className="text-sm font-semibold text-purple-700">Total Provision</span>
                  <div className="text-right">
                    <span className="text-lg font-bold tabular-nums text-purple-700">{formatMoney(selectedClosing.totalProvision)}</span>
                    <p className="text-[10px] text-purple-500">Cobertura: {((selectedClosing.totalProvision / selectedClosing.totalVencida) * 100).toFixed(1)}%</p>
                  </div>
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
