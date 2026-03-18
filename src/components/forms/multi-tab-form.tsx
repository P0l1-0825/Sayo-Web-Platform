"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight, Save, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export interface FormField {
  name: string
  label: string
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "email" | "tel" | "currency"
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: string | number | boolean
  span?: 1 | 2 // grid columns
  pattern?: RegExp
  patternMessage?: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
}

export interface FormTab {
  label: string
  icon?: string
  fields: FormField[]
  description?: string
}

interface MultiTabFormProps {
  tabs: FormTab[]
  onSubmit?: (data: Record<string, unknown>) => void
  title?: string
  submitLabel?: string
  readOnly?: boolean
  initialData?: Record<string, unknown>
}

export function MultiTabForm({ tabs, onSubmit, title, submitLabel = "Enviar", readOnly = false, initialData = {} }: MultiTabFormProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
  const [completedTabs, setCompletedTabs] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showErrors, setShowErrors] = useState(false)

  const handleFieldChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validateTab = useCallback((tabIndex: number): Record<string, string> => {
    const tab = tabs[tabIndex]
    const tabErrors: Record<string, string> = {}
    for (const field of tab.fields) {
      if (field.required) {
        const value = formData[field.name]
        if (value === undefined || value === null || value === "" || (typeof value === "number" && isNaN(value))) {
          tabErrors[field.name] = `${field.label} es requerido`
        }
      }
      // Email validation
      if (field.type === "email" && formData[field.name]) {
        const email = String(formData[field.name])
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          tabErrors[field.name] = "Email inválido"
        }
      }
      // Tel validation (basic: at least 10 digits)
      if (field.type === "tel" && formData[field.name]) {
        const tel = String(formData[field.name]).replace(/\D/g, "")
        if (tel && tel.length < 10) {
          tabErrors[field.name] = "Teléfono debe tener al menos 10 dígitos"
        }
      }
      // Custom pattern validation
      if (field.pattern && formData[field.name]) {
        const val = String(formData[field.name])
        if (val && !field.pattern.test(val)) {
          tabErrors[field.name] = field.patternMessage || `${field.label} tiene formato inválido`
        }
      }
      // Min/Max for number/currency
      if ((field.type === "number" || field.type === "currency") && formData[field.name] !== undefined && formData[field.name] !== "") {
        const num = Number(formData[field.name])
        if (field.min !== undefined && num < field.min) {
          tabErrors[field.name] = `${field.label} debe ser al menos ${field.min.toLocaleString("es-MX")}`
        }
        if (field.max !== undefined && num > field.max) {
          tabErrors[field.name] = `${field.label} no debe exceder ${field.max.toLocaleString("es-MX")}`
        }
      }
      // MinLength/MaxLength for text fields
      if (formData[field.name] && typeof formData[field.name] === "string") {
        const len = (formData[field.name] as string).length
        if (field.minLength && len < field.minLength) {
          tabErrors[field.name] = `${field.label} debe tener al menos ${field.minLength} caracteres`
        }
        if (field.maxLength && len > field.maxLength) {
          tabErrors[field.name] = `${field.label} no debe exceder ${field.maxLength} caracteres`
        }
      }
    }
    return tabErrors
  }, [tabs, formData])

  const isTabValid = useCallback((tabIndex: number): boolean => {
    return Object.keys(validateTab(tabIndex)).length === 0
  }, [validateTab])

  const markTabComplete = () => {
    setCompletedTabs(prev => new Set([...prev, activeTab]))
  }

  const handleNext = () => {
    const tabErrors = validateTab(activeTab)
    if (Object.keys(tabErrors).length > 0) {
      setErrors(tabErrors)
      setShowErrors(true)
      toast.error("Campos requeridos", { description: "Completa los campos obligatorios antes de continuar" })
      return
    }
    setErrors({})
    setShowErrors(false)
    markTabComplete()
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1)
    }
  }

  const handlePrevious = () => {
    setShowErrors(false)
    if (activeTab > 0) {
      setActiveTab(activeTab - 1)
    }
  }

  const handleSubmit = () => {
    // Validate all tabs
    const allErrors: Record<string, string> = {}
    const invalidTabs: number[] = []
    for (let i = 0; i < tabs.length; i++) {
      const tabErrors = validateTab(i)
      Object.assign(allErrors, tabErrors)
      if (Object.keys(tabErrors).length > 0) invalidTabs.push(i)
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      setShowErrors(true)
      // Navigate to first invalid tab
      if (invalidTabs.length > 0) setActiveTab(invalidTabs[0])
      toast.error("Formulario incompleto", { description: `Revisa las secciones: ${invalidTabs.map(i => tabs[i].label).join(", ")}` })
      return
    }
    markTabComplete()
    onSubmit?.(formData)
  }

  const currentTab = tabs[activeTab]
  const isLastTab = activeTab === tabs.length - 1
  const progress = Math.round(((completedTabs.size) / tabs.length) * 100)

  return (
    <div className="space-y-6">
      {title && <h2 className="text-xl font-bold">{title}</h2>}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progreso: {completedTabs.size} de {tabs.length} secciones</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-sayo-cafe transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {tabs.map((tab, index) => {
          const tabHasErrors = showErrors && !isTabValid(index) && !completedTabs.has(index)
          return (
            <button
              key={index}
              onClick={() => { setShowErrors(false); setActiveTab(index) }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === index
                  ? "bg-sayo-cafe text-white"
                  : completedTabs.has(index)
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : tabHasErrors
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {completedTabs.has(index) && <Check className="h-3.5 w-3.5" />}
              {tabHasErrors && <AlertCircle className="h-3.5 w-3.5" />}
              <span>{index + 1}. {tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active tab content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{currentTab.label}</CardTitle>
            <Badge variant="outline">Paso {activeTab + 1} de {tabs.length}</Badge>
          </div>
          {currentTab.description && (
            <p className="text-sm text-muted-foreground">{currentTab.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTab.fields.map((field) => {
              const fieldError = showErrors ? errors[field.name] : undefined
              return (
                <div key={field.name} className={cn("space-y-2", field.span === 2 && "md:col-span-2")}>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={(formData[field.name] as string) || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      disabled={readOnly}
                      rows={3}
                      className={cn(fieldError && "border-red-500 focus-visible:ring-red-500")}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      value={(formData[field.name] as string) || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      disabled={readOnly}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        fieldError && "border-red-500 focus:ring-red-500"
                      )}
                    >
                      <option value="">{field.placeholder || "Seleccionar..."}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <input
                        id={field.name}
                        type="checkbox"
                        checked={(formData[field.name] as boolean) || false}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        disabled={readOnly}
                        className="h-4 w-4 rounded border-gray-300 text-sayo-cafe focus:ring-sayo-cafe"
                      />
                      <span className="text-sm text-muted-foreground">{field.placeholder}</span>
                    </div>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === "currency" ? "number" : field.type}
                      placeholder={field.placeholder}
                      value={(formData[field.name] as string | number) || ""}
                      onChange={(e) => handleFieldChange(field.name, field.type === "number" || field.type === "currency" ? Number(e.target.value) : e.target.value)}
                      disabled={readOnly}
                      step={field.type === "currency" ? "0.01" : undefined}
                      className={cn(fieldError && "border-red-500 focus-visible:ring-red-500")}
                    />
                  )}
                  {fieldError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldError}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={activeTab === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {!isLastTab ? (
            <Button onClick={handleNext} className="bg-sayo-cafe hover:bg-sayo-cafe-light">
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-accent-green hover:bg-accent-green/90 text-white">
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
