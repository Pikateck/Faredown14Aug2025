import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate from INR
  flag: string;
  decimalPlaces: number;
}

export const CURRENCIES: Currency[] = [
  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    rate: 1,
    flag: "🇮🇳",
    decimalPlaces: 0,
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rate: 0.012,
    flag: "🇺🇸",
    decimalPlaces: 2,
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rate: 0.011,
    flag: "🇪🇺",
    decimalPlaces: 2,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    rate: 0.0095,
    flag: "🇬🇧",
    decimalPlaces: 2,
  },
  {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    rate: 0.044,
    flag: "🇦🇪",
    decimalPlaces: 2,
  },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    rate: 0.016,
    flag: "🇸🇬",
    decimalPlaces: 2,
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    rate: 1.83,
    flag: "🇯🇵",
    decimalPlaces: 0,
  },
  {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    rate: 0.087,
    flag: "🇨🇳",
    decimalPlaces: 2,
  },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    rate: 0.016,
    flag: "🇨🇦",
    decimalPlaces: 2,
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    rate: 0.018,
    flag: "🇦🇺",
    decimalPlaces: 2,
  },
  {
    code: "CHF",
    symbol: "₣",
    name: "Swiss Franc",
    rate: 0.011,
    flag: "🇨🇭",
    decimalPlaces: 2,
  },
  {
    code: "KRW",
    symbol: "₩",
    name: "South Korean Won",
    rate: 16.2,
    flag: "🇰🇷",
    decimalPlaces: 0,
  },
  {
    code: "THB",
    symbol: "฿",
    name: "Thai Baht",
    rate: 0.42,
    flag: "🇹🇭",
    decimalPlaces: 2,
  },
  {
    code: "MYR",
    symbol: "RM",
    name: "Malaysian Ringgit",
    rate: 0.054,
    flag: "🇲🇾",
    decimalPlaces: 2,
  },
  {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    rate: 188,
    flag: "🇮🇩",
    decimalPlaces: 0,
  },
  {
    code: "PHP",
    symbol: "₱",
    name: "Philippine Peso",
    rate: 0.69,
    flag: "🇵🇭",
    decimalPlaces: 2,
  },
  {
    code: "HKD",
    symbol: "HK$",
    name: "Hong Kong Dollar",
    rate: 0.095,
    flag: "🇭🇰",
    decimalPlaces: 2,
  },
  {
    code: "NZD",
    symbol: "NZ$",
    name: "New Zealand Dollar",
    rate: 0.02,
    flag: "🇳🇿",
    decimalPlaces: 2,
  },
  {
    code: "SAR",
    symbol: "﷼",
    name: "Saudi Riyal",
    rate: 0.045,
    flag: "🇸🇦",
    decimalPlaces: 2,
  },
  {
    code: "QAR",
    symbol: "﷼",
    name: "Qatari Riyal",
    rate: 0.044,
    flag: "🇶🇦",
    decimalPlaces: 2,
  },
  {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    rate: 0.22,
    flag: "🇿🇦",
    decimalPlaces: 2,
  },
  {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    rate: 0.072,
    flag: "🇧🇷",
    decimalPlaces: 2,
  },
  {
    code: "RUB",
    symbol: "₽",
    name: "Russian Ruble",
    rate: 1.14,
    flag: "🇷🇺",
    decimalPlaces: 2,
  },
  {
    code: "TRY",
    symbol: "₺",
    name: "Turkish Lira",
    rate: 0.41,
    flag: "🇹🇷",
    decimalPlaces: 2,
  },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  currencies: Currency[];
  setCurrency: (currency: Currency | string) => void;
  convertPrice: (priceInINR: number) => number;
  formatPrice: (priceInINR: number) => string;
  isLoading: boolean;
  lastUpdated: string | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    CURRENCIES[0], // Default to INR (index 0)
  );
  const [currencies, setCurrencies] = useState<Currency[]>(CURRENCIES);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  // Load user preference and live rates on mount
  useEffect(() => {
    // Wrap everything in a try-catch to prevent provider failure
    try {
      loadUserPreference();

      // Try to refresh rates, but don't block the app if it fails
      // Add a delay and check environment to prevent issues
      setTimeout(() => {
        const safeRefreshRates = async () => {
          try {
            // Skip fetching if we're in an embedded environment or if there are known issues
            if (
              typeof window !== "undefined" &&
              (window.location.hostname.includes("fly.dev") ||
                window.location.search.includes("reload="))
            ) {
              console.log(
                "💰 Skipping currency fetch in embedded/reload environment, using static rates",
              );
              return;
            }
            await refreshRates();
          } catch (error) {
            console.log(
              "💰 Initial currency rate fetch failed, using static rates:",
              error?.message || "Unknown error",
            );
          }
        };

        safeRefreshRates().catch((error) => {
          console.log(
            "💰 Currency rate refresh setup failed completely, using static rates:",
            error?.message || "Unknown error",
          );
        });
      }, 2000); // Longer delay to ensure app is fully loaded and prevent race conditions

      // Update rates every 30 minutes (reduced frequency to prevent spam)
      const interval = setInterval(
        () => {
          const safePeriodicRefresh = async () => {
            try {
              await refreshRates();
            } catch (error) {
              // Silent fail for periodic updates
              console.log(
                "💰 Periodic currency rate update failed:",
                error?.message || "Unknown error",
              );
            }
          };

          safePeriodicRefresh().catch((error) => {
            console.log(
              "💰 Periodic currency rate update setup failed:",
              error?.message || "Unknown error",
            );
          });
        },
        30 * 60 * 1000,
      );

      return () => clearInterval(interval);
    } catch (globalError) {
      console.error("💰 CurrencyProvider useEffect failed:", globalError);
      // Don't throw - just log and continue with static rates
    }
  }, []);

  const loadUserPreference = () => {
    try {
      const savedCurrency = localStorage.getItem("preferred_currency");
      if (savedCurrency) {
        setCurrencies((currentCurrencies) => {
          const currency = currentCurrencies.find(
            (c) => c.code === savedCurrency,
          );
          if (currency) {
            setSelectedCurrency(currency);
          }
          return currentCurrencies;
        });
      }
    } catch (error) {
      console.log("💰 Failed to load currency preference:", error);
    }
  };

  const setCurrency = (currency: Currency | string) => {
    let targetCurrency: Currency;

    if (typeof currency === "string") {
      // Find the currency object by code
      const foundCurrency = currencies.find((c) => c.code === currency);
      if (!foundCurrency) {
        console.warn(`Currency with code ${currency} not found`);
        return;
      }
      targetCurrency = foundCurrency;
    } else {
      targetCurrency = currency;
    }

    setSelectedCurrency(targetCurrency);
    localStorage.setItem("preferred_currency", targetCurrency.code);
  };

  const refreshRates = async () => {
    try {
      // Throttle API calls - don't refresh more than once every 2 minutes
      const now = Date.now();
      const minInterval = 2 * 60 * 1000; // 2 minutes

      if (now - lastRefreshTime < minInterval) {
        console.log("💰 Currency refresh throttled, using cached rates");
        return;
      }

      try {
        setLastRefreshTime(now);
        // Additional safety wrapper to prevent any unhandled errors
        await _refreshRatesInternal();
      } catch (error) {
        // Final safety net - never let errors escape from refreshRates
        // This catches any errors including browser extension interference
        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch")
        ) {
          console.log(
            "💰 Network error (possibly browser extension interference), using static rates",
          );
        } else {
          console.warn(
            "📈 Currency refresh failed with unexpected error:",
            error,
          );
        }
        // Always continue gracefully with static rates
      } finally {
        setIsLoading(false);
      }
    } catch (globalError) {
      // Absolute final safety net - never allow any error to escape
      console.log(
        "💰 Currency refresh failed at global level, using static rates:",
        globalError,
      );
      setIsLoading(false);
    }
  };

  const _refreshRatesInternal = async () => {
    try {
      setIsLoading(true);

      // Early exit if fetch is not available (shouldn't happen in modern browsers)
      if (typeof fetch === "undefined") {
        console.log("💰 Fetch API not available, using static rates");
        return;
      }

      // Skip if we're in a problematic environment (e.g., with interfering browser extensions)
      if (
        typeof window !== "undefined" &&
        window.location?.hostname?.includes("fullstory")
      ) {
        console.log("💰 Detected analytics environment, using static rates");
        return;
      }

      // Ensure currencies state is available
      if (!currencies || currencies.length === 0) {
        console.log("💰 Currencies not loaded yet, skipping rate refresh");
        return;
      }

      // Check if the API endpoint is available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      let response;
      try {
        // Check if we're in development/production with proper API
        const apiUrl = "/api/currency/rates";

        // Use a more defensive approach to handle browser extension interference
        const safeFetch = async () => {
          try {
            const fetchPromise = fetch(apiUrl, {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            // Add a timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 5000),
            );

            return (await Promise.race([
              fetchPromise,
              timeoutPromise,
            ])) as Response;
          } catch (innerError: any) {
            // Handle any fetch errors - never let them bubble up
            console.log(
              "💰 Fetch failed (network/timeout/extension interference), using static rates:",
              innerError?.message || "Unknown error",
            );
            return null;
          }
        };

        response = await safeFetch();
        if (!response) {
          // safeFetch returned null due to extension interference
          return;
        }
      } catch (fetchError: any) {
        // Catch any network errors immediately and handle gracefully
        console.warn(
          "📈 Network error fetching exchange rates:",
          fetchError?.message || "Unknown error",
        );
        // Don't throw error, just log and continue with static rates
        console.log("💰 Using static exchange rates due to fetch failure");
        return;
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `📈 Exchange rate API returned ${response.status}: ${response.statusText}, using static rates`,
        );
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn(
          "📈 Invalid JSON response from exchange rate API, using static rates",
        );
        return;
      }

      if (data.success && data.data) {
        setCurrencies((currentCurrencies) => {
          const updatedCurrencies = currentCurrencies.map((currency) => {
            if (currency.code === "INR") return currency; // INR is base currency

            const rateData = data.data.find((r: any) => r.to === currency.code);
            if (rateData) {
              return { ...currency, rate: rateData.rate };
            }
            return currency;
          });

          // Update selected currency if it was updated
          setSelectedCurrency((currentSelected) => {
            const updatedSelected = updatedCurrencies.find(
              (c) => c.code === currentSelected.code,
            );
            return updatedSelected || currentSelected;
          });

          return updatedCurrencies;
        });

        setLastUpdated(data.lastUpdated);

        console.log(`💱 Exchange rates updated from ${data.source}`);
      } else {
        console.warn(
          "📈 Exchange rate API returned invalid data, using static rates",
        );
      }
    } catch (error) {
      // Graceful fallback - don't show error to user, just log it
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.warn("📈 Exchange rate fetch timeout, using static rates");
        } else if (error.message.includes("Failed to fetch")) {
          console.warn("📈 Exchange rate API unavailable, using static rates");
        } else {
          console.warn("📈 Exchange rate fetch failed:", error.message);
        }
      } else {
        console.warn("📈 Exchange rate fetch failed with unknown error");
      }

      // Continue with static rates - don't break the app
      console.log("💰 Using static exchange rates for currency conversion");
    } finally {
      setIsLoading(false);
    }
  };

  const convertPrice = (priceInINR: number): number => {
    if (selectedCurrency.code === "INR") return priceInINR;
    return priceInINR * selectedCurrency.rate;
  };

  const formatPrice = (priceInINR: number): string => {
    const convertedPrice = convertPrice(priceInINR);

    if (selectedCurrency.code === "INR") {
      return formatINR(convertedPrice);
    }

    const formatted = convertedPrice.toFixed(selectedCurrency.decimalPlaces);
    return `${selectedCurrency.symbol}${formatted}`;
  };

  const formatINR = (amount: number): string => {
    const roundedAmount = Math.round(amount);

    if (roundedAmount >= 10000000) {
      const crores = roundedAmount / 10000000;
      return `₹${crores.toFixed(2)} Cr`;
    } else if (roundedAmount >= 100000) {
      const lakhs = roundedAmount / 100000;
      return `₹${lakhs.toFixed(2)} L`;
    } else {
      return `₹${roundedAmount.toLocaleString("en-IN")}`;
    }
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    currencies,
    setCurrency,
    convertPrice,
    formatPrice,
    isLoading,
    lastUpdated,
    refreshRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // Provide a more descriptive error message and ensure it's not a timing issue
    console.error(
      "❌ CurrencyContext is undefined. This usually means either:",
      "\n1. useCurrency hook is called outside of CurrencyProvider",
      "\n2. CurrencyProvider failed to initialize properly",
      "\n3. There's a circular dependency or timing issue",
    );

    // Return a fallback context to prevent app crashes
    console.warn("⚠️ Using fallback currency context with INR defaults");
    return {
      selectedCurrency: CURRENCIES[0], // INR
      currencies: CURRENCIES,
      setCurrency: () =>
        console.warn("Currency change attempted outside provider"),
      convertPrice: (price: number) => price,
      formatPrice: (price: number) => `₹${price.toLocaleString("en-IN")}`,
      isLoading: false,
      lastUpdated: null,
      refreshRates: async () =>
        console.warn("Rate refresh attempted outside provider"),
    };
  }
  return context;
}
