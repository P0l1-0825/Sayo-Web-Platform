"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

export interface WizardStep {
  title: string
  description?: string
  content: React.ReactNode
  validate?: () => boolean
}

interface WizardStepsProps {
  steps: WizardStep[]
  onComplete?: () => void
  completedContent?: React.ReactNode
  title?: string
}

export function WizardSteps({ steps, onComplete, completedContent, title }: WizardStepsProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleNext = () => {
    const step = steps[currentStep]
    if (step.validate && !step.validate()) return

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setCompleted(true)
      onComplete?.()
    }, 1500) // Simulate processing
  }

  const isLastStep = currentStep === steps.length - 1

  if (completed && completedContent) {
    return <>{completedContent}</>
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-xl font-bold">{title}</h2>}

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <div className={cn(
              "flex items-center justify-center rounded-full text-sm font-bold transition-colors",
              "h-10 w-10",
              index < currentStep
                ? "bg-accent-green text-white"
                : index === currentStep
                ? "bg-sayo-cafe text-white"
                : "bg-muted text-muted-foreground"
            )}>
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            {/* Step label below */}
            <div className="hidden sm:block ml-2 mr-4">
              <p className={cn(
                "text-sm font-medium",
                index === currentStep ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "h-0.5 w-8 sm:w-16",
                index < currentStep ? "bg-accent-green" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Current step content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Paso {currentStep + 1}: {steps[currentStep].title}
          </CardTitle>
          {steps[currentStep].description && (
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          )}
        </CardHeader>
        <CardContent>
          {steps[currentStep].content}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || processing}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {!isLastStep ? (
          <Button onClick={handleNext} className="bg-sayo-cafe hover:bg-sayo-cafe-light">
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={processing}
            className="bg-accent-green hover:bg-accent-green/90 text-white"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirmar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
