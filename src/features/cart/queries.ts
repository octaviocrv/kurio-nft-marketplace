import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
  type AddCartItemInput,
  type Cart,
} from '@/api/cart'
import { createQuote } from '@/api/quote'

export const cartKeys = {
  all: ['cart'] as const,
  detail: (ownerId: string) => [...cartKeys.all, ownerId] as const,
}

export const quoteKeys = {
  all: ['quote'] as const,
  owner: (ownerId: string) => [...quoteKeys.all, ownerId] as const,
  detail: (ownerId: string, cart: Cart) => [
    ...quoteKeys.owner(ownerId),
    cart.couponCode,
    cart.items.map(({ id, quantity, unitPrice, available }) => ({ id, quantity, unitPrice, available })),
  ] as const,
}

export function useCart(ownerId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.detail(ownerId ?? 'pending'),
    queryFn: ({ signal }) => fetchCart(signal),
    enabled: ownerId !== undefined,
  })
}

function useStoreCartResult(ownerId: string | undefined) {
  const queryClient = useQueryClient()
  return async (cart: Cart) => {
    if (!ownerId) return
    queryClient.setQueryData(cartKeys.detail(ownerId), cart)
    await queryClient.invalidateQueries({ queryKey: quoteKeys.owner(ownerId) })
  }
}

export function useAddCartItem(ownerId: string | undefined) {
  const storeResult = useStoreCartResult(ownerId)
  return useMutation({ mutationFn: (input: AddCartItemInput) => addCartItem(input), onSuccess: storeResult })
}

export function useUpdateCartItem(ownerId: string | undefined) {
  const storeResult = useStoreCartResult(ownerId)
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => updateCartItem(itemId, { quantity }),
    onSuccess: storeResult,
  })
}

export function useRemoveCartItem(ownerId: string | undefined) {
  const storeResult = useStoreCartResult(ownerId)
  return useMutation({ mutationFn: removeCartItem, onSuccess: storeResult })
}

export function useQuote(ownerId: string | undefined, cart: Cart | undefined) {
  return useQuery({
    queryKey: ownerId && cart ? quoteKeys.detail(ownerId, cart) : [...quoteKeys.all, 'pending'],
    queryFn: ({ signal }) => createQuote({}, signal),
    enabled: ownerId !== undefined && cart !== undefined && cart.items.length > 0,
    // Ao recalcular quantidade/cupom, mantém os valores anteriores visíveis até a nova cotação chegar.
    placeholderData: keepPreviousData,
  })
}

export function useApplyCoupon(ownerId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (couponCode: string | null) => createQuote({ couponCode }),
    onSuccess: async (quote) => {
      if (!ownerId) return
      queryClient.setQueryData<Cart>(cartKeys.detail(ownerId), (cart) => cart && ({ ...cart, couponCode: quote.coupon?.code ?? null }))
      await queryClient.invalidateQueries({ queryKey: quoteKeys.owner(ownerId) })
    },
  })
}
