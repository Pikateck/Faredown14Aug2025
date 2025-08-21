import { Currency, CURRENCIES } from "@/contexts/CurrencyContext";

export interface PriceBreakdown {
  basePrice: number;
  taxes: number;
  fees: number;
  total: number;
}

export interface PriceCalculation {
  perNightPrice: number;
  totalNights: number;
  roomsCount: number;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateTotalPrice(
  basePricePerNight: number,
  nights: number,
  rooms: number = 1,
  extraFees: number = 0,
): PriceBreakdown {
  // Ensure all inputs are valid numbers
  const safeBasePrice = isNaN(basePricePerNight) ? 129 : basePricePerNight;
  const safeNights = isNaN(nights) || nights < 1 ? 1 : nights;
  const safeRooms = isNaN(rooms) || rooms < 1 ? 1 : rooms;
  const safeExtraFees = isNaN(extraFees) ? 0 : extraFees;

  const basePrice = Math.round(safeBasePrice * safeNights * safeRooms);
  const taxes = Math.round(basePrice * 0.12); // 12% tax rate
  const fees = Math.round(25 * safeRooms + safeExtraFees); // $25 booking fee per room + extra fees
  const total = Math.round(basePrice + taxes + fees);

  return {
    basePrice,
    taxes,
    fees,
    total,
  };
}

export function formatPriceWithSymbol(
  priceInUSD: number,
  currencyOrCode: Currency | string,
): string {
  // Handle NaN and invalid numbers - but don't convert valid 0 to 0
  if (isNaN(priceInUSD) || !isFinite(priceInUSD)) {
    priceInUSD = 0;
  }

  // Handle both Currency object and currency code string
  let currency: Currency;

  if (typeof currencyOrCode === "string") {
    // Find currency by code
    const foundCurrency = CURRENCIES.find((c) => c.code === currencyOrCode);
    currency = foundCurrency || CURRENCIES[0]; // Default to USD if not found
  } else {
    currency = currencyOrCode;
  }

  const convertedPrice = Math.round(priceInUSD * currency.rate);
  return `${currency.symbol}${convertedPrice.toLocaleString()}`;
}

export function formatPrice(
  priceInUSD: number,
  currencyCode: string = "USD",
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(priceInUSD);
}

export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercentage: number,
): number {
  return originalPrice * (1 - discountPercentage / 100);
}

export function calculateBargainPrice(
  originalPrice: number,
  bargainPercentage: number,
): number {
  const maxDiscount = 0.3; // Maximum 30% discount through bargaining
  const actualDiscount = Math.min(bargainPercentage / 100, maxDiscount);
  return originalPrice * (1 - actualDiscount);
}

export function formatLocalPrice(
  price: number,
  currencyOrCode: Currency | string,
): string {
  // Handle NaN and invalid numbers
  if (isNaN(price) || !isFinite(price)) {
    price = 0;
  }

  // Handle both Currency object and currency code string
  let currency: Currency;

  if (typeof currencyOrCode === "string") {
    const foundCurrency = CURRENCIES.find((c) => c.code === currencyOrCode);
    currency = foundCurrency || CURRENCIES[0];
  } else {
    currency = currencyOrCode;
  }

  // No currency conversion - price is already in local currency
  return `${currency.symbol}${Math.round(price).toLocaleString()}`;
}

export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: Currency,
): string {
  const minFormatted = formatPriceWithSymbol(minPrice, currency);
  const maxFormatted = formatPriceWithSymbol(maxPrice, currency);
  return `${minFormatted} - ${maxFormatted}`;
}

export function calculatePricePerNight(
  totalPrice: number,
  nights: number,
  rooms: number = 1,
): number {
  return totalPrice / (nights * rooms);
}
