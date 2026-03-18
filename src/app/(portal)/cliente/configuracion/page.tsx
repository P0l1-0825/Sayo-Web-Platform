"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Building2, Shield, Bell, User, Lock, Smartphone, Mail } from "lucide-react"
import { toast } from "sonner"

export default function ConfiguracionPage() {
  const [twoFactor, setTwoFactor] = React.useState(true)
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
                <div className="flex items-center gap-2"><Smartphone className="size-4 text-muted-foreground" /><span className="text-sm">Autenticación 2 Factores</span></div>
                <Badge variant={twoFactor ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => { setTwoFactor(!twoFactor); toast.success(twoFactor ? "2FA desactivado" : "2FA activado") }}>{twoFactor ? "Activo" : "Inactivo"}</Badge>
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
    </div>
  )
}
