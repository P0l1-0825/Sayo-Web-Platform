"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney, formatClabe, getStatusColor } from "@/lib/utils"
import { Eye, Lock, Unlock } from "lucide-react"

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

const cuentas: CuentaSayo[] = [
  { id: "CTA-001", clabe: "64618000123456789", titular: "Juan Pérez García", tipo: "Cuenta SAYO", saldo: 47250.80, saldoRetenido: 0, status: "activa", apertura: "2023-06-15", ultimoMov: "2024-03-06" },
  { id: "CTA-002", clabe: "64618000987654321", titular: "María López Fernández", tipo: "Cuenta SAYO", saldo: 125000.00, saldoRetenido: 25000, status: "activa", apertura: "2023-04-01", ultimoMov: "2024-03-05" },
  { id: "CTA-003", clabe: "64618000111222333", titular: "Empresa ABC S.A. de C.V.", tipo: "Cuenta Empresarial", saldo: 890000.00, saldoRetenido: 0, status: "activa", apertura: "2023-07-20", ultimoMov: "2024-03-06" },
  { id: "CTA-004", clabe: "64618000444555666", titular: "Tech Solutions MX", tipo: "Cuenta Empresarial", saldo: 2340000.00, saldoRetenido: 100000, status: "bloqueada", apertura: "2023-05-10", ultimoMov: "2024-03-04" },
  { id: "CTA-005", clabe: "64618000777888999", titular: "Carlos Ruiz Méndez", tipo: "Cuenta SAYO", saldo: 0, saldoRetenido: 0, status: "inactiva", apertura: "2023-08-01", ultimoMov: "2024-01-15" },
  { id: "CTA-006", clabe: "64618000101010101", titular: "Ana Torres Vega", tipo: "Cuenta SAYO", saldo: 18500.50, saldoRetenido: 0, status: "activa", apertura: "2023-09-12", ultimoMov: "2024-03-06" },
]

const columns: ColumnDef<CuentaSayo>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "clabe", header: "CLABE", cell: ({ row }) => <span className="font-mono text-xs">{row.original.clabe}</span> },
  { accessorKey: "titular", header: "Titular" },
  { accessorKey: "tipo", header: "Tipo", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.tipo}</Badge> },
  { accessorKey: "saldo", header: "Saldo", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.saldo)}</span> },
  { accessorKey: "saldoRetenido", header: "Retenido", cell: ({ row }) => row.original.saldoRetenido > 0 ? <span className="tabular-nums text-sayo-orange">{formatMoney(row.original.saldoRetenido)}</span> : <span className="text-muted-foreground">—</span> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(row.original.status)}`}>{row.original.status}</span> },
  { accessorKey: "ultimoMov", header: "Últ. Movimiento", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.ultimoMov}</span> },
  {
    id: "actions", header: "",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs"><Eye className="size-3.5" /></Button>
        {row.original.status === "bloqueada" ? (
          <Button variant="ghost" size="icon-xs"><Unlock className="size-3.5 text-sayo-green" /></Button>
        ) : (
          <Button variant="ghost" size="icon-xs"><Lock className="size-3.5 text-sayo-orange" /></Button>
        )}
      </div>
    ),
  },
]

export default function CuentasPage() {
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
      />
    </div>
  )
}
