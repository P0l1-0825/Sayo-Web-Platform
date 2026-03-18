// ============================================================
// SAYO — Dashboard Skeleton Components
// ============================================================
// Composable skeletons for common dashboard layouts.
// ============================================================

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/** Skeleton for a single stat card */
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  )
}

/** Skeleton grid of 4 stat cards (most common dashboard header) */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Skeleton for a chart card */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

/** Skeleton for a data table */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Header row */}
        <div className="flex gap-4 py-2">
          {[80, 120, 100, 60, 80].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-t border-border/50">
            {[80, 120, 100, 60, 80].map((w, j) => (
              <Skeleton key={j} className="h-3" style={{ width: w + Math.random() * 20 }} />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** Full dashboard skeleton: stats + charts + table */
export function DashboardSkeleton({
  variant = "full",
}: {
  variant?: "full" | "stats-and-table" | "stats-only" | "table-only"
}) {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <Skeleton className="h-6 w-48 mb-1" />
        <Skeleton className="h-3 w-72" />
      </div>

      {/* Stat cards */}
      {variant !== "table-only" && <StatCardsSkeleton />}

      {/* Charts */}
      {variant === "full" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartSkeleton className="lg:col-span-2" />
          <ChartSkeleton />
        </div>
      )}

      {/* Table */}
      {variant !== "stats-only" && <TableSkeleton />}
    </div>
  )
}
