"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Smartphone, CreditCard, TrendingUp, Users, Star, CheckCircle } from "lucide-react"

const products = [
  { name: "Cuenta SAYO", description: "Cuenta digital sin comisiones ni saldo mínimo", icon: Smartphone, color: "text-blue-600 bg-blue-100" },
  { name: "Crédito Personal", description: "Desde 12% anual, aprobación en minutos", icon: TrendingUp, color: "text-green-600 bg-green-100" },
  { name: "Tarjeta SAYO", description: "Mastercard con cashback en todas tus compras", icon: CreditCard, color: "text-purple-600 bg-purple-100" },
  { name: "SAYO Empresas", description: "Soluciones financieras para tu negocio", icon: Users, color: "text-orange-600 bg-orange-100" },
]

const features = [
  "Sin comisiones por apertura",
  "SPEI ilimitado y gratis",
  "Tarjeta física y virtual",
  "App iOS y Android",
  "Regulada por CNBV",
  "Protección IPAB hasta 25 UDIS",
]

const testimonials = [
  { name: "María G.", text: "La mejor fintech de México. Abrí mi cuenta en 5 minutos.", rating: 5 },
  { name: "Carlos R.", text: "El crédito fue aprobado en horas, increíble servicio.", rating: 5 },
  { name: "Ana T.", text: "La app es super intuitiva y las transferencias son instantáneas.", rating: 4 },
]

export default function SayoMXHome() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 py-12 bg-gradient-to-b from-sayo-cream to-white rounded-2xl px-6">
        <Badge className="bg-sayo-cafe text-white text-xs">Regulada por CNBV • IPAB</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-sayo-cafe">
          Tu banco digital,<br />sin complicaciones
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Abre tu cuenta SAYO en minutos. Sin comisiones, sin saldo mínimo, con la seguridad que necesitas.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" className="bg-sayo-cafe hover:bg-sayo-cafe-light">
            Abrir Cuenta <ArrowRight className="size-4 ml-1" />
          </Button>
          <Button size="lg" variant="outline">Conocer más</Button>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-xl font-bold text-center mb-6">Nuestros Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const Icon = p.icon
            return (
              <Card key={p.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center space-y-3">
                  <div className={`size-12 rounded-full flex items-center justify-center mx-auto ${p.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  <Button variant="ghost" size="sm" className="text-xs">Más info <ArrowRight className="size-3 ml-1" /></Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features */}
      <div className="bg-sayo-cream rounded-2xl p-8">
        <h2 className="text-xl font-bold text-center mb-6 text-sayo-cafe">¿Por qué SAYO?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <CheckCircle className="size-4 text-sayo-green flex-shrink-0" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-xl font-bold text-center mb-6">Lo que dicen nuestros clientes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground">&quot;{t.text}&quot;</p>
                <p className="text-xs font-semibold">{t.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-3 py-8 border-t">
        <h2 className="text-lg font-bold">¿Listo para comenzar?</h2>
        <p className="text-sm text-muted-foreground">Únete a más de 48,000 usuarios que ya confían en SAYO</p>
        <Button size="lg" className="bg-sayo-cafe hover:bg-sayo-cafe-light">
          Abrir Mi Cuenta <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
