import React from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

interface MobileBottomBarProps {
  price?: number;
  originalPrice?: number;
  priceLabel?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive";
    className?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "outline" | "destructive";
  };
  showPrice?: boolean;
  className?: string;
}

export function MobileBottomBar({
  price,
  originalPrice,
  priceLabel = "per night",
  primaryAction,
  secondaryAction,
  showPrice = true,
  className = "",
}: MobileBottomBarProps) {
  const { formatPrice } = useCurrency();

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 ${className}`}
    >
      <div className="flex items-center justify-between">
        {showPrice && price && (
          <div className="flex-1 pr-4">
            <div className="text-xs text-gray-500">
              {originalPrice && originalPrice > price && (
                <span className="line-through mr-2">
                  {formatPrice(originalPrice)}
                </span>
              )}
              Starting from
            </div>
            <div className="text-lg font-bold text-[#003580]">
              {formatPrice(price)}
            </div>
            <div className="text-xs text-gray-500">{priceLabel}</div>
          </div>
        )}

        <div className="flex gap-2">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              size="sm"
              className="px-4"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon && secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}

          <Button
            variant={primaryAction.variant || "default"}
            onClick={primaryAction.onClick}
            className={`font-semibold px-6 ${
              primaryAction.className ||
              "bg-[#febb02] hover:bg-[#e6a602] text-black"
            }`}
          >
            {primaryAction.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
