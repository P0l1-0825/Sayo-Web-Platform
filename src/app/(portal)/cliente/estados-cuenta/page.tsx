"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar } from "lucide-react"

const statements = [
  { id: "EC-001", period: "Marzo 2024", date: "2024-03-01", type: "Parcial", size: "En proceso" },
  { id: "EC-002", period: "Febrero 2024", date: "2024-02-01", type: "Completo", size: "245 KB" },
  { id: "EC-003", period: "Enero 2024", date: "2024-01-01", type: "Completo", size: "312 KB" },
  { id: "EC-004", period: "Diciembre 2023", date: "2023-12-01", type: "Completo", size: "289 KB" },
  { id: "EC-005", period: "Noviembre 2023", date: "2023-11-01", type: "Completo", size: "198 KB" },
  { id: "EC-006", period: "Octubre 2023", date: "2023-10-01", type: "Completo", size: "267 KB" },
]

export default function EstadosCuentaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Estados de Cuenta</h1>
        <p className="text-sm text-muted-foreground">Descarga tus estados de cuenta mensuales en PDF</p>
      </div>

      <Card className="bg-sayo-cream border-sayo-maple">
        <CardContent className="p-4 flex items-center gap-3">
          <Calendar className="size-5 text-sayo-cafe" />
          <div>
            <p className="text-sm font-medium text-sayo-cafe">Cuenta SAYO • Nivel 4</p>
            <p className="text-xs text-sayo-cafe-light">CLABE: 646 180 0012 3456 7890 • Titular: Juan Pérez</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {statements.map((st) => (
          <Card key={st.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{st.period}</p>
                <p className="text-xs text-muted-foreground">Generado: {st.date} • {st.size}</p>
              </div>
              {st.type === "Completo" ? (
                <Button variant="outline" size="sm"><Download className="size-3.5 mr-1" /> PDF</Button>
              ) : (
                <span className="text-xs text-muted-foreground italic">{st.size}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
