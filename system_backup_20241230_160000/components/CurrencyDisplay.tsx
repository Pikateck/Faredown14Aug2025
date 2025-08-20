/**
 * Currency Display Component
 * INR-first display with real-time conversions
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DollarSign,
  Globe,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
} from "lucide-react";
import { currencyService, PriceDisplay } from "@/services/currencyService";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  showConversions?: string[];
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency = "INR",
  showConversions = ["USD", "EUR", "GBP"],
  size = "md",
  showTrend = false,
  className = "",
}: CurrencyDisplayProps) {
  const [priceDisplay, setPriceDisplay] = useState<PriceDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const loadPriceDisplay = async () => {
      setIsLoading(true);
      try {
        const display = await currencyService.getPriceDisplay(
          amount,
          currency,
          showConversions,
        );
        setPriceDisplay(display);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error loading price display:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (amount && currency) {
      loadPriceDisplay();
    }
  }, [amount, currency, showConversions]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          main: "text-sm font-semibold",
          secondary: "text-xs",
          badge: "text-xs px-2 py-1",
        };
      case "lg":
        return {
          main: "text-2xl font-bold",
          secondary: "text-sm",
          badge: "text-sm px-3 py-1",
        };
      default:
        return {
          main: "text-lg font-semibold",
          secondary: "text-sm",
          badge: "text-xs px-2 py-1",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (isLoading || !priceDisplay) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
        <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Primary Display (INR) */}
      <div className="flex items-center space-x-1">
        <span className={`text-green-600 ${sizeClasses.main}`}>
          {currency === "INR"
            ? priceDisplay.formatted
            : priceDisplay.inrFormatted}
        </span>

        {currency !== "INR" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className={sizeClasses.badge}>
                  INR
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Converted to Indian Rupee (Primary Currency)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Original Currency (if different from INR) */}
      {currency !== "INR" && (
        <div className="flex items-center space-x-1">
          <span className={`text-gray-600 ${sizeClasses.secondary}`}>
            ({priceDisplay.formatted})
          </span>
        </div>
      )}

      {/* Currency Conversions Popover */}
      {showConversions.length > 0 &&
        Object.keys(priceDisplay.conversions).length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <Globe className="w-4 h-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Currency Conversions</h4>
                  <Badge variant="outline" className="text-xs">
                    Live Rates
                  </Badge>
                </div>

                {/* INR Display */}
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🇮🇳</span>
                    <div>
                      <p className="font-medium">Indian Rupee</p>
                      <p className="text-xs text-gray-600">INR (Primary)</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    {priceDisplay.inrFormatted}
                  </p>
                </div>

                {/* Other Currency Conversions */}
                {Object.entries(priceDisplay.conversions).map(
                  ([currencyCode, conversion]) => {
                    const curr = currencyService.getCurrency(currencyCode);
                    return (
                      <div
                        key={currencyCode}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{curr?.flag || "🌍"}</span>
                          <div>
                            <p className="font-medium">{curr?.name}</p>
                            <p className="text-xs text-gray-600">
                              {currencyCode} • Rate:{" "}
                              {conversion.rate.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">{conversion.formatted}</p>
                      </div>
                    );
                  },
                )}

                <div className="border-t pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Info className="w-3 h-3" />
                      <span>Powered by XE.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

      {/* Trend Indicator (if enabled) */}
      {showTrend && (
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">+2.3%</span>
        </div>
      )}
    </div>
  );
}

// Simplified version for inline use
export function InlineINR({
  amount,
  currency = "INR",
  showOriginal = true,
}: {
  amount: number;
  currency?: string;
  showOriginal?: boolean;
}) {
  const [inrAmount, setInrAmount] = useState<number>(amount);

  useEffect(() => {
    if (currency !== "INR") {
      currencyService.convertToINR(amount, currency).then((conversion) => {
        setInrAmount(conversion.toAmount);
      });
    } else {
      setInrAmount(amount);
    }
  }, [amount, currency]);

  return (
    <span className="inline-flex items-center space-x-1">
      <span className="font-semibold text-green-600">
        {currencyService.formatCurrency(inrAmount, "INR")}
      </span>
      {showOriginal && currency !== "INR" && (
        <span className="text-sm text-gray-500">
          ({currencyService.formatCurrency(amount, currency)})
        </span>
      )}
    </span>
  );
}

export default CurrencyDisplay;
