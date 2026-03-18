// ============================================================
// SAYO — Error Card Component
// ============================================================
// Reusable error display with optional retry button.
// ============================================================

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorCardProps {
  message: string
  onRetry?: () => void
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="p-6 text-center">
        <AlertCircle className="size-8 mx-auto mb-2 text-destructive" />
        <p className="text-sm text-destructive font-medium mb-1">Error al cargar datos</p>
        <p className="text-xs text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            <RefreshCw className="size-3.5 mr-1" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
