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
import { Scale, Clock, CheckCircle, Eye, Plus, Send, FileText, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { formatMoney } from "@/lib/utils"

interface Queja {
  id: string
  folio: string
  clientName: string
  subject: string
  amount: number
  status: string
  receivedDate: string
  deadlineDate: string
  daysRemaining: number
  channel: string
  response?: string
}

const initialQuejas: Queja[] = [
  { id: "UNE-001", folio: "CONDUSEF-2024-0145", clientName: "Martha Sánchez Ríos", subject: "Cobro no reconocido en tarjeta", amount: 3500, status: "en_atencion", receivedDate: "2024-03-01", deadlineDate: "2024-03-31", daysRemaining: 25, channel: "CONDUSEF" },
  { id: "UNE-002", folio: "CONDUSEF-2024-0138", clientName: "Pedro Jiménez Cruz", subject: "Transferencia no aplicada", amount: 15000, status: "respondida", receivedDate: "2024-02-20", deadlineDate: "2024-03-20", daysRemaining: 14, channel: "CONDUSEF", response: "Se identificó la transferencia retenida por validación AML. Se liberó y aplicó el 2024-03-05." },
  { id: "UNE-003", folio: "UNE-INT-2024-042", clientName: "Laura Mendoza", subject: "Demora en apertura de cuenta", amount: 0, status: "cerrada", receivedDate: "2024-02-10", deadlineDate: "2024-03-10", daysRemaining: 0, channel: "UNE Interna", response: "Cuenta aperturada exitosamente. Se contactó al cliente para confirmar." },
]

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  en_atencion: { label: "En Atención", color: "bg-blue-100 text-blue-700", icon: <Clock className="size-3" /> },
  respondida: { label: "Respondida", color: "bg-yellow-100 text-yellow-700", icon: <Send className="size-3" /> },
  cerrada: { label: "Cerrada", color: "bg-green-100 text-green-700", icon: <CheckCircle className="size-3" /> },
  escalada: { label: "Escalada", color: "bg-red-100 text-red-700", icon: <AlertTriangle className="size-3" /> },
}

