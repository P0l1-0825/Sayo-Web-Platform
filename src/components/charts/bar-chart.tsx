"use client"

import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ChartDataPoint } from "@/lib/types"
import { formatMoneyCompact } from "@/lib/utils"

interface BarChartProps {
  data: ChartDataPoint[]
  dataKey?: string
  secondaryDataKey?: string
  height?: number
  color?: string
  secondaryColor?: string
  formatY?: "currency" | "number"
  layout?: "horizontal" | "vertical"
}

export function BarChartComponent({
  data,
  dataKey = "value",
  secondaryDataKey,
  height = 240,
  color = "var(--chart-1)",
  secondaryColor = "var(--chart-2)",
  formatY = "number",
}: BarChartProps) {
  const formatValue = (v: number) =>
    formatY === "currency" ? formatMoneyCompact(v) : v.toLocaleString("es-MX")

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        {secondaryDataKey && (
          <Bar dataKey={secondaryDataKey} fill={secondaryColor} radius={[4, 4, 0, 0]} />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
