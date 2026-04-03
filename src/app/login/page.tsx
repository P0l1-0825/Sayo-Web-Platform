"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()

  // Stable ref to login function — never changes between renders
  const loginRef = React.useRef(auth.login)
  loginRef.current = auth.login

  // Stable callback that React.memo can trust
  const stableLogin = React.useCallback(
    (email: string, password: string) => loginRef.current(email, password),
    []
  )

  // Redirect if already authenticated
  React.useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      router.push(auth.user.role === "L6_SUPERADMIN" ? "/portals" : `/${auth.user.portal}`)
    }
  }, [auth.isAuthenticated, auth.user, router])

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return <LoginForm onLogin={stableLogin} />
}
