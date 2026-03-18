"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, User, Clock, CheckCircle, Send, Tag, Building2 } from "lucide-react"
import { toast } from "sonner"

interface Mensaje { autor: string; rol: "cliente" | "agente" | "sistema"; contenido: string; fecha: string }
interface Ticket { id: string; asunto: string; cliente: string; empresa: string; email: string; producto: string; prioridad: "alta" | "media" | "baja"; status: "abierto" | "en-progreso" | "resuelto"; agente: string; creado: string; mensajes: Mensaje[] }

const demoTicket: Ticket = {
  id: "TK-2026-1847", asunto: "No puedo acceder a mi estado de cuenta de febrero", cliente: "Roberto Sánchez Méndez", empresa: "Logística Express México SA de CV", email: "roberto@logisticaexpress.mx", producto: "Crédito Revolvente", prioridad: "media", status: "en-progreso", agente: "Carlos Mendoza", creado: "2026-03-16 09:30",
  mensajes: [
    { autor: "Roberto Sánchez", rol: "cliente", contenido: "Buenos días, intento descargar mi estado de cuenta de febrero pero me marca error 500. ¿Podrían ayudarme?", fecha: "2026-03-16 09:30" },
    { autor: "Sistema", rol: "sistema", contenido: "Ticket asignado a Carlos Mendoza — Equipo Soporte N1", fecha: "2026-03-16 09:31" },
    { autor: "Carlos Mendoza", rol: "agente", contenido: "Hola Roberto, gracias por contactarnos. Estoy revisando tu cuenta. ¿Podrías confirmarme el número de crédito?", fecha: "2026-03-16 09:35" },
    { autor: "Roberto Sánchez", rol: "cliente", contenido: "Claro, es CRV-2025-0892", fecha: "2026-03-16 09:38" },
    { autor: "Carlos Mendoza", rol: "agente", contenido: "Perfecto, encontré el problema. Hubo un error en la generación del PDF. Ya lo regeneré, intenta descargarlo nuevamente.", fecha: "2026-03-16 09:45" },
  ],
}

export default function DetalleTicketPage() {
  const [ticket] = React.useState(demoTicket)
  const [newMsg, setNewMsg] = React.useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Detalle de Ticket</h1>
        <p className="text-sm text-muted-foreground">{ticket.id} — {ticket.asunto}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Tag className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-lg font-bold font-mono">{ticket.id}</p><p className="text-xs text-muted-foreground">Folio</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-lg font-bold">{ticket.creado}</p><p className="text-xs text-muted-foreground">Creado</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium mx-auto ${ticket.prioridad === "alta" ? "bg-red-100 text-red-700" : ticket.prioridad === "media" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{ticket.prioridad}</span>
          <p className="text-xs text-muted-foreground mt-1">Prioridad</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium mx-auto ${ticket.status === "resuelto" ? "bg-green-100 text-green-700" : ticket.status === "en-progreso" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{ticket.status}</span>
          <p className="text-xs text-muted-foreground mt-1">Estado</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><MessageCircle className="size-4" /> Conversación</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {ticket.mensajes.map((m, i) => (
                <div key={i} className={`flex ${m.rol === "agente" ? "justify-end" : m.rol === "sistema" ? "justify-center" : "justify-start"}`}>
                  {m.rol === "sistema" ? (
                    <p className="text-[10px] text-muted-foreground italic bg-muted/50 rounded px-2 py-1">{m.contenido} — {m.fecha}</p>
                  ) : (
                    <div className={`max-w-[80%] rounded-lg p-3 ${m.rol === "agente" ? "bg-blue-50 border border-blue-200" : "bg-muted"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium">{m.autor}</span>
                        <span className="text-[10px] text-muted-foreground">{m.fecha}</span>
                      </div>
                      <p className="text-sm">{m.contenido}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Escribe una respuesta..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
              <Button size="sm" onClick={() => { toast.success("Mensaje enviado"); setNewMsg("") }}><Send className="size-3.5 mr-1" /> Enviar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><User className="size-4" /> Datos del Cliente</h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase">Nombre</p><p className="font-medium">{ticket.cliente}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Empresa</p><p>{ticket.empresa}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Email</p><p className="font-mono text-xs">{ticket.email}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Producto</p><Badge variant="outline" className="text-[10px]">{ticket.producto}</Badge></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Agente Asignado</p><p className="font-medium">{ticket.agente}</p></div>
            </div>
            <div className="space-y-2 pt-3 border-t">
              <Button variant="outline" size="sm" className="w-full text-sayo-green" onClick={() => toast.success("Ticket marcado como resuelto")}><CheckCircle className="size-3.5 mr-1" /> Marcar Resuelto</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
