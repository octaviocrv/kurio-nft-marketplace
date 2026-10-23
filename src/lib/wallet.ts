/** "0xA91F5ee4...d5E82C" → "0xA91F…E82C", como no Figma. */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

const explorers = {
  ethereum: { name: 'Etherscan', txUrl: 'https://etherscan.io/tx/' },
  polygon: { name: 'Polygonscan', txUrl: 'https://polygonscan.com/tx/' },
  solana: { name: 'Solscan', txUrl: 'https://solscan.io/tx/' },
} as const

/** Explorador de blocos de cada rede. Na demo o hash é simulado (o enunciado prevê links simulados). */
export function getExplorer(network: keyof typeof explorers, transactionHash: string) {
  const explorer = explorers[network]
  return { name: explorer.name, url: explorer.txUrl + transactionHash }
}
