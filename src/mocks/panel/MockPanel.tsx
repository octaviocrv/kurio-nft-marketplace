import { FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { resetMocks, setScenario } from '../control'
import { getScenario, scenarioLabels, scenarioSchema, type Scenario } from '../scenarios'

/**
 * Painel de cenários: só existe com os mocks ligados (é montado pelo src/mocks/browser.ts, fora
 * da árvore do app). Fica discreto na borda esquerda para não competir com o layout do Figma.
 */
export function MockPanel() {
  const activeScenario = getScenario()
  const [selected, setSelected] = useState<Scenario>(activeScenario)

  function applyScenario() {
    setScenario(selected)
    // Recarrega para o app começar do zero no cenário novo (sem cache do cenário anterior)
    window.location.reload()
  }

  return (
    <Dialog onOpenChange={(open) => open && setSelected(getScenario())}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Simulação da API: cenário ${scenarioLabels[activeScenario].title}`}
          className="fixed top-1/2 left-0 z-50 flex h-12 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-lg border border-l-0 border-border-soft bg-card/80 text-muted-foreground opacity-70 outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:text-highlight data-[active=true]:opacity-100"
          // Fora do padrão, o botão fica destacado: lembra que a API não está no cenário normal
          data-active={activeScenario !== 'default'}
        >
          <FlaskConical className="size-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Simulação da API</DialogTitle>
          <DialogDescription>
            Muda como a API simulada (MSW) responde. Também dá para escolher pela URL: <code>?scenario=slow</code>.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selected} onValueChange={(value) => setSelected(value as Scenario)} aria-label="Cenário">
          {scenarioSchema.options.map((scenario) => (
            <label key={scenario} htmlFor={`mock-scenario-${scenario}`} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-secondary">
              <RadioGroupItem id={`mock-scenario-${scenario}`} value={scenario} className="mt-0.5" />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">{scenarioLabels[scenario].title}</span>
                <span className="text-xs text-muted-foreground">{scenarioLabels[scenario].description}</span>
              </span>
            </label>
          ))}
        </RadioGroup>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={resetMocks}>
            Restaurar dados iniciais
          </Button>
          <Button onClick={applyScenario}>Aplicar cenário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
