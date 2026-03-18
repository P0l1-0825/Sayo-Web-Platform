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
import { Zap, Droplets, Wifi, Phone, Tv, CreditCard, Clock, Check, Eye, Copy } from "lucide-react"
import { toast } from "sonner"

interface ServiceCategory {
  name: string
  icon: typeof Zap
  color: string
  providers: string[]
}

interface Payment {
  id: string
  service: string
  provider: string
  amount: number
  date: string
  reference: string
  status: "pagado" | "pendiente" | "fallido"
  account: string
}

const services: ServiceCategory[] = [
  { name: "CFE", icon: Zap, color: "text-yellow-600 bg-yellow-100", providers: ["CFE Doméstico", "CFE Comercial"] },
  { name: "Agua", icon: Droplets, color: "text-blue-600 bg-blue-100", providers: ["SIAPA", "SACMEX", "CESPT"] },
  { name: "Internet", icon: Wifi, color: "text-purple-600 bg-purple-100", providers: ["Telmex", "Totalplay", "Izzi", "Megacable"] },
  { name: "Teléfono", icon: Phone, color: "text-green-600 bg-green-100", providers: ["Telcel", "AT&T", "Movistar"] },
  { name: "TV Cable", icon: Tv, color: "text-red-600 bg-red-100", providers: ["Sky", "Dish", "Star TV"] },
  { name: "Tarjeta", icon: CreditCard, color: "text-orange-600 bg-orange-100", providers: ["BBVA", "Santander", "Banorte", "Citibanamex", "HSBC"] },
]

const initialPayments: Payment[] = [
  { id: "PAG-001", service: "CFE", provider: "CFE Doméstico", amount: 1200, date: "2024-03-03", reference: "CFE-539871234", status: "pagado", account: "539871234" },
  { id: "PAG-002", service: "Teléfono", provider: "Telcel", amount: 399, date: "2024-02-28", reference: "TEL-5512345678", status: "pagado", account: "5512345678" },
  { id: "PAG-003", service: "Internet", provider: "Telmex", amount: 649, date: "2024-02-25", reference: "TMX-12345678", status: "pagado", account: "12345678" },
  { id: "PAG-004", service: "Agua", provider: "SIAPA", amount: 320, date: "2024-02-20", reference: "AGU-87654321", status: "pagado", account: "87654321" },
  { id: "PAG-005", service: "Tarjeta", provider: "BBVA", amount: 5500, date: "2024-02-15", reference: "TDC-4152XXXX1234", status: "pagado", account: "4152XXXX1234" },
]

const serviceIcons: Record<string, typeof Zap> = {
  CFE: Zap, Agua: Droplets, Internet: Wifi, Teléfono: Phone, "TV Cable": Tv, Tarjeta: CreditCard,
}

