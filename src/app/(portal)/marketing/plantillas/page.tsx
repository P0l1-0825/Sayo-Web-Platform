"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Copy, Eye, Plus } from "lucide-react"

const templates = [
  { id: "TPL-001", name: "Bienvenida", event: "Registro exitoso", channel: "email", lastUsed: "2024-03-06", usageCount: 12450 },
  { id: "TPL-002", name: "Pago Recibido", event: "Pago crédito aplicado", channel: "push", lastUsed: "2024-03-06", usageCount: 8920 },
  { id: "TPL-003", name: "Recordatorio Pago", event: "3 días antes de vencimiento", channel: "sms", lastUsed: "2024-03-05", usageCount: 15630 },
  { id: "TPL-004", name: "Transferencia Exitosa", event: "SPEI procesado", channel: "push", lastUsed: "2024-03-06", usageCount: 45200 },
  { id: "TPL-005", name: "Alerta de Seguridad", event: "Login desde nuevo dispositivo", channel: "email", lastUsed: "2024-03-04", usageCount: 2340 },
  { id: "TPL-006", name: "Crédito Pre-aprobado", event: "Score > 700 y antigüedad > 6m", channel: "in_app", lastUsed: "2024-03-01", usageCount: 5670 },
  { id: "TPL-007", name: "Cuenta Inactiva", event: "Sin actividad 30 días", channel: "email", lastUsed: "2024-02-28", usageCount: 1890 },
  { id: "TPL-008", name: "Vencimiento Próximo", event: "Día de vencimiento", channel: "push", lastUsed: "2024-03-06", usageCount: 22100 },
]

const channelColor: Record<string, string> = {
  email: "bg-blue-100 text-blue-700",
  push: "bg-purple-100 text-purple-700",
  sms: "bg-green-100 text-green-700",
  in_app: "bg-orange-100 text-orange-700",
}

export default function PlantillasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Plantillas de Notificación</h1>
          <p className="text-sm text-muted-foreground">Templates por evento — bienvenida, pago, vencimiento, seguridad</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Nueva Plantilla</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <Card key={t.id} className="hover:border-primary transition-colors">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${channelColor[t.channel]}`}>{t.channel}</span>
              </div>
              <p className="text-xs text-muted-foreground">Evento: {t.event}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.usageCount.toLocaleString()} usos</span>
                <span>Última: {t.lastUsed}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="flex-1 text-xs"><Eye className="size-3 mr-1" /> Ver</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs"><Copy className="size-3 mr-1" /> Duplicar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
