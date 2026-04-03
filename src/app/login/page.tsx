"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === "L6_SUPERADMIN" ? "/portals" : `/${user.portal}`)
    }
  }, [isAuthenticated, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return <LoginForm onLogin={login} />
}
