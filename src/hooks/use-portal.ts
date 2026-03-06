"use client"

import { usePathname } from "next/navigation"
import { portals } from "@/lib/portals"
import type { PortalConfig, PortalId } from "@/lib/types"

export function usePortal(): PortalConfig | undefined {
  const pathname = usePathname()

  const portalId = pathname.split("/").filter(Boolean)[0] as PortalId | undefined
  if (!portalId) return undefined

  return portals.find((p) => p.id === portalId)
}

export function useActiveNav(): string {
  const pathname = usePathname()
  return pathname
}
