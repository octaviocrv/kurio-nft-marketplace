import { queryOptions, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { fetchSession, login, logout, register, type LoginInput, type RegisterInput } from '@/api/auth'
import { socket } from '@/api/socket'
import type { Session } from '@/api/user'
import { getSessionToken, removeSessionToken, saveSessionToken } from './sessionStorage'

export const sessionKeys = {
  current: ['session'] as const,
}

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionKeys.current,
    queryFn: ({ signal }) => fetchSession(signal),
    staleTime: 0,
  })
}

export function useSession() {
  return useQuery(sessionQueryOptions())
}

/** Sessão opcional para telas públicas: sem token, não faz uma requisição que só responderia 401. */
export function useOptionalSession() {
  return useQuery({ ...sessionQueryOptions(), enabled: getSessionToken() !== null })
}

/** Guard compartilhado pelas rotas privadas. O caminho completo volta no redirect após autenticar. */
export async function requireSession(queryClient: QueryClient, redirectTo: string): Promise<Session> {
  try {
    return await queryClient.ensureQueryData(sessionQueryOptions())
  } catch {
    throw redirect({ to: '/login', search: { redirect: redirectTo }, replace: true })
  }
}

function activateSession(queryClient: QueryClient, session: Session) {
  // Login por outra identidade nunca reaproveita dados privados da sessão anterior.
  queryClient.clear()
  saveSessionToken(session.token)
  queryClient.setQueryData(sessionKeys.current, session)
  socket.auth = { token: session.token }
  // O servidor só lê o token no handshake. Quem já estava conectado como visitante precisa reconectar,
  // senão nunca receberia os eventos privados (pedido) do usuário que acabou de entrar.
  if (socket.connected) socket.disconnect()
  socket.connect()
}

export function clearSession(queryClient: QueryClient): boolean {
  const hadToken = removeSessionToken()
  queryClient.clear()
  socket.disconnect()
  socket.auth = {}
  return hadToken
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (session) => activateSession(queryClient, session),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (session) => activateSession(queryClient, session),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    // Mesmo sem rede, "Sair" precisa encerrar a sessão local e remover dados privados.
    onSettled: () => clearSession(queryClient),
  })
}
