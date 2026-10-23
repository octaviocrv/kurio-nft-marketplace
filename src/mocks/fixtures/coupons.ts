import type { Coupon } from '@/api/quote'

/*
 * Cupons de demonstração:
 *   KURIO10    — válido, 10%
 *   LANCAMENTO — válido, 15% ("Desconto do lançamento", como no resumo do carrinho do Figma)
 *   VERAO25    — expirado
 *   Qualquer outro código — inválido (não existe nesta lista)
 *
 * Datas fixas para o cenário ser reproduzível em qualquer dia.
 */
export const coupons: Coupon[] = [
  { code: 'KURIO10', description: 'Desconto Kurio', discountPercent: 10, expiresAt: '2099-12-31T23:59:59.000Z' },
  { code: 'LANCAMENTO', description: 'Desconto do lançamento', discountPercent: 15, expiresAt: '2099-12-31T23:59:59.000Z' },
  { code: 'VERAO25', description: 'Promoção de verão', discountPercent: 20, expiresAt: '2025-03-20T23:59:59.000Z' },
]
