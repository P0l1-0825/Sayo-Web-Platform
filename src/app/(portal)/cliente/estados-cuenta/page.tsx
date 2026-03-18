"use client"

import * as React from "react"
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
import { formatMoney } from "@/lib/utils"
import { FileText, Download, Calendar, Eye, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react"
import { toast } from "sonner"

interface Statement {
  id: string
  period: string
  date: string
  type: "Completo" | "Parcial"
  size: string
  ingresos: number
  egresos: number
  saldoInicial: number
  saldoFinal: number
  movimientos: number
}

const statements: Statement[] = [
  { id: "EC-001", period: "Marzo 2024", date: "2024-03-01", type: "Parcial", size: "En proceso", ingresos: 26000, egresos: 8850, saldoInicial: 30100.80, saldoFinal: 47250.80, movimientos: 8 },
  { id: "EC-002", period: "Febrero 2024", date: "2024-02-01", type: "Completo", size: "245 KB", ingresos: 52500, egresos: 38200, saldoInicial: 15800.80, saldoFinal: 30100.80, movimientos: 24 },
  { id: "EC-003", period: "Enero 2024", date: "2024-01-01", type: "Completo", size: "312 KB", ingresos: 48000, egresos: 42300, saldoInicial: 10100.80, saldoFinal: 15800.80, movimientos: 31 },
  { id: "EC-004", period: "Diciembre 2023", date: "2023-12-01", type: "Completo", size: "289 KB", ingresos: 55000, egresos: 52400, saldoInicial: 7500.80, saldoFinal: 10100.80, movimientos: 35 },
  { id: "EC-005", period: "Noviembre 2023", date: "2023-11-01", type: "Completo", size: "198 KB", ingresos: 35000, egresos: 31200, saldoInicial: 3700.80, saldoFinal: 7500.80, movimientos: 18 },
  { id: "EC-006", period: "Octubre 2023", date: "2023-10-01", type: "Completo", size: "267 KB", ingresos: 42000, egresos: 39500, saldoInicial: 1200.80, saldoFinal: 3700.80, movimientos: 22 },
]

const yearFilter = ["2024", "2023"]

export default function EstadosCuentaPage() {
  const [selectedYear, setSelectedYear] = React.useState<string | null>(null)
  const [selectedStatement, setSelectedStatement] = React.useState<Statement | null>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)

  const filteredStatements = selectedYear
    ? statements.filter((s) => s.date.startsWith(selectedYear))
    : statements

  const handleView = (st: Statement) => {
    setSelectedStatement(st)
    setPreviewOpen(true)
  }

  const handleDownload = (st: Statement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (st.type === "Parcial") {
      toast.info("Estado de cuenta en proceso", { description: "Estará disponible al cierre de mes" })
      return
    }
    // Simulate CSV download
    const csvContent = [
      ["Estado de Cuenta SAYO", st.period].join(","),
      [""],
      ["Concepto", "Monto"].join(","),
      ["Saldo Inicial", st.saldoInicial.toString()].join(","),
      ["Ingresos", st.ingresos.toString()].join(","),
      ["Egresos", st.egresos.toString()].join(","),
      ["Saldo Final", st.saldoFinal.toString()].join(","),
      [""],
      ["Movimientos", st.movimientos.toString()].join(","),
    ].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `estado_cuenta_${st.period.replace(" ", "_").toLowerCase()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Estado de cuenta descargado", { description: st.period })
  }

  const totalIngresos = filteredStatements.reduce((s, st) => s + st.ingresos, 0)
  const totalEgresos = filteredStatements.reduce((s, st) => s + st.egresos, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Estados de Cuenta</h1>
        <p className="text-sm text-muted-foreground">Descarga tus estados de cuenta mensuales</p>
      </div>

      <Card className="bg-sayo-cream border-sayo-maple">
        <CardContent className="p-4 flex items-center gap-3">
          <Calendar className="size-5 text-sayo-cafe" />
          <div className="flex-1">
            <p className="text-sm font-medium text-sayo-cafe">Cuenta SAYO • Nivel 4</p>
            <p className="text-xs text-sayo-cafe-light">CLABE: 646 180 0012 3456 7890 • Titular: Juan Pérez</p>
          </div>
          <Badge variant="outline" className="text-[10px]">{filteredStatements.length} estados</Badge>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <ArrowDownLeft className="size-4 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-bold text-green-600">{formatMoney(totalIngresos)}</p>
            <p className="text-[10px] text-muted-foreground">Total Ingresos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <ArrowUpRight className="size-4 mx-auto text-red-500 mb-1" />
            <p className="text-lg font-bold text-red-600">{formatMoney(totalEgresos)}</p>
            <p className="text-[10px] text-muted-foreground">Total Egresos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <FileText className="size-4 mx-auto text-sayo-blue mb-1" />
            <p className="text-lg font-bold">{filteredStatements.filter((s) => s.type === "Completo").length}</p>
            <p className="text-[10px] text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="size-4 mx-auto text-sayo-orange mb-1" />
            <p className="text-lg font-bold">{filteredStatements.reduce((s, st) => s + st.movimientos, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Movimientos</p>
          </CardContent>
        </Card>
      </div>

      {/* Year Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${!selectedYear ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          Todos
        </button>
        {yearFilter.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(selectedYear === y ? null : y)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${selectedYear === y ? "bg-sayo-cafe text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Statements List */}
      <div className="space-y-2">
        {filteredStatements.map((st) => (
          <Card key={st.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleView(st)}>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className={`size-5 ${st.type === "Completo" ? "text-sayo-blue" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{st.period}</p>
                  {st.type === "Parcial" && <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700">En proceso</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {st.movimientos} movimientos • Saldo final: {formatMoney(st.saldoFinal)}
                </p>
              </div>
              <div className="text-right mr-2">
                <p className="text-xs text-green-600">+{formatMoney(st.ingresos)}</p>
                <p className="text-xs text-red-600">-{formatMoney(st.egresos)}</p>
              </div>
              {st.type === "Completo" ? (
                <Button variant="outline" size="sm" onClick={(e) => handleDownload(st, e)}>
                  <Download className="size-3.5 mr-1" /> CSV
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground italic">{st.size}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statement Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Estado de Cuenta</DialogTitle>
            <DialogDescription>{selectedStatement?.period} — {selectedStatement?.id}</DialogDescription>
          </DialogHeader>
          {selectedStatement && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-sayo-cream">
                <div>
                  <p className="text-sm font-medium text-sayo-cafe">{selectedStatement.period}</p>
                  <p className="text-xs text-sayo-cafe-light">{selectedStatement.type === "Completo" ? `Generado • ${selectedStatement.size}` : "En proceso de generación"}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${selectedStatement.type === "Completo" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {selectedStatement.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Inicial</p>
                  <p className="text-sm font-bold">{formatMoney(selectedStatement.saldoInicial)}</p>
                </div>
                <div className="p-3 rounded-lg border text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Final</p>
                  <p className="text-sm font-bold">{formatMoney(selectedStatement.saldoFinal)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="size-4 text-green-600" />
                    <span className="text-sm">Ingresos</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">+{formatMoney(selectedStatement.ingresos)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="size-4 text-red-600" />
                    <span className="text-sm">Egresos</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">-{formatMoney(selectedStatement.egresos)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Diferencia</span>
                  <span className={`text-sm font-bold ${selectedStatement.ingresos - selectedStatement.egresos >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {selectedStatement.ingresos - selectedStatement.egresos >= 0 ? "+" : ""}{formatMoney(selectedStatement.ingresos - selectedStatement.egresos)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Total de Movimientos</p>
                <p className="text-xl font-bold">{selectedStatement.movimientos}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedStatement?.type === "Completo" && (
              <Button variant="outline" size="sm" onClick={() => selectedStatement && handleDownload(selectedStatement)}>
                <Download className="size-3.5 mr-1" /> Descargar CSV
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
