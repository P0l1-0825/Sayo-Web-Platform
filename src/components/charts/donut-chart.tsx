"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { ChartDataPoint } from "@/lib/types"

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#94A3B8",
  "#F59E0B",
  "#10B981",
]

interface DonutChartProps {
  data: ChartDataPoint[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showLabels?: boolean
}

export function DonutChartComponent({
  data,
  height = 240,
  innerRadius = 55,
  outerRadius = 85,
  showLegend = true,
}: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [Number(value).toLocaleString("es-MX"), ""]}
        />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px" }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
