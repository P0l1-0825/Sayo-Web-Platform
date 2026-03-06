"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, ExternalLink, Scale, Shield, ScrollText, BookOpen } from "lucide-react"

const legalDocs = [
  {
    icon: Shield,
    title: "Aviso de Privacidad",
    description: "Cómo recopilamos, usamos y protegemos tu información personal conforme a la Ley Federal de Protección de Datos Personales.",
    lastUpdated: "2024-01-15",
    type: "PDF",
  },
  {
    icon: ScrollText,
    title: "Términos y Condiciones",
    description: "Condiciones generales para el uso de los servicios de SAYO, incluyendo cuenta, tarjeta y créditos.",
    lastUpdated: "2024-02-01",
    type: "PDF",
  },
  {
    icon: FileText,
    title: "Contrato de Adhesión",
    description: "Contrato registrado ante CONDUSEF para la prestación de servicios financieros de SAYO.",
    lastUpdated: "2024-01-01",
    type: "PDF",
  },
  {
    icon: Scale,
    title: "CONDUSEF",
    description: "Información sobre tus derechos como usuario de servicios financieros y cómo presentar una queja.",
    lastUpdated: "2024-03-01",
    type: "Link",
  },
  {
    icon: BookOpen,
    title: "Comisiones y Tarifas",
    description: "Tabla completa de comisiones, tarifas y tasas de interés aplicables a todos nuestros productos.",
    lastUpdated: "2024-03-01",
    type: "PDF",
  },
]

const contactInfo = [
  { label: "UNE (Unidad Especializada)", value: "une@sayo.mx • 800-SAYO-UNE" },
  { label: "CONDUSEF", value: "www.condusef.gob.mx • 55 5340 0999" },
  { label: "CNBV", value: "www.cnbv.gob.mx • Autorización IFPE-2023-XXX" },
]

export default function LegalPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Legal y Regulación</h1>
        <p className="text-sm text-muted-foreground">Documentos legales, regulación y derechos del usuario</p>
      </div>

      {/* Legal Documents */}
      <div className="space-y-3">
        {legalDocs.map((doc) => {
          const Icon = doc.icon
          return (
            <Card key={doc.title}>
              <CardContent className="p-5 flex items-start gap-4">
                <Icon className="size-6 text-sayo-cafe mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                  <p className="text-[10px] text-muted-foreground">Última actualización: {doc.lastUpdated}</p>
                </div>
                {doc.type === "PDF" ? (
                  <Button variant="outline" size="sm"><Download className="size-3.5 mr-1" /> PDF</Button>
                ) : (
                  <Button variant="outline" size="sm"><ExternalLink className="size-3.5 mr-1" /> Ir</Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Contact Info */}
      <Card className="bg-sayo-cream border-sayo-maple">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-sayo-cafe">Contacto Regulatorio</h2>
          {contactInfo.map((c) => (
            <div key={c.label}>
              <p className="text-xs font-semibold text-sayo-cafe">{c.label}</p>
              <p className="text-xs text-sayo-cafe-light">{c.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-center text-[10px] text-muted-foreground space-y-1 py-4 border-t">
        <p>SAYO es una Institución de Fondos de Pago Electrónico (IFPE) regulada por la CNBV.</p>
        <p>Los depósitos están protegidos por el IPAB hasta por el equivalente a 25,000 UDIS.</p>
        <p>© 2024 SAYO Financial Technologies S.A.P.I. de C.V. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}
