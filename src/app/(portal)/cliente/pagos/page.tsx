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
import { formatMoney } from "@/lib/utils"
import { Zap, Droplets, Wifi, Phone, Tv, CreditCard, Clock, Check, Copy, Loader2, RefreshCw, AlertCircle, Flame, Smartphone } from "lucide-react"
import { toast } from "sonner"
import {
  getServiceCatalog,
  createPayment,
  getPaymentHistory,
  serviceCategories,
  type ServiceCatalogItem,
  type ServicePayment,
} from "@/lib/payments-service"
import { ApiError } from "@/lib/api-client"

// ── Icon map ───────────────────────────────────────────────────

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electricidad: Zap,
  agua: Droplets,
  gas: Flame,
  telefonia: Phone,
  internet: Wifi,
  television: Tv,
  recargas: Smartphone,
  tarjeta: CreditCard,
  otros: CreditCard,
  sat: CreditCard,
}

function getCategoryIcon(category: string): React.ComponentType<{ className?: string }> {
  return categoryIconMap[category] ?? CreditCard
}

const categoryColorMap: Record<string, string> = {
  electricidad: "text-yellow-600 bg-yellow-100",
  agua: "text-blue-600 bg-blue-100",
  gas: "text-red-600 bg-red-100",
  telefonia: "text-green-600 bg-green-100",
  internet: "text-purple-600 bg-purple-100",
  television: "text-red-600 bg-red-100",
  recargas: "text-green-600 bg-green-100",
  tarjeta: "text-orange-600 bg-orange-100",
  sat: "text-indigo-600 bg-indigo-100",
  otros: "text-gray-600 bg-gray-100",
}

function getCategoryColor(category: string): string {
  return categoryColorMap[category] ?? "text-gray-600 bg-gray-100"
}

function mapPaymentStatus(status: string): "pagado" | "pendiente" | "fallido" {
  if (status === "completed" || status === "pagado") return "pagado"
  if (status === "failed" || status === "rejected" || status === "fallido") return "fallido"
  return "pendiente"
}

// ── Component ─────────────────────────────────────────────────

