import { createFileRoute } from '@tanstack/react-router'
import { ProfileForm } from '@/features/account/ProfileForm'
import { useSession } from '@/features/auth/queries'

export const Route = createFileRoute('/_tabs/conta/perfil')({
  component: ProfilePage,
})

function ProfilePage() {
  const session = useSession()
  if (!session.data) return null
  return <ProfileForm key={session.data.user.id} user={session.data.user} />
}
