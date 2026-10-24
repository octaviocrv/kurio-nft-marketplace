import { Skeleton } from '@/components/ui/skeleton'

/** Mesmas dimensões do perfil carregado: avatar, nome e dois cards de campos (evita deslocamento de layout). */
export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando perfil" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-28 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-[26rem] rounded-2xl" />
      <Skeleton className="h-60 rounded-2xl" />
      <Skeleton className="h-12 rounded-xl" />
    </div>
  )
}

export function WalletsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando carteiras" className="flex flex-col gap-6">
      <Skeleton className="mx-auto h-10 w-full" />
      <Skeleton className="h-60 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  )
}
