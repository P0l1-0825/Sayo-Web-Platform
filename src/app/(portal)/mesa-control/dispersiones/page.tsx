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
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ErrorCard } from "@/components/dashboard/error-card"
import { useServiceData } from "@/hooks/use-service-data"
import { tesoreriaService } from "@/lib/tesoreria-service"
import { accountsService } from "@/lib/accounts-service"
import { formatMoney } from "@/lib/utils"
import { Send, Users, Clock, CheckCircle, Eye, Download, Plus, FileText, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Batch } from "@/lib/accounts-service"

interface TreasuryPayment {
  id: string
  folio: string
  concept: string
  amount: number
  status: string
  date: string
  type: string
}

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface DispersionItem {
  id: string
  name: string
  type: string
  beneficiarios: number
  total: number
  procesados: number
  pendientes: number
  status: string
  date: string
  hora: string
  source: "batch" | "payment"
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const statusMap: Record<string, { label: string; color: string }> = {
  en_proceso:  { label: "En Proceso",  color: "bg-blue-100 text-blue-700" },
  procesando:  { label: "En Proceso",  color: "bg-blue-100 text-blue-700" },
  procesado:   { label: "En Proceso",  color: "bg-blue-100 text-blue-700" },
  completada:  { label: "Completada",  color: "bg-green-100 text-green-700" },
  completado:  { label: "Completada",  color: "bg-green-100 text-green-700" },
  pendiente:   { label: "Pendiente",   color: "bg-yellow-100 text-yellow-700" },
  autorizado:  { label: "Autorizado",  color: "bg-purple-100 text-purple-700" },
  rechazado:   { label: "Rechazado",   color: "bg-red-100 text-red-700" },
  cancelado:   { label: "Cancelado",   color: "bg-gray-100 text-gray-700" },
  error:       { label: "Error",       color: "bg-red-100 text-red-700" },
  fallido:     { label: "Error",       color: "bg-red-100 text-red-700" },
  parcial:     { label: "Parcial",     color: "bg-orange-100 text-orange-700" },
}

function isActive(status: string) {
  return status === "en_proceso" || status === "procesando" || status === "procesado" || status === "pendiente" || status === "autorizado"
}

function isCompleted(status: string) {
  return status === "completada" || status === "completado"
}

function mapBatchToDispersion(b: Batch): DispersionItem {
  const date = b.started_at ?? b.completed_at ?? b.created_at ?? new Date().toISOString()
  const parsedDate = new Date(date)
  return {
    id: b.id,
    name: b.name,
    type: b.type === "nomina" ? "Nomina" : b.type === "proveedores" ? "Proveedores" : "Otro",
    beneficiarios: b.total_transactions,
    total: b.total_amount,
    procesados: b.success_count,
    pendientes: b.total_transactions - b.success_count - b.failed_count,
    status: b.status,
    date: parsedDate.toISOString().slice(0, 10),
    hora: parsedDate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    source: "batch",
  }
}

function mapPaymentToDispersion(p: TreasuryPayment): DispersionItem {
  const parsedDate = new Date(p.date)
  return {
    id: p.folio,
    name: p.concept,
    type: "Dispersión",
    beneficiarios: 1,
    total: p.amount,
    procesados: isCompleted(p.status) ? 1 : 0,
    pendientes: isCompleted(p.status) ? 0 : 1,
    status: p.status,
    date: p.date,
    hora: parsedDate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    source: "payment",
  }
}

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────

export default function DispersionesPage() {
  const {
    data: batches,
    isLoading: batchesLoading,
    error: batchesError,
    refetch: refetchBatches,
  } = useServiceData(() => accountsService.getBatches(), [])

  const {
    data: payments,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useServiceData(
    () => tesoreriaService.getPayments({ type: "dispersion" }),
    []
  )

  const [selectedDisp, setSelectedDisp] = React.useState<DispersionItem | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({ name: "", type: "Nómina", beneficiarios: "", total: "" })
  const [submitting, setSubmitting] = React.useState(false)

  const isLoading = batchesLoading || paymentsLoading
  const error = batchesError || paymentsError

  const dispersiones = React.useMemo<DispersionItem[]>(() => {
    const batchItems = (batches ?? []).map(mapBatchToDispersion)
    const paymentItems = (payments ?? []).map(mapPaymentToDispersion)
    // Merge, deduplicate by id, sort newest first
    const merged = [...batchItems, ...paymentItems]
    merged.sort((a, b) => (a.date < b.date ? 1 : -1))
    return merged
  }, [batches, payments])

  const handleView = (d: DispersionItem) => {
    setSelectedDisp(d)
    setDetailOpen(true)
  }

  const handleDownload = (d: DispersionItem) => {
    toast.success("Descargando reporte", { description: `${d.id} — ${d.name}.csv` })
  }

  const handleRefresh = () => {
    refetchBatches()
    refetchPayments()
    toast.info("Actualizando dispersiones...")
  }

  const handleNewDispersion = async () => {
    if (!newForm.name || !newForm.beneficiarios || !newForm.total) {
      toast.error("Completa todos los campos")
      return
    }
    setSubmitting(true)
    try {
      const typeMap: Record<string, string> = {
        "Nómina": "nomina",
        "Créditos": "dispersiones",
        "Comisiones": "proveedores",
        "Otro": "custom",
      }
      await accountsService.getBatches() // verify service is reachable
      // Create via tesoreria as a dispersion payment
      await tesoreriaService.createPayment({
        type: "dispersion",
        beneficiaryName: newForm.name,
        beneficiaryBank: "Varios",
        beneficiaryClabe: "N/A",
        amount: parseFloat(newForm.total),
        concept: `${newForm.type} — ${newForm.name}`,
        reference: typeMap[newForm.type] ?? "custom",
        sourceAccount: "646180009999888877",
        status: "pendiente",
        requestedBy: "Mesa Control",
        date: new Date().toISOString().slice(0, 10),
      })
      toast.success("Dispersión creada", { description: newForm.name })
      setNewOpen(false)
      setNewForm({ name: "", type: "Nómina", beneficiarios: "", total: "" })
      refetchBatches()
      refetchPayments()
    } catch (err) {
      toast.error("Error al crear dispersión", { description: err instanceof Error ? err.message : "Intenta de nuevo" })
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <DashboardSkeleton variant="stats-and-table" />
  if (error) return <ErrorCard message={error} onRetry={handleRefresh} />

  const totalDispersado = dispersiones.reduce((s, d) => s + d.total, 0)
  const completadas = dispersiones.filter((d) => isCompleted(d.status)).length
  const enProceso = dispersiones.filter((d) => isActive(d.status)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dispersiones</h1>
          <p className="text-sm text-muted-foreground">Lotes de dispersión: nómina, créditos y comisiones</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="size-4 mr-1.5" />
            Actualizar
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4 mr-1.5" />
            Nueva Dispersión
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <Send className="size-5 text-sayo-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Dispersado</p>
              <p className="text-lg font-bold">{formatMoney(totalDispersado)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle className="size-5 text-sayo-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completadas</p>
              <p className="text-lg font-bold">{completadas}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-50">
              <Clock className="size-5 text-sayo-orange" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En Proceso</p>
              <p className="text-lg font-bold">{enProceso}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispersión Cards */}
      {dispersiones.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            No se encontraron dispersiones registradas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {dispersiones.map((d) => {
            const status = statusMap[d.status] ?? statusMap.pendiente
            const progress = d.beneficiarios > 0 ? Math.round((d.procesados / d.beneficiarios) * 100) : 0

            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{d.name}</h3>
                        <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {d.id} — {d.date} {d.hora}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Beneficiarios</p>
                        <div className="flex items-center gap-1 justify-center">
                          <Users className="size-3.5 text-muted-foreground" />
                          <p className="text-sm font-bold">{d.beneficiarios}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold">{formatMoney(d.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progreso</p>
                        <div className="flex items-center gap-1 justify-center">
                          {progress === 100 ? (
                            <CheckCircle className="size-3.5 text-sayo-green" />
                          ) : (
                            <Clock className="size-3.5 text-sayo-blue" />
                          )}
                          <p className="text-sm font-bold">{progress}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleView(d)} title="Ver detalle">
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDownload(d)} title="Descargar">
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isActive(d.status) && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sayo-blue transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {d.procesados} de {d.beneficiarios} procesados — {d.pendientes} pendientes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Dispersión</DialogTitle>
            <DialogDescription>{selectedDisp?.id} — {selectedDisp?.name}</DialogDescription>
          </DialogHeader>
          {selectedDisp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[selectedDisp.status]?.color}`}>
                  {statusMap[selectedDisp.status]?.label ?? selectedDisp.status}
                </span>
                <p className="text-xl font-bold tabular-nums">{formatMoney(selectedDisp.total)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p>{selectedDisp.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha / Hora</p>
                  <p>{selectedDisp.date} {selectedDisp.hora}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Beneficiarios</p>
                  <p className="font-semibold">{selectedDisp.beneficiarios}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Progreso</p>
                  <p className="font-semibold">
                    {selectedDisp.procesados}/{selectedDisp.beneficiarios}{" "}
                    ({Math.round((selectedDisp.procesados / Math.max(selectedDisp.beneficiarios, 1)) * 100)}%)
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg border space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Resumen</p>
                <div className="flex items-center justify-between text-sm py-1 border-b">
                  <span>Procesados exitosamente</span>
                  <span className="font-semibold tabular-nums text-sayo-green">{selectedDisp.procesados}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span>Pendientes / Fallidos</span>
                  <span className="font-semibold tabular-nums text-sayo-orange">{selectedDisp.pendientes}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedDisp && handleDownload(selectedDisp)}>
              <FileText className="size-3.5 mr-1" /> Descargar Reporte
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Dispersión Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Dispersión</DialogTitle>
            <DialogDescription>Crear un nuevo lote de dispersión</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre del lote</label>
              <Input
                placeholder="Ej: Nómina Quincenal Mar-2"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <div className="flex gap-2 mt-1">
                {["Nómina", "Créditos", "Comisiones", "Otro"].map((t) => (
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Beneficiarios</label>
                <Input
                  type="number"
                  placeholder="35"
                  value={newForm.beneficiarios}
                  onChange={(e) => setNewForm({ ...newForm, beneficiarios: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Monto Total</label>
                <Input
                  type="number"
                  placeholder="890000"
                  value={newForm.total}
                  onChange={(e) => setNewForm({ ...newForm, total: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewDispersion} disabled={submitting}>
              <Send className="size-3.5 mr-1" />
              {submitting ? "Creando..." : "Crear Dispersión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
