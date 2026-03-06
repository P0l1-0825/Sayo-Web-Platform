"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { StatCard } from "@/components/dashboard/stat-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { DataTable } from "@/components/dashboard/data-table"
import { AreaChartComponent } from "@/components/charts/area-chart"
import { Badge } from "@/components/ui/badge"
import { mesaControlStats, transactionsTrend, transactions, mesaControlActivity } from "@/lib/mock-data"
import { formatMoney, getStatusColor } from "@/lib/utils"
import type { Transaction } from "@/lib/types"

const columns: ColumnDef<Transaction>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: "type", header: "Tipo", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.type}</Badge> },
  { accessorKey: "senderName", header: "Origen" },
  { accessorKey: "receiverName", header: "Destino" },
  { accessorKey: "amount", header: "Monto", cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(row.original.status)}`}>{row.original.status}</span> },
  { accessorKey: "hour", header: "Hora", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.hour}</span> },
]

export default function MesaControlDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Mesa de Control</h1>
        <p className="text-sm text-muted-foreground">Operaciones del día — {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mesaControlStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Transacciones 7 días" description="SPEI Entrada vs Salida" className="lg:col-span-2">
          <AreaChartComponent
            data={transactionsTrend}
            dataKey="spei_in"
            secondaryDataKey="spei_out"
            color="var(--chart-2)"
            secondaryColor="var(--chart-4)"
          />
        </ChartCard>
        <ActivityFeed items={mesaControlActivity} />
      </div>

      {/* Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Últimas Transacciones</h2>
        <DataTable columns={columns} data={transactions} searchKey="senderName" searchPlaceholder="Buscar por origen..." />
      </div>
    </div>
  )
}
