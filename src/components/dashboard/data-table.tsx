"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Download } from "lucide-react"
import { exportToCSV } from "@/lib/utils"

interface StatusTab {
  label: string
  value: string
  count?: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
  exportFilename?: string
  statusTabs?: StatusTab[]
  statusKey?: string
  onRowClick?: (row: TData) => void
  toolbar?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Buscar...",
  pageSize = 10,
  exportFilename,
  statusTabs,
  statusKey,
  onRowClick,
  toolbar,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [activeTab, setActiveTab] = React.useState("all")

  const filteredData = React.useMemo(() => {
    if (!statusKey || activeTab === "all") return data
    return data.filter((row) => {
      const val = (row as Record<string, unknown>)[statusKey]
      return val === activeTab
    })
  }, [data, statusKey, activeTab])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize } },
  })

  const handleExport = () => {
    if (!exportFilename) return
    const rows = table.getFilteredRowModel().rows.map((r) => r.original as Record<string, unknown>)
    exportToCSV(rows, exportFilename)
  }

  return (
    <div className="space-y-3">
      {/* Status Tabs */}
      {statusTabs && (
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeTab === "all"
                ? "bg-sayo-cafe text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todos ({data.length})
          </button>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeTab === tab.value
                  ? "bg-sayo-cafe text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}
        </div>
      )}

      {/* Search + Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {searchKey && (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-9 h-9 text-sm"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {toolbar}
          {exportFilename && (
            <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5">
              <Download className="size-3.5" />
              CSV
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-9"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`text-sm ${onRowClick ? "cursor-pointer hover:bg-muted/30" : ""}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} resultado(s)
          {activeTab !== "all" && statusTabs && (
            <Badge variant="outline" className="ml-2 text-[10px]">
              Filtro: {statusTabs.find((t) => t.value === activeTab)?.label}
            </Badge>
          )}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="size-8 p-0">
            <ChevronsLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="size-8 p-0">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="size-8 p-0">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="size-8 p-0">
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
