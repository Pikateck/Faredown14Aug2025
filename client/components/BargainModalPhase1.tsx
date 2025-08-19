/**
 * Phase 1 Bargain Modal Component
 * Implements: Base Price + Markup (randomized) + Counter-offers
 * User Flow: User sees marked-up fare → Enters desired price → System responds with match or counter-offer
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Target,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Calculator,
  Zap,
  Clock,
  Award,
  Info,
  Sparkles,
} from "lucide-react";
import {
  useBargain,
  type BargainProductCPO,
  type BargainSessionStartResponse,
  type BargainOfferResponse,
} from "@/hooks/useBargain";
import { formatPriceNoDecimals } from "@/lib/formatPrice";
import RepriceModal from "@/components/RepriceModal";
import { RotatingBargainSkeleton } from "@/components/BargainLoadingSkeleton";

interface BargainModalPhase1Props {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (finalPrice: number) => void;
  itemDetails: {
    type: "flight" | "hotel" | "sightseeing";
    itemId: string;
    title: string;
    basePrice: number;
    userType?: "b2c" | "b2b";
    // Flight specific
    airline?: string;
    route?: { from: string; to: string };
    class?: string;
    // Hotel specific
    city?: string;
    hotelName?: string;
    starRating?: string;
    roomCategory?: string;
    // Sightseeing specific
    location?: string;
    category?: string;
    duration?: string;
    activityName?: string;
  };
  promoCode?: string;
  userLocation?: string;
  deviceType?: "mobile" | "desktop";
}

type BargainStep =
  | "loading"
  | "initial"
  | "negotiating"
  | "success"
  | "rejected";

export default function BargainModalPhase1({
  isOpen,
  onClose,
  onBookingConfirmed,
  itemDetails,
  promoCode,
  userLocation,
  deviceType = "desktop",
}: BargainModalPhase1Props) {
  const [step, setStep] = useState<BargainStep>("loading");
  const [userOfferPrice, setUserOfferPrice] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [showPricingDetails, setShowPricingDetails] = useState(false);

  // Use live bargain API
  const {
    isLoading,
    error: bargainError,
    session,
    lastOffer,
    startBargainSession,
    submitOffer,
    acceptCurrentOffer,
    resetSession,
    getErrorMessage,
    currentPrice,
    minFloor,
    explanation,
  } = useBargain();

  const [error, setError] = useState<string | null>(null);
  const [showRepriceModal, setShowRepriceModal] = useState(false);
  const [repriceData, setRepriceData] = useState<{
    oldPrice: number;
    newPrice?: number;
  } | null>(null);

  // 30-second timer for counter-offers (Zubin's requirement)
  const [counterOfferTimer, setCounterOfferTimer] = useState(0);
  const [isCounterOfferExpired, setIsCounterOfferExpired] = useState(false);

  // Prevent repeat price entries (Zubin's requirement)
  const [usedPrices, setUsedPrices] = useState<Set<number>>(new Set());

  // Initialize bargain session when modal opens
  useEffect(() => {
    if (isOpen && step === "loading") {
      initializeBargainSession();
    }
  }, [isOpen]);

  // 30-second countdown timer for counter-offers
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (counterOfferTimer > 0 && step === "negotiating") {
      interval = setInterval(() => {
        setCounterOfferTimer((prev) => {
          if (prev <= 1) {
            setIsCounterOfferExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [counterOfferTimer, step]);

  const initializeBargainSession = async () => {
    try {
      setError(null);

      // Create CPO (Comparable Product Object) for the API
      const productCPO: BargainProductCPO = {
        type: itemDetails.type,
        supplier: itemDetails.airline || "hotelbeds", // Determine supplier
        product_id: itemDetails.itemId,
        ...(itemDetails.route && {
          route: `${itemDetails.route.from}-${itemDetails.route.to}`,
        }),
        ...(itemDetails.city && { city: itemDetails.city }),
        ...(itemDetails.category && { activity_type: itemDetails.category }),
        ...(itemDetails.class && { class_of_service: itemDetails.class }),
      };

      const result = await startBargainSession(productCPO, promoCode);
      setStep("initial");

      // Set suggested target price (80% of initial offer as default)
      const suggestedPrice = Math.round(result.initial_offer.price * 0.8);
      setUserOfferPrice(suggestedPrice.toString());
    } catch (err: any) {
      console.error("❌ Failed to initialize bargain session:", err);

      const errorMsg = getErrorMessage(err);
      setError(errorMsg);

      // For network errors, still allow offline mode
      if (step === "loading" && errorMsg.includes("Network")) {
        setStep("initial");
        // Fallback pricing based on base price
        const fallbackPrice = Math.round(itemDetails.basePrice * 0.8);
        setUserOfferPrice(fallbackPrice.toString());
      }
    }
  };

  const handleUserOffer = async () => {
    if (!session || !userOfferPrice) return;

    try {
      setError(null);

      const offerPrice = parseFloat(userOfferPrice);

      if (isNaN(offerPrice) || offerPrice <= 0) {
        setError("Please enter a valid price");
        return;
      }

      // Zubin's Requirement: Prevent repeat price entries
      if (usedPrices.has(offerPrice)) {
        setError(
          "You cannot re-enter the same price. Please try a different amount.",
        );
        return;
      }

      // Add to used prices
      setUsedPrices((prev) => new Set(prev).add(offerPrice));

      const response = await submitOffer(offerPrice);
      setAttemptCount((prev) => prev + 1);

      if (response.decision === "accept") {
        setStep("success");
      } else if (response.decision === "counter") {
        setStep("negotiating");
        // Start 30-second timer for counter-offer (Zubin's requirement)
        setCounterOfferTimer(30);
        setIsCounterOfferExpired(false);
        // Clear the input for next attempt
        setUserOfferPrice("");
      } else {
        setStep("rejected");
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleAcceptCounterOffer = async () => {
    if (lastOffer?.counter_offer) {
      try {
        setError(null);
        const result = await acceptCurrentOffer();
        setStep("success");
        // Use the final accepted price
        onBookingConfirmed(lastOffer.counter_offer);
      } catch (err: any) {
        setError(getErrorMessage(err));
        if (err.code === "INVENTORY_CHANGED") {
          // Show reprice modal
          setRepriceData({
            oldPrice: lastOffer.counter_offer,
            newPrice: err.new_price, // If provided by API
          });
          setShowRepriceModal(true);
        }
      }
    }
  };

  const handleRejectCounterOffer = () => {
    if (attemptCount >= 3) {
      setStep("rejected");
    } else {
      // Allow user to make another offer
      setCounterOfferResponse(null);
    }
  };

  const handleBookNow = async () => {
    try {
      setError(null);
      if (step === "success" && lastOffer?.counter_offer) {
        const result = await acceptCurrentOffer();
        onBookingConfirmed(lastOffer.counter_offer);
      } else if (session?.initial_offer?.price) {
        const result = await acceptCurrentOffer();
        onBookingConfirmed(session.initial_offer.price);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const getSavingsInfo = () => {
    if (!session) return null;

    const initialPrice = session.initial_offer.price;
    const finalPrice =
      lastOffer?.counter_offer || parseFloat(userOfferPrice) || initialPrice;
    const savings = initialPrice - finalPrice;
    const savingsPercentage = (savings / initialPrice) * 100;

    return {
      savings: Math.max(0, savings),
      savingsPercentage: Math.max(0, savingsPercentage),
    };
  };

  const renderLoadingStep = () => <RotatingBargainSkeleton />;

  const renderInitialStep = () => {
    if (!session) return null;

    const savingsInfo = getSavingsInfo();

    return (
      <div className="space-y-6">
        {/* Current Price Display */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">AI Initial Offer</p>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {formatPriceNoDecimals(session.initial_offer.price)}
              </p>
              {promoCode && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Promo Applied: {promoCode}
                  </Badge>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingDetails(!showPricingDetails)}
                className="text-xs"
              >
                <Info className="w-3 h-3 mr-1" />
                {showPricingDetails ? "Hide" : "Show"} Why This Price?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Explanation */}
        {showPricingDetails && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                AI Pricing Explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800">
                  {session.initial_offer.explanation ||
                    session.explain ||
                    "AI has analyzed market conditions and demand patterns to suggest this optimal starting price."}
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Floor:</span>
                  <span>{formatPriceNoDecimals(session.min_floor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Target Range:</span>
                  <span>
                    {formatPriceNoDecimals(session.min_floor)} -{" "}
                    {formatPriceNoDecimals(
                      Math.round(session.initial_offer.price * 0.9),
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bargain Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              What price would you like to pay?
            </CardTitle>
            <CardDescription>
              Enter your desired price and we'll see if we can make it work!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userOffer">Your Target Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="userOffer"
                  type="number"
                  value={userOfferPrice}
                  onChange={(e) => setUserOfferPrice(e.target.value)}
                  placeholder={`e.g., ${pricingResult.bargainRange.recommendedTarget}`}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>AI Suggestion:</strong> Try offering around{" "}
                {formatPriceNoDecimals(
                  Math.round(session.initial_offer.price * 0.8),
                )}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Minimum acceptable: {formatPriceNoDecimals(session.min_floor)}
              </p>
            </div>

            {(error || bargainError) && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800">{error || bargainError}</p>
              </div>
            )}

            <Button
              onClick={handleUserOffer}
              disabled={isLoading || !userOfferPrice}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  AI is thinking...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Submit Offer to AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNegotiatingStep = () => {
    if (!lastOffer) return null;

    const savingsInfo = getSavingsInfo();

    return (
      <div className="space-y-6">
        {/* Counter Offer Response with 30-Second Timer */}
        <Card
          className={`border-orange-200 ${isCounterOfferExpired ? "bg-red-50" : "bg-orange-50"}`}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <MessageCircle
                className={`w-8 h-8 mx-auto mb-3 ${isCounterOfferExpired ? "text-red-600" : "text-orange-600"}`}
              />
              <h3
                className={`text-lg font-semibold mb-2 ${isCounterOfferExpired ? "text-red-800" : "text-orange-800"}`}
              >
                {isCounterOfferExpired ? "Offer Expired!" : "Counter Offer!"}
              </h3>

              {/* 30-Second Timer Display (Zubin's requirement) */}
              {counterOfferTimer > 0 && !isCounterOfferExpired && (
                <div className="mb-3">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                      counterOfferTimer <= 10
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-mono font-bold">
                      {counterOfferTimer}s
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Offer valid for {counterOfferTimer} seconds
                  </p>
                </div>
              )}

              {lastOffer.counter_offer && !isCounterOfferExpired && (
                <p className="text-2xl font-bold text-orange-600 mb-2">
                  {formatPriceNoDecimals(lastOffer.counter_offer)}
                </p>
              )}

              <p
                className={`text-sm ${isCounterOfferExpired ? "text-red-700" : "text-orange-700"}`}
              >
                {isCounterOfferExpired
                  ? "This counter-offer has expired. You can make a new offer below."
                  : lastOffer.explain}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Savings Information */}
        {savingsInfo && savingsInfo.savings > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Potential Savings
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatPriceNoDecimals(savingsInfo.savings)}
                  </p>
                  <p className="text-sm text-green-600">
                    {savingsInfo.savingsPercentage.toFixed(1)}% off
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons for Active Counter-Offer */}
        {!isCounterOfferExpired && lastOffer.counter_offer && (
          <div className="flex gap-3">
            <Button
              onClick={handleAcceptCounterOffer}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isCounterOfferExpired || isLoading}
            >
              {isLoading ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              Accept Offer (₹{formatPriceNoDecimals(lastOffer.counter_offer)})
            </Button>
            <Button
              onClick={handleRejectCounterOffer}
              variant="outline"
              className="flex-1"
              disabled={isCounterOfferExpired}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject & Try Again
            </Button>
          </div>
        )}

        {/* New Offer Input (for expired offers or after rejection) */}
        {(isCounterOfferExpired || attemptCount < 3) && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-800 mb-3">
                Make Another Offer
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="newOffer">Your New Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="newOffer"
                      type="number"
                      value={userOfferPrice}
                      onChange={(e) => setUserOfferPrice(e.target.value)}
                      placeholder="Enter your desired price"
                      className="pl-10"
                    />
                  </div>
                  {usedPrices.size > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Previously tried:{" "}
                      {Array.from(usedPrices)
                        .map((p) => `₹${p.toLocaleString()}`)
                        .join(", ")}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleUserOffer}
                  disabled={isLoading || !userOfferPrice}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Submit New Offer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Attempts: {attemptCount}/3 •{" "}
            {lastOffer.explain || "Keep trying for better deals!"}
          </p>
          {usedPrices.size > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Note: You cannot re-enter the same price
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => {
    const finalPrice =
      lastOffer?.counter_offer ||
      parseFloat(userOfferPrice) ||
      session?.initial_offer?.price ||
      0;
    const savingsInfo = getSavingsInfo();

    return (
      <div className="space-y-6 text-center">
        <div className="py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Bargain Successful!
          </h3>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {formatPriceNoDecimals(finalPrice)}
          </p>

          {savingsInfo && savingsInfo.savings > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                <Award className="w-4 h-4 inline mr-1" />
                You saved{" "}
                <strong>{formatPriceNoDecimals(savingsInfo.savings)}</strong> (
                {savingsInfo.savingsPercentage.toFixed(1)}% off)!
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleBookNow}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm Booking at {formatPriceNoDecimals(finalPrice)}
        </Button>
      </div>
    );
  };

  const renderRejectedStep = () => (
    <div className="space-y-6 text-center">
      <div className="py-8">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-red-800 mb-2">
          Bargaining Session Ended
        </h3>
        <p className="text-gray-600 mb-4">
          We couldn't reach an agreement this time, but you can still book at
          the current price.
        </p>
        {session && (
          <p className="text-2xl font-bold text-blue-600">
            {formatPriceNoDecimals(session.initial_offer.price)}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleBookNow} className="flex-1">
          Book at Current Price
        </Button>
        <Button onClick={onClose} variant="outline" className="flex-1">
          Continue Shopping
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              AI Bargaining Platform
              {error && error.includes("Network") && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Offline Mode
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {itemDetails.title} • Live AI-powered price negotiation
              {error && error.includes("Network") && (
                <span className="block text-yellow-600 text-sm mt-1">
                  ⚠️ Using fallback pricing - bargaining still works!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {step === "loading" && renderLoadingStep()}
            {step === "initial" && renderInitialStep()}
            {step === "negotiating" && renderNegotiatingStep()}
            {step === "success" && renderSuccessStep()}
            {step === "rejected" && renderRejectedStep()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reprice Modal */}
      {showRepriceModal && (
        <RepriceModal
          isOpen={showRepriceModal}
          onClose={() => {
            setShowRepriceModal(false);
            setRepriceData(null);
            onClose(); // Close main modal too
          }}
          onRefresh={() => {
            setShowRepriceModal(false);
            setRepriceData(null);
            setStep("loading");
            initializeBargainSession(); // Restart with fresh data
          }}
          oldPrice={repriceData?.oldPrice || 0}
          newPrice={repriceData?.newPrice}
          itemTitle={itemDetails.title}
          reason="Inventory has changed during bargaining"
        />
      )}
    </>
  );
}
