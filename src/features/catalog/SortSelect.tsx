import { nftSortSchema, type NftSort } from '@/api/nft'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sortLabels } from './labels'

interface SortSelectProps {
  sort: NftSort
  onSortChange: (sort: NftSort) => void
}

/** "Ordenar por" do desktop. Aplica na hora: é um controle só, então gera uma consulta só (como as abas). */
export function SortSelect({ sort, onSortChange }: SortSelectProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 text-sm">
      <span aria-hidden>Ordenar por:</span>
      <Select value={sort} onValueChange={(value) => onSortChange(value as NftSort)}>
        <SelectTrigger aria-label="Ordenar por" className="w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {nftSortSchema.options.map((option) => (
            <SelectItem key={option} value={option}>{sortLabels[option]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
