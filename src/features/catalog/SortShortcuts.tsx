import type { NftSort } from '@/api/nft'

interface SortShortcutsProps {
  shortcuts: { sort: NftSort; label: string }[]
  activeSort: NftSort
  onSortChange: (sort: NftSort) => void
}

/**
 * "Todos os NFTs / Novos lançamentos / Em alta": no Figma parecem abas, mas são atalhos de ordenação
 * da mesma lista (não há painéis). Por isso são botões com aria-pressed, não role="tab" (que exigiria
 * um tabpanel para cada um). O visual é o mesmo das abas.
 */
export function SortShortcuts({ shortcuts, activeSort, onSortChange }: SortShortcutsProps) {
  return (
    <div role="group" aria-label="Atalhos de ordenação" className="-ml-2 inline-flex w-fit items-center gap-2">
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.sort}
          type="button"
          aria-pressed={shortcut.sort === activeSort}
          onClick={() => onSortChange(shortcut.sort)}
          className="relative inline-flex cursor-pointer items-center rounded-md px-2 pt-1.5 pb-2.5 text-sm font-bold whitespace-nowrap text-foreground transition-colors duration-200 outline-none hover:text-highlight focus-visible:bg-accent/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:text-highlight after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-highlight after:transition-transform after:duration-300 after:ease-out aria-pressed:after:scale-x-100 motion-reduce:after:transition-none"
        >
          {shortcut.label}
        </button>
      ))}
    </div>
  )
}
