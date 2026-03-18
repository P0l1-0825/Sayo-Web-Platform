"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Shield, Target, Heart, Award, Building, Scale, Linkedin, Mail, Calendar, Users, TrendingUp, Globe, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
  name: string
  role: string
  bio: string
  fullBio: string
  linkedin: string
  experience: string[]
}

const team: TeamMember[] = [
  {
    name: "Alejandro Torres",
    role: "CEO & Co-Founder",
    bio: "Ex-Banorte, 15 años en banca digital",
    fullBio: "Alejandro fundó SAYO con la visión de democratizar los servicios financieros en México. Con más de 15 años de experiencia en el sector bancario, lideró la transformación digital en Banorte antes de emprender.",
    linkedin: "linkedin.com/in/atorres",
    experience: ["Banorte (VP Digital)", "McKinsey & Company", "ITESM MBA"],
  },
  {
    name: "Gabriela Méndez",
    role: "CTO",
    bio: "Ex-Clip, experta en fintech e infraestructura",
    fullBio: "Gabriela lidera el equipo de tecnología de SAYO, diseñando la arquitectura que soporta miles de transacciones por segundo. Su experiencia en Clip la preparó para construir infraestructura financiera de clase mundial.",
    linkedin: "linkedin.com/in/gmendez",
    experience: ["Clip (Engineering Director)", "Amazon Web Services", "Stanford CS"],
  },
  {
    name: "Ricardo Vega",
    role: "CFO",
    bio: "Ex-KPMG, especialista en regulación financiera",
    fullBio: "Ricardo asegura que SAYO opera con los más altos estándares financieros y regulatorios. Su experiencia en KPMG y el sector público le da una perspectiva única sobre compliance en fintech.",
    linkedin: "linkedin.com/in/rvega",
    experience: ["KPMG (Senior Manager)", "Banco de México", "UNAM Economía"],
  },
  {
    name: "Laura Castillo",
    role: "COO",
    bio: "Ex-Nu, experiencia en operaciones a escala",
    fullBio: "Laura escala las operaciones de SAYO para atender a millones de usuarios. En Nu México, aprendió a manejar el crecimiento exponencial de una fintech y a construir equipos de alto rendimiento.",
    linkedin: "linkedin.com/in/lcastillo",
    experience: ["Nu México (Head of Ops)", "Uber (Operations)", "Tec de Monterrey"],
  },
  {
    name: "Fernando Ríos",
    role: "CPO",
    bio: "Ex-Rappi, diseño de producto centrado en usuario",
    fullBio: "Fernando diseña los productos de SAYO pensando siempre en la experiencia del usuario. En Rappi lideró equipos de producto que alcanzaron a millones de usuarios en toda Latinoamérica.",
    linkedin: "linkedin.com/in/frios",
    experience: ["Rappi (Product Director)", "Mercado Libre", "CENTRO Diseño"],
  },
  {
    name: "Diana Ruiz",
    role: "CISO",
    bio: "Ex-BBVA, ciberseguridad y cumplimiento",
    fullBio: "Diana protege a SAYO y a sus usuarios contra amenazas cibernéticas. Con amplia experiencia en BBVA y certificaciones internacionales, implementa los más altos estándares de seguridad en la industria.",
    linkedin: "linkedin.com/in/druiz",
    experience: ["BBVA (Cybersecurity Lead)", "Deloitte Cyber", "CISSP, CISM"],
  },
]

const values = [
  { icon: Target, name: "Misión", description: "Democratizar el acceso a servicios financieros de calidad en México, eliminando barreras y comisiones innecesarias." },
  { icon: Heart, name: "Visión", description: "Ser la plataforma financiera digital más confiable y accesible de Latinoamérica para 2030." },
  { icon: Award, name: "Valores", description: "Transparencia, inclusión, innovación, seguridad y excelencia en servicio." },
]

const regulations = [
  { icon: Building, name: "CNBV", description: "Regulada por la Comisión Nacional Bancaria y de Valores bajo la Ley Fintech.", link: "https://www.cnbv.gob.mx", detail: "Autorización IFPE-2023-XXX otorgada el 15 de marzo de 2023." },
  { icon: Shield, name: "IPAB", description: "Depósitos protegidos por el Instituto para la Protección al Ahorro Bancario hasta 25 UDIS.", link: "https://www.gob.mx/ipab", detail: "Cobertura de hasta ~$2,200,000 MXN por titular." },
  { icon: Scale, name: "CONDUSEF", description: "Adherida a la Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros.", link: "https://www.condusef.gob.mx", detail: "Registro RECA: SAYO-2023-XXXX. Línea: 55 5340 0999." },
]

const timeline = [
  { year: "2022", event: "Fundación de SAYO Financial Technologies", icon: Calendar },
  { year: "2023 Q1", event: "Autorización CNBV como IFPE", icon: Shield },
  { year: "2023 Q3", event: "Lanzamiento de Cuenta SAYO y App", icon: Globe },
  { year: "2024 Q1", event: "10,000 usuarios activos", icon: Users },
  { year: "2024 Q3", event: "Lanzamiento de Crédito Personal", icon: TrendingUp },
  { year: "2025 Q1", event: "48,000+ usuarios y $2,340M en activos", icon: Award },
]

