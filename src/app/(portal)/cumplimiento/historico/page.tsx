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
import { Search, Download, Eye, History, Filter, BarChart3 } from "lucide-react"
import { toast } from "sonner"

type HistoricalOperation = {
  id: string
  date: string
  time: string
  clientName: string
  clientId: string
  type: "deposito" | "retiro" | "transferencia" | "pago" | "cambio_divisas"
  channel: "ventanilla" | "spei" | "app" | "banca_linea" | "corresponsal"
  amount: number
  currency: "MXN" | "USD"
  origin: string
  destination: string
  reference: string
  flagged: boolean
}

const operations: HistoricalOperation[] = [
  { id: "HOP-001", date: "2025-03-08", time: "09:15", clientName: "Carlos Mendez Lopez", clientId: "CLI-001", type: "deposito", channel: "ventanilla", amount: 85000, currency: "MXN", origin: "Efectivo", destination: "Cuenta CLABE", reference: "DEP-20250308-001", flagged: true },
  { id: "HOP-002", date: "2025-03-08", time: "10:30", clientName: "Laura Martinez Rios", clientId: "CLI-007", type: "transferencia", channel: "spei", amount: 45000, currency: "MXN", origin: "BBVA 0123", destination: "Banorte 9876", reference: "SPEI-20250308-001", flagged: false },
  { id: "HOP-003", date: "2025-03-08", time: "11:00", clientName: "Laura Martinez Rios", clientId: "CLI-007", type: "transferencia", channel: "spei", amount: 48000, currency: "MXN", origin: "BBVA 0123", destination: "Banorte 9876", reference: "SPEI-20250308-002", flagged: true },
  { id: "HOP-004", date: "2025-03-07", time: "14:20", clientName: "Grupo Industrial Azteca", clientId: "CLI-008", type: "transferencia", channel: "banca_linea", amount: 1200000, currency: "MXN", origin: "Cuenta propia", destination: "Proveedor ABC", reference: "TRF-20250307-001", flagged: true },
  { id: "HOP-005", date: "2025-03-07", time: "15:45", clientName: "Roberto Juarez Pinto", clientId: "CLI-005", type: "deposito", channel: "ventanilla", amount: 49500, currency: "MXN", origin: "Efectivo", destination: "Cuenta CLABE", reference: "DEP-20250307-001", flagged: false },
  { id: "HOP-006", date: "2025-03-07", time: "16:10", clientName: "Roberto Juarez Pinto", clientId: "CLI-005", type: "deposito", channel: "ventanilla", amount: 35000, currency: "MXN", origin: "Efectivo", destination: "Cuenta CLABE", reference: "DEP-20250307-002", flagged: true },
  { id: "HOP-007", date: "2025-03-06", time: "08:45", clientName: "Carlos Mendez Lopez", clientId: "CLI-001", type: "pago", channel: "app", amount: 15000, currency: "MXN", origin: "Cuenta propia", destination: "Crédito CCC-001", reference: "PAG-20250306-001", flagged: false },
  { id: "HOP-008", date: "2025-03-06", time: "12:30", clientName: "Laura Martinez Rios", clientId: "CLI-007", type: "cambio_divisas", channel: "ventanilla", amount: 5000, currency: "USD", origin: "Cuenta USD", destination: "Cuenta MXN", reference: "FX-20250306-001", flagged: false },
  { id: "HOP-009", date: "2025-03-05", time: "10:00", clientName: "Grupo Industrial Azteca", clientId: "CLI-008", type: "transferencia", channel: "spei", amount: 2500000, currency: "MXN", origin: "Cuenta operativa", destination: "Nomina lote", reference: "SPEI-20250305-001", flagged: false },
  { id: "HOP-010", date: "2025-03-05", time: "11:20", clientName: "Roberto Juarez Pinto", clientId: "CLI-005", type: "retiro", channel: "ventanilla", amount: 30000, currency: "MXN", origin: "Cuenta CLABE", destination: "Efectivo", reference: "RET-20250305-001", flagged: false },
]

