"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

/**
 * Isolated login form — does NOT import useAuth.
 * This prevents Supabase onAuthStateChange re-renders from
 * affecting the input fields. The parent passes `onLogin` as a stable callback.
 */
export const LoginForm = React.memo(function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError("Completa todos los campos")
      return
    }

    setError("")
    setLoading(true)

    try {
      const result = await onLogin(email.trim(), password)
      if (result.success) {
        toast.success("Inicio de sesión exitoso")
      } else {
        setError(result.error || "Credenciales incorrectas")
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex size-16 items-center justify-center rounded-2xl text-white font-bold text-3xl shadow-lg mx-auto select-none bg-primary">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">SAYO</h1>
            <p className="text-sm text-muted-foreground">Plataforma Financiera Digital</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold">Iniciar Sesión</h2>
              <p className="text-sm text-muted-foreground">Accede a tu cuenta SAYO</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-medium">
                    Contraseña
                  </Label>
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline font-medium"
                    onClick={() => toast.info("Contacta a soporte para recuperar tu contraseña")}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          SOLVENDOM SOFOM E.N.R. | Regulado por CNBV
        </p>
      </div>
    </div>
  )
})
