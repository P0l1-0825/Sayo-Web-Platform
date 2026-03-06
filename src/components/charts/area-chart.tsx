"use client"

import { Area, AreaChart as RechartsAreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ChartDataPoint } from "@/lib/types"
import { formatMoneyCompact } from "@/lib/utils"

interface AreaChartProps {
  data: ChartDataPoint[]
  dataKey?: string
  secondaryDataKey?: string
  height?: number
  color?: string
  secondaryColor?: string
  formatY?: "currency" | "number"
  showGrid?: boolean
}

export function AreaChartComponent({
  data,
  dataKey = "value",
  secondaryDataKey,
  height = 240,
  color = "var(--chart-1)",
  secondaryColor = "var(--chart-2)",
  formatY = "number",
  showGrid = true,
}: AreaChartProps) {
  const formatValue = (v: number) =>
    formatY === "currency" ? formatMoneyCompact(v) : v.toLocaleString("es-MX")

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [formatValue(Number(value)), ""]}
        />
        <defs>
          <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {secondaryDataKey && (
            <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill="url(#gradient1)"
        />
        {secondaryDataKey && (
          <Area
            type="monotone"
            dataKey={secondaryDataKey}
            stroke={secondaryColor}
            strokeWidth={2}
            fill="url(#gradient2)"
          />
        )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
