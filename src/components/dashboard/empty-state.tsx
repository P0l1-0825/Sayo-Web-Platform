"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Inbox, RefreshCw } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mx-auto">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-sm">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
            <RefreshCw className="size-3.5 mr-1.5" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
