"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Wallet, CreditCard, ArrowRight, CheckCircle, Clock, Banknote, Shield } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface ProductoPersona { nombre: string; descripcion: string; beneficios: string[]; montoMax: string; tasaDesde: string; tiempo: string }

const productos: ProductoPersona[] = [
  { nombre: "Adelanto de Nómina", descripcion: "Recibe tu salario antes del día de pago sin intereses ocultos", beneficios: ["Sin consulta a Buró", "Depósito en 10 minutos", "Descuento automático en nómina", "Sin comisión por apertura", "App móvil 24/7"], montoMax: "Hasta 50% de tu nómina", tasaDesde: "0% los primeros 3 adelantos", tiempo: "10 minutos" },
  { nombre: "Tarjeta Personal Sayo", descripcion: "Tu tarjeta digital con cashback en todas tus compras", beneficios: ["2% cashback en todas las compras", "Sin anualidad el primer año", "Controles desde la app", "Compras internacionales", "Seguro de compras protegidas"], montoMax: "Hasta $80,000 MXN", tasaDesde: "28% anual", tiempo: "Aprobación en 5 minutos" },
]

export default function PersonasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Productos para Personas</h1>
        <p className="text-sm text-muted-foreground">Adelanto de nómina y tarjeta personal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><User className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">2</p><p className="text-xs text-muted-foreground">Productos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Banknote className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">0%</p><p className="text-xs text-muted-foreground">Primer Adelanto</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">5 min</p><p className="text-xs text-muted-foreground">Aprobación</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold">100%</p><p className="text-xs text-muted-foreground">Seguro</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {productos.map((p) => (
          <Card key={p.nombre} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                {p.nombre.includes("Nómina") ? <Wallet className="size-6 text-sayo-green" /> : <CreditCard className="size-6 text-purple-500" />}
                <h3 className="text-lg font-bold">{p.nombre}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{p.descripcion}</p>
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="p-3 rounded-lg bg-muted/50 text-center"><p className="text-muted-foreground">Monto</p><p className="font-semibold mt-1">{p.montoMax}</p></div>
                <div className="p-3 rounded-lg bg-muted/50 text-center"><p className="text-muted-foreground">Tasa</p><p className="font-semibold mt-1 text-sayo-green">{p.tasaDesde}</p></div>
                <div className="p-3 rounded-lg bg-muted/50 text-center"><p className="text-muted-foreground">Tiempo</p><p className="font-semibold mt-1">{p.tiempo}</p></div>
              </div>
              <ul className="space-y-1.5 mb-4">{p.beneficios.map((b, i) => (<li key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="size-3.5 text-sayo-green flex-shrink-0" />{b}</li>))}</ul>
              <Button className="w-full">Solicitar Ahora <ArrowRight className="size-3.5 ml-1" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
