import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Mesmo esqueleto da página de detalhe: galeria quadrada, painel e barra de compra.
 * Mobile: barra fixa embaixo. Tablet/desktop: duas colunas, com a compra em linha no painel.
 */
export function NftDetailSkeleton() {
  return (
    <>
      <div className="md:hidden">
        <PageHeader />
      </div>
      <main
        aria-busy="true"
        aria-label="Carregando NFT"
        className="mx-auto max-w-md pb-[calc(10rem+env(safe-area-inset-bottom))] md:page-container md:grid md:grid-cols-2 md:items-start md:gap-8 md:pt-16 md:pb-0 lg:gap-12"
      >
        <div className="px-6 md:px-0">
          <Skeleton className="aspect-square w-full rounded-3xl md:rounded-lg" />
        </div>
        <section className="relative -mt-10 flex flex-col gap-4 rounded-t-3xl bg-card px-6 pt-6 pb-8 md:mt-0 md:rounded-none md:bg-transparent md:p-0">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-5 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-14 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <div aria-hidden className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:static md:rounded-none md:border-0 md:bg-transparent md:pb-0">
            <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pt-5 pb-5 md:max-w-none md:p-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-14 flex-1 rounded-full" />
                <Skeleton className="size-14 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
        </section>
      </main>
    </>
  )
}