export default function PagosPage() {
  const [payments, setPayments] = React.useState<Payment[]>(initialPayments)
  const [selectedService, setSelectedService] = React.useState<ServiceCategory | null>(null)
  const [form, setForm] = React.useState({ provider: "", account: "", amount: "" })
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null)
  const [lastPayment, setLastPayment] = React.useState<Payment | null>(null)

  const handleSelectService = (svc: ServiceCategory) => {
    setSelectedService(svc)
    setForm({ provider: svc.providers[0], account: "", amount: "" })
    toast.info(`Servicio: ${svc.name}`, { description: "Completa los datos de pago" })
  }

  const handlePay = () => {
    if (!selectedService) {
      toast.error("Selecciona un servicio arriba")
      return
    }
    if (!form.account) {
      toast.error("Ingresa el número de referencia o contrato")
      return
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmPay = () => {
    if (!selectedService) return
    const newPayment: Payment = {
      id: `PAG-${String(payments.length + 1).padStart(3, "0")}`,
      service: selectedService.name,
      provider: form.provider,
      amount: parseFloat(form.amount),
      date: new Date().toISOString().slice(0, 10),
      reference: `${selectedService.name.toUpperCase().slice(0, 3)}-${form.account}`,
      status: "pagado",
      account: form.account,
    }
    setPayments([newPayment, ...payments])
    setLastPayment(newPayment)
    setConfirmOpen(false)
    setSuccessOpen(true)
    setForm({ provider: "", account: "", amount: "" })
    setSelectedService(null)
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setDetailOpen(true)
  }

  const totalPagado = payments.filter((p) => p.status === "pagado").reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pago de Servicios</h1>
        <p className="text-sm text-muted-foreground">Paga luz, agua, internet, teléfono y más</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Pagado</p>
            <p className="text-lg font-bold">{formatMoney(totalPagado)}</p>
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
            <p className="text-lg font-bold">{services.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {services.map((s) => {
          const Icon = s.icon
          const isSelected = selectedService?.name === s.name
          return (
            <Card
              key={s.name}
              className={`cursor-pointer transition-colors ${isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary"}`}
              onClick={() => handleSelectService(s)}
            >
              <CardContent className="p-4 text-center">
                <div className={`size-10 rounded-full flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                  <Icon className="size-5" />
                </div>
                <p className="text-xs font-medium">{s.name}</p>
                {isSelected && <Check className="size-3 text-primary mx-auto mt-1" />}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment Form */}
      <Card className={selectedService ? "border-primary" : ""}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Realizar Pago</h2>
            {selectedService && (
              <Badge variant="outline" className="text-xs">{selectedService.name}</Badge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Proveedor</label>
              {selectedService ? (
                <div className="flex gap-1.5 flex-wrap">
                  {selectedService.providers.map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, provider: p })}
                      className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${form.provider === p ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ) : (
                <Input placeholder="Selecciona un servicio arriba" disabled />
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Referencia / No. Contrato *</label>
              <Input placeholder="Número de referencia" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} disabled={!selectedService} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Monto *</label>
              <Input placeholder="$0.00" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} disabled={!selectedService} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePay} disabled={!selectedService}>
              <CreditCard className="size-4 mr-1.5" /> Pagar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Clock className="size-4 text-muted-foreground" /> Historial de Pagos</h2>
        <div className="space-y-1">
          {payments.map((p) => {
            const Icon = serviceIcons[p.service] || CreditCard
            return (
              <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewPayment(p)}>
                <CardContent className="p-3 flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.provider}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString("es-MX")} • Ref: {p.reference}</p>
                  </div>
                  <p className="text-sm font-semibold text-red-600">-{formatMoney(p.amount)}</p>
                  <Badge variant="outline" className={`text-[10px] ${p.status === "pagado" ? "bg-green-50 text-green-700" : p.status === "pendiente" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{p.status}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Confirm Payment Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Pago</DialogTitle>
            <DialogDescription>Revisa los datos del pago</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Servicio</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Proveedor</span>
                <span>{form.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referencia</span>
                <span className="font-mono text-xs">{form.account}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-sm font-medium">Monto a Pagar</span>
                <span className="text-xl font-bold text-sayo-cafe">{formatMoney(parseFloat(form.amount) || 0)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleConfirmPay}>
              <Check className="size-3.5 mr-1" /> Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¡Pago Exitoso!</DialogTitle>
            <DialogDescription>Tu pago se ha procesado correctamente</DialogDescription>
          </DialogHeader>
          {lastPayment && (
            <div className="space-y-4">
              <div className="text-center p-4">
                <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="size-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{formatMoney(lastPayment.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">{lastPayment.provider}</p>
              </div>
              <div className="p-3 rounded-lg border text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referencia</span>
                  <span className="font-mono text-xs">{lastPayment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span>{new Date(lastPayment.date).toLocaleDateString("es-MX")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="text-green-600 font-medium">Pagado</span>
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
            const Icon = serviceIcons[selectedPayment.service] || CreditCard
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedPayment.provider}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">{selectedPayment.status}</Badge>
                </div>
                <div className="text-center py-2">
                  <p className="text-2xl font-bold text-red-600">-{formatMoney(selectedPayment.amount)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Servicio</p>
                    <p className="font-medium">{selectedPayment.service}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Proveedor</p>
                    <p>{selectedPayment.provider}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">No. Cuenta / Referencia</p>
                    <p className="font-mono text-xs">{selectedPayment.account}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                    <p>{new Date(selectedPayment.date).toLocaleDateString("es-MX")}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Referencia de Pago</p>
                    <p className="font-mono text-xs">{selectedPayment.reference}</p>
                  </div>
                </div>
              </div>
            )
          })()}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => {
              if (selectedPayment) {
                const text = `Pago SAYO\n${selectedPayment.provider}\n${formatMoney(selectedPayment.amount)}\nRef: ${selectedPayment.reference}\nFecha: ${selectedPayment.date}`
                navigator.clipboard.writeText(text).then(() => toast.success("Detalles copiados")).catch(() => toast.info("No se pudo copiar"))
              }
            }}>
              <Copy className="size-3.5 mr-1" /> Copiar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
