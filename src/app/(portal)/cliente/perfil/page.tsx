"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, MapPin, Shield, FileText, Bell, Key, Smartphone, ChevronRight } from "lucide-react"

const profileData = {
  name: "Juan Pérez García",
  email: "juan.perez@gmail.com",
  phone: "+52 55 1234 5678",
  address: "Av. Reforma 222, Col. Juárez, CDMX, 06600",
  curp: "PEGJ900515HDFRRC09",
  rfc: "PEGJ900515XXX",
  accountLevel: "Nivel 4",
  memberSince: "Marzo 2023",
}

const settingsItems = [
  { icon: Key, label: "Cambiar Contraseña", description: "Actualizar contraseña de acceso" },
  { icon: Smartphone, label: "Autenticación 2FA", description: "Activar/desactivar verificación en dos pasos", badge: "Activo" },
  { icon: Bell, label: "Notificaciones", description: "Configurar push, email y SMS" },
  { icon: Shield, label: "Dispositivos", description: "Ver y administrar dispositivos conectados" },
  { icon: FileText, label: "Documentos", description: "INE, comprobante de domicilio, CURP" },
]

export default function PerfilPage() {
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
            <div className="size-16 rounded-full bg-sayo-cafe flex items-center justify-center text-white text-xl font-bold">
              JP
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-lg font-bold">{profileData.name}</h2>
                <p className="text-xs text-muted-foreground">Miembro desde {profileData.memberSince}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-xs">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-xs">{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-xs">{profileData.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-xs">CURP: {profileData.curp}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-sayo-cafe text-white text-[10px]">{profileData.accountLevel}</Badge>
                <Badge variant="outline" className="text-[10px]">RFC: {profileData.rfc}</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">Editar</Button>
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
              <Card key={item.label} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">{item.badge}</Badge>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
