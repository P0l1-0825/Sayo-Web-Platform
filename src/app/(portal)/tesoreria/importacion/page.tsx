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
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Clock, Eye, AlertTriangle, FileText, Download } from "lucide-react"
import { toast } from "sonner"

const formats = [
  { id: "spei", name: "SPEI Estandar", description: "Formato Banxico para transferencias SPEI", fields: "Emisor|Receptor|CLABE|Monto|Concepto|Referencia" },
  { id: "clabe", name: "CLABE Interbancaria", description: "Formato por CLABE con validación integrada", fields: "CLABE|Beneficiario|Monto|Concepto|Referencia|Banco" },
  { id: "cie", name: "CIE / CLC", description: "Formato para pagos referenciados CIE", fields: "Convenio|Referencia|Monto|FechaValor|Concepto" },
  { id: "custom", name: "Personalizado", description: "Mapeo manual de columnas", fields: "Configurable" },
]

const importHistory = [
  { id: "IMP-001", filename: "pagos_marzo_q1.csv", format: "SPEI Estandar", records: 145, success: 142, errors: 3, totalAmount: 2350000, status: "parcial" as const, uploadedBy: "Gabriela Navarro", date: "2025-03-08" },
  { id: "IMP-002", filename: "dispersión_creditos_lote12.txt", format: "CLABE Interbancaria", records: 28, success: 28, errors: 0, totalAmount: 4200000, status: "completado" as const, uploadedBy: "Gabriela Navarro", date: "2025-03-07" },
  { id: "IMP-003", filename: "pagos_sat_febrero.csv", format: "CIE / CLC", records: 5, success: 5, errors: 0, totalAmount: 1890000, status: "completado" as const, uploadedBy: "Gabriela Navarro", date: "2025-03-05" },
  { id: "IMP-004", filename: "nomina_enero_q2.csv", format: "SPEI Estandar", records: 152, success: 0, errors: 152, totalAmount: 0, status: "fallido" as const, uploadedBy: "Patricia Morales", date: "2025-02-15" },
  { id: "IMP-005", filename: "proveedores_febrero.txt", format: "Personalizado", records: 35, success: 35, errors: 0, totalAmount: 1800000, status: "completado" as const, uploadedBy: "Gabriela Navarro", date: "2025-02-28" },
]

type ImportRecord = typeof importHistory[0]

const statusColor = (status: string) => {
  switch (status) {
    case "completado": return "bg-green-100 text-green-700"
    case "parcial": return "bg-orange-100 text-orange-700"
    case "procesando": return "bg-blue-100 text-blue-700"
    case "fallido": return "bg-red-100 text-red-700"
    case "pendiente": return "bg-yellow-100 text-yellow-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

interface ParsedRecord {
  raw: string[]
  beneficiary: string
  clabe: string
  amount: number
  concept: string
  valid: boolean
  error?: string
}

function parseCSV(text: string, delimiter: string): string[][] {
  return text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0).map((l) => l.split(delimiter))
}

function validateClabe(clabe: string): boolean {
  if (!/^\d{18}$/.test(clabe)) return false
  const w = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7]
  const d = clabe.split("").map(Number)
  return (10 - (w.reduce((a, v, i) => a + ((v * d[i]) % 10), 0) % 10)) % 10 === d[17]
}

function parseRecords(rows: string[][], format: string): ParsedRecord[] {
  return rows.slice(1).map((cols) => {
    const r: ParsedRecord = { raw: cols, beneficiary: "", clabe: "", amount: 0, concept: "", valid: true }
    if (format === "spei") { r.beneficiary = cols[3] || ""; r.clabe = cols[2] || ""; r.amount = parseFloat(cols[4]) || 0; r.concept = cols[5] || "" }
    else if (format === "clabe") { r.clabe = cols[0] || ""; r.beneficiary = cols[1] || ""; r.amount = parseFloat(cols[2]) || 0; r.concept = cols[3] || "" }
    else if (format === "cie") { r.beneficiary = cols[0] || ""; r.clabe = cols[1] || ""; r.amount = parseFloat(cols[2]) || 0; r.concept = cols[4] || "" }
    else { r.beneficiary = cols[1] || cols[0] || ""; r.clabe = cols.find((c) => /^\d{18}$/.test(c)) || ""; const n = cols.find((c) => /^\d+(\.\d+)?$/.test(c) && parseFloat(c) > 100); r.amount = n ? parseFloat(n) : 0 }
    if (!r.clabe || !validateClabe(r.clabe)) { r.valid = false; r.error = "CLABE inválida" }
    if (r.amount <= 0) { r.valid = false; r.error = r.error ? `${r.error}, monto inválido` : "Monto inválido" }
    return r
  })
}

