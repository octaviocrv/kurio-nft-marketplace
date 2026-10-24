import { Camera, ImageIcon } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'
import { AVATAR_TYPES } from '@/api/profile'

interface ProfileHeaderProps {
  displayName: string
  username: string
  avatarUrl: string | null // o que está no formulário: mostra a prévia antes de salvar
  error?: string
  onPickAvatar: (file: File) => void
  onRemoveAvatar: () => void
}

/** Cartão de identidade do topo do perfil: avatar com troca (prévia imediata) e remoção. */
export function ProfileHeader({ displayName, username, avatarUrl, error, onPickAvatar, onRemoveAvatar }: ProfileHeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpa o campo para escolher o mesmo arquivo de novo depois de um erro
    event.target.value = ''
    if (file) onPickAvatar(file)
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-secondary text-highlight">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`Avatar de ${displayName}`} width={112} height={112} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-10" />
          )}
        </div>
        <input ref={fileInput} type="file" accept={AVATAR_TYPES.join(',')} hidden aria-label="Escolher imagem do avatar" onChange={handleFileChange} />
        <button
          type="button"
          aria-label="Alterar avatar"
          onClick={() => fileInput.current?.click()}
          className="absolute right-0 bottom-0 flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Camera className="size-4" />
        </button>
      </div>
      <div>
        <p className="text-lg font-bold">{displayName}</p>
        <p className="text-sm text-muted-foreground">@{username}</p>
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      {avatarUrl && (
        <button
          type="button"
          onClick={onRemoveAvatar}
          className="cursor-pointer rounded-sm text-xs text-muted-foreground underline-offset-4 outline-none hover:text-destructive hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Remover foto
        </button>
      )}
    </div>
  )
}
