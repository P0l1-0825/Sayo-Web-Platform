"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { BarChartComponent } from "@/components/charts/bar-chart"
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
import { formatMoney } from "@/lib/utils"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Discrepancia {
  id: string
  txnId: string
  type: string
  montoSayo: number
  montoBanxico: number
  diferencia: number
  status: string
  date: string
}

const conciliacionStats = [
  { title: "Conciliadas", value: 2780, change: 98.5, icon: "CheckCircle", trend: "up" as const },
  { title: "Discrepancias", value: 12, change: -5, icon: "AlertTriangle", trend: "down" as const },
  { title: "Sin Match", value: 5, icon: "XCircle", trend: "neutral" as const },
  { title: "Monto Discrepancia", value: 45000, icon: "DollarSign", format: "currency" as const, trend: "neutral" as const },
]

const conciliacionTrend = [
  { name: "Lun", value: 2340, discrepancias: 8 },
  { name: "Mar", value: 2780, discrepancias: 5 },
  { name: "Mié", value: 2450, discrepancias: 12 },
  { name: "Jue", value: 3100, discrepancias: 3 },
  { name: "Vie", value: 2847, discrepancias: 7 },
]

const initialDiscrepancias: Discrepancia[] = [
  { id: "DISC-001", txnId: "TXN-034", type: "Monto diferente", montoSayo: 50000, montoBanxico: 55000, diferencia: 5000, status: "pendiente", date: "2024-03-06" },
  { id: "DISC-002", txnId: "TXN-087", type: "No encontrada en SPEI", montoSayo: 15000, montoBanxico: 0, diferencia: 15000, status: "pendiente", date: "2024-03-06" },
  { id: "DISC-003", txnId: "TXN-112", type: "Duplicada", montoSayo: 25000, montoBanxico: 25000, diferencia: 0, status: "investigando", date: "2024-03-05" },
  { id: "DISC-004", txnId: "N/A", type: "Sin match interno", montoSayo: 0, montoBanxico: 8500, diferencia: 8500, status: "pendiente", date: "2024-03-06" },
]

const statusIcon: Record<string, React.ReactNode> = {
  pendiente: <AlertTriangle className="size-3.5 text-sayo-orange" />,
  investigando: <RefreshCw className="size-3.5 text-sayo-blue" />,
  resuelta: <CheckCircle className="size-3.5 text-sayo-green" />,
}

export default function ConciliacionPage() {
  const [discrepancias, setDiscrepancias] = React.useState(initialDiscrepancias)
  const [running, setRunning] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [selectedDisc, setSelectedDisc] = React.useState<Discrepancia | null>(null)
  const [conciliarOpen, setConciliarOpen] = React.useState(false)

  const handleRunConciliacion = async () => {
    setRunning(true)
    toast.loading("Ejecutando conciliación...", { id: "conciliación" })
    // Simulate async process
    await new Promise((r) => setTimeout(r, 2500))
    setRunning(false)
    toast.success("Conciliación completada", {
      id: "conciliación",
      description: "2,847 transacciones procesadas — 4 discrepancias encontradas",
    })
  }

  const handleConciliar = (disc: Discrepancia) => {
    setSelectedDisc(disc)
    setConciliarOpen(true)
  }

  const confirmConciliar = () => {
    if (!selectedDisc) return
    setDiscrepancias((prev) =>
      prev.map((d) => (d.id === selectedDisc.id ? { ...d, status: "resuelta" } : d))
    )
    setConciliarOpen(false)
    toast.success("Discrepancia conciliada", { description: `${selectedDisc.id} marcada como resuelta` })
  }

  const handleInvestigar = (disc: Discrepancia) => {
    setDiscrepancias((prev) =>
      prev.map((d) => (d.id === disc.id ? { ...d, status: "investigando" } : d))
    )
    toast.info("Discrepancia en investigación", { description: `${disc.id} asignada para revisión` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Conciliación</h1>
          <p className="text-sm text-muted-foreground">Comparativa SPEI (Banxico) vs registros internos SAYO</p>
        </div>
        <Button onClick={handleRunConciliacion} disabled={running}>
          {running ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <RefreshCw className="size-4 mr-1.5" />}
          {running ? "Ejecutando..." : "Ejecutar Conciliación"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {conciliacionStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* Chart */}
      <ChartCard title="Conciliación Semanal" description="Transacciones conciliadas vs discrepancias">
        <BarChartComponent
          data={conciliacionTrend}
          dataKey="value"
          secondaryDataKey="discrepancias"
          color="var(--chart-2)"
          secondaryColor="var(--chart-4)"
        />
      </ChartCard>

      {/* Discrepancies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Discrepancias Pendientes</h2>
          <Badge variant="outline">{discrepancias.filter((d) => d.status !== "resuelta").length} activas</Badge>
        </div>
        <div className="space-y-2">
          {discrepancias.map((d) => (
            <Card key={d.id} className={d.status === "resuelta" ? "opacity-60" : ""}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  {statusIcon[d.status]}
                  <span className="font-mono text-xs">{d.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{d.type}</p>
                  <p className="text-xs text-muted-foreground">TXN: {d.txnId} — {d.date}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">SAYO</p>
                    <p className="font-semibold tabular-nums">{formatMoney(d.montoSayo)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Banxico</p>
                    <p className="font-semibold tabular-nums">{formatMoney(d.montoBanxico)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Δ</p>
                    <p className={`font-semibold tabular-nums ${d.diferencia > 0 ? "text-sayo-red" : "text-sayo-green"}`}>
                      {formatMoney(d.diferencia)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {d.status === "pendiente" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleInvestigar(d)}>
                        Investigar
                      </Button>
                      <Button size="sm" onClick={() => handleConciliar(d)}>
                        Conciliar
                      </Button>
                    </>
                  )}
                  {d.status === "investigando" && (
                    <Button size="sm" onClick={() => handleConciliar(d)}>
                      Conciliar
                    </Button>
                  )}
                  {d.status === "resuelta" && (
                    <Badge variant="outline" className="text-[10px] text-sayo-green">
                      <CheckCircle className="size-3 mr-1" /> Resuelta
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Conciliar Confirmation Dialog */}
      <Dialog open={conciliarOpen} onOpenChange={setConciliarOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Conciliación</DialogTitle>
            <DialogDescription>
              ¿Marcar {selectedDisc?.id} como resuelta?
            </DialogDescription>
          </DialogHeader>
          {selectedDisc && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{selectedDisc.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diferencia:</span>
                <span className="font-semibold text-sayo-red">{formatMoney(selectedDisc.diferencia)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TXN:</span>
                <span className="font-mono text-xs">{selectedDisc.txnId}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmConciliar}>
              <CheckCircle className="size-3.5 mr-1" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
