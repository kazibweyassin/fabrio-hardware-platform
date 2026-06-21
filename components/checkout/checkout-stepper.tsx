import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, label: 'Cart' },
  { id: 2, label: 'Shipping' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Done' },
] as const

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3 | 4
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-between gap-2 max-w-2xl">
        {steps.map((step, index) => {
          const isComplete = step.id < currentStep
          const isCurrent = step.id === currentStep

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 shrink-0 transition-colors',
                    isComplete && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-accent bg-accent/10 text-accent-foreground',
                    !isComplete && !isCurrent && 'border-border bg-surface text-muted-foreground'
                  )}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium truncate w-full text-center',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 rounded-full mb-5',
                    step.id < currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}