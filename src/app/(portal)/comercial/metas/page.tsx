"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Trophy, TrendingUp, Users, Medal } from "lucide-react"

const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

interface Ejecutivo { id: string; nombre: string; meta: number; logrado: number; comisionGanada: number; operaciones: number; rank: number }

const demoEjecutivos: Ejecutivo[] = [
  { id: "EJ-001", nombre: "Ana Martínez López", meta: 5000000, logrado: 4200000, comisionGanada: 126000, operaciones: 18, rank: 1 },
  { id: "EJ-002", nombre: "Carlos Herrera Ruiz", meta: 5000000, logrado: 3800000, comisionGanada: 114000, operaciones: 15, rank: 2 },
  { id: "EJ-003", nombre: "Diana Flores Ortiz", meta: 4000000, logrado: 3950000, comisionGanada: 118500, operaciones: 20, rank: 3 },
  { id: "EJ-004", nombre: "Eduardo Ramírez Silva", meta: 4000000, logrado: 2800000, comisionGanada: 84000, operaciones: 12, rank: 4 },
  { id: "EJ-005", nombre: "Fernanda Castillo Vega", meta: 3500000, logrado: 2100000, comisionGanada: 63000, operaciones: 9, rank: 5 },
  { id: "EJ-006", nombre: "Gabriel Morales Cruz", meta: 3500000, logrado: 1500000, comisionGanada: 45000, operaciones: 7, rank: 6 },
]

export default function MetasPage() {
  const totalMeta = demoEjecutivos.reduce((s, e) => s + e.meta, 0)
  const totalLogrado = demoEjecutivos.reduce((s, e) => s + e.logrado, 0)
  const totalComisiones = demoEjecutivos.reduce((s, e) => s + e.comisionGanada, 0)
  const avance = Math.round((totalLogrado / totalMeta) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Metas y Comisiones</h1>
        <p className="text-sm text-muted-foreground">Objetivos comerciales, seguimiento y leaderboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Target className="size-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{fmt(totalMeta)}</p><p className="text-xs text-muted-foreground">Meta Global</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="size-5 mx-auto text-sayo-green mb-1" /><p className="text-2xl font-bold text-sayo-green">{fmt(totalLogrado)}</p><p className="text-xs text-muted-foreground">Logrado ({avance}%)</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Trophy className="size-5 mx-auto text-sayo-orange mb-1" /><p className="text-2xl font-bold text-sayo-orange">{fmt(totalComisiones)}</p><p className="text-xs text-muted-foreground">Comisiones Acumuladas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="size-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{demoEjecutivos.length}</p><p className="text-xs text-muted-foreground">Ejecutivos Activos</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Trophy className="size-4" /> Leaderboard — Marzo 2026</h2>
        <div className="space-y-4">
          {demoEjecutivos.map((e) => {
            const pct = Math.round((e.logrado / e.meta) * 100)
            return (
              <div key={e.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center justify-center size-8 rounded-full bg-muted font-bold text-sm">
                  {e.rank <= 3 ? <Medal className={`size-4 ${e.rank === 1 ? "text-yellow-500" : e.rank === 2 ? "text-gray-400" : "text-amber-600"}`} /> : e.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate">{e.nombre}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{e.operaciones} ops</Badge>
                      <span className="text-xs font-semibold text-sayo-green">{fmt(e.comisionGanada)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="flex-1 h-2" />
                    <span className="text-xs tabular-nums font-medium w-16 text-right">{fmt(e.logrado)}</span>
                    <span className="text-[10px] text-muted-foreground">/ {fmt(e.meta)}</span>
                    <span className={`text-xs font-bold tabular-nums ${pct >= 100 ? "text-sayo-green" : pct >= 70 ? "text-sayo-orange" : "text-sayo-red"}`}>{pct}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent></Card>
    </div>
  )
}
