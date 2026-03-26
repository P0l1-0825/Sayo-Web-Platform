"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

type PageState = "loading" | "form" | "success" | "error"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [pageState, setPageState] = React.useState<PageState>("loading")
  const [accessToken, setAccessToken] = React.useState<string | null>(null)
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")

  // On mount: extract the access_token from the URL hash fragment.
  // Supabase password-reset emails append #access_token=...&type=recovery
  // to whatever redirectTo URL was configured.
  React.useEffect(() => {
    const hash = window.location.hash
    if (!hash) {
      setErrorMsg(
        "El enlace de recuperación no es válido o ha expirado. Solicita un nuevo enlace desde la página de inicio de sesión."
      )
      setPageState("error")
      return
    }

    const params = new URLSearchParams(hash.replace(/^#/, ""))
    const token = params.get("access_token")
    const type = params.get("type")

    if (!token || type !== "recovery") {
      setErrorMsg(
        "El enlace de recuperación no es válido o ha expirado. Solicita un nuevo enlace desde la página de inicio de sesión."
      )
      setPageState("error")
      return
    }

    setAccessToken(token)
    setPageState("form")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.")
      return
    }

    if (!accessToken) {
      setErrorMsg("Token de acceso no disponible. Solicita un nuevo enlace.")
      return
    }

    setSubmitting(true)

    try {
      const supabase = getSupabase()
      if (!supabase) {
        setErrorMsg("Servicio no disponible. Inténtalo más tarde.")
        setSubmitting(false)
        return
      }

      // Set the session using the recovery token so updateUser works
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken,
      })

      if (sessionError) {
        // Token may be a one-time recovery token — try updateUser directly
        // (some Supabase versions accept it without setSession)
      }

      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setErrorMsg(
          error.message === "Auth session missing!"
            ? "El enlace ha expirado. Solicita un nuevo enlace de recuperación."
            : error.message
        )
        setSubmitting(false)
        return
      }

      setPageState("success")
    } catch {
      setErrorMsg("Ocurrió un error inesperado. Inténtalo de nuevo.")
      setSubmitting(false)
    }
  }

  // ── Shared logo header ─────────────────────────────────────────
  const Logo = () => (
    <div className="text-center space-y-4 mb-8">
      <div
        className="flex size-16 items-center justify-center rounded-2xl text-white font-bold text-3xl shadow-lg mx-auto"
        style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
      >
        S
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#472913" }}>
          SAYO
        </h1>
        <p className="text-sm text-muted-foreground">Plataforma Financiera Digital</p>
      </div>
    </div>
  )

  // ── Loading state ──────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="size-8 animate-spin" style={{ color: "#472913" }} />
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────
  if (pageState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4">
        <div className="w-full max-w-md">
          <Logo />
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex size-14 items-center justify-center rounded-full bg-red-50 mx-auto">
                <AlertCircle className="size-7 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Enlace no válido</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full text-white font-semibold h-11"
                style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
              >
                Ir a Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
          <p className="text-center text-[11px] text-muted-foreground mt-6">
            SOLVENDOM SOFOM E.N.R. | Regulado por CNBV
          </p>
        </div>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────
  if (pageState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4">
        <div className="w-full max-w-md">
          <Logo />
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div
                className="flex size-14 items-center justify-center rounded-full mx-auto"
                style={{ background: "#F0F9F4" }}
              >
                <CheckCircle className="size-7 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Contraseña actualizada</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full text-white font-semibold h-11"
                style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
              >
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
          <p className="text-center text-[11px] text-muted-foreground mt-6">
            SOLVENDOM SOFOM E.N.R. | Regulado por CNBV
          </p>
        </div>
      </div>
    )
  }

  // ── Form state ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4">
      <div className="w-full max-w-md">
        <Logo />

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-1 mb-6">
              <h2 className="text-lg font-semibold text-foreground">Nueva contraseña</h2>
              <p className="text-sm text-muted-foreground">
                Elige una contraseña segura de al menos 8 caracteres.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* New password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: "#C1B6AE" }}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-[11px] text-amber-600">Mínimo 8 caracteres</p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs font-medium text-foreground/80">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: "#C1B6AE" }}
                  />
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-[11px] text-red-500">Las contraseñas no coinciden</p>
                )}
                {confirmPassword.length > 0 && password === confirmPassword && password.length >= 8 && (
                  <p className="text-[11px] text-green-600 flex items-center gap-1">
                    <CheckCircle className="size-3" /> Las contraseñas coinciden
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full text-white font-semibold h-11 mt-2"
                style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Actualizando contraseña...
                  </>
                ) : (
                  "Establecer nueva contraseña"
                )}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          SOLVENDOM SOFOM E.N.R. | Regulado por CNBV
        </p>
      </div>
    </div>
  )
}
