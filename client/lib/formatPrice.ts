// Utility to format prices without decimal places throughout the app

export function formatPriceNoDecimals(
  price: number,
  symbol: string = "₹",
): string {
  const roundedPrice = Math.round(price);
  return `${symbol}${roundedPrice.toLocaleString()}`;
}

export function formatNumberNoDecimals(num: number): string {
  return Math.round(num).toLocaleString();
}

// Replace any existing toLocaleString() calls that might show decimals
export function safeToLocaleString(num: number): string {
  return Math.round(num).toLocaleString();
}
