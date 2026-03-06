"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, timeAgo } from "@/lib/utils"
import type { ActivityItem } from "@/lib/types"
import { CheckCircle, AlertTriangle, XCircle, Info, Clock } from "lucide-react"

interface ActivityFeedProps {
  title?: string
  items: ActivityItem[]
  className?: string
}

const statusConfig = {
  success: { icon: CheckCircle, color: "text-sayo-green", bg: "bg-green-50" },
  warning: { icon: AlertTriangle, color: "text-sayo-orange", bg: "bg-orange-50" },
  error: { icon: XCircle, color: "text-sayo-red", bg: "bg-red-50" },
  info: { icon: Info, color: "text-sayo-blue", bg: "bg-blue-50" },
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
}

export function ActivityFeed({ title = "Actividad Reciente", items, className }: ActivityFeedProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.map((item) => {
          const config = statusConfig[item.status || "info"]
          const Icon = config.icon
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", config.bg)}>
                <Icon className={cn("size-3.5", config.color)} />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <p className="text-[10px] text-muted-foreground/70">{timeAgo(item.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
