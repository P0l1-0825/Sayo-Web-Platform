"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { portals, demoUsers } from "@/lib/portals"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Monitor, ShieldCheck, HandCoins, TrendingUp, Headphones, Shield,
  Megaphone, Crown, Settings, User, Globe, LogIn, Eye, EyeOff,
  ArrowLeft, Mail, Lock, AlertCircle, CheckCircle, Loader2,
} from "lucide-react"
import { toast } from "sonner"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, ShieldCheck, HandCoins, TrendingUp, Headphones, Shield,
  Megaphone, Crown, Settings, User, Globe,
}

type LoginMode = "selector" | "credentials" | "register" | "forgot"

export default function LoginPage() {
  const router = useRouter()
  const { login, logout, register, demoLogin, resetPassword, isAuthenticated, isDemoMode, user, isLoading: authLoading, error: authError, clearError } = useAuth()

  const [mode, setMode] = React.useState<LoginMode>("selector")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [forgotEmail, setForgotEmail] = React.useState("")
  const [forgotSent, setForgotSent] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)

  // Handle ?logout=true param — clear session so user can switch portals
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

  // Redirect if already authenticated (skip during logout)
  React.useEffect(() => {
    if (loggingOut) return
    const params = new URLSearchParams(window.location.search)
    if (isAuthenticated && user && params.get("logout") !== "true") {
      router.push(`/${user.portal}`)
    }
  }, [isAuthenticated, user, router, loggingOut])

  // Handle demo portal selection (direct access)
  const handlePortalSelect = (portalId: string) => {
    demoLogin(portalId as Parameters<typeof demoLogin>[0])
    const portal = portals.find((p) => p.id === portalId)
    if (portal) {
      toast.success(`Acceso demo: ${portal.name}`)
      router.push(portal.navItems[0]?.href || `/${portalId}`)
    }
  }

  // Handle email/password login
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
      // Redirect handled by useEffect
    } else {
      toast.error(result.error || "Error al iniciar sesión")
    }
    setLoading(false)
  }

  // Handle registration
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
      if (isDemoMode) {
        toast.success("Cuenta creada exitosamente")
        // In demo mode, auto-login happens
      } else {
        setSuccessOpen(true)
      }
    } else {
      toast.error(result.error || "Error al registrarse")
    }
    setLoading(false)
  }

  // Handle forgot password
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

  // ----------------------------------------------------------
  // RENDER: Portal Selector (Demo Mode)
  // ----------------------------------------------------------
  if (mode === "selector") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sayo-cream p-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-sayo-cafe text-white font-bold text-2xl shadow-lg">
                S
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-sayo-cafe tracking-tight">SAYO</h1>
              <p className="text-sm text-muted-foreground mt-1">Plataforma Financiera Digital</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                {isDemoMode ? "Demo — Selecciona un portal" : "Plataforma Operativa"}
              </Badge>
            </div>
          </div>

          {/* Login Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setMode("credentials")}
              className="bg-sayo-cafe hover:bg-sayo-cafe-light text-white gap-2"
            >
              <LogIn className="size-4" />
              Iniciar Sesión con Credenciales
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-sayo-cream px-3 text-muted-foreground">o accede como demo</span>
            </div>
          </div>

          {/* Portal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {portals.map((portal) => {
              const Icon = iconMap[portal.icon] || Monitor
              const demoUser = demoUsers.find((u) => u.portal === portal.id)

              return (
                <Card
                  key={portal.id}
                  className="cursor-pointer hover:shadow-md hover:border-sayo-cafe/30 transition-all duration-200 group"
                  onClick={() => handlePortalSelect(portal.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted ${portal.color} group-hover:bg-sayo-cafe group-hover:text-white transition-colors`}>
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-sayo-cafe transition-colors">
                          {portal.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {portal.description}
                        </p>
                        {demoUser && (
                          <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                            {demoUser.name} — {portal.role.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Footer */}
          <div className="text-center space-y-1">
            <p className="text-[11px] text-muted-foreground">
              SAYO Financial S.A. de C.V. SOFOM E.N.R. — Regulado por CNBV
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              v1.1.0 — {isDemoMode ? "Entorno de demostración" : "Producción"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------
  // RENDER: Credentials Login Form
  // ----------------------------------------------------------
  if (mode === "credentials") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sayo-cream p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-sayo-cafe text-white font-bold text-2xl shadow-lg mx-auto">
              S
            </div>
            <h1 className="text-2xl font-bold text-sayo-cafe">Iniciar Sesión</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder</p>
          </div>

          {/* Login Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {authError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="size-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{authError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setForgotEmail(email); setForgotSent(false) }}
                    className="text-xs text-sayo-blue hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-sayo-cafe hover:bg-sayo-cafe-light text-white"
                  disabled={loading || authLoading}
                >
                  {(loading || authLoading) ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" /> Iniciando sesión...</>
                  ) : (
                    <><LogIn className="size-4 mr-2" /> Iniciar Sesión</>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">¿No tienes cuenta?</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMode("register")}
              >
                Crear cuenta nueva
              </Button>

              {isDemoMode && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">Demo</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-sayo-cream border border-sayo-maple">
                    <p className="text-[10px] text-muted-foreground mb-2 text-center">
                      Credenciales de prueba (cualquier contraseña funciona)
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {demoUsers.slice(0, 4).map((u) => (
                        <button
                          key={u.email}
                          type="button"
                          onClick={() => { setEmail(u.email); setPassword("demo1234") }}
                          className="text-[9px] text-sayo-cafe hover:bg-sayo-maple/30 rounded px-1.5 py-1 text-left truncate transition-colors"
                        >
                          {u.email}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Back to Selector */}
          <div className="flex justify-center">
            <button
              onClick={() => { setMode("selector"); clearError() }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" />
              Volver al selector de portales
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------
  // RENDER: Registration Form
  // ----------------------------------------------------------
  if (mode === "register") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sayo-cream p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-sayo-cafe text-white font-bold text-2xl shadow-lg mx-auto">
              S
            </div>
            <h1 className="text-2xl font-bold text-sayo-cafe">Crear Cuenta</h1>
            <p className="text-sm text-muted-foreground">Regístrate para acceder a SAYO</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleRegister} className="space-y-4">
                {authError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="size-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{authError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-xs">Nombre completo *</Label>
                  <Input
                    id="reg-name"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-xs">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone" className="text-xs">Teléfono</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-xs">Contraseña * (mín. 8 caracteres)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm" className="text-xs">Confirmar contraseña *</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-red-500">Las contraseñas no coinciden</p>
                  )}
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Al crear tu cuenta, aceptas nuestros{" "}
                  <a href="/sayo-mx/legal/" className="text-sayo-blue hover:underline">Términos y Condiciones</a>{" "}
                  y <a href="/sayo-mx/legal/" className="text-sayo-blue hover:underline">Aviso de Privacidad</a>.
                </div>

                <Button
                  type="submit"
                  className="w-full bg-sayo-cafe hover:bg-sayo-cafe-light text-white"
                  disabled={loading || authLoading}
                >
                  {(loading || authLoading) ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" /> Creando cuenta...</>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => { setMode("credentials"); clearError() }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" />
              Ya tengo cuenta
            </button>
            <button
              onClick={() => { setMode("selector"); clearError() }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Selector de portales
            </button>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                Cuenta Creada
              </DialogTitle>
              <DialogDescription>
                Te hemos enviado un email de verificación a <strong>{email}</strong>. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button className="bg-sayo-cafe hover:bg-sayo-cafe-light text-white" onClick={() => setMode("credentials")} />}>
                Ir a Iniciar Sesión
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ----------------------------------------------------------
  // RENDER: Forgot Password
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-sayo-cream p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-sayo-cafe text-white font-bold text-2xl shadow-lg mx-auto">
            S
          </div>
          <h1 className="text-2xl font-bold text-sayo-cafe">Recuperar Contraseña</h1>
          <p className="text-sm text-muted-foreground">Te enviaremos instrucciones a tu email</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {forgotSent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="size-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium">Instrucciones enviadas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Revisa tu email <strong>{forgotEmail}</strong> y sigue las instrucciones para restablecer tu contraseña.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setMode("credentials"); setForgotSent(false) }}
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Volver a Iniciar Sesión
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-xs">Email registrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-sayo-cafe hover:bg-sayo-cafe-light text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" /> Enviando...</>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {!forgotSent && (
          <div className="flex justify-center">
            <button
              onClick={() => { setMode("credentials"); clearError() }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" />
              Volver a Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
