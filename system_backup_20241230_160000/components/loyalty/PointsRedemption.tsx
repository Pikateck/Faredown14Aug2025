import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import {
  Star,
  Gift,
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useLoyalty } from "../../contexts/LoyaltyContext";
import { loyaltyService } from "../../services/loyaltyService";

interface PointsRedemptionProps {
  cartId: string;
  eligibleAmount: number;
  currency?: string;
  fxRate?: number;
  onRedemptionChange?: (
    redemption: {
      pointsApplied: number;
      rupeeValue: number;
      lockedId?: string;
    } | null,
  ) => void;
  disabled?: boolean;
}

export function PointsRedemption({
  cartId,
  eligibleAmount,
  currency = "INR",
  fxRate = 1.0,
  onRedemptionChange,
  disabled = false,
}: PointsRedemptionProps) {
  const {
    profile,
    cartRedemption,
    pendingQuote,
    quoteRedemption,
    applyPoints,
    cancelRedemption,
    canRedeem,
  } = useLoyalty();

  const [selectedPoints, setSelectedPoints] = useState(0);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get current redemption quote
  useEffect(() => {
    if (eligibleAmount > 0 && profile && canRedeem(eligibleAmount)) {
      handleQuoteRedemption();
    }
  }, [eligibleAmount, profile, cartId]);

  // Update parent when redemption changes
  useEffect(() => {
    if (cartRedemption && onRedemptionChange) {
      onRedemptionChange({
        pointsApplied: cartRedemption.pointsApplied,
        rupeeValue: cartRedemption.rupeeValue,
        lockedId: cartRedemption.lockedId,
      });
    } else if (!cartRedemption && onRedemptionChange) {
      onRedemptionChange(null);
    }
  }, [cartRedemption, onRedemptionChange]);

  const handleQuoteRedemption = async () => {
    setIsQuoting(true);
    setError(null);

    try {
      const quoteResult = await quoteRedemption(
        eligibleAmount,
        currency,
        fxRate,
      );
      setQuote(quoteResult);

      // Reset selected points if it exceeds new max
      if (selectedPoints > quoteResult.maxPoints) {
        setSelectedPoints(quoteResult.maxPoints);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get redemption quote",
      );
    } finally {
      setIsQuoting(false);
    }
  };

  const handleApplyPoints = async () => {
    if (!selectedPoints || selectedPoints < 200) return;

    setIsApplying(true);
    setError(null);

    try {
      const success = await applyPoints(cartId, selectedPoints, eligibleAmount);
      if (!success) {
        setError("Failed to apply points. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply points");
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelRedemption = async () => {
    const success = await cancelRedemption();
    if (success) {
      setSelectedPoints(0);
      setError(null);
    }
  };

  const handleMaxPoints = () => {
    if (quote?.maxPoints) {
      setSelectedPoints(quote.maxPoints);
    }
  };

  const calculateRupeeValue = (points: number) => {
    return (points / 100) * 10; // 100 points = ₹10
  };

  // Don't show if user can't redeem
  if (!profile || !canRedeem(eligibleAmount)) {
    return null;
  }

  // Don't show if no points available
  const availablePoints =
    profile.member.pointsBalance - profile.member.pointsLocked;
  if (availablePoints < 200) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900">
          <Star className="w-5 h-5" />
          Use Your Points
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Redemption Display */}
        {cartRedemption ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Points Applied
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelRedemption}
                className="text-green-700 hover:text-green-900 hover:bg-green-100"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Points Used:</span>
                <div className="font-semibold text-green-800">
                  {loyaltyService.formatPoints(cartRedemption.pointsApplied)}
                </div>
              </div>
              <div>
                <span className="text-green-600">Discount:</span>
                <div className="font-semibold text-green-800">
                  {loyaltyService.formatRupees(cartRedemption.rupeeValue)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Available Points */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Available: {loyaltyService.formatPoints(availablePoints)}{" "}
                  points
                </div>
                <div className="text-sm text-gray-600">
                  Worth{" "}
                  {loyaltyService.formatRupees(
                    calculateRupeeValue(availablePoints),
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-blue-700 border-blue-300"
              >
                {profile.member.tierName}
              </Badge>
            </div>

            {/* Quote Loading */}
            {isQuoting && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Calculating redemption...</span>
              </div>
            )}

            {/* Redemption Controls */}
            {quote && !isQuoting && (
              <div className="space-y-4">
                {/* Max Redemption Info */}
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    You can use up to{" "}
                    <strong>
                      {loyaltyService.formatRupees(quote.rupeeValue)}
                    </strong>{" "}
                    ({loyaltyService.formatPoints(quote.maxPoints)} points) on
                    this booking.
                  </div>
                  {quote.capReason && (
                    <div className="text-xs text-blue-600 mt-1">
                      {quote.capReason}
                    </div>
                  )}
                </div>

                {/* Points Slider */}
                {quote.maxPoints >= 200 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Points to use:
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMaxPoints}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        Use Max
                      </Button>
                    </div>

                    <Slider
                      value={[selectedPoints]}
                      onValueChange={(value) => setSelectedPoints(value[0])}
                      max={quote.maxPoints}
                      min={0}
                      step={100}
                      className="w-full"
                      disabled={disabled}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {loyaltyService.formatPoints(selectedPoints)} points
                      </span>
                      <span className="font-medium text-gray-900">
                        {loyaltyService.formatRupees(
                          calculateRupeeValue(selectedPoints),
                        )}{" "}
                        discount
                      </span>
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                {selectedPoints >= 200 && (
                  <Button
                    onClick={handleApplyPoints}
                    disabled={disabled || isApplying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isApplying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Gift className="w-4 h-4 mr-2" />
                    )}
                    Apply {loyaltyService.formatPoints(selectedPoints)} Points
                  </Button>
                )}
              </div>
            )}

            {/* No redemption available */}
            {quote && quote.maxPoints < 200 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">
                    Minimum 200 points required for redemption.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 w-full"
        >
          {showDetails ? "Hide" : "Show"} Redemption Details
        </Button>

        {/* Redemption Details */}
        {showDetails && (
          <div className="text-xs text-gray-600 space-y-2 bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between">
              <span>Redemption Rate:</span>
              <span>100 points = ₹10</span>
            </div>
            <div className="flex justify-between">
              <span>Maximum per booking:</span>
              <span>20% of eligible amount</span>
            </div>
            <div className="flex justify-between">
              <span>Eligible Amount:</span>
              <span>{loyaltyService.formatRupees(eligibleAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Your Tier:</span>
              <span>
                {profile.member.tierName} (Level {profile.member.tier})
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PointsRedemption;
