/** "0xA91F5ee4...d5E82C" → "0xA91F…E82C", como no Figma. */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
