/**
 * Currency Management Service
 * INR-first currency system with XE.com integration
 */

import { apiClient, ApiResponse } from "@/lib/api";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimalPlaces: number;
  isActive: boolean;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  inverseRate: number;
  lastUpdated: string;
  source: "XE" | "Manual" | "Cached";
  reliability: number; // 0-100%
}

export interface CurrencyConversion {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  fees?: number;
  netAmount?: number;
  timestamp: string;
}

export interface PriceDisplay {
  amount: number;
  currency: string;
  formatted: string;
  inrAmount: number;
  inrFormatted: string;
  conversions: {
    [key: string]: {
      amount: number;
      formatted: string;
      rate: number;
    };
  };
}

// Primary supported currencies
export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    flag: "🇮🇳",
    decimalPlaces: 0,
    isActive: true,
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    decimalPlaces: 2,
    isActive: true,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    decimalPlaces: 2,
    isActive: true,
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    decimalPlaces: 2,
    isActive: true,
  },
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    flag: "🇦🇪",
    decimalPlaces: 2,
    isActive: true,
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    flag: "🇸🇬",
    decimalPlaces: 2,
    isActive: true,
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    flag: "🇯🇵",
    decimalPlaces: 0,
    isActive: true,
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    flag: "🇨🇳",
    decimalPlaces: 2,
    isActive: true,
  },
];

export class CurrencyService {
  private readonly baseUrl = "/api/currency";
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private lastUpdate: Date | null = null;
  private readonly UPDATE_INTERVAL = 1000 * 60 * 15; // 15 minutes

  /**
   * Get current exchange rates (cached or live from XE)
   */
  async getExchangeRates(): Promise<ExchangeRate[]> {
    try {
      // Check if we need to update rates
      if (this.shouldUpdateRates()) {
        await this.updateExchangeRates();
      }

      return Array.from(this.exchangeRates.values());
    } catch (error) {
      console.error("Error getting exchange rates:", error);
      // Return cached rates if available
      return Array.from(this.exchangeRates.values());
    }
  }