export default function ImportacionPage() {
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [selectedFormat, setSelectedFormat] = React.useState("")
  const [selectedImport, setSelectedImport] = React.useState<ImportRecord | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [parsedRecords, setParsedRecords] = React.useState<ParsedRecord[]>([])
  const [fileName, setFileName] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!selectedFormat) { toast.error("Selecciona un formato primero"); return }
    if (file.size > 10 * 1024 * 1024) { toast.error("Archivo muy grande", { description: "Máximo 10MB" }); return }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const delim = text.includes("|") ? "|" : text.includes("\t") ? "\t" : ","
      const rows = parseCSV(text, delim)
      if (rows.length < 2) { toast.error("Archivo vacío o sin registros"); return }
      setParsedRecords(parseRecords(rows, selectedFormat))
      setUploadOpen(false)
      setPreviewOpen(true)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processFile(f) }

  const handleUpload = () => {
    if (!selectedFormat) { toast.error("Selecciona un formato", { description: "Debes seleccionar el formato del archivo a importar" }); return }
    fileInputRef.current?.click()
  }

  const handleProcess = () => {
    const validCount = parsedRecords.filter((r) => r.valid).length
    const totalAmount = parsedRecords.filter((r) => r.valid).reduce((s, r) => s + r.amount, 0)
    setPreviewOpen(false)
    toast.success("Archivo procesado exitosamente", { description: `${validCount} registros importados — $${totalAmount.toLocaleString("es-MX")} total` })
    setSelectedFormat(""); setParsedRecords([]); setFileName("")
  }

  const handleViewImport = (imp: ImportRecord) => {
    setSelectedImport(imp)
    setDetailOpen(true)
  }

  const handleDownloadTemplate = (format: typeof formats[0]) => {
    toast.info(`Template ${format.name} descargado`, { description: `Formato: ${format.fields}` })
  }

  const columns: ColumnDef<ImportRecord>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: "filename",
      header: "Archivo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{row.original.filename}</span>
        </div>
      ),
    },
    { accessorKey: "format", header: "Formato", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.format}</Badge> },
    { accessorKey: "records", header: "Registros", cell: ({ row }) => <span className="font-semibold">{row.original.records}</span> },
    {
      id: "results",
      header: "Exito / Error",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-green-600">{row.original.success} ok</span>
          <span className="text-red-500">{row.original.errors} err</span>
        </div>
      ),
    },
    { accessorKey: "totalAmount", header: "Monto Total", cell: ({ row }) => <span className="font-semibold tabular-nums">{row.original.totalAmount > 0 ? `$${(row.original.totalAmount / 1000000).toFixed(1)}M` : "—"}</span> },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(row.original.status)}`}>
          {row.original.status === "completado" && <CheckCircle className="size-3" />}
          {row.original.status === "parcial" && <AlertTriangle className="size-3" />}
          {row.original.status === "fallido" && <XCircle className="size-3" />}
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "date", header: "Fecha", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.date}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleViewImport(row.original) }}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Importación de Layouts</h1>
          <p className="text-sm text-muted-foreground">Importar archivos bancarios SPEI, CLABE y CIE</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-accent-green hover:bg-accent-green/90 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Importar Archivo
        </Button>
      </div>

      {/* Format Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {formats.map((format) => (
          <Card key={format.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="pt-4 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                <Button variant="ghost" size="icon-xs" onClick={() => handleDownloadTemplate(format)} title="Descargar template">
                  <Download className="size-3.5" />
                </Button>
              </div>
              <p className="text-sm font-semibold">{format.name}</p>
              <p className="text-xs text-muted-foreground">{format.description}</p>
              <p className="text-[10px] font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1">{format.fields}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-indigo-700">{importHistory.length}</p>
              <p className="text-xs text-indigo-600">Importaciones Totales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{importHistory.reduce((s, i) => s + i.success, 0)}</p>
              <p className="text-xs text-green-600">Registros Exitosos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{importHistory.reduce((s, i) => s + i.errors, 0)}</p>
              <p className="text-xs text-red-500">Con Error</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import History Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Historial de Importaciones</h2>
        <DataTable
          columns={columns}
          data={importHistory}
          searchKey="filename"
          searchPlaceholder="Buscar por archivo..."
          exportFilename="importaciones"
          onRowClick={handleViewImport}
        />
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Layout Bancario</DialogTitle>
            <DialogDescription>Selecciona el formato y carga tu archivo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Formato del Archivo</p>
              <div className="grid grid-cols-2 gap-2">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${selectedFormat === format.id ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
                  >
                    <p className="text-xs font-semibold">{format.name}</p>
                    <p className="text-[10px] text-muted-foreground">{format.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleFileSelect} />
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => selectedFormat && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragging ? "bg-sayo-cream border-sayo-cafe" : "hover:bg-muted/50"}`}
            >
              <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? "text-sayo-cafe" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium">{fileName || "Arrastra tu archivo aqui"}</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, TXT — Max 10MB</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleUpload} className="bg-sayo-cafe hover:bg-sayo-cafe-light">
              Cargar y Validar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview del Archivo</DialogTitle>
            <DialogDescription>Revisa los registros antes de procesar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Archivo:</span>
                <span className="text-xs font-medium">{fileName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Formato:</span>
                <Badge variant="outline">{formats.find((f) => f.id === selectedFormat)?.name || "N/A"}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Registros encontrados:</span>
                <span className="font-semibold">{parsedRecords.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monto total:</span>
                <span className="font-semibold tabular-nums">${parsedRecords.filter((r) => r.valid).reduce((s, r) => s + r.amount, 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Validación</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="size-3.5 text-green-600" />
                  <span>{parsedRecords.filter((r) => r.valid).length} registros válidos</span>
                </div>
                {parsedRecords.some((r) => !r.valid) && (
                  <div className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="size-3.5 text-orange-500" />
                    <span className="text-orange-600">{parsedRecords.filter((r) => !r.valid).length} registros con errores</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg border max-h-40 overflow-y-auto">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Muestra de Registros</p>
              <div className="space-y-1 text-xs font-mono">
                {parsedRecords.slice(0, 5).map((r, i) => (
                  <p key={i} className={r.valid ? "" : "text-red-500"}>
                    {i + 1}. {r.beneficiary || "—"} | {r.clabe || "—"} | ${r.amount.toLocaleString("es-MX")} {!r.valid && `⚠ ${r.error}`}
                  </p>
                ))}
                {parsedRecords.length > 5 && <p className="text-muted-foreground">... {parsedRecords.length - 5} registros más</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleProcess} className="bg-accent-green hover:bg-accent-green/90 text-white" disabled={parsedRecords.filter((r) => r.valid).length === 0}>
              <CheckCircle className="size-3.5 mr-1" /> Procesar {parsedRecords.filter((r) => r.valid).length} Registros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Importación</DialogTitle>
            <DialogDescription>{selectedImport?.id}</DialogDescription>
          </DialogHeader>
          {selectedImport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(selectedImport.status)}`}>
                  {selectedImport.status}
                </span>
                <Badge variant="outline" className="text-[10px]">{selectedImport.format}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Archivo</p>
                  <p className="text-xs font-medium">{selectedImport.filename}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Registros</p>
                  <p className="font-semibold">{selectedImport.records}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Exitosos</p>
                  <p className="font-semibold text-green-600">{selectedImport.success}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Con Error</p>
                  <p className="font-semibold text-red-500">{selectedImport.errors}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Monto Total</p>
                  <p className="font-semibold tabular-nums">{selectedImport.totalAmount > 0 ? `$${(selectedImport.totalAmount / 1000000).toFixed(2)}M` : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Subido por</p>
                  <p>{selectedImport.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                  <p>{selectedImport.date}</p>
                </div>
              </div>
              {selectedImport.errors > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-[10px] font-semibold text-red-700 uppercase mb-1">Errores Encontrados</p>
                  <div className="space-y-1 text-xs text-red-600">
                    <p>Reg. 45: CLABE invalida (digito verificador incorrecto)</p>
                    <p>Reg. 89: Monto excede limite diario</p>
                    {selectedImport.errors > 2 && <p>... {selectedImport.errors - 2} errores mas</p>}
                  </div>
                </div>
              )}
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
