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
import { CheckCircle, ArrowRight, Smartphone, TrendingUp, CreditCard, Building, Calculator, Send, Check, Info } from "lucide-react"
import { toast } from "sonner"
import { formatMoney } from "@/lib/utils"

const products = [
  {
    id: "cuenta",
    name: "Cuenta SAYO",
    subtitle: "Cuenta digital sin comisiones",
    icon: Smartphone,
    color: "from-blue-500 to-blue-600",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      "Sin comisiones de apertura ni mantenimiento",
      "CLABE interbancaria propia",
      "SPEI ilimitado sin costo",
      "Tarjeta virtual inmediata",
      "App iOS y Android",
      "Depósitos protegidos por IPAB",
    ],
    requirements: ["INE vigente", "Selfie de verificación", "Comprobante de domicilio"],
    cta: "Abrir Cuenta",
    ctaType: "account" as const,
    details: {
      tasaAnual: "0%",
      comisionApertura: "$0",
      saldoMinimo: "$0",
      rendimiento: "Hasta 11% anual en cuenta de ahorro",
    },
  },
  {
    id: "credito",
    name: "Crédito Personal",
    subtitle: "Desde 12% anual",
    icon: TrendingUp,
    color: "from-green-500 to-green-600",
    badgeColor: "bg-green-100 text-green-700",
    features: [
      "Tasas desde 12% anual",
      "Aprobación en minutos",
      "Sin comisión por apertura",
      "Plazos de 6 a 48 meses",
      "Sin penalización por prepago",
      "Dispersión inmediata a tu cuenta SAYO",
    ],
    requirements: ["Cuenta SAYO activa", "Antigüedad mínima 3 meses", "Score crediticio > 600"],
    cta: "Simular Crédito",
    ctaType: "simulator" as const,
    details: {
      tasaMinima: "12%",
      tasaMaxima: "36%",
      cat: "Desde 14.5% sin IVA",
      montoMinimo: "$5,000",
      montoMaximo: "$500,000",
    },
  },
  {
    id: "tarjeta",
    name: "Tarjeta SAYO",
    subtitle: "Mastercard con cashback",
    icon: CreditCard,
    color: "from-purple-500 to-purple-600",
    badgeColor: "bg-purple-100 text-purple-700",
    features: [
      "2% cashback en todas tus compras",
      "Aceptada en millones de comercios",
      "Pagos contactless (NFC)",
      "Control desde la app",
      "Bloqueo/desbloqueo instantáneo",
      "Sin anualidad el primer año",
    ],
    requirements: ["Cuenta SAYO activa", "Solicitar desde la app"],
    cta: "Solicitar Tarjeta",
    ctaType: "account" as const,
    details: {
      anualidad: "$0 primer año, $499 después",
      cashback: "2% en compras nacionales, 3% internacionales",
      limiteInicial: "Desde $10,000",
    },
  },
  {
    id: "empresas",
    name: "SAYO Empresas",
    subtitle: "Soluciones para tu negocio",
    icon: Building,
    color: "from-orange-500 to-orange-600",
    badgeColor: "bg-orange-100 text-orange-700",
    features: [
      "Dispersión de nómina",
      "Terminal punto de venta",
      "Facturación electrónica",
      "Crédito empresarial",
      "Dashboard de administración",
      "API de integración",
    ],
    requirements: ["Acta constitutiva", "RFC de la empresa", "Identificación del representante legal"],
    cta: "Contactar Ventas",
    ctaType: "contact" as const,
    details: {
      comisionNomina: "$3.50 por dispersión",
      tpv: "Desde 2.5% + IVA",
      creditoEmpresarial: "Desde $100,000 hasta $10M",
    },
  },
]

