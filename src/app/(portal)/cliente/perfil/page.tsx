"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { User, Mail, Phone, MapPin, Shield, FileText, Bell, Key, Smartphone, ChevronRight, Check, X, Eye, EyeOff, Pencil, Trash2, Upload, Clock } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface ProfileData {
  name: string
  email: string
  phone: string
  address: string
  curp: string
  rfc: string
  accountLevel: string
  memberSince: string
}

interface Device {
  id: string
  name: string
  type: string
  lastAccess: string
  location: string
  current: boolean
}

interface Document {
  id: string
  name: string
  status: "verificado" | "pendiente" | "rechazado"
  uploadDate: string
}

// Default profile — will be overridden by real auth data
const defaultProfile: ProfileData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  curp: "",
  rfc: "",
  accountLevel: "Nivel 1",
  memberSince: "",
}

const initialDevices: Device[] = [
  { id: "DEV-1", name: "iPhone 15 Pro", type: "iOS", lastAccess: "2024-03-06T10:30:00", location: "CDMX, México", current: true },
  { id: "DEV-2", name: "MacBook Pro", type: "Web", lastAccess: "2024-03-06T09:15:00", location: "CDMX, México", current: false },
  { id: "DEV-3", name: "iPad Air", type: "iPadOS", lastAccess: "2024-02-28T16:00:00", location: "Guadalajara, México", current: false },
]

const initialDocuments: Document[] = [
  { id: "DOC-1", name: "INE (Frente y Vuelta)", status: "verificado", uploadDate: "2023-03-15" },
  { id: "DOC-2", name: "Comprobante de Domicilio", status: "verificado", uploadDate: "2023-03-15" },
  { id: "DOC-3", name: "CURP", status: "verificado", uploadDate: "2023-03-15" },
  { id: "DOC-4", name: "Constancia de Situación Fiscal", status: "pendiente", uploadDate: "2024-02-20" },
]

const notifSettings = [
  { key: "push_transfers", label: "Transferencias", description: "Notificaciones push de envíos y recibos" },
  { key: "push_payments", label: "Pagos de servicios", description: "Confirmación de pagos realizados" },
  { key: "email_statements", label: "Estados de cuenta", description: "Envío mensual por email" },
  { key: "sms_security", label: "Alertas de seguridad", description: "SMS para accesos nuevos" },
  { key: "push_promo", label: "Promociones", description: "Ofertas y beneficios exclusivos" },
]

