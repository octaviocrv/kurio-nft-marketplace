import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Avatar do perfil, em destaque no topo. Fase 1: só visual; upload (com preview) e remoção entram na fase 2. */
export function AvatarField({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-secondary text-highlight">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Avatar de ${name}`} width={112} height={112} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-10" />
        )}
      </div>
      <div className="flex gap-3">
        <Button size="sm">Alterar avatar</Button>
        <Button size="sm" variant="outline" disabled={!avatarUrl}>
          Remover
        </Button>
      </div>
    </div>
  )
}
