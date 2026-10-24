import { createFileRoute } from '@tanstack/react-router'
import type { User } from '@/api/user'
import { ErrorState } from '@/components/ErrorState'
import { ProfileSkeleton } from '@/features/account/AccountSkeletons'
import { ProfileForm } from '@/features/account/ProfileForm'
import { useChangePassword, useProfile, useUpdateProfile } from '@/features/account/queries'
import { useSession } from '@/features/auth/queries'

export const Route = createFileRoute('/_tabs/conta/perfil')({
  component: ProfilePage,
})

function ProfilePage() {
  const session = useSession()
  const profile = useProfile(session.data?.user.id)

  if (!session.data || profile.isPending) return <ProfileSkeleton />
  if (profile.error) {
    return <ErrorState title="Não foi possível carregar seu perfil" description={profile.error.message} onRetry={() => void profile.refetch()} isRetrying={profile.isFetching} />
  }
  return <ProfileEditor user={profile.data} />
}

function ProfileEditor({ user }: { user: User }) {
  const updateProfile = useUpdateProfile(user.id)
  const changePassword = useChangePassword()
  return <ProfileForm key={user.id} user={user} onSaveProfile={updateProfile.mutateAsync} onChangePassword={changePassword.mutateAsync} />
}
