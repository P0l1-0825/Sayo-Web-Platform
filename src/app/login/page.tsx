"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()

  // Stable refs to prevent React.memo invalidation
  const loginRef = React.useRef(auth.login)
  loginRef.current = auth.login
  const verifyMfaRef = React.useRef(auth.verifyMfa)
  verifyMfaRef.current = auth.verifyMfa

  const stableLogin = React.useCallback(
    (email: string, password: string) => loginRef.current(email, password),
    []
  )
  const stableVerifyMfa = React.useCallback(
    (factorId: string, code: string) => verifyMfaRef.current(factorId, code),
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

  return <LoginForm onLogin={stableLogin} onVerifyMfa={stableVerifyMfa} />
}
