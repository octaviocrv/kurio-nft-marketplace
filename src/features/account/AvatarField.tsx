import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Avatar do perfil. Fase 1: só visual; upload (com preview) e remoção entram na fase 2. */
export function AvatarField({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Avatar</span>
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-soft bg-secondary text-highlight">
          {avatarUrl ? <img src={avatarUrl} alt={`Avatar de ${name}`} className="size-full object-cover" /> : <ImageIcon className="size-6" />}
        </div>
        <Button size="sm">Alterar</Button>
        <Button size="sm" variant="ghost" disabled={!avatarUrl}>
          Remover
        </Button>
      </div>
    </div>
  )
}
