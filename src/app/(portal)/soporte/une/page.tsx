"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Scale, Clock, CheckCircle, FileText, Eye } from "lucide-react"

const quejas = [
  { id: "UNE-001", folio: "CONDUSEF-2024-0145", clientName: "Martha Sánchez Ríos", subject: "Cobro no reconocido en tarjeta", amount: 3500, status: "en_atencion", receivedDate: "2024-03-01", deadlineDate: "2024-03-31", daysRemaining: 25, channel: "CONDUSEF" },
  { id: "UNE-002", folio: "CONDUSEF-2024-0138", clientName: "Pedro Jiménez Cruz", subject: "Transferencia no aplicada", amount: 15000, status: "respondida", receivedDate: "2024-02-20", deadlineDate: "2024-03-20", daysRemaining: 14, channel: "CONDUSEF" },
  { id: "UNE-003", folio: "UNE-INT-2024-042", clientName: "Laura Mendoza", subject: "Demora en apertura de cuenta", amount: 0, status: "cerrada", receivedDate: "2024-02-10", deadlineDate: "2024-03-10", daysRemaining: 0, channel: "UNE Interna" },
]

const statusMap: Record<string, { label: string; color: string }> = {
  en_atencion: { label: "En Atención", color: "bg-blue-100 text-blue-700" },
  respondida: { label: "Respondida", color: "bg-yellow-100 text-yellow-700" },
  cerrada: { label: "Cerrada", color: "bg-green-100 text-green-700" },
  escalada: { label: "Escalada", color: "bg-red-100 text-red-700" },
}

export default function UNEPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">UNE / CONDUSEF</h1>
        <p className="text-sm text-muted-foreground">Quejas CONDUSEF y UNE — seguimiento, respuesta y resolución</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Total Quejas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-blue">1</p><p className="text-xs text-muted-foreground">En Atención</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-orange">1</p><p className="text-xs text-muted-foreground">Respondida</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-green">1</p><p className="text-xs text-muted-foreground">Cerrada</p></CardContent></Card>
      </div>

      <div className="space-y-2">
        {quejas.map((q) => {
          const status = statusMap[q.status]
          return (
            <Card key={q.id}>
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
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>{status.label}</span>
                {q.daysRemaining > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className={q.daysRemaining < 10 ? "text-sayo-red font-bold" : "text-muted-foreground"}>{q.daysRemaining}d restantes</span>
                  </div>
                )}
                <Button variant="outline" size="sm"><Eye className="size-3.5 mr-1" /> Ver</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
