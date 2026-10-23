import { createFileRoute } from '@tanstack/react-router'
import { ProfileForm } from '@/features/account/ProfileForm'
import { users } from '@/mocks/fixtures/users' // fase 1: vira hook de Query (sessão/perfil) na fase 2

export const Route = createFileRoute('/_tabs/conta/perfil')({
  component: ProfilePage,
})

function ProfilePage() {
  return <ProfileForm user={users[0]!} />
}
