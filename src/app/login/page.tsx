"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"

type LoginMode = "credentials" | "register" | "forgot"

// ── Shared components (defined OUTSIDE LoginPage to prevent remount on re-render) ──

function Logo() {
  return (
    <div className="text-center space-y-3 mb-8">
      <div className="flex size-16 items-center justify-center rounded-2xl text-white font-bold text-3xl shadow-lg mx-auto select-none bg-sayo-gradient">
        S
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">SAYO</h1>
        <p className="text-sm text-muted-foreground">Plataforma Financiera Digital</p>
      </div>
    </div>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {children}
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          SOLVENDOM SOFOM E.N.R. | Regulado por CNBV
        </p>
      </div>
    </div>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
      <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
      <p className="text-xs text-red-600 leading-relaxed">{msg}</p>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const {
    login, logout, register, resetPassword,
    isAuthenticated, user, isLoading: authLoading,
    error: authError, clearError,
  } = useAuth()

  const [mode, setMode] = React.useState<LoginMode>("credentials")

  // Credentials form
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  // Register form
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showRegPassword, setShowRegPassword] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)

  // Forgot password form
  const [forgotEmail, setForgotEmail] = React.useState("")
  const [forgotSent, setForgotSent] = React.useState(false)

  // Logout handling
  const [loggingOut, setLoggingOut] = React.useState(false)

  // Handle ?logout=true — clear session cleanly
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("logout") === "true" && isAuthenticated) {
      setLoggingOut(true)
      logout().then(() => {
        setLoggingOut(false)
        window.history.replaceState({}, "", "/login")
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redirect if already authenticated
  React.useEffect(() => {
    if (loggingOut) return
    const params = new URLSearchParams(window.location.search)
    if (isAuthenticated && user && params.get("logout") !== "true") {
      // L6_SUPERADMIN goes to portal selector to choose which portal to enter
      if (user.role === "L6_SUPERADMIN") {
        router.push("/portals")
      } else {
        router.push(`/${user.portal}`)
      }
    }
  }, [isAuthenticated, user, router, loggingOut])

  const switchMode = (next: LoginMode) => {
    clearError()
    setLoading(false)
    setMode(next)
  }

  // ── Login ────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Completa todos los campos")
      return
    }
    setLoading(true)
    clearError()

    const result = await login(email, password)

    if (result.success) {
      toast.success("Inicio de sesión exitoso")
      // Redirect handled by useEffect above
    } else {
      toast.error(result.error || "Error al iniciar sesión")
    }
    setLoading(false)
  }

  // ── Register ─────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName) {
      toast.error("Completa todos los campos requeridos")
      return
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    setLoading(true)
    clearError()

    const result = await register({ email, password, fullName, phone })

    if (result.success) {
      setSuccessOpen(true)
    } else {
      toast.error(result.error || "Error al registrarse")
    }
    setLoading(false)
  }

  // ── Forgot password ───────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) {
      toast.error("Ingresa tu email")
      return
    }
    setLoading(true)

    const result = await resetPassword(forgotEmail)

    if (result.success) {
      setForgotSent(true)
      toast.success("Instrucciones enviadas a tu email")
    } else {
      toast.error(result.error || "Error al enviar instrucciones")
    }
    setLoading(false)
  }

  // Components moved outside — see below

  // ============================================================
  // RENDER: Login form (default)
  // ============================================================
  if (mode === "credentials") {
    return (
      <PageWrapper>
        <Logo />

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-1 mb-6">
              <h2 className="text-lg font-semibold text-foreground">Iniciar Sesión</h2>
              <p className="text-sm text-muted-foreground">Accede a tu cuenta SAYO</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {authError && <ErrorBanner msg={authError} />}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: "#C1B6AE" }}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
                    Contraseña
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setForgotSent(false)
                      switchMode("forgot")
                    }}
                    className="text-[11px] font-medium hover:underline transition-colors"
                    style={{ color: "#472913" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
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
                    autoComplete="current-password"
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
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full text-white font-semibold h-11 mt-1"
                style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
                disabled={loading || authLoading}
              >
                {(loading || authLoading) ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Admin creates accounts — no self-registration */}
          </CardContent>
        </Card>
      </PageWrapper>
    )
  }

  // ============================================================
  // RENDER: Forgot password
  // ============================================================
  if (mode === "forgot") {
    return (
      <PageWrapper>
        <Logo />

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            {forgotSent ? (
              <div className="text-center space-y-5">
                <div
                  className="flex size-14 items-center justify-center rounded-full mx-auto"
                  style={{ background: "#F0F9F4" }}
                >
                  <CheckCircle className="size-7 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Revisa tu correo</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enviamos instrucciones de recuperación a{" "}
                    <span className="font-medium text-foreground">{forgotEmail}</span>.
                    Haz clic en el enlace del correo para restablecer tu contraseña.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-10 border-[#E1DBD6]"
                  onClick={() => switchMode("credentials")}
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Volver a Iniciar Sesión
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1 mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Recuperar contraseña</h2>
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-xs font-medium text-foreground/80">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                        style={{ color: "#C1B6AE" }}
                      />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10 h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-white font-semibold h-11"
                    style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar instrucciones"
                    )}
                  </Button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode("credentials")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    <ArrowLeft className="size-3" />
                    Volver a Iniciar Sesión
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PageWrapper>
    )
  }

  // ============================================================
  // RENDER: Registration form
  // ============================================================
  return (
    <PageWrapper>
      <Logo />

      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="space-y-1 mb-6">
            <h2 className="text-lg font-semibold text-foreground">Crear cuenta</h2>
            <p className="text-sm text-muted-foreground">Regístrate para acceder a SAYO</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {authError && <ErrorBanner msg={authError} />}

            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-xs font-medium text-foreground/80">
                Nombre completo *
              </Label>
              <Input
                id="reg-name"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-medium text-foreground/80">
                Correo electrónico *
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                  style={{ color: "#C1B6AE" }}
                />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-phone" className="text-xs font-medium text-foreground/80">
                Teléfono
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="+52 55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                autoComplete="tel"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-xs font-medium text-foreground/80">
                Contraseña * <span className="text-muted-foreground font-normal">(mín. 8 caracteres)</span>
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
                  style={{ color: "#C1B6AE" }}
                />
                <Input
                  id="reg-password"
                  type={showRegPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm" className="text-xs font-medium text-foreground/80">
                Confirmar contraseña *
              </Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 border-[#E1DBD6] focus-visible:ring-[#472913]/30 bg-white"
                required
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-[11px] text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Al crear tu cuenta aceptas nuestros{" "}
              <a href="/sayo-mx/legal/" className="underline hover:text-foreground transition-colors">
                Términos y Condiciones
              </a>{" "}
              y{" "}
              <a href="/sayo-mx/legal/" className="underline hover:text-foreground transition-colors">
                Aviso de Privacidad
              </a>.
            </p>

            <Button
              type="submit"
              className="w-full text-white font-semibold h-11"
              style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => switchMode("credentials")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <ArrowLeft className="size-3" />
              Ya tengo cuenta — Iniciar Sesión
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Success dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-500" />
              Cuenta Creada
            </DialogTitle>
            <DialogDescription>
              Te enviamos un correo de verificación a{" "}
              <strong>{email}</strong>. Revisa tu bandeja de entrada y haz clic
              en el enlace para activar tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  className="text-white"
                  style={{ background: "linear-gradient(135deg, #472913 0%, #6B4226 100%)" }}
                  onClick={() => switchMode("credentials")}
                />
              }
            >
              Ir a Iniciar Sesión
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
