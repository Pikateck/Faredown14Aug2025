// Utility to ensure all prices are displayed without decimals

export function roundedPrice(price: number): number {
  return Math.round(price);
}

export function formatRoundedPrice(
  price: number,
  symbol: string = "₹",
): string {
  return `${symbol}${Math.round(price).toLocaleString()}`;
}

// Wrapper for toLocaleString to ensure no decimals
export function safeToLocaleString(price: number): string {
  return Math.round(price).toLocaleString();
}
