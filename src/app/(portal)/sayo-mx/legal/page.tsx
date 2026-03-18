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
import { FileText, Download, ExternalLink, Scale, Shield, ScrollText, BookOpen, Search, Eye, Copy, Check, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

interface LegalDoc {
  icon: typeof FileText
  title: string
  description: string
  lastUpdated: string
  type: "PDF" | "Link"
  size?: string
  content: string[]
  link?: string
}

const legalDocs: LegalDoc[] = [
  {
    icon: Shield,
    title: "Aviso de Privacidad",
    description: "Cómo recopilamos, usamos y protegemos tu información personal conforme a la Ley Federal de Protección de Datos Personales.",
    lastUpdated: "2024-01-15",
    type: "PDF",
    size: "245 KB",
    content: [
      "SAYO Financial Technologies S.A.P.I. de C.V. (en adelante 'SAYO') es responsable del tratamiento de tus datos personales.",
      "Datos recabados: nombre, domicilio, RFC, CURP, datos biométricos, datos financieros.",
      "Finalidades: prestación de servicios financieros, verificación de identidad, prevención de lavado de dinero, cumplimiento regulatorio.",
      "Transferencias: CNBV, CONDUSEF, SAT, sociedades de información crediticia.",
      "Derechos ARCO: acceso, rectificación, cancelación y oposición en privacidad@sayo.mx.",
      "Medidas de seguridad: cifrado AES-256, TLS 1.3, control de accesos, auditorías periódicas.",
    ],
  },
  {
    icon: ScrollText,
    title: "Términos y Condiciones",
    description: "Condiciones generales para el uso de los servicios de SAYO, incluyendo cuenta, tarjeta y créditos.",
    lastUpdated: "2024-02-01",
    type: "PDF",
    size: "380 KB",
    content: [
      "El usuario acepta que SAYO es una Institución de Fondos de Pago Electrónico regulada por la CNBV.",
      "Requisitos de apertura: ser mayor de 18 años, contar con identificación oficial vigente y CURP.",
      "Límites operativos: conforme a los niveles de cuenta establecidos por la regulación vigente.",
      "SAYO podrá suspender o cancelar la cuenta en caso de uso irregular o sospecha de actividades ilícitas.",
      "Las transferencias SPEI están sujetas a los horarios y reglas del Banco de México.",
      "Comisiones y tarifas: consultar el documento de Comisiones y Tarifas disponible en esta misma sección.",
    ],
  },
  {
    icon: FileText,
    title: "Contrato de Adhesión",
    description: "Contrato registrado ante CONDUSEF para la prestación de servicios financieros de SAYO.",
    lastUpdated: "2024-01-01",
    type: "PDF",
    size: "520 KB",
    content: [
      "Contrato de adhesión RECA: SAYO-2023-XXXX registrado ante CONDUSEF.",
      "Objeto: apertura y operación de cuenta de fondos de pago electrónico.",
      "Obligaciones de SAYO: mantener la plataforma operativa, proteger fondos, informar al usuario.",
      "Obligaciones del usuario: proporcionar información veraz, mantener actualizada su identificación.",
      "Vigencia: indefinida. El usuario puede cancelar en cualquier momento sin penalización.",
      "Resolución de controversias: ante CONDUSEF o tribunales competentes de la CDMX.",
    ],
  },
  {
    icon: Scale,
    title: "CONDUSEF",
    description: "Información sobre tus derechos como usuario de servicios financieros y cómo presentar una queja.",
    lastUpdated: "2024-03-01",
    type: "Link",
    link: "https://www.condusef.gob.mx",
    content: [
      "CONDUSEF: Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros.",
      "Teléfono: 55 5340 0999 | Lada sin costo: 800 999 8080",
      "Sitio web: www.condusef.gob.mx",
      "Puedes presentar quejas o reclamaciones en línea a través del portal de CONDUSEF.",
      "UNE SAYO: une@sayo.mx | Teléfono: 800-SAYO-UNE (800-7296-863)",
      "Plazo de respuesta: 30 días hábiles para quejas, 45 para reclamaciones.",
    ],
  },
  {
    icon: BookOpen,
    title: "Comisiones y Tarifas",
    description: "Tabla completa de comisiones, tarifas y tasas de interés aplicables a todos nuestros productos.",
    lastUpdated: "2024-03-01",
    type: "PDF",
    size: "156 KB",
    content: [
      "Apertura de cuenta: $0 MXN",
      "Mantenimiento mensual: $0 MXN",
      "Transferencia SPEI (salida): $0 MXN",
      "Transferencia SPEI (entrada): $0 MXN",
      "Consulta de saldo en app: $0 MXN",
      "Tarjeta virtual: $0 MXN | Tarjeta física: $149 MXN (envío incluido)",
      "Reposición de tarjeta: $99 MXN",
      "Crédito personal: Sin comisión por apertura. Tasa desde 12% anual. CAT desde 14.5% sin IVA.",
    ],
  },
]

const contactInfo = [
  { label: "UNE (Unidad Especializada)", value: "une@sayo.mx • 800-SAYO-UNE (800-7296-863)", email: "une@sayo.mx" },
  { label: "CONDUSEF", value: "www.condusef.gob.mx • 55 5340 0999 • 800 999 8080", link: "https://www.condusef.gob.mx" },
  { label: "CNBV", value: "www.cnbv.gob.mx • Autorización IFPE-2023-XXX", link: "https://www.cnbv.gob.mx" },
]

const faqs = [
  { q: "¿SAYO es un banco?", a: "SAYO es una Institución de Fondos de Pago Electrónico (IFPE) regulada por la CNBV bajo la Ley Fintech. No es un banco tradicional, pero tus fondos están protegidos por el IPAB." },
  { q: "¿Mis depósitos están seguros?", a: "Sí. Los depósitos en SAYO están protegidos por el Instituto para la Protección al Ahorro Bancario (IPAB) hasta por el equivalente a 25,000 UDIS (aproximadamente $2,200,000 MXN)." },
  { q: "¿Cómo presento una queja?", a: "Puedes comunicarte con nuestra Unidad Especializada (UNE) en une@sayo.mx o al 800-SAYO-UNE. Si no estás satisfecho con la respuesta, puedes acudir a CONDUSEF." },
  { q: "¿Qué pasa si olvido mi contraseña?", a: "Puedes recuperar tu acceso desde la app mediante verificación biométrica (Face ID / huella) o solicitando un código de recuperación a tu email registrado." },
  { q: "¿Puedo cancelar mi cuenta en cualquier momento?", a: "Sí. Puedes solicitar la cancelación de tu cuenta sin costo ni penalización. Tu saldo será transferido a la cuenta que indiques." },
]

export default function LegalPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [selectedDoc, setSelectedDoc] = React.useState<LegalDoc | null>(null)
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null)
  const [copiedEmail, setCopiedEmail] = React.useState(false)

  const filteredDocs = legalDocs.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePreview = (doc: LegalDoc) => {
    setSelectedDoc(doc)
    setPreviewOpen(true)
  }

  const handleDownload = (doc: LegalDoc) => {
    // Simulate PDF download
    const content = [
      `SAYO Financial Technologies S.A.P.I. de C.V.`,
      `Documento: ${doc.title}`,
      `Última actualización: ${doc.lastUpdated}`,
      ``,
      ...doc.content,
      ``,
      `--- Fin del documento ---`,
      `Generado desde sayo.mx`,
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `SAYO_${doc.title.replace(/\s+/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Documento descargado", { description: doc.title })
  }

  const handleExternalLink = (doc: LegalDoc) => {
    toast.info("Enlace externo", { description: `Redirigiendo a ${doc.link || "sitio oficial"}` })
  }

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedEmail(true)
      toast.success("Email copiado", { description: email })
      setTimeout(() => setCopiedEmail(false), 2000)
    }).catch(() => {
      toast.info(`Email: ${email}`)
    })
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Legal y Regulación</h1>
        <p className="text-sm text-muted-foreground">Documentos legales, regulación y derechos del usuario</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Legal Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Documentos Legales</h2>
          <Badge variant="outline" className="text-[10px]">{filteredDocs.length} documentos</Badge>
        </div>
        {filteredDocs.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No se encontraron documentos que coincidan con &quot;{searchTerm}&quot;
            </CardContent>
          </Card>
        )}
        {filteredDocs.map((doc) => {
          const Icon = doc.icon
          return (
            <Card key={doc.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="size-10 rounded-lg bg-sayo-cream flex items-center justify-center flex-shrink-0">
                  <Icon className="size-5 text-sayo-cafe" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold">{doc.title}</h3>
                    <Badge variant="outline" className="text-[10px]">{doc.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Actualizado: {new Date(doc.lastUpdated).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</span>
                    {doc.size && <span>• {doc.size}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => handlePreview(doc)} title="Vista previa">
                    <Eye className="size-4" />
                  </Button>
                  {doc.type === "PDF" ? (
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="size-3.5 mr-1" /> Descargar
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleExternalLink(doc)}>
                      <ExternalLink className="size-3.5 mr-1" /> Ir al sitio
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-bold text-center mb-4 flex items-center justify-center gap-2">
          <HelpCircle className="size-5 text-sayo-cafe" />
          Preguntas Frecuentes
        </h2>
        <div className="space-y-2 max-w-2xl mx-auto">
          {faqs.map((faq, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => toggleFaq(i)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{faq.q}</p>
                  {expandedFaq === i ? (
                    <ChevronUp className="size-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {expandedFaq === i && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">{faq.a}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <Card className="bg-sayo-cream border-sayo-maple">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-sayo-cafe">Contacto Regulatorio</h2>
          {contactInfo.map((c) => (
            <div key={c.label} className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-sayo-cafe">{c.label}</p>
                <p className="text-xs text-sayo-cafe-light">{c.value}</p>
              </div>
              {c.email && (
                <Button variant="ghost" size="icon-xs" onClick={() => handleCopyEmail(c.email!)} title="Copiar email">
                  {copiedEmail ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                </Button>
              )}
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

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.title}</DialogTitle>
            <DialogDescription>Vista previa del documento</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-sayo-cream">
                {(() => {
                  const Icon = selectedDoc.icon
                  return (
                    <div className="flex items-center gap-2">
                      <Icon className="size-5 text-sayo-cafe" />
                      <div>
                        <p className="text-sm font-semibold text-sayo-cafe">{selectedDoc.title}</p>
                        <p className="text-[10px] text-sayo-cafe-light">
                          Actualizado: {new Date(selectedDoc.lastUpdated).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                          {selectedDoc.size && ` • ${selectedDoc.size}`}
                        </p>
                      </div>
                    </div>
                  )
                })()}
                <Badge variant="outline" className="text-[10px]">{selectedDoc.type}</Badge>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-3 p-4 rounded-lg border bg-white">
                <p className="text-xs font-bold text-center text-sayo-cafe mb-3">
                  SAYO Financial Technologies S.A.P.I. de C.V.
                </p>
                {selectedDoc.content.map((paragraph, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                    {i + 1}. {paragraph}
                  </p>
                ))}
                <p className="text-[10px] text-muted-foreground text-center mt-4 pt-3 border-t">
                  Este es un resumen del documento. Para el documento completo, descargue el archivo.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedDoc) {
                  const text = selectedDoc.content.join("\n")
                  navigator.clipboard.writeText(text).then(() => toast.success("Contenido copiado")).catch(() => toast.info("No se pudo copiar"))
                }
              }}
            >
              <Copy className="size-3.5 mr-1" /> Copiar
            </Button>
            {selectedDoc?.type === "PDF" && (
              <Button size="sm" onClick={() => { if (selectedDoc) handleDownload(selectedDoc) }}>
                <Download className="size-3.5 mr-1" /> Descargar
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
