import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Tag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingDisplayProps {
  originalPrice?: number;
  markedUpPrice?: number;
  finalPrice: number;
  discount?: number;
  currency?: string;
  markupApplied?: {
    markup_percentage?: number;
    markup_type?: string;
  };
  promoApplied?: boolean;
  promoDetails?: {
    code?: string;
    discount_value?: number;
    discount_type?: string;
  };
  className?: string;
  showBreakdown?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PricingDisplay({
  originalPrice,
  markedUpPrice,
  finalPrice,
  discount = 0,
  currency = "INR",
  markupApplied,
  promoApplied = false,
  promoDetails,
  className,
  showBreakdown = false,
  size = "md",
}: PricingDisplayProps) {
  const hasDiscount = discount > 0;
  const hasMarkup = markupApplied && markupApplied.markup_percentage;
  const showOriginalPrice = originalPrice && originalPrice !== finalPrice;

  const formatPrice = (amount: number) => {
    const symbol =
      currency === "INR"
        ? "₹"
        : currency === "USD"
          ? "$"
          : currency === "EUR"
            ? "€"
            : currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const badgeSizes = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-1", className)}>
        {/* Main Price Display */}
        <div className="flex items-center space-x-2">
          <span className={cn("font-bold text-gray-900", textSizes[size])}>
            {formatPrice(finalPrice)}
          </span>

          {showOriginalPrice && (
            <span
              className={cn(
                "text-gray-500 line-through",
                size === "sm" ? "text-xs" : "text-sm",
              )}
            >
              {formatPrice(originalPrice!)}
            </span>
          )}

          {hasDiscount && (
            <Badge
              className={cn("bg-green-100 text-green-800", badgeSizes[size])}
            >
              Save {formatPrice(discount)}
            </Badge>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex items-center space-x-1 flex-wrap gap-1">
          {promoApplied && promoDetails && (
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className={cn(
                    "bg-blue-50 text-blue-700 border-blue-300",
                    badgeSizes[size],
                  )}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {promoDetails.code}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Promo code applied: {promoDetails.discount_value}
                  {promoDetails.discount_type === "percentage"
                    ? "%"
                    : ` ${currency}`}{" "}
                  off
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {hasMarkup && (
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className={cn(
                    "bg-yellow-50 text-yellow-700 border-yellow-300",
                    badgeSizes[size],
                  )}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Live Price
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Real-time pricing with {markupApplied.markup_percentage}%
                  service fee
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Detailed Breakdown */}
        {showBreakdown && (originalPrice || markedUpPrice) && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-1 text-sm font-medium text-gray-700">
              <Info className="w-4 h-4" />
              <span>Price Breakdown</span>
            </div>

            <div className="space-y-1 text-sm">
              {originalPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span>{formatPrice(originalPrice)}</span>
                </div>
              )}

              {hasMarkup && markedUpPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Service Fee ({markupApplied.markup_percentage}%):
                  </span>
                  <span>
                    +{formatPrice(markedUpPrice - (originalPrice || 0))}
                  </span>
                </div>
              )}

              {hasDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoDetails?.code}):</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <hr className="border-gray-200" />

              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatPrice(finalPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Savings Summary */}
        {(hasDiscount || showOriginalPrice) && (
          <div className="text-xs text-green-600 font-medium">
            {hasDiscount && `You save ${formatPrice(discount)}`}
            {hasDiscount && showOriginalPrice && " • "}
            {showOriginalPrice &&
              !hasDiscount &&
              `You save ${formatPrice((originalPrice || 0) - finalPrice)}`}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default PricingDisplay;
