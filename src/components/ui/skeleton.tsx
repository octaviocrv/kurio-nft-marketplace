import { cn } from "@/lib/utils"

// Shimmer em vez do pulse padrão; quem pede menos movimento vê o bloco parado.
// aria-hidden: leitor de tela não deve anunciar placeholders (quem anuncia o carregamento é aria-busy no container).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-foreground/5 before:to-transparent motion-reduce:before:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
