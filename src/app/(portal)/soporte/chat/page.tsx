"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Bot, Users, Clock, Send, Sparkles } from "lucide-react"

interface ChatSession {
  id: string; cliente: string; empresa: string; canal: string; status: "activo" | "esperando" | "cerrado"; agente: string; mensajes: number; duracion: string; ultimoMsg: string; aiSuggestion: string
}

const demoChats: ChatSession[] = [
  { id: "CH-001", cliente: "María García", empresa: "Distribuidora del Norte", canal: "Web Widget", status: "activo", agente: "Carlos M.", mensajes: 12, duracion: "8 min", ultimoMsg: "¿Cuándo se refleja mi pago?", aiSuggestion: "Los pagos vía SPEI se reflejan en 24-48 horas hábiles." },
  { id: "CH-002", cliente: "Roberto Sánchez", empresa: "Logística Express", canal: "WhatsApp", status: "activo", agente: "Ana L.", mensajes: 5, duracion: "3 min", ultimoMsg: "Necesito mi estado de cuenta", aiSuggestion: "Puede descargarlo desde Portal > Estados de Cuenta." },
  { id: "CH-003", cliente: "Luis Torres", empresa: "TechParts Mfg", canal: "Web Widget", status: "esperando", agente: "Sin asignar", mensajes: 2, duracion: "1 min", ultimoMsg: "Hola, necesito ayuda con mi crédito", aiSuggestion: "Bienvenido, ¿podría proporcionarme su número de crédito?" },
  { id: "CH-004", cliente: "Patricia Ruiz", empresa: "Alimentos Frescos", canal: "WhatsApp", status: "activo", agente: "Diana F.", mensajes: 18, duracion: "15 min", ultimoMsg: "Ya envié la documentación", aiSuggestion: "Confirmo recepción. El equipo de análisis revisará en 24h." },
  { id: "CH-005", cliente: "Fernando Vega", empresa: "Servicios Médicos", canal: "Web Widget", status: "cerrado", agente: "Carlos M.", mensajes: 8, duracion: "6 min", ultimoMsg: "Gracias, todo resuelto", aiSuggestion: "" },
]

export default function ChatPage() {
  const [chats] = React.useState(demoChats)
  const [selectedChat, setSelectedChat] = React.useState<ChatSession | null>(demoChats[0])
  const [message, setMessage] = React.useState("")

  const activos = chats.filter((c) => c.status === "activo").length
  const esperando = chats.filter((c) => c.status === "esperando").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Chat en Vivo</h1>
        <p className="text-sm text-muted-foreground">Widget de chat, co-browsing y sugerencias AI</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><MessageCircle className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{activos}</p><p className="text-xs text-muted-foreground">Chats Activos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{esperando}</p><p className="text-xs text-muted-foreground">En Espera</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Bot className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">94%</p><p className="text-xs text-muted-foreground">Precisión AI</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Agentes en Línea</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-3 border-b"><p className="text-sm font-semibold">Conversaciones</p></div>
            <div className="divide-y overflow-y-auto max-h-[440px]">
              {chats.map((c) => (
                <div key={c.id} className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedChat?.id === c.id ? "bg-muted/50" : ""}`} onClick={() => setSelectedChat(c)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{c.cliente}</p>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${c.status === "activo" ? "bg-green-100 text-green-700" : c.status === "esperando" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.ultimoMsg}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px]">{c.canal}</Badge>
                    <span className="text-[10px] text-muted-foreground">{c.duracion}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex flex-col flex-1">
            {selectedChat ? (
              <>
                <div className="p-3 border-b flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{selectedChat.cliente}</p>
                    <p className="text-xs text-muted-foreground">{selectedChat.empresa} — {selectedChat.canal}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{selectedChat.agente}</Badge>
                    <span className="text-xs text-muted-foreground">{selectedChat.mensajes} msgs</span>
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/20">
                  <div className="flex justify-start"><div className="bg-muted rounded-lg p-3 max-w-[80%] text-sm">{selectedChat.ultimoMsg}</div></div>
                  {selectedChat.aiSuggestion && (
                    <div className="flex justify-end">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-[80%] text-sm">
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 mb-1"><Sparkles className="size-3" /> Sugerencia AI</div>
                        {selectedChat.aiSuggestion}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t flex gap-2">
                  <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Escribe un mensaje..." value={message} onChange={(e) => setMessage(e.target.value)} />
                  <Button size="sm"><Send className="size-3.5 mr-1" /> Enviar</Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Selecciona una conversación</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