const channelLabel: Record<string, string> = {
  ventanilla: "Ventanilla",
  spei: "SPEI",
  app: "App Movil",
  banca_linea: "Banca en Línea",
  corresponsal: "Corresponsal",
}

const typeLabel: Record<string, string> = {
  deposito: "Deposito",
  retiro: "Retiro",
  transferencia: "Transferencia",
  pago: "Pago",
  cambio_divisas: "Cambio Divisas",
}

const channelDistribution = [
  { name: "Ventanilla", value: operations.filter((o) => o.channel === "ventanilla").length },
  { name: "SPEI", value: operations.filter((o) => o.channel === "spei").length },
  { name: "App", value: operations.filter((o) => o.channel === "app").length },
  { name: "Banca Línea", value: operations.filter((o) => o.channel === "banca_linea").length },
]

const amountDistribution = [
  { name: "<$50K", value: operations.filter((o) => o.amount < 50000).length },
  { name: "$50K-$100K", value: operations.filter((o) => o.amount >= 50000 && o.amount < 100000).length },
  { name: "$100K-$500K", value: operations.filter((o) => o.amount >= 100000 && o.amount < 500000).length },
  { name: ">$500K", value: operations.filter((o) => o.amount >= 500000).length },
]

export default function HistoricoPage() {
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [clientFilter, setClientFilter] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("")
  const [minAmount, setMinAmount] = React.useState("")
  const [maxAmount, setMaxAmount] = React.useState("")
  const [onlyFlagged, setOnlyFlagged] = React.useState(false)
  const [selectedOp, setSelectedOp] = React.useState<HistoricalOperation | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const filteredOps = React.useMemo(() => {
    return operations.filter((op) => {
      if (dateFrom && op.date < dateFrom) return false
      if (dateTo && op.date > dateTo) return false
      if (clientFilter && !op.clientName.toLowerCase().includes(clientFilter.toLowerCase())) return false
      if (typeFilter && op.type !== typeFilter) return false
      if (channelFilter && op.channel !== channelFilter) return false
      if (minAmount && op.amount < Number(minAmount)) return false
      if (maxAmount && op.amount > Number(maxAmount)) return false
      if (onlyFlagged && !op.flagged) return false
      return true
    })
  }, [dateFrom, dateTo, clientFilter, typeFilter, channelFilter, minAmount, maxAmount, onlyFlagged])

  const activeFilters = [dateFrom, dateTo, clientFilter, typeFilter, channelFilter, minAmount, maxAmount, onlyFlagged].filter(Boolean).length

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setClientFilter("")
    setTypeFilter("")
    setChannelFilter("")
    setMinAmount("")
    setMaxAmount("")
    setOnlyFlagged(false)
  }

  const handleView = (op: HistoricalOperation) => {
    setSelectedOp(op)
    setDetailOpen(true)
  }

  const handleExport = (format: string) => {
    toast.success(`Exportado en formato ${format}`, { description: `${filteredOps.length} operaciones exportadas` })
  }

  const columns: ColumnDef<HistoricalOperation>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: "date",
      header: "Fecha/Hora",
      cell: ({ row }) => (
        <div>
          <span className="text-xs">{row.original.date}</span>
          <span className="text-[10px] text-muted-foreground ml-1">{row.original.time}</span>
        </div>
      ),
    },
    { accessorKey: "clientName", header: "Cliente" },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{typeLabel[row.original.type]}</Badge>,
    },
    {
      accessorKey: "channel",
      header: "Canal",
      cell: ({ row }) => <span className="text-xs">{channelLabel[row.original.channel]}</span>,
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-xs">
          {row.original.currency === "USD" ? "USD " : ""}{formatMoney(row.original.amount)}
        </span>
      ),
    },
    { accessorKey: "reference", header: "Referencia", cell: ({ row }) => <span className="font-mono text-[10px]">{row.original.reference}</span> },
    {
      accessorKey: "flagged",
      header: "Alerta",
      cell: ({ row }) => row.original.flagged ? (
        <Badge className="bg-red-100 text-red-700 text-[10px]">Alerta</Badge>
      ) : (
        <span className="text-[10px] text-muted-foreground">—</span>
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
          <h1 className="text-xl font-bold">Histórico de Operaciones</h1>
          <p className="text-sm text-muted-foreground">Busqueda y analisis de operaciones para revision PLD/FT</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("CSV")}>
            <Download className="mr-1 h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("PDF")}>
            <Download className="mr-1 h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filtros de Busqueda</span>
              {activeFilters > 0 && <Badge className="bg-sayo-cafe text-white text-[10px]">{activeFilters}</Badge>}
            </div>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">Limpiar filtros</Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px]">Fecha Desde</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Fecha Hasta</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Cliente</Label>
              <Input value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} placeholder="Nombre..." className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Tipo Operación</Label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs">
                <option value="">Todos</option>
                <option value="deposito">Deposito</option>
                <option value="retiro">Retiro</option>
                <option value="transferencia">Transferencia</option>
                <option value="pago">Pago</option>
                <option value="cambio_divisas">Cambio Divisas</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Canal</Label>
              <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs">
                <option value="">Todos</option>
                <option value="ventanilla">Ventanilla</option>
                <option value="spei">SPEI</option>
                <option value="app">App Movil</option>
                <option value="banca_linea">Banca en Línea</option>
                <option value="corresponsal">Corresponsal</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Monto Minimo</Label>
              <Input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="$0" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Monto Maximo</Label>
              <Input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="Sin limite" className="text-xs" />
            </div>
            <div className="space-y-1 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} className="rounded" />
                <span className="text-xs font-medium">Solo con alerta PLD</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <History className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-lg font-bold">{filteredOps.length}</p>
              <p className="text-[10px] text-muted-foreground">Operaciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-lg font-bold tabular-nums">{formatMoney(filteredOps.reduce((sum, o) => sum + o.amount, 0))}</p>
              <p className="text-[10px] text-muted-foreground">Monto Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <Search className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-lg font-bold text-red-600">{filteredOps.filter((o) => o.flagged).length}</p>
              <p className="text-[10px] text-muted-foreground">Con Alerta PLD</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <Filter className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-lg font-bold">{new Set(filteredOps.map((o) => o.clientId)).size}</p>
              <p className="text-[10px] text-muted-foreground">Clientes Unicos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Distribucion por Canal" description="Operaciones por canal de origen">
          <DonutChartComponent data={channelDistribution} />
        </ChartCard>
        <ChartCard title="Distribucion por Monto" description="Rango de montos de operaciones">
          <BarChartComponent data={amountDistribution} color="var(--chart-3)" />
        </ChartCard>
      </div>

      {/* Results Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Resultados ({filteredOps.length} operaciones)</h2>
        <DataTable
          columns={columns}
          data={filteredOps}
          searchKey="clientName"
          searchPlaceholder="Buscar por cliente..."
          exportFilename="historico_operaciones_pld"
          onRowClick={handleView}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Operación</DialogTitle>
            <DialogDescription>{selectedOp?.id} — {selectedOp?.reference}</DialogDescription>
          </DialogHeader>
          {selectedOp && (
            <div className="space-y-4">
              {selectedOp.flagged && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-700 text-xs">Alerta PLD</Badge>
                  <span className="text-xs text-red-600">Esta operación fue marcada por el monitor transaccional</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedOp.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha / Hora</p>
                  <p>{selectedOp.date} {selectedOp.time}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <Badge variant="outline" className="text-xs">{typeLabel[selectedOp.type]}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Canal</p>
                  <p>{channelLabel[selectedOp.channel]}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto</p>
                  <p className="font-bold tabular-nums text-lg">{selectedOp.currency === "USD" ? "USD " : ""}{formatMoney(selectedOp.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Moneda</p>
                  <p>{selectedOp.currency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Origen</p>
                  <p className="text-xs">{selectedOp.origin}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Destino</p>
                  <p className="text-xs">{selectedOp.destination}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                  <p className="font-mono text-xs">{selectedOp.reference}</p>
                </div>
              </div>
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