  /**
   * Update exchange rates from XE.com API
   */
  private async updateExchangeRates(): Promise<void> {
    try {
      const response = await apiClient.get<ApiResponse<ExchangeRate[]>>(
        `${this.baseUrl}/rates`,
      );

      if (response.data) {
        // Clear existing rates
        this.exchangeRates.clear();

        // Store new rates
        response.data.forEach((rate) => {
          const key = `${rate.from}-${rate.to}`;
          this.exchangeRates.set(key, rate);
        });

        this.lastUpdate = new Date();

        // Cache rates in localStorage
        localStorage.setItem(
          "currency_rates",
          JSON.stringify(Array.from(this.exchangeRates.entries())),
        );
        localStorage.setItem(
          "currency_last_update",
          this.lastUpdate.toISOString(),
        );
      }
    } catch (error) {
      console.error("Failed to update exchange rates from API:", error);
      // Load from cache if API fails
      this.loadCachedRates();
    }
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<CurrencyConversion> {
    if (fromCurrency === toCurrency) {
      return {
        fromAmount: amount,
        fromCurrency,
        toAmount: amount,
        toCurrency,
        rate: 1,
        timestamp: new Date().toISOString(),
      };
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate.rate;

    return {
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      rate: rate.rate,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Convert any amount to INR (base currency)
   */
  async convertToINR(
    amount: number,
    fromCurrency: string,
  ): Promise<CurrencyConversion> {
    return this.convertCurrency(amount, fromCurrency, "INR");
  }

  /**
   * Convert INR to any currency
   */
  async convertFromINR(
    amount: number,
    toCurrency: string,
  ): Promise<CurrencyConversion> {
    return this.convertCurrency(amount, "INR", toCurrency);
  }

  /**
   * Get formatted price display with INR primary and conversions
   */
  async getPriceDisplay(
    amount: number,
    currency: string,
    showConversions: string[] = ["USD", "EUR", "GBP"],
  ): Promise<PriceDisplay> {
    // Convert to INR first (our base currency)
    const inrConversion = await this.convertToINR(amount, currency);

    // Get conversions for other currencies
    const conversions: { [key: string]: any } = {};

    for (const targetCurrency of showConversions) {
      if (targetCurrency !== currency && targetCurrency !== "INR") {
        try {
          const conversion = await this.convertCurrency(
            amount,
            currency,
            targetCurrency,
          );
          conversions[targetCurrency] = {
            amount: conversion.toAmount,
            formatted: this.formatCurrency(conversion.toAmount, targetCurrency),
            rate: conversion.rate,
          };
        } catch (error) {
          console.warn(`Failed to convert to ${targetCurrency}:`, error);
        }
      }
    }

    return {
      amount,
      currency,
      formatted: this.formatCurrency(amount, currency),
      inrAmount: inrConversion.toAmount,
      inrFormatted: this.formatCurrency(inrConversion.toAmount, "INR"),
      conversions,
    };
  }

  /**
   * Format currency amount with proper symbol and decimals
   */
  formatCurrency(amount: number, currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);

    if (!currency) {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }

    // Special formatting for INR (Indian number system)
    if (currencyCode === "INR") {
      return this.formatINR(amount);
    }

    // Standard formatting for other currencies
    const formattedAmount = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol}${formattedAmount}`;
  }

  /**
   * Format INR with Indian number system (lakhs, crores)
   */
  private formatINR(amount: number): string {
    const roundedAmount = Math.round(amount);

    if (roundedAmount >= 10000000) {
      // Crores
      const crores = roundedAmount / 10000000;
      return `₹${crores.toFixed(2)} Cr`;
    } else if (roundedAmount >= 100000) {
      // Lakhs
      const lakhs = roundedAmount / 100000;
      return `₹${lakhs.toFixed(2)} L`;
    } else if (roundedAmount >= 1000) {
      // Thousands with comma separation
      return `₹${roundedAmount.toLocaleString("en-IN")}`;
    } else {
      return `₹${roundedAmount}`;
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  private async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<ExchangeRate> {
    await this.getExchangeRates();

    const directKey = `${fromCurrency}-${toCurrency}`;
    const directRate = this.exchangeRates.get(directKey);

    if (directRate) {
      return directRate;
    }

    // Try inverse rate
    const inverseKey = `${toCurrency}-${fromCurrency}`;
    const inverseRate = this.exchangeRates.get(inverseKey);

    if (inverseRate) {
      return {
        from: fromCurrency,
        to: toCurrency,
        rate: 1 / inverseRate.rate,
        inverseRate: inverseRate.rate,
        lastUpdated: inverseRate.lastUpdated,
        source: inverseRate.source,
        reliability: inverseRate.reliability,
      };
    }

    // If no direct rate available, try via INR
    if (fromCurrency !== "INR" && toCurrency !== "INR") {
      const toInrKey = `${fromCurrency}-INR`;
      const fromInrKey = `INR-${toCurrency}`;

      const toInrRate = this.exchangeRates.get(toInrKey);
      const fromInrRate = this.exchangeRates.get(fromInrKey);

      if (toInrRate && fromInrRate) {
        const calculatedRate = toInrRate.rate * fromInrRate.rate;
        return {
          from: fromCurrency,
          to: toCurrency,
          rate: calculatedRate,
          inverseRate: 1 / calculatedRate,
          lastUpdated: new Date().toISOString(),
          source: "Cached",
          reliability: Math.min(toInrRate.reliability, fromInrRate.reliability),
        };
      }
    }

    throw new Error(
      `Exchange rate not available: ${fromCurrency} to ${toCurrency}`,
    );
  }

  /**
   * Check if rates need updating
   */
  private shouldUpdateRates(): boolean {
    if (!this.lastUpdate) {
      this.loadCachedRates();
      return !this.lastUpdate;
    }

    const now = new Date();
    const timeDiff = now.getTime() - this.lastUpdate.getTime();
    return timeDiff > this.UPDATE_INTERVAL;
  }

  /**
   * Load cached exchange rates
   */
  private loadCachedRates(): void {
    try {
      const cachedRates = localStorage.getItem("currency_rates");
      const lastUpdate = localStorage.getItem("currency_last_update");

      if (cachedRates && lastUpdate) {
        const ratesArray = JSON.parse(cachedRates);
        this.exchangeRates = new Map(ratesArray);
        this.lastUpdate = new Date(lastUpdate);
      }
    } catch (error) {
      console.error("Error loading cached rates:", error);
    }
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES;
  }

  /**
   * Get currency by code
   */
  getCurrency(code: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find((c) => c.code === code);
  }

  /**
   * Set preferred currency for user
   */
  setPreferredCurrency(currencyCode: string): void {
    localStorage.setItem("preferred_currency", currencyCode);
  }

  /**
   * Get user's preferred currency (defaults to INR)
   */
  getPreferredCurrency(): string {
    return localStorage.getItem("preferred_currency") || "INR";
  }

  /**
   * Get currency rate trend (for analytics)
   */
  async getCurrencyTrend(
    fromCurrency: string,
    toCurrency: string,
    days: number = 30,
  ): Promise<{ date: string; rate: number }[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ date: string; rate: number }[]>
      >(`${this.baseUrl}/trend`, {
        from: fromCurrency,
        to: toCurrency,
        days,
      });

      return response.data || [];
    } catch (error) {
      console.error("Error getting currency trend:", error);
      return [];
    }
  }

  /**
   * Admin: Update manual exchange rate
   */
  async updateManualRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/manual-rate`, {
      from: fromCurrency,
      to: toCurrency,
      rate,
    });

    // Update local cache
    const key = `${fromCurrency}-${toCurrency}`;
    this.exchangeRates.set(key, {
      from: fromCurrency,
      to: toCurrency,
      rate,
      inverseRate: 1 / rate,
      lastUpdated: new Date().toISOString(),
      source: "Manual",
      reliability: 100,
    });
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();
export default currencyService;
