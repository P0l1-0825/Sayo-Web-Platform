"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { leads } from "@/lib/mock-data"
import { formatMoney } from "@/lib/utils"
import { ArrowRight, User } from "lucide-react"

const stages = [
  { id: "prospecto", label: "Prospecto", color: "bg-gray-100 border-gray-200" },
  { id: "contactado", label: "Contactado", color: "bg-blue-50 border-blue-200" },
  { id: "evaluacion", label: "Evaluación", color: "bg-yellow-50 border-yellow-200" },
  { id: "aprobado", label: "Aprobado", color: "bg-green-50 border-green-200" },
  { id: "dispersado", label: "Dispersado", color: "bg-emerald-50 border-emerald-200" },
]

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pipeline Comercial</h1>
        <p className="text-sm text-muted-foreground">Kanban: Prospecto → Contactado → Evaluación → Aprobado → Dispersado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id)
          return (
            <div key={stage.id}>
              <div className={`rounded-lg border p-3 ${stage.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold">{stage.label}</h3>
                  <Badge variant="outline" className="text-[10px]">{stageLeads.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <User className="size-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold">{lead.name}</p>
                            <p className="text-[10px] text-muted-foreground">{lead.product}</p>
                          </div>
                        </div>
                        {lead.amount > 0 && (
                          <p className="text-xs font-bold tabular-nums">{formatMoney(lead.amount)}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">Score:</span>
                            <span className={`text-[10px] font-bold ${lead.score > 80 ? "text-sayo-green" : lead.score > 50 ? "text-sayo-orange" : "text-sayo-red"}`}>{lead.score}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Sin leads</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
