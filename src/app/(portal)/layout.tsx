"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { usePortal } from "@/hooks/use-portal"
import { redirect } from "next/navigation"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const portal = usePortal()

  if (!portal) {
    redirect("/login")
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
