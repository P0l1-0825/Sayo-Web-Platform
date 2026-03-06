"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { collectionActions } from "@/lib/mock-data"
import { Phone, Mail, MessageSquare, Gavel, Eye, Plus } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  llamada: <Phone className="size-4 text-sayo-green" />,
  email: <Mail className="size-4 text-sayo-blue" />,
  sms: <MessageSquare className="size-4 text-sayo-purple" />,
  legal: <Gavel className="size-4 text-sayo-red" />,
  visita: <Eye className="size-4 text-sayo-orange" />,
}

const resultColor: Record<string, string> = {
  contactado: "bg-green-100 text-green-700",
  promesa_pago: "bg-blue-100 text-blue-700",
  no_contesta: "bg-yellow-100 text-yellow-700",
  negativa: "bg-red-100 text-red-700",
  buzon: "bg-gray-100 text-gray-500",
}

export default function GestionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Gestiones de Cobranza</h1>
          <p className="text-sm text-muted-foreground">Log de gestiones realizadas — llamadas, SMS, email y legal</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Registrar Gestión</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">4</p><p className="text-xs text-muted-foreground">Total gestiones</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-green">2</p><p className="text-xs text-muted-foreground">Contactados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-blue">1</p><p className="text-xs text-muted-foreground">Promesas pago</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-sayo-orange">1</p><p className="text-xs text-muted-foreground">Sin contacto</p></CardContent></Card>
      </div>

      <div className="space-y-2">
        {collectionActions.map((g) => (
          <Card key={g.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                {iconMap[g.type]}
                <span className="font-mono text-xs">{g.id}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium capitalize">{g.type}</p>
                  <Badge variant="outline" className="text-[10px]">{g.creditId}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{g.notes}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${resultColor[g.result]}`}>
                {g.result.replace("_", " ")}
              </span>
              <div className="text-xs text-muted-foreground">
                <p>{g.agent}</p>
                <p>{g.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
