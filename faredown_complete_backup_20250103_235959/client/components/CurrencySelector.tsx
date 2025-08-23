import React, { useState } from "react";
import { ChevronDown, RefreshCw, Globe } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CurrencySelectorProps {
  variant?: "default" | "compact" | "header";
  showFlag?: boolean;
  showStatus?: boolean;
}

export function CurrencySelector({
  variant = "default",
  showFlag = true,
  showStatus = true,
}: CurrencySelectorProps) {
  const {
    selectedCurrency,
    currencies,
    setCurrency,
    isLoading,
    lastUpdated,
    refreshRates,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return "Not updated";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const handleCurrencySelect = (currency: typeof selectedCurrency) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  const handleRefreshRates = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await refreshRates();
  };

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            {showFlag && <span className="mr-1">{selectedCurrency.flag}</span>}
            <span className="font-medium">{selectedCurrency.code}</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Currency</span>
            {showStatus && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleRefreshRates}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {currencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleCurrencySelect(currency)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center">
                <span className="mr-2">{currency.flag}</span>
                <div>
                  <div className="font-medium">{currency.code}</div>
                  <div className="text-xs text-gray-500">{currency.name}</div>
                </div>
              </div>
              {currency.code === selectedCurrency.code && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </DropdownMenuItem>
          ))}

          {showStatus && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-xs text-gray-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "header") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 px-3">
            <Globe className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline mr-1">
              {selectedCurrency.flag}
            </span>
            <span className="font-medium">{selectedCurrency.code}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Select Currency</span>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Badge variant="secondary" className="text-xs">
                  Updating...
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleRefreshRates}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {currencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleCurrencySelect(currency)}
              className="flex items-center justify-between cursor-pointer py-3"
            >
              <div className="flex items-center">
                <span className="mr-3 text-lg">{currency.flag}</span>
                <div>
                  <div className="font-medium">{currency.code}</div>
                  <div className="text-sm text-gray-500">{currency.name}</div>
                  {currency.code !== "INR" && (
                    <div className="text-xs text-blue-600">
                      1 INR = {currency.rate.toFixed(currency.decimalPlaces)}{" "}
                      {currency.code}
                    </div>
                  )}
                </div>
              </div>
              {currency.code === selectedCurrency.code && (
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50">
            <div className="flex items-center justify-between">
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
              <span className="text-blue-600">Live rates</span>
            </div>
            <div className="mt-1 text-gray-400">
              All prices automatically converted from INR
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              {showFlag && (
                <span className="mr-2">{selectedCurrency.flag}</span>
              )}
              <span className="font-medium">{selectedCurrency.code}</span>
              <span className="ml-2 text-gray-500">
                ({selectedCurrency.symbol})
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[300px]">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Choose Currency</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshRates}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="max-h-64 overflow-y-auto">
            {currencies.map((currency) => (
              <DropdownMenuItem
                key={currency.code}
                onClick={() => handleCurrencySelect(currency)}
                className="flex items-center justify-between cursor-pointer p-3"
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">{currency.flag}</span>
                  <div>
                    <div className="font-medium">{currency.name}</div>
                    <div className="text-sm text-gray-500">
                      {currency.code} ({currency.symbol})
                    </div>
                    {currency.code !== "INR" && (
                      <div className="text-xs text-blue-600">
                        Rate:{" "}
                        {currency.rate.toFixed(
                          currency.decimalPlaces > 2
                            ? 4
                            : currency.decimalPlaces,
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {currency.code === selectedCurrency.code && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>

          {showStatus && (
            <>
              <DropdownMenuSeparator />
              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span>Exchange rates: {formatLastUpdated(lastUpdated)}</span>
                  <Badge
                    variant={isLoading ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {isLoading ? "Updating..." : "Live"}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
