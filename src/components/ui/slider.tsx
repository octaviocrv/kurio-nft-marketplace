import * as React from "react"
import { cn } from "@/lib/utils"
import { Slider as SliderPrimitive } from "radix-ui"

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Um rótulo acessível por ponta (ex.: ["Preço mínimo", "Preço máximo"]) */
  thumbLabels: string[]
  /** Texto lido pelo leitor de tela para o valor de cada ponta */
  getValueText?: (value: number) => string
}

// Faixa de uma ou duas pontas (Radix cuida de teclado, toque, arraste e ARIA).
// Teclado: setas ±1 passo, PageUp/PageDown ±10, Home/End vão ao limite.
function Slider({ className, value, thumbLabels, getValueText, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      className={cn("relative flex h-6 w-full touch-none items-center select-none data-[disabled]:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-primary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {value?.map((thumbValue, index) => (
        <SliderPrimitive.Thumb
          key={thumbLabels[index]}
          aria-label={thumbLabels[index]}
          aria-valuetext={getValueText?.(thumbValue)}
          // after: área de toque maior que o círculo visível (16px) sem aumentar o desenho
          className="relative block size-4 shrink-0 cursor-grab rounded-full border-2 border-secondary bg-primary outline-none transition-[box-shadow] after:absolute after:-inset-2 after:content-[''] hover:ring-4 hover:ring-primary/20 focus-visible:ring-[5px] focus-visible:ring-ring/50 active:cursor-grabbing"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
