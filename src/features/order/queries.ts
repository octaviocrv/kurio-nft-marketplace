import { useEffect } from 'react'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createOrder, fetchOrder, type CreateOrderInput, type Order } from '@/api/order'
import { cartKeys } from '@/features/cart/queries'
import { nftKeys } from '@/features/nft/queries'
import { clearOrderAttempt, getOrderAttempt, startOrderAttempt } from './attemptStorage'

export const orderKeys = {
  all: (userId: string) => ['orders', userId] as const,
  detail: (userId: string, orderId: string) => [...orderKeys.all(userId), orderId] as const,
}

export function orderQueryOptions(orderId: string, userId: string) {
  return queryOptions({
    queryKey: orderKeys.detail(userId, orderId),
    queryFn: ({ signal }) => fetchOrder(orderId, signal),
    refetchInterval: (query) => query.state.data?.status === 'pending' ? 500 : false,
  })
}

export function useOrder(orderId: string, userId: string | undefined) {
  const queryClient = useQueryClient()
  const query = useQuery({
    ...orderQueryOptions(orderId, userId ?? 'pending'),
    enabled: userId !== undefined,
  })

  useEffect(() => {
    if (!userId || !query.data || query.data.status === 'pending') return
    clearOrderAttempt(userId)
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: cartKeys.all }),
      queryClient.invalidateQueries({ queryKey: nftKeys.all }),
    ])
  }, [query.data, queryClient, userId])
  return query
}

export function useCreateOrder(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => {
      // Com tentativa em aberto, reenvia o payload dela e ignora o formulário: a resposta
      // anterior pode ter se perdido e o servidor devolve o pedido que já criou.
      const attempt = getOrderAttempt(userId) ?? startOrderAttempt(userId, input)
      return createOrder(attempt.input, attempt.key)
    },
    onSuccess: (order: Order) => queryClient.setQueryData(orderKeys.detail(userId, order.id), order),
    onError: (error) => {
      // Sem resposta HTTP (timeout, rede) não dá pra saber se o pedido foi criado: mantém a
      // tentativa para recuperar. Com resposta de erro o servidor não criou nada: a próxima
      // compra começa limpa, com a cotação revisada.
      if (error.status !== 0) clearOrderAttempt(userId)
    },
  })
}
