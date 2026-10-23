import { Camera, ImageIcon } from 'lucide-react'
import type { User } from '@/api/user'

/** Cartão de identidade do topo do perfil. Fase 1: só visual; upload (com preview) e remoção entram na fase 2. */
export function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-secondary text-highlight">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={`Avatar de ${user.displayName}`} width={112} height={112} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-10" />
          )}
        </div>
        <button
          type="button"
          aria-label="Alterar avatar"
          className="absolute right-0 bottom-0 flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Camera className="size-4" />
        </button>
      </div>
      <div>
        <p className="text-lg font-bold">{user.displayName}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
      {user.avatarUrl && (
        <button type="button" className="cursor-pointer rounded-sm text-xs text-muted-foreground underline-offset-4 outline-none hover:text-destructive hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">
          Remover foto
        </button>
      )}
    </div>
  )
}
