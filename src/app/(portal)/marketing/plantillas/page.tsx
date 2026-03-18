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
import { FileText, Copy, Eye, Plus, Search, Bell, Mail, MessageSquare, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface Template {
  id: string
  name: string
  event: string
  channel: string
  content: string
  lastUsed: string
  usageCount: number
}

const initialTemplates: Template[] = [
  { id: "TPL-001", name: "Bienvenida", event: "Registro exitoso", channel: "email", content: "¡Hola {{nombre}}! Bienvenido/a a SAYO. Tu cuenta está lista. Tu CLABE es {{clabe}}. Descarga la app para empezar.", lastUsed: "2024-03-06", usageCount: 12450 },
  { id: "TPL-002", name: "Pago Recibido", event: "Pago crédito aplicado", channel: "push", content: "Tu pago de {{monto}} ha sido aplicado a tu crédito {{credito_id}}. Saldo pendiente: {{saldo}}.", lastUsed: "2024-03-06", usageCount: 8920 },
  { id: "TPL-003", name: "Recordatorio Pago", event: "3 días antes de vencimiento", channel: "sms", content: "SAYO: Tu pago de {{monto}} vence el {{fecha}}. Paga desde la app para evitar cargos.", lastUsed: "2024-03-05", usageCount: 15630 },
  { id: "TPL-004", name: "Transferencia Exitosa", event: "SPEI procesado", channel: "push", content: "Transferencia de {{monto}} enviada a {{beneficiario}} exitosamente. Ref: {{referencia}}.", lastUsed: "2024-03-06", usageCount: 45200 },
  { id: "TPL-005", name: "Alerta de Seguridad", event: "Login desde nuevo dispositivo", channel: "email", content: "Detectamos un inicio de sesión desde {{dispositivo}} en {{ubicacion}}. Si no fuiste tú, bloquea tu cuenta inmediatamente.", lastUsed: "2024-03-04", usageCount: 2340 },
  { id: "TPL-006", name: "Crédito Pre-aprobado", event: "Score > 700 y antigüedad > 6m", channel: "in_app", content: "¡{{nombre}}, tienes un crédito pre-aprobado de hasta {{monto_max}}! Tasa desde {{tasa}}%. Solicítalo ahora.", lastUsed: "2024-03-01", usageCount: 5670 },
  { id: "TPL-007", name: "Cuenta Inactiva", event: "Sin actividad 30 días", channel: "email", content: "¡Te extrañamos, {{nombre}}! Tu cuenta SAYO sigue activa. Ingresa y descubre las novedades.", lastUsed: "2024-02-28", usageCount: 1890 },
  { id: "TPL-008", name: "Vencimiento Próximo", event: "Día de vencimiento", channel: "push", content: "Hoy es tu fecha de pago. Monto: {{monto}}. Paga ahora desde la app para mantener tu historial limpio.", lastUsed: "2024-03-06", usageCount: 22100 },
]

const channelColor: Record<string, string> = {
  email: "bg-blue-100 text-blue-700",
  push: "bg-purple-100 text-purple-700",
  sms: "bg-green-100 text-green-700",
  in_app: "bg-orange-100 text-orange-700",
}

const channelIcons: Record<string, typeof Bell> = {
  push: Bell,
  email: Mail,
  sms: MessageSquare,
  in_app: Smartphone,
}

const channelOptions = ["email", "push", "sms", "in_app"]

export default function PlantillasPage() {
  const [templates, setTemplates] = React.useState<Template[]>(initialTemplates)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [newForm, setNewForm] = React.useState({
    name: "",
    event: "",
    channel: "push",
    content: "",
  })

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = searchTerm === "" ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.event.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChannel = !channelFilter || t.channel === channelFilter
    return matchesSearch && matchesChannel
  })

  const handleView = (template: Template) => {
    setSelectedTemplate(template)
    setDetailOpen(true)
  }

  const handleDuplicate = (template: Template) => {
    const dup: Template = {
      ...template,
      id: `TPL-${String(templates.length + 1).padStart(3, "0")}`,
      name: `${template.name} (Copia)`,
      usageCount: 0,
    }
    setTemplates([dup, ...templates])
    toast.success("Plantilla duplicada", { description: `${dup.id} — ${dup.name}` })
  }

  const handleNewTemplate = () => {
    if (!newForm.name || !newForm.content) {
      toast.error("Completa nombre y contenido")
      return
    }
    const newTpl: Template = {
      id: `TPL-${String(templates.length + 1).padStart(3, "0")}`,
      name: newForm.name,
      event: newForm.event || "Manual",
      channel: newForm.channel,
      content: newForm.content,
      lastUsed: "—",
      usageCount: 0,
    }
    setTemplates([newTpl, ...templates])
    setNewOpen(false)
    setNewForm({ name: "", event: "", channel: "push", content: "" })
    toast.success("Plantilla creada", { description: `${newTpl.id} — ${newTpl.name}` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Plantillas de Notificación</h1>
          <p className="text-sm text-muted-foreground">Templates por evento — bienvenida, pago, vencimiento, seguridad</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Nueva Plantilla
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {channelOptions.map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(channelFilter === ch ? null : ch)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-1 ${
                channelFilter === ch ? channelColor[ch] : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {React.createElement(channelIcons[ch] || Bell, { className: "size-3" })}
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((t) => (
          <Card key={t.id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleView(t)}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${channelColor[t.channel]}`}>{t.channel}</span>
              </div>
              <p className="text-xs text-muted-foreground">Evento: {t.event}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.usageCount.toLocaleString()} usos</span>
                <span>Última: {t.lastUsed}</span>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleView(t)}>
                  <Eye className="size-3 mr-1" /> Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleDuplicate(t)}>
                  <Copy className="size-3 mr-1" /> Duplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <FileText className="size-8 mx-auto mb-2" />
            <p className="text-sm">No se encontraron plantillas</p>
          </div>
        )}
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Plantilla</DialogTitle>
            <DialogDescription>{selectedTemplate?.id} — {selectedTemplate?.name}</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {React.createElement(channelIcons[selectedTemplate.channel] || Bell, { className: "size-4 text-muted-foreground" })}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${channelColor[selectedTemplate.channel]}`}>
                    {selectedTemplate.channel}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{selectedTemplate.usageCount.toLocaleString()} usos</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Evento Trigger</p>
                  <p className="font-medium">{selectedTemplate.event}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Último Uso</p>
                  <p>{selectedTemplate.lastUsed}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Contenido de la Plantilla</p>
                <p className="text-sm leading-relaxed whitespace-pre-line">{selectedTemplate.content}</p>
              </div>

              <div className="p-3 rounded-lg border bg-blue-50">
                <p className="text-[10px] text-blue-600 uppercase mb-1">Variables Disponibles</p>
                <div className="flex gap-1 flex-wrap">
                  {(selectedTemplate.content.match(/\{\{[^}]+\}\}/g) || []).map((v, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-mono">{v}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => selectedTemplate && handleDuplicate(selectedTemplate)}>
              <Copy className="size-3.5 mr-1" /> Duplicar
            </Button>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Plantilla</DialogTitle>
            <DialogDescription>Crear plantilla de notificación</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
              <Input placeholder="Ej: Recordatorio Mensual" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Evento Trigger</label>
              <Input placeholder="Ej: 5 días antes de vencimiento" value={newForm.event} onChange={(e) => setNewForm({ ...newForm, event: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Canal</label>
              <div className="flex gap-2 mt-1">
                {channelOptions.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setNewForm({ ...newForm, channel: ch })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-1 ${
                      newForm.channel === ch ? channelColor[ch] : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {React.createElement(channelIcons[ch] || Bell, { className: "size-3" })}
                    {ch}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contenido * <span className="text-[10px] text-muted-foreground font-normal">(Usa {`{{variable}}`} para datos dinámicos)</span></label>
              <Input placeholder="Ej: Hola {{nombre}}, tu pago de {{monto}} fue recibido." value={newForm.content} onChange={(e) => setNewForm({ ...newForm, content: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewTemplate}>
              <Plus className="size-3.5 mr-1" /> Crear Plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
