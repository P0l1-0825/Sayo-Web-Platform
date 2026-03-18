"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AmortizationRow } from "@/lib/types"
import { formatMoney } from "@/lib/utils"

interface AmortizationTableProps {
  rows: AmortizationRow[]
  showTotals?: boolean
  title?: string
}

export function AmortizationTable({ rows, showTotals = true, title = "Tabla de Amortización" }: AmortizationTableProps) {
  const totals = showTotals
    ? rows.reduce(
        (acc, row) => ({
          capital: acc.capital + row.capital,
          interest: acc.interest + row.interest,
          iva: acc.iva + row.iva,
          totalPayment: acc.totalPayment + row.totalPayment,
        }),
        { capital: 0, interest: 0, iva: 0, totalPayment: 0 }
      )
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center w-16">No.</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead className="text-right">Capital</TableHead>
                <TableHead className="text-right">Interés</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Pago Total</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.period} className="text-sm">
                  <TableCell className="text-center font-medium">{row.period}</TableCell>
                  <TableCell className="text-right">{formatMoney(row.initialBalance)}</TableCell>
                  <TableCell className="text-right">{formatMoney(row.capital)}</TableCell>
                  <TableCell className="text-right">{formatMoney(row.interest)}</TableCell>
                  <TableCell className="text-right">{formatMoney(row.iva)}</TableCell>
                  <TableCell className="text-right font-medium">{formatMoney(row.totalPayment)}</TableCell>
                  <TableCell className="text-right">{formatMoney(row.finalBalance)}</TableCell>
                </TableRow>
              ))}
              {totals && (
                <TableRow className="bg-sayo-cream font-bold border-t-2">
                  <TableCell className="text-center">TOTAL</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">{formatMoney(totals.capital)}</TableCell>
                  <TableCell className="text-right">{formatMoney(totals.interest)}</TableCell>
                  <TableCell className="text-right">{formatMoney(totals.iva)}</TableCell>
                  <TableCell className="text-right">{formatMoney(totals.totalPayment)}</TableCell>
                  <TableCell className="text-right">—</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
