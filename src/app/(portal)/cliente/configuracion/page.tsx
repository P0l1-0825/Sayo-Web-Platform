"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Settings, Building2, Shield, Bell, User, Lock, Smartphone, Mail, QrCode } from "lucide-react"
import { toast } from "sonner"
import { isApiConfigured } from "@/lib/api-client"
import api from "@/lib/api-client"

export default function ConfiguracionPage() {
  const [twoFactor, setTwoFactor] = React.useState(false)
  const [mfaDialogOpen, setMfaDialogOpen] = React.useState(false)
  const [mfaStep, setMfaStep] = React.useState<"qr" | "verify">("qr")
  const [mfaData, setMfaData] = React.useState<{ factorId: string; qrCode: string; secret: string } | null>(null)
  const [totpCode, setTotpCode] = React.useState("")
  const [mfaLoading, setMfaLoading] = React.useState(false)

  // Check MFA status on mount
  React.useEffect(() => {
    if (!isApiConfigured) return
    api.get<{ totp: Array<{ id: string; status: string }> }>("/api/v1/auth/mfa/factors")
      .then((data) => {
        const verified = data.totp?.some((f) => f.status === "verified")
        setTwoFactor(!!verified)
      })
      .catch(() => {})
  }, [])

  const handleEnrollMfa = async () => {
    if (!isApiConfigured) {
      toast.info("API no configurada — funcionalidad disponible en produccion")
      return
    }
    setMfaLoading(true)
    try {
      const data = await api.post<{ factorId: string; qrCode: string; secret: string }>("/api/v1/auth/mfa/enroll")
      setMfaData(data)
      setMfaStep("qr")
      setMfaDialogOpen(true)
    } catch (err) {
      toast.error("Error al iniciar configuracion 2FA")
    } finally {
      setMfaLoading(false)
    }
  }

  const handleVerifyMfa = async () => {
    if (!mfaData) return
    setMfaLoading(true)
    try {
      await api.post("/api/v1/auth/mfa/verify", { factorId: mfaData.factorId, code: totpCode })
      setTwoFactor(true)
      setMfaDialogOpen(false)
      setTotpCode("")
      toast.success("2FA activado exitosamente")
    } catch {
      toast.error("Codigo invalido — intenta de nuevo")
    } finally {
      setMfaLoading(false)
    }
  }
  const [notifEmail, setNotifEmail] = React.useState(true)
  const [notifSms, setNotifSms] = React.useState(true)
  const [notifPush, setNotifPush] = React.useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Datos empresariales, seguridad y preferencias</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Building2 className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-sm font-bold">Logística Express</p><p className="text-xs text-muted-foreground">Empresa</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><User className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-sm font-bold">Roberto Sánchez</p><p className="text-xs text-muted-foreground">Administrador</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-sm font-bold text-sayo-green">2FA Activo</p><p className="text-xs text-muted-foreground">Seguridad</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Bell className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-sm font-bold">2 canales</p><p className="text-xs text-muted-foreground">Notificaciones</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 className="size-4" /> Datos de la Empresa</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 rounded border"><span className="text-muted-foreground">Razón Social</span><span className="font-medium">Logística Express México SA de CV</span></div>
            <div className="flex justify-between p-2 rounded border"><span className="text-muted-foreground">RFC</span><span className="font-mono">LEM210510EF5</span></div>
            <div className="flex justify-between p-2 rounded border"><span className="text-muted-foreground">Régimen Fiscal</span><span>601 — General de Ley</span></div>
            <div className="flex justify-between p-2 rounded border"><span className="text-muted-foreground">Domicilio Fiscal</span><span>CDMX, México</span></div>
            <div className="flex justify-between p-2 rounded border"><span className="text-muted-foreground">Representante Legal</span><span>Roberto Sánchez Méndez</span></div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info("Función disponible próximamente")}>Editar Datos</Button>
        </CardContent></Card>

        <div className="space-y-4">
          <Card><CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Lock className="size-4" /> Seguridad</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2"><Smartphone className="size-4 text-muted-foreground" /><span className="text-sm">Autenticacion 2 Factores (TOTP)</span></div>
                {twoFactor ? (
                  <Badge variant="default" className="text-[10px]">Activo</Badge>
                ) : (
                  <Button variant="outline" size="sm" className="text-[10px] h-6" onClick={handleEnrollMfa} disabled={mfaLoading}>
                    {mfaLoading ? "Cargando..." : "Configurar"}
                  </Button>
                )}
              </div>
              <div className="flex justify-between p-2 rounded border"><span className="text-sm text-muted-foreground">Último cambio de contraseña</span><span className="text-sm">2026-02-15</span></div>
              <div className="flex justify-between p-2 rounded border"><span className="text-sm text-muted-foreground">Sesiones activas</span><span className="text-sm font-semibold">2 dispositivos</span></div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info("Enlace de cambio enviado a tu email")}>Cambiar Contraseña</Button>
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Bell className="size-4" /> Notificaciones</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /><span className="text-sm">Email</span></div>
                <Badge variant={notifEmail ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => setNotifEmail(!notifEmail)}>{notifEmail ? "Activo" : "Inactivo"}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2"><Smartphone className="size-4 text-muted-foreground" /><span className="text-sm">SMS</span></div>
                <Badge variant={notifSms ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => setNotifSms(!notifSms)}>{notifSms ? "Activo" : "Inactivo"}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2"><Bell className="size-4 text-muted-foreground" /><span className="text-sm">Push</span></div>
                <Badge variant={notifPush ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => setNotifPush(!notifPush)}>{notifPush ? "Activo" : "Inactivo"}</Badge>
              </div>
            </div>
          </CardContent></Card>
        </div>
      </div>

      {/* MFA Setup Dialog */}
      <Dialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <div className="text-center">
              <QrCode className="size-8 mx-auto text-sayo-cafe mb-2" />
              <h3 className="font-bold">Configurar Autenticacion 2FA</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Escanea el codigo QR con tu app de autenticacion (Google Authenticator, Authy, etc.)
              </p>
            </div>

            {mfaData?.qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <img src={mfaData.qrCode} alt="QR Code" className="size-48" />
              </div>
            )}

            {mfaData?.secret && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground mb-1">O ingresa manualmente:</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono select-all">{mfaData.secret}</code>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium">Ingresa el codigo de 6 digitos:</p>
              <Input
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-[0.5em] font-mono"
                maxLength={6}
              />
              <Button
                className="w-full"
                onClick={handleVerifyMfa}
                disabled={totpCode.length !== 6 || mfaLoading}
              >
                {mfaLoading ? "Verificando..." : "Verificar y Activar 2FA"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
