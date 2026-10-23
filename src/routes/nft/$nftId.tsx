import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Heart, SearchX, Star } from 'lucide-react'
import { useState } from 'react'
import type { Nft } from '@/api/nft'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { BuyBar } from '@/features/nft/BuyBar'
import { EditionPicker } from '@/features/nft/EditionPicker'
import { NftDetailSkeleton } from '@/features/nft/NftDetailSkeleton'
import { NftGallery } from '@/features/nft/NftGallery'
import { useNftDetail } from '@/features/nft/queries'
import { multiplyWei, parseEth, toEthString } from '@/lib/eth'
import { isSoldOut } from '@/lib/nft'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/nft/$nftId')({
  // Trocar de NFT remonta a página: edição/quantidade escolhidas no anterior não vazam para o próximo
  remountDeps: ({ params }) => params.nftId,
  component: NftDetailPage,
})

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const detail = useNftDetail(nftId)

  if (detail.isPending) return <NftDetailSkeleton />

  if (detail.isError && !detail.data) {
    // Acesso direto a um id que não existe: a API responde 404 (requisito do enunciado)
    if (detail.error.code === 'not_found') return <NftNotFound />
    return (
      <div className="flex min-h-dvh flex-col">
        <PageHeader />
        <main className="flex flex-1 flex-col">
          <ErrorState title="Não foi possível carregar o NFT" description={detail.error.message} onRetry={() => detail.refetch()} isRetrying={detail.isFetching} />
        </main>
      </div>
    )
  }

  if (!detail.data) return null
  return <NftDetail nft={detail.data} />
}

// Separado da página: a edição e a quantidade só começam a existir quando o NFT já chegou
function NftDetail({ nft }: { nft: Nft }) {
  const navigate = useNavigate()
  const soldOut = isSoldOut(nft)

  // Começa na primeira edição com estoque (a primeira pode estar esgotada)
  const [editionId, setEditionId] = useState(() => nft.editions.find((edition) => edition.available > 0)?.id)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const edition = nft.editions.find((item) => item.id === editionId)
  const available = edition?.available ?? 0
  const total = toEthString(multiplyWei(parseEth(nft.price), quantity))

  function handleEditionChange(nextEditionId: string) {
    setEditionId(nextEditionId)
    setQuantity(1) // cada edição tem seu estoque: a quantidade anterior pode não caber na nova
  }

  return (
    <>
      <PageHeader
        action={
          <Button
            variant="outline"
            size="icon"
            className={cn('rounded-full', isFavorite && 'text-highlight')}
            onClick={() => setIsFavorite(!isFavorite)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
          >
            <Heart className={cn('size-5', isFavorite && 'fill-current')} />
          </Button>
        }
      />

      {/* Espaço no fim para a barra de compra fixa não cobrir o conteúdo */}
      <main className="mx-auto max-w-md pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <div className="px-6">
          <NftGallery name={nft.name} images={nft.images} />
        </div>

        {/* Painel sobe por cima da imagem, como o bottom sheet do Figma */}
        <section className="relative -mt-10 flex flex-col gap-4 rounded-t-3xl bg-card px-6 pt-6 pb-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold">{nft.name}</h1>
            <p className="flex shrink-0 items-center gap-1 rounded-full border border-highlight px-2 py-0.5 text-sm">
              <Star aria-hidden className="size-4 fill-highlight text-highlight" />
              <span className="font-bold">{nft.rating.average.toFixed(1)}</span>
              <span className="text-muted-foreground">({nft.rating.count})</span>
              <span className="sr-only">avaliações</span>
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{nft.description}</p>

          <EditionPicker editions={nft.editions} selectedId={editionId} onSelect={handleEditionChange} />
          {edition && (
            <p className="text-xs text-muted-foreground">
              {available} {available === 1 ? 'disponível' : 'disponíveis'} nesta edição
            </p>
          )}

          <dl className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <dt>ID do token:</dt>
              <dd>#{nft.tokenId}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Coleção:</dt>
              <dd>{nft.collection}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Atributos:</dt>
              <dd>{nft.attributes.join(', ')}</dd>
            </div>
          </dl>
        </section>
      </main>

      <BuyBar
        nftName={nft.name}
        total={total}
        quantity={quantity}
        maxQuantity={available}
        onQuantityChange={setQuantity}
        // Fase 1: só navega. Na fase 2 adiciona ao carrinho de verdade antes.
        onBuy={() => navigate({ to: '/carrinho' })}
        onAddToCart={() => {}}
        soldOut={soldOut}
      />
    </>
  )
}

function NftNotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader />
      <main className="flex flex-1 flex-col">
        <EmptyState
          icon={<SearchX />}
          title="NFT não encontrado"
          description="Ele pode ter sido removido ou o link está incorreto."
          action={{ label: 'Voltar ao catálogo', to: '/' }}
        />
      </main>
    </div>
  )
}
