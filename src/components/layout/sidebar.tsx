"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { PortalConfig } from "@/lib/types"
import {
  LayoutDashboard, ArrowLeftRight, Send, GitCompare, Wallet, FileBarChart,
  AlertTriangle, FileText, Search, FileSearch, Briefcase, Target, Phone,
  Users, DollarSign, Ticket, Scale, BookOpen, Shield, UserCog, ScrollText,
  AlertOctagon, Rocket, Bell, LayoutTemplate, Crown, Receipt, Gauge, Presentation,
  Settings, Database, KeyRound, CreditCard, UserCircle, Home, Package, Building2,
  Globe, Monitor, ShieldCheck, HandCoins, TrendingUp, Headphones, Megaphone, User,
  ArrowDownLeft, ArrowUpRight, Kanban,
  FileSignature, Landmark, Calculator, ClipboardList, UserCheck, Gavel,
  CircleDollarSign, Import, Ban, Clock, ListChecks, FolderOpen, CalendarClock,
  FileWarning, ScanSearch, RefreshCw,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, ArrowLeftRight, Send, GitCompare, Wallet, FileBarChart,
  AlertTriangle, FileText, Search, FileSearch, Briefcase, Target, Phone,
  Users, DollarSign, Ticket, Scale, BookOpen, Shield, UserCog, ScrollText,
  AlertOctagon, Rocket, Bell, LayoutTemplate, Crown, Receipt, Gauge, Presentation,
  Settings, Database, KeyRound, CreditCard, UserCircle, Home, Package, Building2,
  Globe, Monitor, ShieldCheck, HandCoins, TrendingUp, Headphones, Megaphone, User,
  ArrowDownLeft, ArrowUpRight, Kanban,
  FileSignature, Landmark, Calculator, ClipboardList, UserCheck, Gavel,
  CircleDollarSign, Import, Ban, Clock, ListChecks, FolderOpen, CalendarClock,
  FileWarning, ScanSearch, RefreshCw,
}

interface SidebarProps {
  portal: PortalConfig
  collapsed?: boolean
}

export function Sidebar({ portal, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo — links back to portal selector */}
      <Link
        href="/login"
        className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 hover:bg-sidebar-accent/50 transition-colors"
        title="Volver al selector de portales"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sayo-cafe text-white font-bold text-sm">
          S
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sayo-cafe tracking-wide">SAYO</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{portal.shortName}</span>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {portal.navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-sayo-red text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs font-medium text-sidebar-foreground">SAYO Financial</p>
            <p className="text-[10px] text-muted-foreground">Regulado por CNBV</p>
          </div>
        )}
      </div>
    </aside>
  )
}
