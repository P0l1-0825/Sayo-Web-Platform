"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { rolePermissions } from "@/lib/mock-data"
import { Shield, Users, Plus, Check, X } from "lucide-react"

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Roles y Permisos</h1>
          <p className="text-sm text-muted-foreground">Configuración de roles — módulos y permisos por perfil</p>
        </div>
        <Button><Plus className="size-4 mr-1.5" /> Nuevo Rol</Button>
      </div>

      <div className="space-y-4">
        {rolePermissions.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-sayo-blue" />
                  <div>
                    <h3 className="text-sm font-bold">{role.name}</h3>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{role.userCount} usuarios</span>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(role.permissions).map(([perm, enabled]) => (
                  <Badge
                    key={perm}
                    variant="outline"
                    className={`text-[10px] ${enabled ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-400 border-red-200"}`}
                  >
                    {enabled ? <Check className="size-2.5 mr-0.5" /> : <X className="size-2.5 mr-0.5" />}
                    {perm}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
