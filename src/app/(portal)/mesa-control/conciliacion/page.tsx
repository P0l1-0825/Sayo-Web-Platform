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
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { useServiceData } from "@/hooks/use-service-data"
import { concentradoraService } from "@/lib/concentradora-service"
import type { ReconciliationReport, SyncBalanceResult } from "@/lib/concentradora-service"
import { formatMoney } from "@/lib/utils"
import { CheckCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface Discrepancia {
  id: string
  txnId: string
  type: string
  montoSayo: number
  montoBanxico: number
  diferencia: number
  status: "pendiente" | "investigando" | "resuelta"
  date: string
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const statusIcon: Record<string, React.ReactNode> = {
  pendiente:    <AlertTriangle className="size-3.5 text-sayo-orange" />,
  investigando: <RefreshCw className="size-3.5 text-sayo-blue" />,
  resuelta:     <CheckCircle className="size-3.5 text-sayo-green" />,
}

function buildDiscrepanciasFromReport(report: ReconciliationReport): Discrepancia[] {
  const discrepancias: Discrepancia[] = []
  if (!report.is_reconciled) {
    discrepancias.push({
      id: "DISC-OPM-001",
      txnId: "OPM-BALANCE",
      type: "Balance OPM vs Local",
      montoSayo: report.balance_local_stored,
      montoBanxico: report.balance_opm,
      diferencia: Math.abs(report.balance_diff),
      status: "pendiente",
      date: report.generated_at.slice(0, 10),
    })
    if (report.balance_local_stored !== report.balance_local_calculated) {
      discrepancias.push({
        id: "DISC-CALC-002",
        txnId: "LOCAL-CALC",
        type: "Balance Local vs Calculado",
        montoSayo: report.balance_local_stored,
        montoBanxico: report.balance_local_calculated,
        diferencia: Math.abs(report.balance_local_stored - report.balance_local_calculated),
        status: "pendiente",
        date: report.generated_at.slice(0, 10),
      })
    }
  }
  return discrepancias
}

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────

export default function ConciliacionPage() {
  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useServiceData(() => concentradoraService.getReconciliation(), [])

  const [running, setRunning]               = React.useState(false)
  const [syncResult, setSyncResult]         = React.useState<SyncBalanceResult | null>(null)
  const [selectedDisc, setSelectedDisc]     = React.useState<Discrepancia | null>(null)
  const [conciliarOpen, setConciliarOpen]   = React.useState(false)
  const [discrepancias, setDiscrepancias]   = React.useState<Discrepancia[]>([])

  // Rebuild discrepancias whenever the report changes
  React.useEffect(() => {
    if (report) {
      setDiscrepancias(buildDiscrepanciasFromReport(report))
    }
  }, [report])

  const handleRunConciliacion = async () => {
    setRunning(true)
    toast.loading("Ejecutando conciliación...", { id: "conciliacion" })
    try {
      const result = await concentradoraService.syncBalance()
      setSyncResult(result)
      toast.success("Conciliación completada", {
        id: "conciliacion",
        description: result.is_reconciled
          ? `Balance OPM: ${formatMoney(result.balance_opm)} — Conciliado`
          : `Diferencia detectada: ${formatMoney(Math.abs(result.balance_diff))}`,
      })
      refetch()
    } catch (err) {
      toast.error("Error al ejecutar conciliación", {
        id: "conciliacion",
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    } finally {
      setRunning(false)
    }
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

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error)     return <ErrorCard message={error} onRetry={refetch} />
  if (!report)   return null

  // Build StatCard data from real reconciliation report
  const totalSubcuentas = report.total_subcuentas
  const isReconciled    = report.is_reconciled
  const balanceDiff     = Math.abs(report.balance_diff)
  const activeDiscs     = discrepancias.filter((d) => d.status !== "resuelta").length

  const conciliacionStats = [
    {
      title: "Subcuentas Totales",
      value: totalSubcuentas,
      icon: "CheckCircle",
      trend: "up" as const,
    },
    {
      title: "Discrepancias",
      value: activeDiscs,
      icon: "AlertTriangle",
      trend: activeDiscs > 0 ? ("down" as const) : ("up" as const),
    },
    {
      title: "Estado",
      value: isReconciled ? "Conciliado" : "Diferencia",
      icon: "CheckCircle",
      trend: isReconciled ? ("up" as const) : ("down" as const),
    },
    {
      title: "Diferencia OPM",
      value: balanceDiff,
      icon: "DollarSign",
      format: "currency" as const,
      trend: balanceDiff === 0 ? ("up" as const) : ("neutral" as const),
    },
  ]

  // Chart data: balance comparison
  const conciliacionTrend = [
    { name: "OPM",      value: report.balance_opm,              discrepancias: 0 },
    { name: "Local",    value: report.balance_local_stored,     discrepancias: isReconciled ? 0 : 1 },
    { name: "Calculado", value: report.balance_local_calculated, discrepancias: 0 },
  ]

  // Sync result info row
  const lastSync = syncResult?.synced_at ?? report.last_opm_sync

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Conciliación</h1>
          <p className="text-sm text-muted-foreground">
            Balance OPM vs saldo local — Concentradora {report.name}
          </p>
        </div>
        <Button onClick={() => void handleRunConciliacion()} disabled={running}>
          {running
            ? <Loader2 className="size-4 mr-1.5 animate-spin" />
            : <RefreshCw className="size-4 mr-1.5" />
          }
          {running ? "Ejecutando..." : "Ejecutar Conciliación"}
        </Button>
      </div>

      {/* Reconciliation Summary Banner */}
      <Card className={isReconciled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {isReconciled
                ? <CheckCircle className="size-5 text-green-600" />
                : <AlertTriangle className="size-5 text-red-600" />
              }
              <span className={`font-semibold text-sm ${isReconciled ? "text-green-700" : "text-red-700"}`}>
                {isReconciled ? "Conciliación en orden" : "Diferencia detectada"}
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-xs">
              <div>
                <p className="text-muted-foreground">Balance OPM</p>
                <p className="font-bold tabular-nums">{formatMoney(report.balance_opm)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance Local (almacenado)</p>
                <p className="font-bold tabular-nums">{formatMoney(report.balance_local_stored)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance Calculado</p>
                <p className="font-bold tabular-nums">{formatMoney(report.balance_local_calculated)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Diferencia</p>
                <p className={`font-bold tabular-nums ${balanceDiff > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatMoney(balanceDiff)}
                </p>
              </div>
            </div>
            <div className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap">
              Último sync: {lastSync ? new Date(lastSync).toLocaleString("es-MX") : "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {conciliacionStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* Chart */}
      <ChartCard title="Comparativa de Balances" description="OPM vs balance local almacenado vs calculado">
        <BarChartComponent
          data={conciliacionTrend}
          dataKey="value"
          secondaryDataKey="discrepancias"
          color="var(--chart-2)"
          secondaryColor="var(--chart-4)"
        />
      </ChartCard>

      {/* Reconciliation Detail Table */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Detalle de Reconciliación</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Concentradora",          value: report.concentradora_id },
              { label: "RFC",                    value: report.rfc },
              { label: "CLABE",                  value: report.clabe },
              { label: "Total Subcuentas",       value: report.total_subcuentas.toLocaleString() },
              { label: "Balance OPM",            value: formatMoney(report.balance_opm) },
              { label: "Balance Local",          value: formatMoney(report.balance_local_stored) },
              { label: "Balance Calculado",      value: formatMoney(report.balance_local_calculated) },
              { label: "Diferencia",             value: formatMoney(report.balance_diff) },
              { label: "Estado",                 value: report.is_reconciled ? "Conciliado" : "Con diferencias" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discrepancies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Discrepancias Pendientes</h2>
          <Badge variant="outline">
            {discrepancias.filter((d) => d.status !== "resuelta").length} activas
          </Badge>
        </div>

        {discrepancias.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="size-8 text-sayo-green mx-auto mb-2" />
              <p className="text-sm font-medium text-sayo-green">Sin discrepancias detectadas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Los balances OPM y local están conciliados.
              </p>
            </CardContent>
          </Card>
        ) : (
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
                      <p className="text-muted-foreground">OPM</p>
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
        )}
      </div>

      {/* Conciliar Confirmation Dialog */}
      <Dialog open={conciliarOpen} onOpenChange={setConciliarOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Conciliación</DialogTitle>
            <DialogDescription>
              Marcar {selectedDisc?.id} como resuelta?
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
