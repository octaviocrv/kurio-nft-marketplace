import { Skeleton } from '@/components/ui/skeleton'

/** Mesmas medidas do NftCard (imagem quadrada + nome + preço): os cards entram sem deslocar o layout. */
export function NftGridSkeleton({ count }: { count: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-6 md:gap-y-8">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="rounded-2xl bg-card p-1 pb-5">
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
          <Skeleton className="mt-3 h-5 w-3/4" />
          <Skeleton className="mt-1 h-5 w-1/2" />
        </li>
      ))}
    </ul>
  )
}

/** Mesma altura do slide do hero (texto à esquerda, arte quadrada à direita). */
export function HeroSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-card p-4 pb-8 md:gap-10 md:bg-transparent md:p-0 md:pb-12">
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="mt-1 h-4 w-1/3" />
      </div>
      <Skeleton className="aspect-square w-[42%] shrink-0 rounded-2xl md:w-[45%] lg:w-[450px]" />
    </div>
  )
}
