import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ticket, X, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoCodeInputProps {
  value?: string;
  onChange: (promoCode: string) => void;
  onApply?: (promoCode: string) => Promise<{
    success: boolean;
    discount?: number;
    message?: string;
  }>;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  autoApply?: boolean;
}

export function PromoCodeInput({
  value = "",
  onChange,
  onApply,
  placeholder = "Enter promo code",
  className,
  compact = false,
  autoApply = false,
}: PromoCodeInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCode, setAppliedCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (autoApply && inputValue.length >= 3 && inputValue !== appliedCode) {
      const timer = setTimeout(() => {
        handleApply();
      }, 1000); // Auto-apply after 1 second of no typing
      return () => clearTimeout(timer);
    }
  }, [inputValue, autoApply, appliedCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setInputValue(newValue);
    onChange(newValue);
    setError("");

    if (!newValue) {
      setAppliedCode("");
      setDiscount(0);
      setShowSuccess(false);
    }
  };

  const handleApply = async () => {
    if (!inputValue.trim() || !onApply) return;

    setIsApplying(true);
    setError("");

    try {
      const result = await onApply(inputValue);

      if (result.success) {
        setAppliedCode(inputValue);
        setDiscount(result.discount || 0);
        setShowSuccess(true);
        setError("");

        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.message || "Invalid promo code");
        setAppliedCode("");
        setDiscount(0);
      }
    } catch (error) {
      setError("Failed to apply promo code");
      setAppliedCode("");
      setDiscount(0);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    setInputValue("");
    setAppliedCode("");
    setDiscount(0);
    setError("");
    setShowSuccess(false);
    onChange("");
  };

  const isApplied = appliedCode && appliedCode === inputValue;

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={cn(
                "pr-8",
                isApplied && "border-green-500 bg-green-50",
                error && "border-red-500",
              )}
              disabled={isApplying}
            />
            <Ticket className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {!autoApply && inputValue && !isApplied && (
            <Button
              onClick={handleApply}
              disabled={isApplying || !inputValue.trim()}
              size="sm"
              variant="outline"
            >
              {isApplying ? "..." : "Apply"}
            </Button>
          )}

          {isApplied && (
            <Button
              onClick={handleRemove}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}

        {isApplied && discount > 0 && (
          <div className="mt-1 flex items-center space-x-1 text-sm text-green-600">
            <Check className="w-3 h-3" />
            <span>₹{discount.toFixed(0)} discount applied!</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center space-x-2">
        <Ticket className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">Promo Code</h3>
        {isApplied && (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300"
          >
            Applied
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              "pr-8",
              isApplied && "border-green-500 bg-green-50",
              error && "border-red-500",
            )}
            disabled={isApplying}
          />
        </div>

        {!autoApply && inputValue && !isApplied && (
          <Button
            onClick={handleApply}
            disabled={isApplying || !inputValue.trim()}
            size="sm"
          >
            {isApplying ? "Applying..." : "Apply"}
          </Button>
        )}

        {isApplied && (
          <Button
            onClick={handleRemove}
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            Remove
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {showSuccess && isApplied && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-600" />
          <div className="text-sm text-green-800">
            <span className="font-medium">{appliedCode}</span> applied
            successfully!
            {discount > 0 && (
              <span className="ml-1">You saved ₹{discount.toFixed(0)}</span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Popular Promo Codes */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600">Popular Codes</h4>
        <div className="flex flex-wrap gap-1">
          {["WELCOME10", "FLIGHT15", "HOTEL20", "SAVE2000"].map((code) => (
            <button
              key={code}
              onClick={() => {
                setInputValue(code);
                onChange(code);
                if (autoApply) {
                  setTimeout(() => handleApply(), 100);
                }
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-700 hover:text-gray-900 transition-colors"
              disabled={isApplying}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromoCodeInput;
