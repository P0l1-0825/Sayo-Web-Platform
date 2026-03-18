"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { ArrowRight, Shield, Smartphone, CreditCard, TrendingUp, Users, Star, CheckCircle, Send, Check } from "lucide-react"
import { toast } from "sonner"

const products = [
  { name: "Cuenta SAYO", description: "Cuenta digital sin comisiones ni saldo mínimo", icon: Smartphone, color: "text-blue-600 bg-blue-100", href: "/sayo-mx/productos" },
  { name: "Crédito Personal", description: "Desde 12% anual, aprobación en minutos", icon: TrendingUp, color: "text-green-600 bg-green-100", href: "/sayo-mx/productos" },
  { name: "Tarjeta SAYO", description: "Mastercard con cashback en todas tus compras", icon: CreditCard, color: "text-purple-600 bg-purple-100", href: "/sayo-mx/productos" },
  { name: "SAYO Empresas", description: "Soluciones financieras para tu negocio", icon: Users, color: "text-orange-600 bg-orange-100", href: "/sayo-mx/productos" },
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
  { name: "María G.", text: "La mejor fintech de México. Abrí mi cuenta en 5 minutos.", rating: 5, city: "CDMX" },
  { name: "Carlos R.", text: "El crédito fue aprobado en horas, increíble servicio.", rating: 5, city: "Monterrey" },
  { name: "Ana T.", text: "La app es super intuitiva y las transferencias son instantáneas.", rating: 4, city: "Guadalajara" },
]

export default function SayoMXHome() {
  const [contactOpen, setContactOpen] = React.useState(false)
  const [contactForm, setContactForm] = React.useState({ name: "", email: "", phone: "", message: "" })
  const [successOpen, setSuccessOpen] = React.useState(false)

  const handleOpenAccount = () => {
    setContactForm({ ...contactForm, message: "Me interesa abrir una cuenta SAYO" })
    setContactOpen(true)
  }

  const handleProductClick = (product: typeof products[0]) => {
    window.location.href = product.href
  }

  const handleSubmitContact = () => {
    if (!contactForm.name || !contactForm.email) {
      toast.error("Completa nombre y email")
      return
    }
    setContactOpen(false)
    setSuccessOpen(true)
    setContactForm({ name: "", email: "", phone: "", message: "" })
  }

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
  }

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
          <Button size="lg" className="bg-sayo-cafe hover:bg-sayo-cafe-light" onClick={handleOpenAccount}>
            Abrir Cuenta <ArrowRight className="size-4 ml-1" />
          </Button>
          <Button size="lg" variant="outline" onClick={scrollToProducts}>Conocer más</Button>
        </div>
        <p className="text-[10px] text-muted-foreground">+48,000 usuarios ya confían en SAYO</p>
      </div>

      {/* Products */}
      <div id="products">
        <h2 className="text-xl font-bold text-center mb-6">Nuestros Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const Icon = p.icon
            return (
              <Card key={p.name} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProductClick(p)}>
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
            <Card key={t.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-4 ${i < t.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground">&quot;{t.text}&quot;</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.city}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form Inline */}
      <Card className="border-sayo-maple">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-sayo-cafe">¿Tienes preguntas?</h2>
              <p className="text-sm text-muted-foreground">Déjanos tus datos y un asesor te contactará en menos de 24 horas.</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>📞 800-SAYO-MEX (800-7296-639)</p>
                <p>📧 contacto@sayo.mx</p>
                <p>💬 Chat en vivo en la app</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input placeholder="Tu nombre" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
              <Input placeholder="Teléfono (opcional)" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
              <Input placeholder="¿Cómo podemos ayudarte?" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
              <Button className="w-full bg-sayo-cafe hover:bg-sayo-cafe-light" onClick={handleSubmitContact}>
                <Send className="size-4 mr-1.5" /> Enviar Mensaje
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-3 py-8 border-t">
        <h2 className="text-lg font-bold">¿Listo para comenzar?</h2>
        <p className="text-sm text-muted-foreground">Únete a más de 48,000 usuarios que ya confían en SAYO</p>
        <Button size="lg" className="bg-sayo-cafe hover:bg-sayo-cafe-light" onClick={handleOpenAccount}>
          Abrir Mi Cuenta <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir Cuenta SAYO</DialogTitle>
            <DialogDescription>Déjanos tus datos para comenzar el proceso</DialogDescription>
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
              <label className="text-xs font-medium text-muted-foreground">Mensaje</label>
              <Input placeholder="¿Algo más que debamos saber?" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
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
            <DialogTitle>¡Mensaje Enviado!</DialogTitle>
            <DialogDescription>Hemos recibido tu solicitud</DialogDescription>
          </DialogHeader>
          <div className="text-center p-4">
            <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check className="size-8 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Un asesor SAYO te contactará en menos de 24 horas hábiles.</p>
            <p className="text-xs text-muted-foreground mt-2">También puedes descargar la app para abrir tu cuenta al instante.</p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
