"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Target, Heart, Award, Building, Scale } from "lucide-react"

const team = [
  { name: "Alejandro Torres", role: "CEO & Co-Founder", bio: "Ex-Banorte, 15 años en banca digital" },
  { name: "Gabriela Méndez", role: "CTO", bio: "Ex-Clip, experta en fintech e infraestructura" },
  { name: "Ricardo Vega", role: "CFO", bio: "Ex-KPMG, especialista en regulación financiera" },
  { name: "Laura Castillo", role: "COO", bio: "Ex-Nu, experiencia en operaciones a escala" },
  { name: "Fernando Ríos", role: "CPO", bio: "Ex-Rappi, diseño de producto centrado en usuario" },
  { name: "Diana Ruiz", role: "CISO", bio: "Ex-BBVA, ciberseguridad y cumplimiento" },
]

const values = [
  { icon: Target, name: "Misión", description: "Democratizar el acceso a servicios financieros de calidad en México, eliminando barreras y comisiones innecesarias." },
  { icon: Heart, name: "Visión", description: "Ser la plataforma financiera digital más confiable y accesible de Latinoamérica para 2030." },
  { icon: Award, name: "Valores", description: "Transparencia, inclusión, innovación, seguridad y excelencia en servicio." },
]

const regulations = [
  { icon: Building, name: "CNBV", description: "Regulada por la Comisión Nacional Bancaria y de Valores bajo la Ley Fintech." },
  { icon: Shield, name: "IPAB", description: "Depósitos protegidos por el Instituto para la Protección al Ahorro Bancario hasta 25 UDIS." },
  { icon: Scale, name: "CONDUSEF", description: "Adherida a la Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros." },
]

export default function NosotrosPage() {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sobre SAYO</h1>
        <p className="text-sm text-muted-foreground">Construyendo el futuro financiero de México</p>
      </div>

      {/* Mission / Vision / Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {values.map((v) => {
          const Icon = v.icon
          return (
            <Card key={v.name} className="bg-sayo-cream border-sayo-maple">
              <CardContent className="p-6 text-center space-y-3">
                <Icon className="size-8 text-sayo-cafe mx-auto" />
                <h3 className="font-bold text-sayo-cafe">{v.name}</h3>
                <p className="text-xs text-sayo-cafe-light">{v.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Team */}
      <div>
        <h2 className="text-xl font-bold text-center mb-6">Equipo Directivo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {team.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-4 text-center space-y-2">
                <div className="size-14 rounded-full bg-sayo-cafe flex items-center justify-center mx-auto text-white font-bold">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[10px] text-sayo-blue font-medium">{t.role}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.bio}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <div className="bg-gradient-to-r from-sayo-cafe to-sayo-cafe-light rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold text-center mb-6">SAYO en Números</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">48,500+</p>
            <p className="text-xs text-white/70">Usuarios activos</p>
          </div>
          <div>
            <p className="text-3xl font-bold">$2,340M</p>
            <p className="text-xs text-white/70">Activos bajo gestión</p>
          </div>
          <div>
            <p className="text-3xl font-bold">99.97%</p>
            <p className="text-xs text-white/70">Uptime plataforma</p>
          </div>
          <div>
            <p className="text-3xl font-bold">NPS 72</p>
            <p className="text-xs text-white/70">Satisfacción</p>
          </div>
        </div>
      </div>

      {/* Regulation */}
      <div>
        <h2 className="text-xl font-bold text-center mb-6">Regulación y Seguridad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {regulations.map((r) => {
            const Icon = r.icon
            return (
              <Card key={r.name}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-sayo-cafe" />
                    <h3 className="text-sm font-bold">{r.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
