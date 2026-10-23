import type { User } from '@/api/user'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { AvatarField } from './AvatarField'

// Campos do User (ver decisoes.md: "Apelido da carteira" do Figma pertence à carteira, não ao perfil).
// Fase 1: só o formulário. Validação, erros da API e salvar entram na fase 2.
export function ProfileForm({ user }: { user: User }) {
  return (
    <form className="flex flex-col gap-8" onSubmit={(event) => event.preventDefault()} noValidate>
      <section className="flex flex-col gap-4">
        <h2 className="font-bold">Perfil do colecionador</h2>
        <AvatarField avatarUrl={user.avatarUrl} name={user.displayName} />
        <FormField id="profile-display-name" label="Nome de exibição" required>
          <Input id="profile-display-name" autoComplete="name" defaultValue={user.displayName} />
        </FormField>
        <FormField id="profile-username" label="Nome de usuário" required>
          <Input id="profile-username" autoComplete="username" defaultValue={user.username} />
        </FormField>
        <FormField id="profile-email" label="E-mail" required>
          <Input id="profile-email" type="email" autoComplete="email" defaultValue={user.email} />
        </FormField>
        <FormField id="profile-ens" label="Nome ENS">
          {/* O Figma usa um select só com ".eth": vira um sufixo fixo, que é o que ele significa */}
          <div className="flex items-center rounded-lg border border-input focus-within:border-ring">
            <Input
              id="profile-ens"
              defaultValue={user.ensName?.replace(/\.eth$/, '') ?? ''}
              placeholder="seu-nome"
              className="border-0 focus-visible:ring-0"
            />
            <span className="pr-4 text-sm text-muted-foreground">.eth</span>
          </div>
        </FormField>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold">Alterar senha</h2>
        <FormField id="profile-current-password" label="Senha atual">
          <PasswordInput id="profile-current-password" autoComplete="current-password" />
        </FormField>
        <FormField id="profile-new-password" label="Nova senha">
          <PasswordInput id="profile-new-password" autoComplete="new-password" />
        </FormField>
        <FormField id="profile-confirm-password" label="Confirmar nova senha">
          <PasswordInput id="profile-confirm-password" autoComplete="new-password" />
        </FormField>
      </section>

      <Button type="submit" size="lg" className="rounded-xl">
        Salvar
      </Button>
    </form>
  )
}
