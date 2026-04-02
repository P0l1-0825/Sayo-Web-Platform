"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatMoney, getStatusColor, copyToClipboard, formatClabe } from "@/lib/utils"
import {
  Eye, Lock, Unlock, Copy, AlertTriangle, RefreshCw, Plus,
  Building2, Wallet, ArrowLeftRight, CheckCircle2, XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { concentradoraService, type ConcentradoraInfo, type SubcuentaRecord } from "@/lib/concentradora-service"

// ─── Status tab helpers ───────────────────────────────────────

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    active:   "Activa",
    blocked:  "Bloqueada",
    inactive: "Inactiva",
    closed:   "Cerrada",
  }
  return map[s] ?? s
}

// ─── Component ───────────────────────────────────────────────

export default function CuentasPage() {
  // ── Concentradora state ─────────────────────────────────────
  const [concentradora, setConcentradora] = React.useState<ConcentradoraInfo | null>(null)
  const [loadingConc,   setLoadingConc]   = React.useState(true)

  // ── Subcuentas state ────────────────────────────────────────
  const [subcuentas,    setSubcuentas]    = React.useState<SubcuentaRecord[]>([])
  const [totalSubc,     setTotalSubc]     = React.useState(0)
  const [loadingSubc,   setLoadingSubc]   = React.useState(true)

  // ── UI state ────────────────────────────────────────────────
  const [selectedSubc,  setSelectedSubc]  = React.useState<SubcuentaRecord | null>(null)
  const [detailOpen,    setDetailOpen]    = React.useState(false)
  const [lockOpen,      setLockOpen]      = React.useState(false)
  const [lockAction,    setLockAction]    = React.useState<"lock" | "unlock">("lock")
  const [createOpen,    setCreateOpen]    = React.useState(false)
  const [syncLoading,   setSyncLoading]   = React.useState(false)

  // ── Create subcuenta form state ─────────────────────────────
  const [newFullName,   setNewFullName]   = React.useState("")
  const [newUserId,     setNewUserId]     = React.useState("")
  const [creating,      setCreating]      = React.useState(false)

  // ── Load concentradora info ─────────────────────────────────
  const loadConcentradora = React.useCallback(async () => {
    setLoadingConc(true)
    try {
      const data = await concentradoraService.getConcentradora()
      setConcentradora(data)
    } catch (err) {
      toast.error("Error al cargar la concentradora", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingConc(false)
    }
  }, [])

  // ── Load subcuentas ─────────────────────────────────────────
  const loadSubcuentas = React.useCallback(async () => {
    setLoadingSubc(true)
    try {
      const result = await concentradoraService.getSubcuentas({ limit: 200 })
      setSubcuentas(result.data)
      setTotalSubc(result.total)
    } catch (err) {
      toast.error("Error al cargar subcuentas", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingSubc(false)
    }
  }, [])

  React.useEffect(() => {
    loadConcentradora()
    loadSubcuentas()
  }, [loadConcentradora, loadSubcuentas])

  // ── Handlers ────────────────────────────────────────────────

  const handleView = (s: SubcuentaRecord) => {
    setSelectedSubc(s)
    setDetailOpen(true)
  }

  const handleLockAction = (s: SubcuentaRecord, action: "lock" | "unlock") => {
    setSelectedSubc(s)
    setLockAction(action)
    setLockOpen(true)
  }

  const confirmLock = async () => {
    if (!selectedSubc) return
    // In real mode, this would call PATCH /api/v1/banking/accounts/:id
    // For now, update local state and show toast
    const newStatus = lockAction === "lock" ? "blocked" : "active"
    setSubcuentas((prev) =>
      prev.map((s) => (s.id === selectedSubc.id ? { ...s, status: newStatus } : s))
    )
    setLockOpen(false)
    toast.success(
      lockAction === "lock" ? "Subcuenta bloqueada" : "Subcuenta desbloqueada",
      { description: `${selectedSubc.sayo_id} — ${selectedSubc.profiles?.full_name ?? "Sin titular"}` }
    )
  }

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text)
    if (ok) toast.success(`${label} copiada`, { description: text })
  }

  const handleSyncBalance = async () => {
    setSyncLoading(true)
    try {
      const result = await concentradoraService.syncBalance()
      if (concentradora) {
        setConcentradora({ ...concentradora, balance_opm: result.balance_opm })
      }
      toast.success("Balance sincronizado", {
        description: result.is_reconciled
          ? "OPM y local están en balance"
          : `Diferencia: ${formatMoney(result.balance_diff)}`,
      })
    } catch (err) {
      toast.error("Error al sincronizar balance", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setSyncLoading(false)
    }
  }

  const handleCreateSubcuenta = async () => {
    if (!newFullName.trim()) {
      toast.error("Nombre requerido", { description: "Ingresa el nombre completo del titular" })
      return
    }
    setCreating(true)
    try {
      const created = await concentradoraService.createSubcuenta({
        full_name: newFullName.trim(),
        user_id:   newUserId.trim() || undefined,
      })
      toast.success("Subcuenta creada", {
        description: `CLABE: ${formatClabe(created.clabe)} — N° ${created.subcuenta_number}`,
      })
      setCreateOpen(false)
      setNewFullName("")
      setNewUserId("")
      await loadSubcuentas()
      await loadConcentradora()
    } catch (err) {
      toast.error("Error al crear subcuenta", {
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setCreating(false)
    }
  }

  // ── Status tabs ─────────────────────────────────────────────
  const statusTabs = [
    { label: "Activa",    value: "active",   count: subcuentas.filter((s) => s.status === "active").length },
    { label: "Bloqueada", value: "blocked",  count: subcuentas.filter((s) => s.status === "blocked").length },
    { label: "Inactiva",  value: "inactive", count: subcuentas.filter((s) => s.status === "inactive").length },
  ]

  // ── Table columns ────────────────────────────────────────────
  const columns: ColumnDef<SubcuentaRecord>[] = [
    {
      accessorKey: "sayo_id",
      header: "SAYO ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.sayo_id ?? "—"}
        </span>
      ),
    },
    {
      id: "titular",
      header: "Titular",
      accessorFn: (row) => row.profiles?.full_name ?? "Sin asignar",
      cell: ({ row }) => (
        <span className={row.original.profiles ? "" : "italic text-muted-foreground"}>
          {row.original.profiles?.full_name ?? "Sin asignar"}
        </span>
      ),
    },
    {
      accessorKey: "clabe",
      header: "CLABE",
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(row.original.clabe, "CLABE") }}
          className="font-mono text-xs hover:text-sayo-cafe transition-colors flex items-center gap-1 group"
        >
          {formatClabe(row.original.clabe)}
          <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
    },
    {
      accessorKey: "subcuenta_number",
      header: "Subcuenta #",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.subcuenta_number ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Saldo",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatMoney(row.original.balance)}
        </span>
      ),
    },
    {
      accessorKey: "hold_amount",
      header: "Retenido",
      cell: ({ row }) =>
        row.original.hold_amount > 0 ? (
          <span className="tabular-nums text-sayo-orange">
            {formatMoney(row.original.hold_amount)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(row.original.status)}`}>
          {statusLabel(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Últ. Movimiento",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.updated_at).toLocaleDateString("es-MX")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost" size="icon-xs"
            onClick={(e) => { e.stopPropagation(); handleView(row.original) }}
            title="Ver detalle"
          >
            <Eye className="size-3.5" />
          </Button>
          {row.original.status === "blocked" ? (
            <Button
              variant="ghost" size="icon-xs"
              onClick={(e) => { e.stopPropagation(); handleLockAction(row.original, "unlock") }}
              title="Desbloquear"
            >
              <Unlock className="size-3.5 text-sayo-green" />
            </Button>
          ) : row.original.status === "active" ? (
            <Button
              variant="ghost" size="icon-xs"
              onClick={(e) => { e.stopPropagation(); handleLockAction(row.original, "lock") }}
              title="Bloquear"
            >
              <Lock className="size-3.5 text-sayo-orange" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Cuentas</h1>
          <p className="text-sm text-muted-foreground">
            Concentradora Solvendom — subcuentas virtuales SPEI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={handleSyncBalance}
            disabled={syncLoading}
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${syncLoading ? "animate-spin" : ""}`} />
            Sincronizar OPM
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5 mr-1.5" />
            Nueva Subcuenta
          </Button>
        </div>
      </div>

      {/* Concentradora card */}
      {loadingConc ? (
        <Card className="animate-pulse">
          <CardContent className="p-6 h-32" />
        </Card>
      ) : concentradora ? (
        <Card className="border-sayo-cafe/20 bg-gradient-to-br from-sayo-cafe/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-sayo-cafe" />
              <CardTitle className="text-base">Cuenta Concentradora</CardTitle>
              <Badge variant="outline" className="text-[10px] ml-auto">
                {concentradora.status === "active" ? "Activa" : concentradora.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Identity row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Razón Social</p>
                <p className="text-sm font-semibold leading-tight">{concentradora.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RFC</p>
                <p className="text-sm font-mono">{concentradora.rfc}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CLABE Maestra</p>
                <button
                  onClick={() => handleCopy(concentradora.clabe, "CLABE")}
                  className="font-mono text-sm flex items-center gap-1 hover:text-sayo-cafe transition-colors"
                >
                  {formatClabe(concentradora.clabe)}
                  <Copy className="size-3" />
                </button>
              </div>
            </div>

            {/* Balance row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-sayo-cafe" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo OPM</p>
                  <p className="text-lg font-bold tabular-nums">{formatMoney(concentradora.balance_opm)}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Saldo Local</p>
                <p className="text-lg font-bold tabular-nums">{formatMoney(concentradora.balance_local)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Diferencia</p>
                <p className={`text-lg font-bold tabular-nums ${Math.abs(concentradora.balance_diff) > 0.01 ? "text-sayo-orange" : "text-sayo-green"}`}>
                  {concentradora.balance_diff === 0 ? "—" : formatMoney(concentradora.balance_diff)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="size-3.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase">Subcuentas</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs font-semibold">{concentradora.total_subcuentas.toLocaleString()} total</span>
                  <span className="text-xs text-sayo-green">{concentradora.active_subcuentas} activas</span>
                  {concentradora.blocked_subcuentas > 0 && (
                    <span className="text-xs text-sayo-orange">{concentradora.blocked_subcuentas} bloqueadas</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reconciliation status */}
            <div className="flex items-center gap-2 pt-1">
              {Math.abs(concentradora.balance_diff) < 0.01 ? (
                <>
                  <CheckCircle2 className="size-4 text-sayo-green" />
                  <span className="text-xs text-sayo-green">Balances conciliados</span>
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-sayo-orange" />
                  <span className="text-xs text-sayo-orange">
                    Diferencia de {formatMoney(Math.abs(concentradora.balance_diff))} — requiere conciliación
                  </span>
                </>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                Actualizado: {new Date(concentradora.updated_at).toLocaleString("es-MX")}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Subcuentas table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Subcuentas Virtuales — {totalSubc.toLocaleString()} registros
          </h2>
        </div>
        {loadingSubc ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3 h-12" />
              </Card>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={subcuentas}
            searchKey="titular"
            searchPlaceholder="Buscar por titular, CLABE o subcuenta..."
            exportFilename="subcuentas_solvendom"
            statusTabs={statusTabs}
            statusKey="status"
            onRowClick={handleView}
          />
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Subcuenta</DialogTitle>
            <DialogDescription>
              {selectedSubc?.sayo_id} — Subcuenta N° {selectedSubc?.subcuenta_number}
            </DialogDescription>
          </DialogHeader>
          {selectedSubc && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedSubc.status)}`}>
                  {statusLabel(selectedSubc.status)}
                </span>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">{formatMoney(selectedSubc.balance)}</p>
                  <p className="text-xs text-muted-foreground">
                    Disponible: {formatMoney(selectedSubc.available_balance)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Titular</p>
                  <p className="font-medium">
                    {selectedSubc.profiles?.full_name ?? <span className="italic text-muted-foreground">Sin asignar</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">SAYO ID</p>
                  <p className="font-mono text-xs">{selectedSubc.sayo_id ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">CLABE</p>
                  <button onClick={() => handleCopy(selectedSubc.clabe, "CLABE")} className="font-mono text-xs flex items-center gap-1 hover:text-sayo-cafe">
                    {formatClabe(selectedSubc.clabe)} <Copy className="size-3" />
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Subcuenta #</p>
                  <p className="font-mono text-xs">{selectedSubc.subcuenta_number ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Saldo Retenido</p>
                  <p className={`font-semibold ${selectedSubc.hold_amount > 0 ? "text-sayo-orange" : ""}`}>
                    {selectedSubc.hold_amount > 0 ? formatMoney(selectedSubc.hold_amount) : "Sin retenciones"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Fecha Apertura</p>
                  <p>{new Date(selectedSubc.created_at).toLocaleDateString("es-MX")}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedSubc?.status === "active" && (
              <Button
                variant="outline" size="sm" className="text-sayo-orange"
                onClick={() => { setDetailOpen(false); handleLockAction(selectedSubc, "lock") }}
              >
                <Lock className="size-3.5 mr-1" /> Bloquear
              </Button>
            )}
            {selectedSubc?.status === "blocked" && (
              <Button
                variant="outline" size="sm" className="text-sayo-green"
                onClick={() => { setDetailOpen(false); handleLockAction(selectedSubc, "unlock") }}
              >
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
              {lockAction === "lock" ? "Bloquear Subcuenta" : "Desbloquear Subcuenta"}
            </DialogTitle>
            <DialogDescription>
              {lockAction === "lock"
                ? "La subcuenta será bloqueada y no podrá recibir ni enviar fondos. ¿Continuar?"
                : "La subcuenta será desbloqueada y podrá operar normalmente. ¿Continuar?"}
            </DialogDescription>
          </DialogHeader>
          {selectedSubc && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SAYO ID:</span>
                <span className="font-mono text-xs">{selectedSubc.sayo_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Titular:</span>
                <span className="font-medium">{selectedSubc.profiles?.full_name ?? "Sin asignar"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo:</span>
                <span className="font-semibold">{formatMoney(selectedSubc.balance)}</span>
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

      {/* Create Subcuenta Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!creating) { setCreateOpen(open); if (!open) { setNewFullName(""); setNewUserId("") } } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Subcuenta Virtual</DialogTitle>
            <DialogDescription>
              Se generará una CLABE 684180297007XXXXXD bajo la concentradora Solvendom.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Nombre completo del titular *</Label>
              <Input
                id="full-name"
                placeholder="Ej. Juan Pérez García"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-id">User ID (UUID) — opcional</Label>
              <Input
                id="user-id"
                placeholder="Dejar vacío si aún no tiene usuario"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                disabled={creating}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Si se proporciona, la subcuenta se vincula al perfil del usuario.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={creating} />}>Cancelar</DialogClose>
            <Button onClick={handleCreateSubcuenta} disabled={creating || !newFullName.trim()}>
              {creating ? (
                <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Plus className="size-3.5 mr-1.5" />
              )}
              {creating ? "Creando..." : "Crear Subcuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
