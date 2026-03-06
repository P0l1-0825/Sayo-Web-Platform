"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Smartphone, TrendingUp, CreditCard, Building } from "lucide-react"

const products = [
  {
    name: "Cuenta SAYO",
    subtitle: "Cuenta digital sin comisiones",
    icon: Smartphone,
    color: "from-blue-500 to-blue-600",
    features: [
      "Sin comisiones de apertura ni mantenimiento",
      "CLABE interbancaria propia",
      "SPEI ilimitado sin costo",
      "Tarjeta virtual inmediata",
      "App iOS y Android",
    ],
    requirements: ["INE vigente", "Selfie de verificación", "Comprobante de domicilio"],
    cta: "Abrir Cuenta",
  },
  {
    name: "Crédito Personal",
    subtitle: "Desde 12% anual",
    icon: TrendingUp,
    color: "from-green-500 to-green-600",
    features: [
      "Tasas desde 12% anual",
      "Aprobación en minutos",
      "Sin comisión por apertura",
      "Plazos de 6 a 48 meses",
      "Sin penalización por prepago",
    ],
    requirements: ["Cuenta SAYO activa", "Antigüedad mínima 3 meses", "Score crediticio > 600"],
    cta: "Solicitar Crédito",
  },
  {
    name: "Tarjeta SAYO",
    subtitle: "Mastercard con cashback",
    icon: CreditCard,
    color: "from-purple-500 to-purple-600",
    features: [
      "2% cashback en todas tus compras",
      "Aceptada en millones de comercios",
      "Pagos contactless (NFC)",
      "Control desde la app",
      "Bloqueo/desbloqueo instantáneo",
    ],
    requirements: ["Cuenta SAYO activa", "Solicitar desde la app"],
    cta: "Solicitar Tarjeta",
  },
  {
    name: "SAYO Empresas",
    subtitle: "Soluciones para tu negocio",
    icon: Building,
    color: "from-orange-500 to-orange-600",
    features: [
      "Dispersión de nómina",
      "Terminal punto de venta",
      "Facturación electrónica",
      "Crédito empresarial",
      "Dashboard de administración",
    ],
    requirements: ["Acta constitutiva", "RFC de la empresa", "Identificación del representante legal"],
    cta: "Contactar Ventas",
  },
]

export default function ProductosPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Nuestros Productos</h1>
        <p className="text-sm text-muted-foreground">Soluciones financieras diseñadas para ti</p>
      </div>

      <div className="space-y-6">
        {products.map((p) => {
          const Icon = p.icon
          return (
            <Card key={p.name} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Product Header */}
                  <div className={`bg-gradient-to-br ${p.color} p-6 text-white flex flex-col justify-center`}>
                    <Icon className="size-10 mb-3" />
                    <h2 className="text-xl font-bold">{p.name}</h2>
                    <p className="text-sm text-white/80">{p.subtitle}</p>
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
                    <Button className="w-full">{p.cta} <ArrowRight className="size-4 ml-1" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
