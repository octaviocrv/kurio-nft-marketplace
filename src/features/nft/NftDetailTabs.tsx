import type { Nft } from '@/api/nft'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { categoryLabels, networkLabels } from '@/features/catalog/labels'
import { formatDate } from '@/lib/date'

/**
 * Abas do Figma desktop. Só mostram o que o contrato tem: os textos de contrato e royalties do Figma
 * não existem na API, e a API de avaliações traz só a nota e o total (sem os comentários).
 */
export function NftDetailTabs({ nft }: { nft: Nft }) {
  return (
    <Tabs defaultValue="detalhes" className="gap-6">
      <TabsList className="-ml-2 w-full justify-start border-b">
        <TabsTrigger value="detalhes">Detalhes do NFT</TabsTrigger>
        <TabsTrigger value="avaliacoes">Avaliações de colecionadores ({nft.rating.count})</TabsTrigger>
      </TabsList>

      <TabsContent value="detalhes" className="flex flex-col gap-5 text-sm leading-6">
        <p className="text-muted-foreground">{nft.description}</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem term="Rede" value={networkLabels[nft.network]} />
          <DetailItem term="Coleção" value={`${nft.collection} · ${categoryLabels[nft.category]}`} />
          <DetailItem term="ID do token" value={`#${nft.tokenId}`} />
          <DetailItem term="Listado em" value={formatDate(nft.listedAt)} />
          <DetailItem
            term="Edições"
            // Edição aberta não tem tiragem fixa (supply null): mostra só o que está disponível
            value={nft.editions
              .map((edition) => `${edition.label}: ${edition.available}${edition.supply === null ? '' : ` de ${edition.supply}`} disponíveis`)
              .join(' · ')}
          />
          <DetailItem term="Atributos" value={nft.attributes.join(', ')} />
        </dl>
      </TabsContent>

      <TabsContent value="avaliacoes" className="text-sm leading-6">
        <p>
          Nota média <strong className="text-highlight">{nft.rating.average.toFixed(1)} de 5</strong>, com base em {nft.rating.count}{' '}
          {nft.rating.count === 1 ? 'avaliação' : 'avaliações'} de colecionadores.
        </p>
        <p className="text-muted-foreground">Os comentários individuais não fazem parte da demo.</p>
      </TabsContent>
    </Tabs>
  )
}

function DetailItem({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-bold">{term}:</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  )
}
