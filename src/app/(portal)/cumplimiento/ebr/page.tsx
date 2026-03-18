"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent } from "@/components/ui/card"
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
import { ebrAssessments } from "@/hooks/use-compliance"
import type { EBRAssessment } from "@/lib/types"
import { ShieldCheck, ShieldAlert, Eye, AlertTriangle, User, RefreshCw } from "lucide-react"

const riskColor = (level: string) => {
  switch (level) {
    case "bajo": return "bg-green-100 text-green-700 border-green-200"
    case "medio": return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "alto": return "bg-orange-100 text-orange-700 border-orange-200"
    case "prohibido": return "bg-red-100 text-red-700 border-red-200"
    default: return "bg-gray-100 text-gray-700"
  }
}

const riskBg = (level: string) => {
  switch (level) {
    case "bajo": return "bg-green-500"
    case "medio": return "bg-yellow-500"
    case "alto": return "bg-orange-500"
    case "prohibido": return "bg-red-500"
    default: return "bg-gray-500"
  }
}

const getDaysUntilReview = (dateStr: string) => {
  const today = new Date()
  const due = new Date(dateStr)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function EBRPage() {
  const [selectedAssessment, setSelectedAssessment] = React.useState<EBRAssessment | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const handleView = (assessment: EBRAssessment) => {
    setSelectedAssessment(assessment)
    setDetailOpen(true)
  }

  const riskDistribution = [
    { level: "bajo", label: "Bajo", count: ebrAssessments.filter((e) => e.riskLevel === "bajo").length, color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50 border-green-200" },
    { level: "medio", label: "Medio", count: ebrAssessments.filter((e) => e.riskLevel === "medio").length, color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200" },
    { level: "alto", label: "Alto", count: ebrAssessments.filter((e) => e.riskLevel === "alto").length, color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-50 border-orange-200" },
    { level: "prohibido", label: "Prohibido", count: ebrAssessments.filter((e) => e.riskLevel === "prohibido").length, color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50 border-red-200" },
  ]

  const pendingReviews = ebrAssessments.filter((e) => getDaysUntilReview(e.nextReview) <= 30).length

  const columns: ColumnDef<EBRAssessment>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "clientName", header: "Cliente" },
    {
      accessorKey: "clientType",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.clientType}</Badge>,
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const score = row.original.score
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-14 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${riskBg(row.original.riskLevel)}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-bold tabular-nums">{score}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "riskLevel",
      header: "Nivel de Riesgo",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${riskColor(row.original.riskLevel)}`}>
          {row.original.riskLevel === "alto" || row.original.riskLevel === "prohibido" ? <AlertTriangle className="size-3" /> : <ShieldCheck className="size-3" />}
          {row.original.riskLevel}
        </span>
      ),
    },
    { accessorKey: "lastReview", header: "Último Review", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.lastReview}</span> },
    {
      accessorKey: "nextReview",
      header: "Próximo Review",
      cell: ({ row }) => {
        const days = getDaysUntilReview(row.original.nextReview)
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs">{row.original.nextReview}</span>
            <span className={`text-[10px] font-semibold ${days < 0 ? "text-red-600" : days <= 30 ? "text-orange-600" : "text-green-600"}`}>
              {days < 0 ? `${Math.abs(days)}d vencido` : `${days}d`}
            </span>
          </div>
        )
      },
    },
    { accessorKey: "reviewer", header: "Revisor" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Enfoque Basado en Riesgos (EBR)</h1>
        <p className="text-sm text-muted-foreground">Evaluación de riesgo PLD/FT por cliente — matriz y scoring</p>
      </div>

      {/* Risk Matrix Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {riskDistribution.map((r) => (
          <Card key={r.level} className={r.bgColor}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${r.color} flex items-center justify-center`}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${r.textColor}`}>{r.count}</p>
                <p className={`text-xs ${r.textColor} opacity-80`}>Riesgo {r.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{ebrAssessments.length}</p>
              <p className="text-xs text-blue-600">Clientes Evaluados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{pendingReviews}</p>
              <p className="text-xs text-orange-600">Reviews Próximos (30d)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factor Legend */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-semibold mb-3">Factores de Riesgo EBR</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { factor: "Pais", desc: "Pais de origen/operación", weight: "10%" },
              { factor: "Actividad", desc: "Giro o actividad economica", weight: "20%" },
              { factor: "Monto", desc: "Volumen transaccional", weight: "30%" },
              { factor: "Tipo Persona", desc: "PFAE, PM, Gobierno", weight: "20%" },
              { factor: "PEP", desc: "Persona Expuesta Politicamente", weight: "20%" },
            ].map((f) => (
              <div key={f.factor} className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs font-semibold">{f.factor}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">Peso: {f.weight}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Evaluaciones de Clientes</h2>
        <DataTable
          columns={columns}
          data={ebrAssessments}
          searchKey="clientName"
          searchPlaceholder="Buscar cliente..."
          exportFilename="evaluaciones_ebr"
          onRowClick={handleView}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Evaluación EBR</DialogTitle>
            <DialogDescription>{selectedAssessment?.clientName} — {selectedAssessment?.id}</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Badge variant="outline" className="text-[10px]">{selectedAssessment.clientType}</Badge>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${riskColor(selectedAssessment.riskLevel)}`}>
                  {selectedAssessment.riskLevel}
                </span>
              </div>

              {/* Score Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Score de Riesgo</span>
                  <span className="text-lg font-bold">{selectedAssessment.score}/100</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${riskBg(selectedAssessment.riskLevel)}`} style={{ width: `${selectedAssessment.score}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0 — Bajo</span>
                  <span>50 — Medio</span>
                  <span>75 — Alto</span>
                  <span>100</span>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-2">Desglose de Factores</p>
                <div className="space-y-2">
                  {selectedAssessment.factors.map((f) => (
                    <div key={f.factor} className="flex items-center gap-3 p-2 rounded border bg-muted/20">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{f.factor}</span>
                          <span className="text-[10px] text-muted-foreground">Peso: {f.weight}%</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{f.value}</span>
                          <span className="text-xs font-bold">{f.score} pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Último Review</p>
                  <p>{selectedAssessment.lastReview}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Próximo Review</p>
                  <p className="font-semibold">{selectedAssessment.nextReview}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Revisor</p>
                  <p>{selectedAssessment.reviewer}</p>
                </div>
              </div>
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
