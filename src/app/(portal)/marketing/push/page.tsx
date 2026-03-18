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
import { Send, Bell, Mail, MessageSquare, Smartphone, Eye, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  channel: string
  audience: number
  segment: string
  sentAt: string
  status: "enviada" | "programada" | "borrador"
}

const initialNotifications: Notification[] = [
  { id: "NOT-001", title: "Pago recibido", message: "Tu pago de $2,500 MXN ha sido aplicado exitosamente a tu crédito.", channel: "push", audience: 1200, segment: "Con crédito", sentAt: "2024-03-06T10:00:00", status: "enviada" },
  { id: "NOT-002", title: "Recordatorio pago crédito", message: "Tu fecha de pago se acerca. Evita cargos moratorios pagando antes del día 15.", channel: "sms", audience: 3400, segment: "Con crédito", sentAt: "2024-03-06T08:00:00", status: "enviada" },
  { id: "NOT-003", title: "Nueva funcionalidad QR", message: "¡Ahora puedes cobrar con QR! Genera tu código desde la app SAYO.", channel: "in_app", audience: 45000, segment: "Todos", sentAt: "2024-03-05T14:00:00", status: "enviada" },
  { id: "NOT-004", title: "Campaña Crédito Express", message: "Crédito pre-aprobado de hasta $50,000. Solicítalo desde tu app SAYO.", channel: "email", audience: 12000, segment: "Activos 30d", sentAt: "2024-03-04T09:00:00", status: "enviada" },
]

const channelIcons: Record<string, typeof Bell> = {
  push: Bell,
  email: Mail,
  sms: MessageSquare,
  in_app: Smartphone,
}

const channelOptions = ["push", "email", "sms", "in_app"]
const segmentOptions = ["Todos", "Activos 30d", "Con crédito", "Sin actividad", "Score > 700", "Nuevos usuarios"]
const scheduleOptions = ["Ahora", "Programar"]

export default function PushPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications)
  const [selectedNotif, setSelectedNotif] = React.useState<Notification | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    title: "",
    message: "",
    channel: "push",
    segment: "Todos",
    schedule: "Ahora",
  })

  const handleView = (notif: Notification) => {
    setSelectedNotif(notif)
    setDetailOpen(true)
  }

  const handleSendPreview = () => {
    if (!form.title || !form.message) {
      toast.error("Completa título y mensaje")
      return
    }
    setConfirmOpen(true)
  }

  const confirmSend = () => {
    const estimatedAudience = form.segment === "Todos" ? 45000 : form.segment === "Activos 30d" ? 12000 : form.segment === "Con crédito" ? 8500 : form.segment === "Sin actividad" ? 3200 : form.segment === "Score > 700" ? 5600 : 2000
    const newNotif: Notification = {
      id: `NOT-${String(notifications.length + 1).padStart(3, "0")}`,
      title: form.title,
      message: form.message,
      channel: form.channel,
      audience: estimatedAudience,
      segment: form.segment,
      sentAt: new Date().toISOString(),
      status: form.schedule === "Ahora" ? "enviada" : "programada",
    }
    setNotifications([newNotif, ...notifications])
    setConfirmOpen(false)
    setForm({ title: "", message: "", channel: "push", segment: "Todos", schedule: "Ahora" })
    toast.success(form.schedule === "Ahora" ? "Notificación enviada" : "Notificación programada", {
      description: `${newNotif.id} — ${estimatedAudience.toLocaleString()} destinatarios vía ${form.channel}`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Envío de Notificaciones</h1>
        <p className="text-sm text-muted-foreground">Enviar push, email, SMS e in-app a segmentos de usuarios</p>
      </div>

      {/* Send Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold">Nueva Notificación</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Título *</label>
              <Input placeholder="Título de la notificación..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Canal</label>
              <div className="flex gap-2">
                {channelOptions.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setForm({ ...form, channel: ch })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      form.channel === ch ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Mensaje *</label>
            <Input placeholder="Contenido del mensaje..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Audiencia</label>
              <div className="flex gap-2 flex-wrap">
                {segmentOptions.map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setForm({ ...form, segment: seg })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      form.segment === seg ? "bg-sayo-blue text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Programar</label>
              <div className="flex gap-2">
                {scheduleOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, schedule: s })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      form.schedule === s ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.title && (
            <div className="p-3 rounded-lg border bg-muted/20">
              <p className="text-[10px] text-muted-foreground uppercase mb-2">Vista previa</p>
              <div className="flex items-start gap-3">
                {React.createElement(channelIcons[form.channel] || Bell, { className: "size-5 text-sayo-cafe mt-0.5" })}
                <div>
                  <p className="text-sm font-semibold">{form.title}</p>
                  <p className="text-xs text-muted-foreground">{form.message || "Sin mensaje"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{form.channel}</Badge>
                    <span className="text-[10px] text-muted-foreground">→ {form.segment}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSendPreview}>
              <Send className="size-4 mr-1.5" /> {form.schedule === "Ahora" ? "Enviar" : "Programar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Envíos Recientes</h2>
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = channelIcons[n.channel] || Bell
            return (
              <Card key={n.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleView(n)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.channel} • {n.segment} • {n.audience.toLocaleString()} destinatarios • {new Date(n.sentAt).toLocaleString("es-MX")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    n.status === "enviada" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {n.status}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Notificación</DialogTitle>
            <DialogDescription>{selectedNotif?.id}</DialogDescription>
          </DialogHeader>
          {selectedNotif && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {React.createElement(channelIcons[selectedNotif.channel] || Bell, { className: "size-4 text-muted-foreground" })}
                  <Badge variant="outline" className="text-[10px]">{selectedNotif.channel}</Badge>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedNotif.status === "enviada" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                }`}>
                  {selectedNotif.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Título</p>
                  <p className="font-medium">{selectedNotif.title}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Mensaje</p>
                  <p className="text-sm">{selectedNotif.message}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Segmento</p>
                  <p>{selectedNotif.segment}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Audiencia</p>
                  <p className="tabular-nums">{selectedNotif.audience.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Enviado</p>
                  <p className="text-xs">{new Date(selectedNotif.sentAt).toLocaleString("es-MX")}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5 text-sayo-blue" />
              Confirmar Envío
            </DialogTitle>
            <DialogDescription>
              ¿{form.schedule === "Ahora" ? "Enviar" : "Programar"} esta notificación?
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Título:</span>
              <span className="font-medium">{form.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Canal:</span>
              <Badge variant="outline" className="text-[10px]">{form.channel}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Segmento:</span>
              <span>{form.segment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío:</span>
              <span>{form.schedule === "Ahora" ? "Inmediato" : "Programado"}</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={confirmSend}>
              <CheckCircle className="size-3.5 mr-1" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