export default function PagosPage() {
  // ── Catalog state ─────────────────────────────────────────────
  const [catalog, setCatalog] = React.useState<ServiceCatalogItem[]>([])
  const [loadingCatalog, setLoadingCatalog] = React.useState(true)

  // ── Payment history state ──────────────────────────────────────
  const [payments, setPayments] = React.useState<ServicePayment[]>([])
  const [loadingHistory, setLoadingHistory] = React.useState(true)

  // ── Category grouping for display ─────────────────────────────
  // Groups catalog items by category, keeping unique categories
  const displayCategories = React.useMemo(() => {
    const seen = new Set<string>()
    const cats: { id: string; name: string; icon: React.ComponentType<{ className?: string }>; color: string; items: ServiceCatalogItem[] }[] = []
    for (const item of catalog) {
      if (!seen.has(item.category)) {
        seen.add(item.category)
        const catMeta = serviceCategories.find((c) => c.id === item.category)
        cats.push({
          id: item.category,
          name: catMeta?.name ?? item.category,
          icon: getCategoryIcon(item.category),
          color: getCategoryColor(item.category),
          items: catalog.filter((i) => i.category === item.category),
        })
      }
    }
    return cats
  }, [catalog])

  // ── Selection state ───────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = React.useState<typeof displayCategories[number] | null>(null)
  const [selectedService, setSelectedService] = React.useState<ServiceCatalogItem | null>(null)
  const [form, setForm] = React.useState({ reference: "", amount: "" })

  // ── Dialog state ──────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [selectedPayment, setSelectedPayment] = React.useState<ServicePayment | null>(null)
  const [lastPayment, setLastPayment] = React.useState<ServicePayment | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // ── Data loading ──────────────────────────────────────────────

  const loadCatalog = React.useCallback(async () => {
    setLoadingCatalog(true)
    try {
      const data = await getServiceCatalog()
      setCatalog(data)
    } catch (err) {
      toast.error("Error al cargar catálogo de servicios", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingCatalog(false)
    }
  }, [])

  const loadHistory = React.useCallback(async () => {
    setLoadingHistory(true)
    try {
      const data = await getPaymentHistory()
      setPayments(data)
    } catch (err) {
      toast.error("Error al cargar historial de pagos", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  React.useEffect(() => {
    loadCatalog()
    loadHistory()
  }, [loadCatalog, loadHistory])

  // ── Computed stats ─────────────────────────────────────────────

  const totalPagado = payments
    .filter((p) => mapPaymentStatus(p.status) === "pagado")
    .reduce((s, p) => s + p.total, 0)

  // ── Handlers ──────────────────────────────────────────────────

  const handleSelectCategory = (cat: typeof displayCategories[number]) => {
    setSelectedCategory(cat)
    const firstItem = cat.items[0] ?? null
    setSelectedService(firstItem)
    setForm({ reference: "", amount: "" })
    toast.info(`Servicio: ${cat.name}`, { description: "Completa los datos de pago" })
  }

  const handleSelectService = (svc: ServiceCatalogItem) => {
    setSelectedService(svc)
    setForm({ reference: "", amount: "" })
  }

  const handlePay = () => {
    if (!selectedService) {
      toast.error("Selecciona un servicio arriba")
      return
    }
    if (!form.reference) {
      const label = selectedService.requires?.[0] ?? "referencia"
      toast.error(`Ingresa el ${label}`)
      return
    }
    const amount = parseFloat(form.amount)
    if (!form.amount || amount <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    if (amount < selectedService.min_amount) {
      toast.error(`El monto mínimo es ${formatMoney(selectedService.min_amount)}`)
      return
    }
    if (selectedService.max_amount && amount > selectedService.max_amount) {
      toast.error(`El monto máximo es ${formatMoney(selectedService.max_amount)}`)
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmPay = async () => {
    if (!selectedService) return
    setSubmitting(true)
    try {
      const payment = await createPayment(
        selectedService.id,
        form.reference,
        parseFloat(form.amount)
      )
      setPayments((prev) => [payment, ...prev])
      setLastPayment(payment)
      setConfirmOpen(false)
      setSuccessOpen(true)
      setForm({ reference: "", amount: "" })
      setSelectedService(null)
      setSelectedCategory(null)

      // Refresh history after brief delay
      setTimeout(() => loadHistory(), 2000)
    } catch (err) {
      setConfirmOpen(false)
      if (err instanceof ApiError) {
        if (err.code === "INSUFFICIENT_FUNDS" || err.status === 402) {
          toast.error("Fondos insuficientes", {
            description: "Tu saldo disponible no es suficiente para este pago.",
          })
        } else if (err.code === "SERVICE_UNAVAILABLE" || err.status === 503) {
          toast.error("Servicio no disponible", {
            description: "El servicio de pagos está temporalmente fuera de línea. Intenta más tarde.",
          })
        } else if (err.code === "INVALID_REFERENCE" || err.status === 422) {
          toast.error("Referencia inválida", {
            description: "Verifica el número de referencia o contrato.",
          })
        } else {
          toast.error(`Error al procesar pago (${err.code})`, {
            description: err.message,
          })
        }
      } else {
        toast.error("Error de red", {
          description: "No se pudo conectar con el servidor. Intenta nuevamente.",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewPayment = (payment: ServicePayment) => {
    setSelectedPayment(payment)
    setDetailOpen(true)
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pago de Servicios</h1>
        <p className="text-sm text-muted-foreground">Paga luz, agua, gas, internet, teléfono y más</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Pagado</p>
            <p className="text-lg font-bold tabular-nums">{formatMoney(totalPagado)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Pagos Realizados</p>
            <p className="text-lg font-bold">{payments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Servicios</p>
            <p className="text-lg font-bold">{displayCategories.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories */}
      {loadingCatalog ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {displayCategories.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory?.id === cat.id
            return (
              <Card
                key={cat.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary"
                }`}
                onClick={() => handleSelectCategory(cat)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`size-10 rounded-full flex items-center justify-center mx-auto mb-2 ${cat.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <p className="text-xs font-medium leading-tight">{cat.name}</p>
                  {isSelected && <Check className="size-3 text-primary mx-auto mt-1" />}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Payment Form */}
      <Card className={selectedCategory ? "border-primary" : ""}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Realizar Pago</h2>
            {selectedCategory && (
              <Badge variant="outline" className="text-xs">{selectedCategory.name}</Badge>
            )}
          </div>

          {/* Provider selector within category */}
          {selectedCategory && selectedCategory.items.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Proveedor</label>
              <div className="flex gap-1.5 flex-wrap">
                {selectedCategory.items.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleSelectService(svc)}
                    className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${
                      selectedService?.id === svc.id
                        ? "bg-sayo-cafe text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {svc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {selectedService?.requires?.[0]
                  ? selectedService.requires[0].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Referencia / No. Contrato"}{" "}
                *
              </label>
              <Input
                placeholder={
                  selectedService?.requires?.[0]
                    ? `Ingresa tu ${selectedService.requires[0].replace(/_/g, " ")}`
                    : "Número de referencia"
                }
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                disabled={!selectedService}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Monto *
                {selectedService && (
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    (min {formatMoney(selectedService.min_amount)}
                    {selectedService.max_amount ? ` — max ${formatMoney(selectedService.max_amount)}` : ""})
                  </span>
                )}
              </label>
              <Input
                placeholder="$0.00"
                type="number"
                min={selectedService?.min_amount ?? 0}
                max={selectedService?.max_amount ?? undefined}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                disabled={!selectedService}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePay} disabled={!selectedService || loadingCatalog}>
              <CreditCard className="size-4 mr-1.5" /> Pagar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="size-4 text-muted-foreground" /> Historial de Pagos
          </h2>
          <Button variant="ghost" size="sm" onClick={loadHistory} disabled={loadingHistory}>
            <RefreshCw className={`size-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loadingHistory ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay pagos en el historial</p>
          </div>
        ) : (
          <div className="space-y-1">
            {payments.map((p) => {
              const Icon = getCategoryIcon(
                catalog.find((c) => c.id === p.service_id)?.category ?? "otros"
              )
              const status = mapPaymentStatus(p.status)
              return (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleViewPayment(p)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <Icon className="size-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.service_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.paid_at).toLocaleDateString("es-MX")} • Ref: {p.reference}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-red-600 tabular-nums flex-shrink-0">
                      -{formatMoney(p.total)}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] flex-shrink-0 ${
                        status === "pagado"
                          ? "bg-green-50 text-green-700"
                          : status === "pendiente"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {status}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm Payment Dialog */}
      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!submitting) setConfirmOpen(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Pago</DialogTitle>
            <DialogDescription>Revisa los datos del pago</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Servicio</span>
                <span className="font-medium">{selectedCategory?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Proveedor</span>
                <span>{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referencia</span>
                <span className="font-mono text-xs">{form.reference}</span>
              </div>
              {selectedService && selectedService.min_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Comisión</span>
                  <span className="text-muted-foreground text-xs">
                    {selectedService.min_amount === 0 ? "Sin comisión" : "Incluida"}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-sm font-medium">Monto a Pagar</span>
                <span className="text-xl font-bold text-sayo-cafe tabular-nums">
                  {formatMoney(parseFloat(form.amount) || 0)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={submitting} />}>Cancelar</DialogClose>
            <Button onClick={handleConfirmPay} disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-3.5 mr-1 animate-spin" />
              ) : (
                <Check className="size-3.5 mr-1" />
              )}
              {submitting ? "Procesando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pago Exitoso</DialogTitle>
            <DialogDescription>Tu pago se ha procesado correctamente</DialogDescription>
          </DialogHeader>
          {lastPayment && (
            <div className="space-y-4">
              <div className="text-center p-4">
                <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="size-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 tabular-nums">
                  {formatMoney(lastPayment.total)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{lastPayment.service_name}</p>
              </div>
              <div className="p-3 rounded-lg border text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmación</span>
                  <span className="font-mono text-xs">{lastPayment.confirmation_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referencia</span>
                  <span className="font-mono text-xs">{lastPayment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span>{new Date(lastPayment.paid_at).toLocaleDateString("es-MX")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="text-green-600 font-medium capitalize">
                    {mapPaymentStatus(lastPayment.status)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Pago</DialogTitle>
            <DialogDescription>{selectedPayment?.id}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (() => {
            const Icon = getCategoryIcon(
              catalog.find((c) => c.id === selectedPayment.service_id)?.category ?? "otros"
            )
            const status = mapPaymentStatus(selectedPayment.status)
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedPayment.service_name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      status === "pagado"
                        ? "bg-green-50 text-green-700"
                        : status === "pendiente"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {status}
                  </Badge>
                </div>
                <div className="text-center py-2">
                  <p className="text-2xl font-bold text-red-600 tabular-nums">
                    -{formatMoney(selectedPayment.total)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Servicio</p>
                    <p className="font-medium">{selectedPayment.service_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Referencia</p>
                    <p className="font-mono text-xs">{selectedPayment.reference}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Confirmación</p>
                    <p className="font-mono text-xs">{selectedPayment.confirmation_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                    <p>{new Date(selectedPayment.paid_at).toLocaleDateString("es-MX")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Monto</p>
                    <p className="font-semibold tabular-nums">{formatMoney(selectedPayment.amount)}</p>
                  </div>
                  {selectedPayment.commission > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Comisión</p>
                      <p className="font-semibold tabular-nums">{formatMoney(selectedPayment.commission)}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedPayment) {
                  const text = `Pago SAYO\n${selectedPayment.service_name}\n${formatMoney(selectedPayment.total)}\nRef: ${selectedPayment.reference}\nConfirmación: ${selectedPayment.confirmation_number}\nFecha: ${new Date(selectedPayment.paid_at).toLocaleDateString("es-MX")}`
                  navigator.clipboard
                    .writeText(text)
                    .then(() => toast.success("Detalles copiados"))
                    .catch(() => toast.info("No se pudo copiar"))
                }
              }}
            >
              <Copy className="size-3.5 mr-1" /> Copiar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
