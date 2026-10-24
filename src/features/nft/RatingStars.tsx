import { Star } from 'lucide-react'
import type { Nft } from '@/api/nft'
import { cn } from '@/lib/utils'

/** Estrelas do desktop: a nota em texto vem junto, então a informação não depende só do desenho. */
export function RatingStars({ rating }: { rating: Nft['rating'] }) {
  const filledStars = Math.round(rating.average)
  return (
    <p className="flex items-center gap-2 text-sm">
      <span aria-hidden className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className={cn('size-4 text-highlight', index < filledStars && 'fill-highlight')} />
        ))}
      </span>
      <span>
        {rating.average.toFixed(1)} · {rating.count} {rating.count === 1 ? 'avaliação' : 'avaliações'} de colecionadores
      </span>
    </p>
  )
}