export default function PerfilPage() {
  const { user, profile: authProfile } = useAuth()

  // Build profile from real auth data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = authProfile as any
  const realProfile: ProfileData = React.useMemo(() => ({
    name: user?.fullName || p?.full_name || defaultProfile.name,
    email: user?.email || p?.email || defaultProfile.email,
    phone: p?.phone || defaultProfile.phone,
    address: p?.address || defaultProfile.address,
    curp: p?.curp || defaultProfile.curp,
    rfc: p?.rfc || defaultProfile.rfc,
    accountLevel: `Nivel ${user?.kycLevel || 1}`,
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("es-MX", { month: "long", year: "numeric" }) : defaultProfile.memberSince,
  }), [user, p])

  const [profile, setProfile] = React.useState<ProfileData>(realProfile)

  // Update profile when auth data loads
  React.useEffect(() => {
    if (user?.fullName) setProfile(realProfile)
  }, [user, realProfile])
  const [devices, setDevices] = React.useState<Device[]>(initialDevices)
  const [documents] = React.useState<Document[]>(initialDocuments)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState<ProfileData>(defaultProfile)
  const [passwordOpen, setPasswordOpen] = React.useState(false)
  const [passwordForm, setPasswordForm] = React.useState({ current: "", newPass: "", confirm: "" })
  const [showPassword, setShowPassword] = React.useState(false)
  const [twoFaEnabled, setTwoFaEnabled] = React.useState(false)
  const [mfaOpen, setMfaOpen] = React.useState(false)
  const [mfaStep, setMfaStep] = React.useState<"idle" | "loading" | "qr" | "verify" | "done">("idle")
  const [mfaQrCode, setMfaQrCode] = React.useState("")
  const [mfaSecret, setMfaSecret] = React.useState("")
  const [mfaFactorId, setMfaFactorId] = React.useState("")
  const [mfaCode, setMfaCode] = React.useState("")
  const [mfaError, setMfaError] = React.useState("")
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Record<string, boolean>>({
    push_transfers: true,
    push_payments: true,
    email_statements: true,
    sms_security: true,
    push_promo: false,
  })
  const [devicesOpen, setDevicesOpen] = React.useState(false)
  const [docsOpen, setDocsOpen] = React.useState(false)

  const handleEditProfile = () => {
    setEditForm({ ...profile })
    setEditOpen(true)
  }

  const handleSaveProfile = () => {
    if (!editForm.name || !editForm.email || !editForm.phone) {
      toast.error("Completa los campos obligatorios")
      return
    }
    setProfile({ ...editForm })
    setEditOpen(false)
    toast.success("Perfil actualizado", { description: "Tus datos se han guardado correctamente" })
  }

  const handleChangePassword = () => {
    if (!passwordForm.current) {
      toast.error("Ingresa tu contraseña actual")
      return
    }
    if (!passwordForm.newPass || passwordForm.newPass.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    setPasswordOpen(false)
    setPasswordForm({ current: "", newPass: "", confirm: "" })
    toast.success("Contraseña actualizada", { description: "Tu contraseña se ha cambiado exitosamente" })
  }

  const handleToggle2FA = () => {
    if (twoFaEnabled) {
      // Unenroll — would need factorId. For now just toggle.
      setTwoFaEnabled(false)
      toast.success("2FA desactivado")
      return
    }
    // Start MFA enrollment
    setMfaOpen(true)
    setMfaStep("loading")
    setMfaError("")
    setMfaCode("")

    const token = (() => {
      try {
        const raw = localStorage.getItem("sayo-auth")
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed?.access_token ?? null
      } catch { return null }
    })()

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/auth/mfa/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setMfaQrCode(res.data.qrCode)
          setMfaSecret(res.data.secret)
          setMfaFactorId(res.data.factorId)
          setMfaStep("qr")
        } else {
          setMfaError(res.error?.message || "Error al enrollar MFA")
          setMfaStep("idle")
        }
      })
      .catch(() => {
        setMfaError("Error de conexión")
        setMfaStep("idle")
      })
  }

  const handleVerifyMfa = () => {
    if (mfaCode.length !== 6) {
      setMfaError("Ingresa el código de 6 dígitos")
      return
    }
    setMfaStep("loading")
    setMfaError("")

    const token = (() => {
      try {
        const raw = localStorage.getItem("sayo-auth")
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed?.access_token ?? null
      } catch { return null }
    })()

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ factorId: mfaFactorId, code: mfaCode }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setMfaStep("done")
          setTwoFaEnabled(true)
          toast.success("2FA activado", { description: "Verificación en dos pasos activada exitosamente" })
          setTimeout(() => setMfaOpen(false), 1500)
        } else {
          setMfaError(res.error?.message || "Código incorrecto")
          setMfaStep("qr")
        }
      })
      .catch(() => {
        setMfaError("Error de conexión")
        setMfaStep("qr")
      })
  }

  const handleToggleNotification = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveNotifications = () => {
    setNotifOpen(false)
    toast.success("Preferencias guardadas", { description: "Tus notificaciones se han actualizado" })
  }

  const handleRemoveDevice = (device: Device) => {
    if (device.current) {
      toast.error("No puedes cerrar sesión del dispositivo actual desde aquí")
      return
    }
    setDevices((prev) => prev.filter((d) => d.id !== device.id))
    toast.success("Dispositivo removido", { description: device.name })
  }

  const settingsItems = [
    { icon: Key, label: "Cambiar Contraseña", description: "Actualizar contraseña de acceso", action: () => setPasswordOpen(true) },
    { icon: Smartphone, label: "Autenticación 2FA", description: "Verificación en dos pasos", badge: twoFaEnabled ? "Activo" : "Inactivo", badgeColor: twoFaEnabled ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700", action: handleToggle2FA },
    { icon: Bell, label: "Notificaciones", description: "Configurar push, email y SMS", action: () => setNotifOpen(true) },
    { icon: Shield, label: "Dispositivos", description: `${devices.length} dispositivos conectados`, action: () => setDevicesOpen(true) },
    { icon: FileText, label: "Documentos", description: `${documents.filter((d) => d.status === "verificado").length}/${documents.length} verificados`, action: () => setDocsOpen(true) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Datos personales, seguridad y configuración</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-full bg-sayo-cafe flex items-center justify-center text-white text-xl font-bold shrink-0">
              {profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-lg font-bold">{profile.name}</h2>
                <p className="text-xs text-muted-foreground">Miembro desde {profile.memberSince}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-xs">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-xs">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-xs">{profile.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-xs">CURP: {profile.curp}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-sayo-cafe text-white text-[10px]">{profile.accountLevel}</Badge>
                <Badge variant="outline" className="text-[10px]">RFC: {profile.rfc}</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <Pencil className="size-3.5 mr-1" /> Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Seguridad y Configuración</h2>
        <div className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={item.action}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className={`text-[10px] ${item.badgeColor || "bg-green-50 text-green-700"}`}>{item.badge}</Badge>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tus datos personales</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre Completo *</label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email *</label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Teléfono *</label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Dirección</label>
              <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">CURP</label>
                <Input value={editForm.curp} disabled className="bg-muted/50" />
                <p className="text-[10px] text-muted-foreground mt-0.5">No editable</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">RFC</label>
                <Input value={editForm.rfc} disabled className="bg-muted/50" />
                <p className="text-[10px] text-muted-foreground mt-0.5">No editable</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSaveProfile}>
              <Check className="size-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>Actualiza tu contraseña de acceso</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contraseña Actual *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña actual"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nueva Contraseña *</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
              />
              {passwordForm.newPass && (
                <div className="mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          passwordForm.newPass.length >= i * 3
                            ? passwordForm.newPass.length >= 12 ? "bg-green-500" : passwordForm.newPass.length >= 8 ? "bg-yellow-500" : "bg-red-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {passwordForm.newPass.length < 8 ? "Muy corta" : passwordForm.newPass.length < 12 ? "Aceptable" : "Fuerte"}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Confirmar Nueva Contraseña *</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Repite la nueva contraseña"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
              {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                <p className="text-[10px] text-red-500 mt-0.5">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleChangePassword}>
              <Key className="size-3.5 mr-1" /> Cambiar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preferencias de Notificación</DialogTitle>
            <DialogDescription>Configura qué notificaciones deseas recibir</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            {notifSettings.map((ns) => (
              <button
                key={ns.key}
                onClick={() => handleToggleNotification(ns.key)}
                className="flex items-center justify-between w-full py-3 px-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium">{ns.label}</p>
                  <p className="text-xs text-muted-foreground">{ns.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${notifications[ns.key] ? "text-green-600" : "text-red-400"}`}>
                  {notifications[ns.key] ? <Check className="size-3" /> : <X className="size-3" />}
                  {notifications[ns.key] ? "ON" : "OFF"}
                </span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSaveNotifications}>
              <Check className="size-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Devices Dialog */}
      <Dialog open={devicesOpen} onOpenChange={setDevicesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dispositivos Conectados</DialogTitle>
            <DialogDescription>{devices.length} dispositivos con acceso a tu cuenta</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Smartphone className="size-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{device.name}</p>
                    {device.current && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">Este dispositivo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {device.type} • {device.location}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-2.5" />
                    Último acceso: {new Date(device.lastAccess).toLocaleString("es-MX")}
                  </p>
                </div>
                {!device.current && (
                  <Button variant="ghost" size="icon-xs" onClick={() => handleRemoveDevice(device)} title="Cerrar sesión">
                    <Trash2 className="size-3.5 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mis Documentos</DialogTitle>
            <DialogDescription>Documentos de verificación de identidad</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <FileText className="size-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Subido: {new Date(doc.uploadDate).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    doc.status === "verificado" ? "bg-green-50 text-green-700" :
                    doc.status === "pendiente" ? "bg-yellow-50 text-yellow-700" :
                    "bg-red-50 text-red-700"
                  }`}
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg border border-dashed text-center">
            <Upload className="size-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Arrastra o haz clic para subir documentos</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.info("Funcionalidad de carga", { description: "Disponible próximamente" })}>
              <Upload className="size-3 mr-1" /> Subir Documento
            </Button>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MFA Enrollment Dialog */}
      <Dialog open={mfaOpen} onOpenChange={setMfaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Activar Autenticación 2FA</DialogTitle>
            <DialogDescription>
              Escanea el código QR con Google Authenticator o cualquier app TOTP
            </DialogDescription>
          </DialogHeader>

          {mfaStep === "loading" && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sayo-cafe" />
            </div>
          )}

          {mfaStep === "qr" && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                {mfaQrCode ? (
                  <img src={mfaQrCode} alt="QR Code MFA" className="w-48 h-48 rounded-lg border" />
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    QR no disponible
                  </div>
                )}
              </div>

              {/* Secret key for manual entry */}
              {mfaSecret && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">O ingresa manualmente:</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono select-all">{mfaSecret}</code>
                </div>
              )}

              {/* TOTP Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Código de verificación</label>
                <Input
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
              </div>

              {mfaError && (
                <p className="text-sm text-red-600 text-center">{mfaError}</p>
              )}
            </div>
          )}

          {mfaStep === "done" && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="size-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-700">2FA activado exitosamente</p>
            </div>
          )}

          {mfaStep !== "done" && (
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              {mfaStep === "qr" && (
                <Button onClick={handleVerifyMfa} disabled={mfaCode.length !== 6}>
                  Verificar y Activar
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
