"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-sayo-cream">
      <div className="text-center space-y-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-sayo-cafe text-white font-bold text-2xl shadow-lg mx-auto">
          S
        </div>
        <p className="text-sm text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}