export default function ProductosPage() {
  const [simulatorOpen, setSimulatorOpen] = React.useState(false)
  const [contactOpen, setContactOpen] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<typeof products[0] | null>(null)
  const [contactForm, setContactForm] = React.useState({ name: "", email: "", phone: "", product: "", message: "" })

  // Credit simulator state
  const [simMonto, setSimMonto] = React.useState(50000)
  const [simPlazo, setSimPlazo] = React.useState(24)
  const [simTasa, setSimTasa] = React.useState(18)

  const plazos = [6, 12, 18, 24, 36, 48]
  const tasas = [12, 15, 18, 24, 30, 36]

  const calcularMensualidad = () => {
    const tasaMensual = simTasa / 100 / 12
    const n = simPlazo
    if (tasaMensual === 0) return simMonto / n
    const mensualidad = simMonto * (tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1)
    return mensualidad
  }

  const mensualidad = calcularMensualidad()
  const totalPagar = mensualidad * simPlazo
  const interesesTotales = totalPagar - simMonto

  const handleCTA = (product: typeof products[0]) => {
    if (product.ctaType === "simulator") {
      setSimMonto(50000)
      setSimPlazo(24)
      setSimTasa(18)
      setSimulatorOpen(true)
    } else if (product.ctaType === "contact") {
      setContactForm({ ...contactForm, product: product.name, message: `Me interesa ${product.name}` })
      setContactOpen(true)
    } else {
      setContactForm({ ...contactForm, product: product.name, message: `Quiero abrir/solicitar ${product.name}` })
      setContactOpen(true)
    }
  }

  const handleViewDetails = (product: typeof products[0]) => {
    setSelectedProduct(product)
    setDetailOpen(true)
  }

  const handleSubmitContact = () => {
    if (!contactForm.name || !contactForm.email) {
      toast.error("Completa nombre y email")
      return
    }
    setContactOpen(false)
    setSuccessOpen(true)
    setContactForm({ name: "", email: "", phone: "", product: "", message: "" })
  }

  const handleSimulatorContact = () => {
    setSimulatorOpen(false)
    setContactForm({
      name: "",
      email: "",
      phone: "",
      product: "Crédito Personal",
      message: `Solicito crédito de ${formatMoney(simMonto)} a ${simPlazo} meses (tasa ${simTasa}%). Mensualidad estimada: ${formatMoney(mensualidad)}`,
    })
    setContactOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Nuestros Productos</h1>
        <p className="text-sm text-muted-foreground">Soluciones financieras diseñadas para ti</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {products.map((p) => (
            <Badge key={p.id} className={`text-[10px] ${p.badgeColor}`}>{p.name}</Badge>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {products.map((p) => {
          const Icon = p.icon
          return (
            <Card key={p.name} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Product Header */}
                  <div className={`bg-gradient-to-br ${p.color} p-6 text-white flex flex-col justify-center`}>
                    <Icon className="size-10 mb-3" />
                    <h2 className="text-xl font-bold">{p.name}</h2>
                    <p className="text-sm text-white/80">{p.subtitle}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white hover:bg-white/20 mt-3 w-fit text-xs"
                      onClick={() => handleViewDetails(p)}
                    >
                      <Info className="size-3 mr-1" /> Ver detalles
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <h3 className="text-sm font-semibold mb-3">Características</h3>
                    <ul className="space-y-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <CheckCircle className="size-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements + CTA */}
                  <div className="p-6 bg-muted/30 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Requisitos</h3>
                      <ul className="space-y-1.5 mb-4">
                        {p.requirements.map((r) => (
                          <li key={r} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full" onClick={() => handleCTA(p)}>
                      {p.ctaType === "simulator" && <Calculator className="size-4 mr-1" />}
                      {p.cta} <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Comparison table */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-center mb-4">Comparativa Rápida</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Característica</th>
                  <th className="text-center py-2 px-3 font-semibold">Cuenta</th>
                  <th className="text-center py-2 px-3 font-semibold">Crédito</th>
                  <th className="text-center py-2 px-3 font-semibold">Tarjeta</th>
                  <th className="text-center py-2 px-3 font-semibold">Empresas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Comisión apertura", values: ["$0", "$0", "$0", "$0"] },
                  { label: "SPEI gratis", values: ["✓", "✓", "✓", "✓"] },
                  { label: "Cashback", values: ["—", "—", "2-3%", "—"] },
                  { label: "App móvil", values: ["✓", "✓", "✓", "✓"] },
                  { label: "Tarjeta física", values: ["Opcional", "—", "✓", "—"] },
                  { label: "IPAB", values: ["✓", "—", "—", "✓"] },
                ].map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="py-2 px-3 font-medium">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`text-center py-2 px-3 ${v === "✓" ? "text-green-600 font-bold" : v === "—" ? "text-muted-foreground" : ""}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CTA Bottom */}
      <div className="text-center space-y-3 py-6 border-t">
        <h2 className="text-lg font-bold">¿No sabes cuál elegir?</h2>
        <p className="text-sm text-muted-foreground">Un asesor SAYO te ayuda a encontrar la mejor opción</p>
        <Button
          size="lg"
          className="bg-sayo-cafe hover:bg-sayo-cafe-light"
          onClick={() => {
            setContactForm({ name: "", email: "", phone: "", product: "Asesoría General", message: "Me gustaría que un asesor me ayude a elegir el mejor producto" })
            setContactOpen(true)
          }}
        >
          Hablar con un Asesor <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>

      {/* Credit Simulator Dialog */}
      <Dialog open={simulatorOpen} onOpenChange={setSimulatorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="size-5 text-green-600" /> Simulador de Crédito
            </DialogTitle>
            <DialogDescription>Calcula tu mensualidad estimada</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Monto */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Monto del crédito</label>
                <span className="text-sm font-bold text-green-600">{formatMoney(simMonto)}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={500000}
                step={5000}
                value={simMonto}
                onChange={(e) => setSimMonto(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$5,000</span>
                <span>$500,000</span>
              </div>
            </div>

            {/* Plazo */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Plazo (meses)</label>
              <div className="flex gap-2 mt-2">
                {plazos.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSimPlazo(p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                      simPlazo === p ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasa */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tasa anual (%)</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {tasas.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSimTasa(t)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      simTasa === t ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-green-50 rounded-xl p-4 space-y-3">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Mensualidad estimada</p>
                <p className="text-3xl font-bold text-green-600">{formatMoney(mensualidad)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">Monto</p>
                  <p className="text-xs font-semibold">{formatMoney(simMonto)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Intereses</p>
                  <p className="text-xs font-semibold text-orange-600">{formatMoney(interesesTotales)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Total a pagar</p>
                  <p className="text-xs font-semibold">{formatMoney(totalPagar)}</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              * Simulación con fines informativos. La tasa real depende del perfil crediticio. CAT promedio 14.5% sin IVA.
            </p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSimulatorContact}>
              <Send className="size-3.5 mr-1" /> Solicitar Crédito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>{selectedProduct?.subtitle}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className={`bg-gradient-to-br ${selectedProduct.color} rounded-xl p-4 text-white`}>
                {(() => {
                  const Icon = selectedProduct.icon
                  return (
                    <div className="flex items-center gap-3">
                      <Icon className="size-8" />
                      <div>
                        <p className="font-bold">{selectedProduct.name}</p>
                        <p className="text-xs text-white/80">{selectedProduct.subtitle}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Detalles del producto</p>
                <div className="space-y-2">
                  {Object.entries(selectedProduct.details).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <span className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="text-xs font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Características ({selectedProduct.features.length})</p>
                <ul className="space-y-1.5">
                  {selectedProduct.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="size-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Requisitos</p>
                <ul className="space-y-1">
                  {selectedProduct.requirements.map((r) => (
                    <li key={r} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
            <Button onClick={() => { setDetailOpen(false); if (selectedProduct) handleCTA(selectedProduct) }}>
              {selectedProduct?.cta} <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar {contactForm.product}</DialogTitle>
            <DialogDescription>Déjanos tus datos y un asesor te contactará</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre Completo *</label>
              <Input placeholder="Juan Pérez" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email *</label>
              <Input placeholder="juan@email.com" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
              <Input placeholder="+52 55 1234 5678" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Producto</label>
              <Input value={contactForm.product} readOnly className="bg-muted" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mensaje</label>
              <Input placeholder="Información adicional..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSubmitContact}>
              <Send className="size-3.5 mr-1" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¡Solicitud Enviada!</DialogTitle>
            <DialogDescription>Hemos recibido tu información</DialogDescription>
          </DialogHeader>
          <div className="text-center p-4">
            <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check className="size-8 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Un asesor SAYO te contactará en menos de 24 horas hábiles.</p>
            <p className="text-xs text-muted-foreground mt-2">También puedes llamarnos al 800-SAYO-MEX (800-7296-639)</p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
