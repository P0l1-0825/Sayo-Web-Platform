"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
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
import { formatMoney, getStatusColor, copyToClipboard, formatClabe } from "@/lib/utils"
import { Eye, Lock, Unlock, Copy, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface CuentaSayo {
  id: string
  clabe: string
  titular: string
  tipo: string
  saldo: number
  saldoRetenido: number
  status: string
  apertura: string
  ultimoMov: string
}

const initialCuentas: CuentaSayo[] = [
  { id: "CTA-001", clabe: "64618000123456789", titular: "Juan Pérez García", tipo: "Cuenta SAYO", saldo: 47250.80, saldoRetenido: 0, status: "activa", apertura: "2023-06-15", ultimoMov: "2024-03-06" },
  { id: "CTA-002", clabe: "64618000987654321", titular: "María López Fernández", tipo: "Cuenta SAYO", saldo: 125000.00, saldoRetenido: 25000, status: "activa", apertura: "2023-04-01", ultimoMov: "2024-03-05" },
  { id: "CTA-003", clabe: "64618000111222333", titular: "Empresa ABC S.A. de C.V.", tipo: "Cuenta Empresarial", saldo: 890000.00, saldoRetenido: 0, status: "activa", apertura: "2023-07-20", ultimoMov: "2024-03-06" },
  { id: "CTA-004", clabe: "64618000444555666", titular: "Tech Solutions MX", tipo: "Cuenta Empresarial", saldo: 2340000.00, saldoRetenido: 100000, status: "bloqueada", apertura: "2023-05-10", ultimoMov: "2024-03-04" },
  { id: "CTA-005", clabe: "64618000777888999", titular: "Carlos Ruiz Méndez", tipo: "Cuenta SAYO", saldo: 0, saldoRetenido: 0, status: "inactiva", apertura: "2023-08-01", ultimoMov: "2024-01-15" },
  { id: "CTA-006", clabe: "64618000101010101", titular: "Ana Torres Vega", tipo: "Cuenta SAYO", saldo: 18500.50, saldoRetenido: 0, status: "activa", apertura: "2023-09-12", ultimoMov: "2024-03-06" },
]

export default function CuentasPage() {
  const [cuentas, setCuentas] = React.useState(initialCuentas)
  const [selectedCta, setSelectedCta] = React.useState<CuentaSayo | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [lockOpen, setLockOpen] = React.useState(false)
  const [lockAction, setLockAction] = React.useState<"lock" | "unlock">("lock")

  const handleView = (cta: CuentaSayo) => {
    setSelectedCta(cta)
    setDetailOpen(true)
  }

  const handleLockAction = (cta: CuentaSayo, action: "lock" | "unlock") => {
    setSelectedCta(cta)
    setLockAction(action)
    setLockOpen(true)
  }

  const confirmLock = () => {
    if (!selectedCta) return
    const newStatus = lockAction === "lock" ? "bloqueada" : "activa"
    setCuentas((prev) =>
      prev.map((c) => (c.id === selectedCta.id ? { ...c, status: newStatus } : c))
    )
    setLockOpen(false)
    toast.success(
      lockAction === "lock" ? "Cuenta bloqueada" : "Cuenta desbloqueada",
      { description: `${selectedCta.id} — ${selectedCta.titular}` }
    )
  }

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text)
    if (ok) toast.success(`${label} copiada`, { description: text })
  }

  const statusTabs = [
    { label: "Activa", value: "activa", count: cuentas.filter((c) => c.status === "activa").length },
    { label: "Bloqueada", value: "bloqueada", count: cuentas.filter((c) => c.status === "bloqueada").length },
    { label: "Inactiva", value: "inactiva", count: cuentas.filter((c) => c.status === "inactiva").length },
  ]

  const columns: ColumnDef<CuentaSayo>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: "clabe",
      header: "CLABE",
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(row.original.clabe, "CLABE") }}
          className="font-mono text-xs hover:text-sayo-cafe transition-colors flex items-center gap-1 group"
        >
          {row.original.clabe}
          <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
    },
    { accessorKey: "titular", header: "Titular" },
    { accessorKey: "tipo", header: "Tipo", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.tipo}</Badge> },
    { accessorKey: "saldo", header: "Saldo", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.saldo)}</span> },
    {
      accessorKey: "saldoRetenido",
      header: "Retenido",
      cell: ({ row }) => row.original.saldoRetenido > 0
        ? <span className="tabular-nums text-sayo-orange">{formatMoney(row.original.saldoRetenido)}</span>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
    { accessorKey: "ultimoMov", header: "Últ. Movimiento", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.ultimoMov}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleView(row.original) }} title="Ver detalle">
            <Eye className="size-3.5" />
          </Button>
          {row.original.status === "bloqueada" ? (
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleLockAction(row.original, "unlock") }} title="Desbloquear">
              <Unlock className="size-3.5 text-sayo-green" />
            </Button>
          ) : row.original.status === "activa" ? (
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleLockAction(row.original, "lock") }} title="Bloquear">
              <Lock className="size-3.5 text-sayo-orange" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cuentas</h1>
        <p className="text-sm text-muted-foreground">Cuentas SAYO — saldos, bloqueos y estatus</p>
      </div>

      <DataTable
        columns={columns}
        data={cuentas}
        searchKey="titular"
        searchPlaceholder="Buscar por titular..."
        exportFilename="cuentas_sayo"
        statusTabs={statusTabs}
        statusKey="status"
        onRowClick={handleView}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Cuenta</DialogTitle>
            <DialogDescription>{selectedCta?.id} — {selectedCta?.titular}</DialogDescription>
          </DialogHeader>
          {selectedCta && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedCta.status)}`}>
                  {selectedCta.status}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedCta.saldo)}</p>
                  <Badge variant="outline" className="text-[10px]">{selectedCta.tipo}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Titular</p>
                  <p className="font-medium">{selectedCta.titular}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">CLABE</p>
                  <button onClick={() => handleCopy(selectedCta.clabe, "CLABE")} className="font-mono text-sm flex items-center gap-1 hover:text-sayo-cafe">
                    {formatClabe(selectedCta.clabe)} <Copy className="size-3" />
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Retenido</p>
                  <p className={`font-semibold ${selectedCta.saldoRetenido > 0 ? "text-sayo-orange" : ""}`}>
                    {selectedCta.saldoRetenido > 0 ? formatMoney(selectedCta.saldoRetenido) : "Sin retenciones"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Disponible</p>
                  <p className="font-semibold text-sayo-green">{formatMoney(selectedCta.saldo - selectedCta.saldoRetenido)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Apertura</p>
                  <p>{selectedCta.apertura}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Último Movimiento</p>
                  <p>{selectedCta.ultimoMov}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedCta?.status === "activa" && (
              <Button variant="outline" size="sm" className="text-sayo-orange" onClick={() => { setDetailOpen(false); handleLockAction(selectedCta, "lock") }}>
                <Lock className="size-3.5 mr-1" /> Bloquear
              </Button>
            )}
            {selectedCta?.status === "bloqueada" && (
              <Button variant="outline" size="sm" className="text-sayo-green" onClick={() => { setDetailOpen(false); handleLockAction(selectedCta, "unlock") }}>
                <Unlock className="size-3.5 mr-1" /> Desbloquear
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock/Unlock Confirmation */}
      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-sayo-orange" />
              {lockAction === "lock" ? "Bloquear Cuenta" : "Desbloquear Cuenta"}
            </DialogTitle>
            <DialogDescription>
              {lockAction === "lock"
                ? "La cuenta será bloqueada y no podrá realizar operaciones. ¿Continuar?"
                : "La cuenta será desbloqueada y podrá operar normalmente. ¿Continuar?"}
            </DialogDescription>
          </DialogHeader>
          {selectedCta && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cuenta:</span>
                <span className="font-mono text-xs">{selectedCta.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Titular:</span>
                <span className="font-medium">{selectedCta.titular}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo:</span>
                <span className="font-semibold">{formatMoney(selectedCta.saldo)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              variant={lockAction === "lock" ? "destructive" : "default"}
              onClick={confirmLock}
            >
              {lockAction === "lock" ? <Lock className="size-3.5 mr-1" /> : <Unlock className="size-3.5 mr-1" />}
              {lockAction === "lock" ? "Bloquear" : "Desbloquear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