export default function UNEPage() {
  const [quejas, setQuejas] = React.useState<Queja[]>(initialQuejas)
  const [selectedQueja, setSelectedQueja] = React.useState<Queja | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [respondOpen, setRespondOpen] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)
  const [responseText, setResponseText] = React.useState("")
  const [newForm, setNewForm] = React.useState({
    folio: "",
    clientName: "",
    subject: "",
    amount: "",
    channel: "CONDUSEF",
  })

  const handleView = (queja: Queja) => {
    setSelectedQueja(queja)
    setDetailOpen(true)
  }

  const handleRespond = (queja: Queja) => {
    setSelectedQueja(queja)
    setResponseText("")
    setRespondOpen(true)
  }

  const sendResponse = () => {
    if (!selectedQueja || !responseText.trim()) {
      toast.error("Escribe la respuesta")
      return
    }
    setQuejas((prev) =>
      prev.map((q) =>
        q.id === selectedQueja.id
          ? { ...q, status: "respondida", response: responseText }
          : q
      )
    )
    setRespondOpen(false)
    setDetailOpen(false)
    toast.success("Respuesta registrada", { description: `${selectedQueja.id} — Folio: ${selectedQueja.folio}` })
  }

  const handleClose = (queja: Queja) => {
    setQuejas((prev) =>
      prev.map((q) => (q.id === queja.id ? { ...q, status: "cerrada", daysRemaining: 0 } : q))
    )
    setDetailOpen(false)
    toast.success("Queja cerrada", { description: `${queja.id} — ${queja.subject}` })
  }

  const handleEscalate = (queja: Queja) => {
    setQuejas((prev) =>
      prev.map((q) => (q.id === queja.id ? { ...q, status: "escalada" } : q))
    )
    if (selectedQueja?.id === queja.id) {
      setSelectedQueja({ ...queja, status: "escalada" })
    }
    toast.info("Queja escalada", { description: `${queja.id} escalada a dirección jurídica` })
  }

  const handleNewQueja = () => {
    if (!newForm.folio || !newForm.clientName || !newForm.subject) {
      toast.error("Completa los campos requeridos")
      return
    }
    const newQueja: Queja = {
      id: `UNE-${String(quejas.length + 1).padStart(3, "0")}`,
      folio: newForm.folio,
      clientName: newForm.clientName,
      subject: newForm.subject,
      amount: newForm.amount ? Number(newForm.amount) : 0,
      status: "en_atencion",
      receivedDate: new Date().toISOString().slice(0, 10),
      deadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      daysRemaining: 30,
      channel: newForm.channel,
    }
    setQuejas([newQueja, ...quejas])
    setNewOpen(false)
    setNewForm({ folio: "", clientName: "", subject: "", amount: "", channel: "CONDUSEF" })
    toast.success("Queja registrada", { description: `${newQueja.id} — Folio: ${newQueja.folio}` })
  }

  const enAtencion = quejas.filter((q) => q.status === "en_atencion").length
  const respondidas = quejas.filter((q) => q.status === "respondida").length
  const cerradas = quejas.filter((q) => q.status === "cerrada").length
  const escaladas = quejas.filter((q) => q.status === "escalada").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">UNE / CONDUSEF</h1>
          <p className="text-sm text-muted-foreground">Quejas CONDUSEF y UNE — seguimiento, respuesta y resolución</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-1.5" /> Registrar Queja
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{quejas.length}</p><p className="text-xs text-muted-foreground">Total Quejas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-blue">{enAtencion}</p><p className="text-xs text-muted-foreground">En Atención</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-orange">{respondidas}</p><p className="text-xs text-muted-foreground">Respondidas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-green">{cerradas}</p><p className="text-xs text-muted-foreground">Cerradas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-red">{escaladas}</p><p className="text-xs text-muted-foreground">Escaladas</p></CardContent></Card>
      </div>

      <div className="space-y-2">
        {quejas.map((q) => {
          const status = statusMap[q.status] || statusMap.en_atencion
          return (
            <Card key={q.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(q)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{q.id}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{q.subject}</p>
                    <Badge variant="outline" className="text-[10px]">{q.channel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {q.clientName} • Folio: {q.folio} • Recibida: {q.receivedDate}
                  </p>
                </div>
                {q.amount > 0 && (
                  <span className="text-xs font-semibold tabular-nums">{formatMoney(q.amount)}</span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                  {status.icon}
                  {status.label}
                </span>
                {q.daysRemaining > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className={q.daysRemaining < 10 ? "text-sayo-red font-bold" : "text-muted-foreground"}>{q.daysRemaining}d</span>
                  </div>
                )}
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {q.status === "en_atencion" && (
                    <Button variant="outline" size="sm" onClick={() => handleRespond(q)}>
                      <Send className="size-3 mr-1" /> Responder
                    </Button>
                  )}
                  {q.status === "respondida" && (
                    <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => handleClose(q)}>
                      <CheckCircle className="size-3 mr-1" /> Cerrar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Queja</DialogTitle>
            <DialogDescription>{selectedQueja?.id} — Folio: {selectedQueja?.folio}</DialogDescription>
          </DialogHeader>
          {selectedQueja && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[selectedQueja.status]?.color}`}>
                  {statusMap[selectedQueja.status]?.icon}
                  {statusMap[selectedQueja.status]?.label}
                </span>
                {selectedQueja.daysRemaining > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className={`text-sm font-bold ${selectedQueja.daysRemaining < 10 ? "text-sayo-red" : "text-muted-foreground"}`}>
                      {selectedQueja.daysRemaining} días restantes
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium">{selectedQueja.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Canal</p>
                  <Badge variant="outline" className="text-[10px]">{selectedQueja.channel}</Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Folio</p>
                  <p className="font-mono text-xs">{selectedQueja.folio}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto Reclamado</p>
                  <p className="font-semibold">{selectedQueja.amount > 0 ? formatMoney(selectedQueja.amount) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Recepción</p>
                  <p>{selectedQueja.receivedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Límite</p>
                  <p className={selectedQueja.daysRemaining < 10 ? "text-sayo-red font-bold" : ""}>{selectedQueja.deadlineDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Asunto</p>
                  <p className="text-sm font-medium">{selectedQueja.subject}</p>
                </div>
                {selectedQueja.response && (
                  <div className="col-span-2 p-3 rounded-lg border bg-green-50">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Respuesta</p>
                    <p className="text-sm">{selectedQueja.response}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedQueja?.status === "en_atencion" && (
              <>
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleRespond(selectedQueja) }}>
                  <Send className="size-3.5 mr-1" /> Responder
                </Button>
                <Button variant="outline" size="sm" className="text-sayo-red" onClick={() => handleEscalate(selectedQueja)}>
                  <AlertTriangle className="size-3.5 mr-1" /> Escalar
                </Button>
              </>
            )}
            {selectedQueja?.status === "respondida" && (
              <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => handleClose(selectedQueja)}>
                <CheckCircle className="size-3.5 mr-1" /> Cerrar Queja
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond Dialog */}
      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5 text-sayo-blue" />
              Responder Queja
            </DialogTitle>
            <DialogDescription>{selectedQueja?.id} — {selectedQueja?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground">{selectedQueja?.clientName} — Folio: {selectedQueja?.folio}</p>
              {selectedQueja && selectedQueja.amount > 0 && (
                <p className="font-semibold mt-1">Monto reclamado: {formatMoney(selectedQueja.amount)}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Respuesta oficial *</label>
              <Input
                placeholder="Detalle de la resolución o respuesta..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={sendResponse}>
              <Send className="size-3.5 mr-1" /> Enviar Respuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Queja Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Queja</DialogTitle>
            <DialogDescription>Registrar nueva queja CONDUSEF/UNE</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Folio CONDUSEF/UNE *</label>
              <Input placeholder="Ej: CONDUSEF-2024-0200" value={newForm.folio} onChange={(e) => setNewForm({ ...newForm, folio: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cliente *</label>
              <Input placeholder="Nombre completo" value={newForm.clientName} onChange={(e) => setNewForm({ ...newForm, clientName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asunto *</label>
              <Input placeholder="Descripción de la queja" value={newForm.subject} onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Monto reclamado</label>
              <Input type="number" placeholder="Ej: 5000" value={newForm.amount} onChange={(e) => setNewForm({ ...newForm, amount: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Canal</label>
              <div className="flex gap-2 mt-1">
                {["CONDUSEF", "UNE Interna"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewForm({ ...newForm, channel: c })}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      newForm.channel === c ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleNewQueja}>
              <Plus className="size-3.5 mr-1" /> Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
