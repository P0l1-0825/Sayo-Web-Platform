"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, CreditCard, TrendingUp, FileText, ArrowRight, CheckCircle, Clock, DollarSign } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Producto { nombre: string; descripcion: string; montoMin: number; montoMax: number; plazoMax: string; tasaDesde: number; requisitos: string[]; icono: React.ReactNode }

const productos: Producto[] = [
  { nombre: "Crédito Simple PyME", descripcion: "Capital de trabajo para tu negocio con tasa competitiva", montoMin: 100000, montoMax: 5000000, plazoMax: "36 meses", tasaDesde: 18, requisitos: ["2+ años de operación", "Facturación > $3M anuales", "Score Buró > 650", "Opinión de cumplimiento SAT"], icono: <DollarSign className="size-6 text-sayo-green" /> },
  { nombre: "Línea Revolvente", descripcion: "Crédito flexible que se renueva con cada pago", montoMin: 50000, montoMax: 3000000, plazoMax: "12 meses", tasaDesde: 22, requisitos: ["1+ año de operación", "Facturación > $1M anuales", "Score Buró > 630", "Estados financieros"], icono: <TrendingUp className="size-6 text-blue-500" /> },
  { nombre: "Tarjeta Empresarial", descripcion: "Controla gastos de tu empresa con tarjetas para empleados", montoMin: 25000, montoMax: 500000, plazoMax: "Revolvente", tasaDesde: 24, requisitos: ["Crédito activo con Sayo", "1+ empleado registrado"], icono: <CreditCard className="size-6 text-purple-500" /> },
  { nombre: "Factoraje", descripcion: "Anticipa tus cuentas por cobrar y mejora tu flujo", montoMin: 50000, montoMax: 10000000, plazoMax: "90 días", tasaDesde: 1.5, requisitos: ["Facturas vigentes a grandes empresas", "Facturación > $5M anuales", "Relación comercial comprobable"], icono: <FileText className="size-6 text-sayo-orange" /> },
]

export default function EmpresasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Productos para Empresas</h1>
        <p className="text-sm text-muted-foreground">Soluciones financieras para PyMEs mexicanas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Building2 className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{productos.length}</p><p className="text-xs text-muted-foreground">Productos Disponibles</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">Desde 18%</p><p className="text-xs text-muted-foreground">Tasa Anual</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">48h</p><p className="text-xs text-muted-foreground">Aprobación</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold">100%</p><p className="text-xs text-muted-foreground">Digital</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {productos.map((p) => (
          <Card key={p.nombre}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                {p.icono}
                <div>
                  <h3 className="text-sm font-semibold">{p.nombre}</h3>
                  <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="p-2 rounded bg-muted/50"><p className="text-muted-foreground">Monto</p><p className="font-semibold">{fmt(p.montoMin)} — {fmt(p.montoMax)}</p></div>
                <div className="p-2 rounded bg-muted/50"><p className="text-muted-foreground">Plazo</p><p className="font-semibold">Hasta {p.plazoMax}</p></div>
                <div className="p-2 rounded bg-muted/50 col-span-2"><p className="text-muted-foreground">Tasa desde</p><p className="font-semibold text-sayo-green">{p.tasaDesde}% anual</p></div>
              </div>
              <div className="mb-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Requisitos</p>
                <ul className="space-y-0.5">{p.requisitos.map((r, i) => (<li key={i} className="flex items-center gap-1 text-xs"><CheckCircle className="size-3 text-sayo-green" />{r}</li>))}</ul>
              </div>
              <Button size="sm" className="w-full">Solicitar <ArrowRight className="size-3.5 ml-1" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
