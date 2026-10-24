import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { changePasswordInputSchema, updateProfileInputSchema, type ChangePasswordInput, type UpdateProfileInput } from '@/api/profile'
import type { User } from '@/api/user'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { fieldA11y } from '@/lib/fieldA11y'
import { AccountCard } from './AccountCard'
import { readAvatarFile } from './avatar'
import { showApiError } from './formErrors'
import { ProfileHeader } from './ProfileHeader'

/**
 * Perfil e senha vivem no mesmo formulário (como no Figma, com um botão só). A troca de senha
 * só é validada e enviada se algum campo de senha for preenchido; a regra é a do schema da API.
 */
const profileFormSchema = updateProfileInputSchema
  .extend({ currentPassword: z.string(), newPassword: z.string(), confirmPassword: z.string() })
  .superRefine((form, ctx) => {
    if (!form.currentPassword && !form.newPassword && !form.confirmPassword) return
    const result = changePasswordInputSchema.safeParse(form)
    result.error?.issues.forEach((issue) => ctx.addIssue({ code: 'custom', path: issue.path, message: issue.message }))
  })
type ProfileFormValues = z.infer<typeof profileFormSchema>

const profileFields = ['displayName', 'username', 'email', 'ensName', 'avatarUrl'] as const
const passwordFields = ['currentPassword', 'newPassword', 'confirmPassword'] as const

function toFormValues(user: User): ProfileFormValues {
  return {
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    ensName: user.ensName,
    avatarUrl: user.avatarUrl,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

interface ProfileFormProps {
  user: User
  onSaveProfile: (input: UpdateProfileInput) => Promise<User>
  onChangePassword: (input: ChangePasswordInput) => Promise<void>
}

export function ProfileForm({ user, onSaveProfile, onChangePassword }: ProfileFormProps) {
  const [notice, setNotice] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema), defaultValues: toFormValues(user) })
  const avatarUrl = useWatch({ control, name: 'avatarUrl' })

  async function handlePickAvatar(file: File) {
    try {
      setValue('avatarUrl', await readAvatarFile(file))
      clearErrors('avatarUrl')
    } catch (error) {
      setError('avatarUrl', { message: error instanceof Error ? error.message : 'Não foi possível ler a imagem' })
    }
  }

  async function submit(values: ProfileFormValues) {
    setNotice(null)
    const { currentPassword, newPassword, confirmPassword, ...profile } = values

    let savedUser: User
    try {
      savedUser = await onSaveProfile(profile)
    } catch (error) {
      showApiError(error, setError, profileFields)
      return
    }
    const passwords = { currentPassword, newPassword, confirmPassword }
    if (!currentPassword && !newPassword && !confirmPassword) {
      reset(toFormValues(savedUser))
      setNotice('Alterações salvas.')
      return
    }

    // O perfil já foi salvo: se a senha falhar, o que o usuário digitou nela fica na tela para corrigir
    reset({ ...toFormValues(savedUser), ...passwords })
    try {
      await onChangePassword(passwords)
      reset(toFormValues(savedUser))
      setNotice('Alterações salvas.')
    } catch (error) {
      setNotice('Dados do perfil salvos. A senha não foi alterada.')
      showApiError(error, setError, passwordFields)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)} noValidate>
      <ProfileHeader
        displayName={user.displayName}
        username={user.username}
        avatarUrl={avatarUrl}
        error={errors.avatarUrl?.message}
        onPickAvatar={handlePickAvatar}
        onRemoveAvatar={() => {
          setValue('avatarUrl', null)
          clearErrors('avatarUrl')
        }}
      />

      <AccountCard title="Informações pessoais">
        <FormField id="profile-display-name" label="Nome de exibição" required error={errors.displayName?.message}>
          <Input id="profile-display-name" autoComplete="name" {...fieldA11y('profile-display-name', errors.displayName?.message)} {...register('displayName')} />
        </FormField>
        <FormField id="profile-username" label="Nome de usuário" required error={errors.username?.message}>
          <Input id="profile-username" autoComplete="username" {...fieldA11y('profile-username', errors.username?.message)} {...register('username')} />
        </FormField>
        <FormField id="profile-email" label="E-mail" required error={errors.email?.message}>
          <Input id="profile-email" type="email" autoComplete="email" {...fieldA11y('profile-email', errors.email?.message)} {...register('email')} />
        </FormField>
        <FormField id="profile-ens" label="Nome ENS" error={errors.ensName?.message}>
          {/* O Figma usa um select só com ".eth": vira um sufixo fixo. O valor do formulário é o nome completo (nome.eth), igual ao contrato */}
          <div className="relative">
            <Controller
              control={control}
              name="ensName"
              render={({ field }) => (
                <Input
                  id="profile-ens"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value?.replace(/\.eth$/, '') ?? ''}
                  onChange={(event) => {
                    const label = event.target.value.trim().toLowerCase()
                    field.onChange(label ? `${label}.eth` : null)
                  }}
                  placeholder="seu-nome"
                  spellCheck={false}
                  autoComplete="off"
                  className="pr-14"
                  {...fieldA11y('profile-ens', errors.ensName?.message)}
                />
              )}
            />
            <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
              .eth
            </span>
          </div>
        </FormField>
      </AccountCard>

      <AccountCard title="Segurança">
        <FormField id="profile-current-password" label="Senha atual" error={errors.currentPassword?.message}>
          <PasswordInput id="profile-current-password" autoComplete="current-password" {...fieldA11y('profile-current-password', errors.currentPassword?.message)} {...register('currentPassword')} />
        </FormField>
        <FormField id="profile-new-password" label="Nova senha" error={errors.newPassword?.message}>
          <PasswordInput id="profile-new-password" autoComplete="new-password" {...fieldA11y('profile-new-password', errors.newPassword?.message)} {...register('newPassword')} />
        </FormField>
        <FormField id="profile-confirm-password" label="Confirmar nova senha" error={errors.confirmPassword?.message}>
          <PasswordInput id="profile-confirm-password" autoComplete="new-password" {...fieldA11y('profile-confirm-password', errors.confirmPassword?.message)} {...register('confirmPassword')} />
        </FormField>
      </AccountCard>

      {errors.root?.message && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.root.message}</p>}
      {notice && <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{notice}</p>}

      <Button type="submit" size="lg" className="rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
