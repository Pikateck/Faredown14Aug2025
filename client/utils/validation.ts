/**
 * Validation utilities to prevent runtime errors and improve type safety
 */

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Safely access object properties with fallback
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: T[K]
): T[K] {
  if (!obj || typeof obj !== 'object') return fallback;
  return obj[key] ?? fallback;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date object
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate airport/city code format
 */
export function isValidAirportCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .trim();
}

/**
 * Validate and clamp number within range
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function to prevent excessive API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is a non-empty string
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validate travel dates
 */
export function validateTravelDates(
  departureDate: Date | null,
  returnDate: Date | null,
  tripType: 'one-way' | 'round-trip'
): { isValid: boolean; error?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!departureDate || !isValidDate(departureDate)) {
    return { isValid: false, error: 'Please select a valid departure date' };
  }

  if (departureDate < today) {
    return { isValid: false, error: 'Departure date cannot be in the past' };
  }

  if (tripType === 'round-trip') {
    if (!returnDate || !isValidDate(returnDate)) {
      return { isValid: false, error: 'Please select a valid return date for round trip' };
    }

    if (returnDate <= departureDate) {
      return { isValid: false, error: 'Return date must be after departure date' };
    }
  }

  return { isValid: true };
}

/**
 * Validate traveler counts
 */
export function validateTravelers(adults: number, children: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
    return { isValid: false, error: 'Number of adults must be between 1 and 9' };
  }

  if (!Number.isInteger(children) || children < 0 || children > 8) {
    return { isValid: false, error: 'Number of children must be between 0 and 8' };
  }

  if (adults + children > 9) {
    return { isValid: false, error: 'Total travelers cannot exceed 9' };
  }

  return { isValid: true };
}

/**
 * Safe URL parameter getter
 */
export function getSafeUrlParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: string = ''
): string {
  try {
    return searchParams.get(key) || fallback;
  } catch (error) {
    console.warn(`Failed to get URL parameter ${key}:`, error);
    return fallback;
  }
}

/**
 * Format price safely
 */
export function formatPrice(
  amount: number | string | null | undefined,
  currency: string = '₹',
  locale: string = 'en-IN'
): string {
  if (amount === null || amount === undefined) return `${currency}0`;
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return `${currency}0`;
  
  try {
    return `${currency}${numericAmount.toLocaleString(locale)}`;
  } catch (error) {
    console.warn('Failed to format price:', error);
    return `${currency}${numericAmount}`;
  }
}
