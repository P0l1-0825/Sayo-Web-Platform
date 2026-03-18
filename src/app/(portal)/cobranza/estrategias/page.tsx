"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Phone, Mail, MessageSquare, Gavel, Bell, Settings, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface StrategyAction {
  icon: string
  label: string
  timing: string
  active: boolean
}

interface Strategy {
  name: string
  segment: string
  color: string
  actions: StrategyAction[]
}

const initialStrategies: Strategy[] = [
  {
    name: "Preventivo",
    segment: "0-15 días antes del vencimiento",
    color: "bg-blue-50 border-blue-200",
    actions: [
      { icon: "bell", label: "SMS recordatorio", timing: "5 días antes", active: true },
      { icon: "mail", label: "Email recordatorio", timing: "3 días antes", active: true },
      { icon: "message", label: "Push notification", timing: "1 día antes", active: true },
    ],
  },
  {
    name: "Administrativo Temprano",
    segment: "1-30 días de mora",
    color: "bg-yellow-50 border-yellow-200",
    actions: [
      { icon: "phone", label: "Llamada telefónica", timing: "Día 3", active: true },
      { icon: "mail", label: "Email de atraso", timing: "Día 1", active: true },
      { icon: "message", label: "SMS con monto adeudado", timing: "Día 7", active: true },
      { icon: "phone", label: "Segunda llamada", timing: "Día 15", active: true },
    ],
  },
  {
    name: "Administrativo Avanzado",
    segment: "31-90 días de mora",
    color: "bg-orange-50 border-orange-200",
    actions: [
      { icon: "phone", label: "Llamadas frecuentes", timing: "Cada 3 días", active: true },
      { icon: "mail", label: "Carta formal de cobranza", timing: "Día 35", active: true },
      { icon: "phone", label: "Contacto referencia", timing: "Día 45", active: false },
      { icon: "mail", label: "Oferta reestructura", timing: "Día 60", active: true },
    ],
  },
  {
    name: "Judicial",
    segment: "90+ días de mora",
    color: "bg-red-50 border-red-200",
    actions: [
      { icon: "gavel", label: "Carta requerimiento notarial", timing: "Día 91", active: true },
      { icon: "gavel", label: "Demanda mercantil", timing: "Día 120", active: true },
      { icon: "mail", label: "Notificación despacho externo", timing: "Día 100", active: false },
    ],
  },
]

const getIcon = (icon: string) => {
  switch (icon) {
    case "phone": return <Phone className="size-4" />
    case "mail": return <Mail className="size-4" />
    case "message": return <MessageSquare className="size-4" />
    case "bell": return <Bell className="size-4" />
    case "gavel": return <Gavel className="size-4" />
    default: return <Bell className="size-4" />
  }
}

export default function EstrategiasPage() {
  const [strategies, setStrategies] = React.useState(initialStrategies)
  const [configOpen, setConfigOpen] = React.useState(false)
  const [selectedStrategy, setSelectedStrategy] = React.useState<string | null>(null)

  const toggleAction = (strategyName: string, actionIndex: number) => {
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.name !== strategyName) return s
        const newActions = [...s.actions]
        newActions[actionIndex] = { ...newActions[actionIndex], active: !newActions[actionIndex].active }
        return { ...s, actions: newActions }
      })
    )
    const strategy = strategies.find((s) => s.name === strategyName)
    const action = strategy?.actions[actionIndex]
    if (action) {
      toast.success(
        action.active ? "Acción desactivada" : "Acción activada",
        { description: `${action.label} en ${strategyName}` }
      )
    }
  }

  const handleConfigure = (strategyName: string) => {
    setSelectedStrategy(strategyName)
    setConfigOpen(true)
  }

  const totalActive = strategies.reduce((sum, s) => sum + s.actions.filter((a) => a.active).length, 0)
  const totalActions = strategies.reduce((sum, s) => sum + s.actions.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Estrategias de Cobranza</h1>
          <p className="text-sm text-muted-foreground">Reglas por segmento — preventivo, administrativo y judicial</p>
        </div>
        <Badge variant="outline">{totalActive}/{totalActions} acciones activas</Badge>
      </div>

      <div className="space-y-4">
        {strategies.map((s) => (
          <Card key={s.name} className={`border ${s.color}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{s.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{s.segment}</Badge>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleConfigure(s.name)} title="Configurar">
                    <Settings className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {s.actions.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                    <div className="text-muted-foreground">{getIcon(a.icon)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.timing}</p>
                    </div>
                    <button
                      onClick={() => toggleAction(s.name, i)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                        a.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {a.active ? <CheckCircle className="size-3" /> : <XCircle className="size-3" />}
                      {a.active ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Configurar: {selectedStrategy}
            </DialogTitle>
            <DialogDescription>
              Activa o desactiva las acciones de cobranza para este segmento.
              Los cambios se aplican inmediatamente.
            </DialogDescription>
          </DialogHeader>
          {selectedStrategy && (
            <div className="space-y-2">
              {strategies.find((s) => s.name === selectedStrategy)?.actions.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="text-muted-foreground">{getIcon(a.icon)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.timing}</p>
                  </div>
                  <button
                    onClick={() => toggleAction(selectedStrategy, i)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      a.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {a.active ? "Activo" : "Inactivo"}
                  </button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
