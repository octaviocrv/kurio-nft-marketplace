import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Reescrito no único estilo do Figma (texto + sublinhado laranja na aba ativa).
// O shadcn traz também o estilo "pílula", que o layout não usa.

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex w-fit items-center gap-2", className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 pt-1.5 pb-2.5 text-sm font-bold whitespace-nowrap text-foreground transition-colors duration-200 outline-none hover:text-highlight disabled:pointer-events-none disabled:opacity-50",
        // Foco de teclado como fundo suave (não caixa colada no texto); continua visível para acessibilidade
        "focus-visible:bg-accent/70",
        // Peso fixo (bold em todas): se só a ativa engrossasse, a largura mudaria e empurraria as vizinhas
        "data-[state=active]:text-highlight",
        // Sublinhado que cresce do centro na aba ativa e encolhe na anterior
        "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-highlight after:transition-transform after:duration-300 after:ease-out data-[state=active]:after:scale-x-100 motion-reduce:after:transition-none",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
