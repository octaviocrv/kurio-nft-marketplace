/**
 * Valores em ETH sem ponto flutuante.
 *
 * Na API, ETH trafega como string decimal ("1.19"). Para calcular, convertemos para
 * wei (bigint, 1 ETH = 10^18 wei), que é inteiro e exato. Com float, 0.1 + 0.2 daria
 * 0.30000000000000004 — inaceitável num total de compra.
 *
 * Regra: string só nas bordas (API e tela), bigint em todo cálculo.
 */

const ETH_DECIMALS = 18
const WEI_PER_ETH = 10n ** BigInt(ETH_DECIMALS)

/** Decimal não negativo com até 18 casas: "1", "1.19", "0.016". Usado também no schema zod. */
export const ETH_DECIMAL_PATTERN = /^\d+(\.\d{1,18})?$/

export function parseEth(value: string): bigint {
  if (!ETH_DECIMAL_PATTERN.test(value)) {
    throw new Error(`Valor em ETH inválido: "${value}"`)
  }
  const [whole = '0', fraction = ''] = value.split('.')
  // Completa à direita até 18 casas: "1.19" → 1 e 190000000000000000
  return BigInt(whole) * WEI_PER_ETH + BigInt(fraction.padEnd(ETH_DECIMALS, '0'))
}

/** Forma canônica para a API: sem zeros sobrando ("1.190" → "1.19", "2.0" → "2"). */
export function toEthString(wei: bigint): string {
  if (wei < 0n) throw new Error('Valor em ETH não pode ser negativo')
  const whole = wei / WEI_PER_ETH
  const fraction = (wei % WEI_PER_ETH).toString().padStart(ETH_DECIMALS, '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

/**
 * Para exibir: no mínimo 2 casas, como no Figma ("1.20", "8.936", "0.016"),
 * mas nunca arredonda — esconder casas mudaria o valor que o usuário paga.
 */
export function formatEth(wei: bigint): string {
  const [whole, fraction = ''] = toEthString(wei).split('.')
  return `${whole}.${fraction.padEnd(2, '0')}`
}

export function sumWei(values: bigint[]): bigint {
  return values.reduce((total, value) => total + value, 0n)
}

/** Preço unitário × quantidade. Quantidade é sempre inteira (regra do enunciado). */
export function multiplyWei(wei: bigint, quantity: number): bigint {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`Quantidade inválida: ${quantity}`)
  }
  return wei * BigInt(quantity)
}

/** Porcentagem de um valor (desconto de cupom). Divisão inteira: arredonda para baixo (no máximo 1 wei), sempre igual no mock e na tela. */
export function percentOfWei(wei: bigint, percent: number): bigint {
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    throw new Error(`Porcentagem inválida: ${percent}`)
  }
  return (wei * BigInt(percent)) / 100n
}