export default function NosotrosPage() {
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null)
  const [memberOpen, setMemberOpen] = React.useState(false)
  const [regDetailOpen, setRegDetailOpen] = React.useState(false)
  const [selectedReg, setSelectedReg] = React.useState<typeof regulations[0] | null>(null)

  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member)
    setMemberOpen(true)
  }

  const handleViewRegulation = (reg: typeof regulations[0]) => {
    setSelectedReg(reg)
    setRegDetailOpen(true)
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("contacto@sayo.mx").then(() => {
      toast.success("Email copiado", { description: "contacto@sayo.mx" })
    }).catch(() => {
      toast.info("Email: contacto@sayo.mx")
    })
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <Badge className="bg-sayo-cafe text-white text-xs">Desde 2022</Badge>
        <h1 className="text-2xl font-bold">Sobre SAYO</h1>
        <p className="text-sm text-muted-foreground">Construyendo el futuro financiero de México</p>
      </div>

      {/* Mission / Vision / Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {values.map((v) => {
          const Icon = v.icon
          return (
            <Card key={v.name} className="bg-sayo-cream border-sayo-maple hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <Icon className="size-8 text-sayo-cafe mx-auto" />
                <h3 className="font-bold text-sayo-cafe">{v.name}</h3>
                <p className="text-xs text-sayo-cafe-light">{v.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-center mb-6">Nuestra Historia</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-sayo-maple" />
            <div className="space-y-6">
              {timeline.map((t, i) => {
                const Icon = t.icon
                return (
                  <div key={t.year} className="flex items-start gap-4 relative">
                    <div className="size-8 rounded-full bg-sayo-cafe flex items-center justify-center flex-shrink-0 z-10">
                      <Icon className="size-4 text-white" />
                    </div>
                    <div className="pt-1">
                      <p className="text-xs font-bold text-sayo-cafe">{t.year}</p>
                      <p className="text-sm text-muted-foreground">{t.event}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <div>
        <h2 className="text-xl font-bold text-center mb-6">Equipo Directivo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {team.map((t) => (
            <Card
              key={t.name}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => handleViewMember(t)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className="size-14 rounded-full bg-sayo-cafe flex items-center justify-center mx-auto text-white font-bold text-sm">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[10px] text-sayo-blue font-medium">{t.role}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.bio}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2">Ver perfil</Button>
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
              <Card
                key={r.name}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewRegulation(r)}
              >
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-sayo-cafe" />
                    <h3 className="text-sm font-bold">{r.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Más información <ArrowRight className="size-3 ml-1" /></Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Contact CTA */}
      <Card className="border-sayo-maple">
        <CardContent className="p-6 text-center space-y-3">
          <h2 className="text-lg font-bold text-sayo-cafe">¿Quieres saber más?</h2>
          <p className="text-sm text-muted-foreground">Contáctanos y resolveremos tus dudas</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopyEmail}>
              <Mail className="size-3.5 mr-1" /> contacto@sayo.mx
            </Button>
            <Button size="sm" className="bg-sayo-cafe hover:bg-sayo-cafe-light" onClick={() => window.location.href = "/sayo-mx"}>
              Ir a Inicio <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Detail Dialog */}
      <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMember?.name}</DialogTitle>
            <DialogDescription>{selectedMember?.role}</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-full bg-sayo-cafe flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {selectedMember.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-bold">{selectedMember.name}</p>
                  <Badge className="bg-sayo-cream text-sayo-cafe text-[10px]">{selectedMember.role}</Badge>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Biografía</p>
                <p className="text-sm text-muted-foreground">{selectedMember.fullBio}</p>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Experiencia</p>
                <div className="space-y-1.5">
                  {selectedMember.experience.map((exp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-sayo-cafe" />
                      <span className="text-xs">{exp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Linkedin className="size-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">{selectedMember.linkedin}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regulation Detail Dialog */}
      <Dialog open={regDetailOpen} onOpenChange={setRegDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedReg?.name}</DialogTitle>
            <DialogDescription>Información regulatoria</DialogDescription>
          </DialogHeader>
          {selectedReg && (
            <div className="space-y-4">
              {(() => {
                const Icon = selectedReg.icon
                return (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-sayo-cream">
                    <Icon className="size-6 text-sayo-cafe" />
                    <div>
                      <p className="text-sm font-bold text-sayo-cafe">{selectedReg.name}</p>
                      <p className="text-xs text-sayo-cafe-light">{selectedReg.description}</p>
                    </div>
                  </div>
                )
              })()}

              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Detalle</p>
                <p className="text-sm">{selectedReg.detail}</p>
              </div>

              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Sitio oficial</p>
                <p className="text-xs text-sayo-blue font-medium">{selectedReg.link}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
