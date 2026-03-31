"use client"

import * as React from "react"
import { Bell, Check, AlertTriangle, Info, CreditCard, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "transaction"
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Transferencia recibida",
    message: "SPEI entrante por $15,000.00 de BBVA",
    type: "transaction",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: "2",
    title: "Alerta PLD",
    message: "Operación inusual detectada — revisión requerida",
    type: "warning",
    time: "Hace 12 min",
    read: false,
  },
  {
    id: "3",
    title: "KYC completado",
    message: "Verificación de identidad aprobada para cliente #4521",
    type: "success",
    time: "Hace 30 min",
    read: false,
  },
  {
    id: "4",
    title: "Reporte generado",
    message: "Estado de cuenta mensual disponible para descarga",
    type: "info",
    time: "Hace 1 hora",
    read: true,
  },
  {
    id: "5",
    title: "Pago programado",
    message: "Dispersión de nómina ejecutada — 45 movimientos",
    type: "transaction",
    time: "Hace 2 horas",
    read: true,
  },
]

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  success: Check,
  transaction: CreditCard,
}

const colorMap = {
  info: "text-blue-500",
  warning: "text-amber-500",
  success: "text-green-500",
  transaction: "text-sayo-cafe",
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = React.useState(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-sayo-red" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] text-muted-foreground hover:text-foreground font-normal"
            >
              Marcar todo como leído
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type]
            return (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 py-3 cursor-pointer"
              >
                <div className={`mt-0.5 shrink-0 ${colorMap[notification.type]}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-medium truncate ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="flex size-1.5 rounded-full bg-sayo-red shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">
                    {notification.time}
                  </p>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-xs text-muted-foreground cursor-pointer">
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
