"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bell, Mail, MessageSquare, Smartphone } from "lucide-react"

const recentNotifications = [
  { id: "NOT-001", title: "Pago recibido", channel: "push", audience: 1200, sentAt: "2024-03-06T10:00:00", status: "enviada" },
  { id: "NOT-002", title: "Recordatorio pago crédito", channel: "sms", audience: 3400, sentAt: "2024-03-06T08:00:00", status: "enviada" },
  { id: "NOT-003", title: "Nueva funcionalidad QR", channel: "in_app", audience: 45000, sentAt: "2024-03-05T14:00:00", status: "enviada" },
  { id: "NOT-004", title: "Campaña Crédito Express", channel: "email", audience: 12000, sentAt: "2024-03-04T09:00:00", status: "enviada" },
]

const channelIcons: Record<string, typeof Bell> = {
  push: Bell,
  email: Mail,
  sms: MessageSquare,
  in_app: Smartphone,
}

export default function PushPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Envío de Notificaciones</h1>
        <p className="text-sm text-muted-foreground">Enviar push, email, SMS e in-app a segmentos de usuarios</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold">Nueva Notificación</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Título</label>
              <Input placeholder="Título de la notificación..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Canal</label>
              <div className="flex gap-2">
                {["Push", "Email", "SMS", "In-App"].map((ch) => (
                  <Button key={ch} variant="outline" size="sm" className="text-xs">{ch}</Button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Mensaje</label>
            <Input placeholder="Contenido del mensaje..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Audiencia</label>
              <div className="flex gap-2">
                {["Todos", "Activos 30d", "Con crédito", "Sin actividad"].map((seg) => (
                  <Badge key={seg} variant="outline" className="text-[10px] cursor-pointer hover:bg-accent">{seg}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Programar</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">Ahora</Button>
                <Button variant="outline" size="sm" className="text-xs">Programar</Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button><Send className="size-4 mr-1.5" /> Enviar</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold mb-3">Envíos Recientes</h2>
        <div className="space-y-2">
          {recentNotifications.map((n) => {
            const Icon = channelIcons[n.channel] || Bell
            return (
              <Card key={n.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.channel} • {n.audience.toLocaleString()} destinatarios • {new Date(n.sentAt).toLocaleString("es-MX")}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700">
                    {n.status}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
