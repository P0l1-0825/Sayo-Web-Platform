"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { usePortal } from "@/hooks/use-portal"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const portal = usePortal()
  const { isAuthenticated, isLoading, user } = useAuth()

  // Auth guard: redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-sayo-cream">
        <div className="text-center space-y-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-sayo-cafe text-white font-bold text-2xl shadow-lg mx-auto">
            S
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated — will redirect via useEffect
  if (!isAuthenticated) {
    return null
  }

  // No portal found in URL
  if (!portal) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar portal={portal} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header portal={portal} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
