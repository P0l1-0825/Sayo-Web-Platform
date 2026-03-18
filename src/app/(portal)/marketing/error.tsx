"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"

export default function PortalSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-red-100 mx-auto">
          <AlertTriangle className="size-7 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">Error en Marketing</h2>
          <p className="text-sm text-muted-foreground">
            Ocurrió un error al cargar esta sección. Puedes reintentar o volver atrás.
          </p>
          {error?.message && (
            <details className="mt-3 text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Detalles del error
              </summary>
              <pre className="text-xs text-red-600 bg-red-50 rounded-lg p-3 mt-2 overflow-auto max-h-32 whitespace-pre-wrap break-all">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="size-3.5 mr-1.5" />
            Reintentar
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="size-3.5 mr-1.5" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  )
}
