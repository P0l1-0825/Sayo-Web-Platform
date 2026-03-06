"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn, formatMoney, formatMoneyCompact } from "@/lib/utils"
import type { StatCardData } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  data: StatCardData
  className?: string
}

export function StatCard({ data, className }: StatCardProps) {
  const displayValue =
    data.format === "currency" && typeof data.value === "number"
      ? formatMoneyCompact(data.value)
      : data.value

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {data.title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{displayValue}</p>
            {data.change !== undefined && (
              <div className="flex items-center gap-1">
                {data.trend === "up" ? (
                  <TrendingUp className="size-3.5 text-sayo-green" />
                ) : data.trend === "down" ? (
                  <TrendingDown className="size-3.5 text-sayo-red" />
                ) : (
                  <Minus className="size-3.5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    data.trend === "up" && "text-sayo-green",
                    data.trend === "down" && "text-sayo-red",
                    data.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {data.change > 0 ? "+" : ""}{data.change}%
                </span>
                {data.changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {data.changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
