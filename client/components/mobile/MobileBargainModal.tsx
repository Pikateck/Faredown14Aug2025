import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, X, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface MobileBargainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBargainSuccess: (finalPrice: number) => void;
  ticketName: string;
  originalPrice: number;
  venueName: string;
  ticketFeatures: string[];
}

export const MobileBargainModal: React.FC<MobileBargainModalProps> = ({
  isOpen,
  onClose,
  onBargainSuccess,
  ticketName,
  originalPrice,
  venueName,
  ticketFeatures,
}) => {
  const { formatPrice } = useCurrency();

  const [targetPrice, setTargetPrice] = useState("");
  const [negotiationPhase, setNegotiationPhase] = useState<
    "input" | "negotiating" | "success" | "counteroffer"
  >("input");
  const [progress, setProgress] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetPrice("");
      setNegotiationPhase("input");
      setProgress(0);
      setTimeLeft(60);
    }
  }, [isOpen]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (negotiationPhase === "negotiating" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setProgress((prev) => Math.min(prev + 1.67, 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [negotiationPhase, timeLeft]);

  // Auto-complete negotiation
  useEffect(() => {
    if (negotiationPhase === "negotiating" && timeLeft === 0) {
      const target = parseInt(targetPrice);
      const savings = originalPrice - target;
      const savingsPercent = (savings / originalPrice) * 100;

      if (savingsPercent >= 20) {
        // High savings - show counter offer
        const counterOffer = target + Math.floor(savings * 0.3);
        setFinalPrice(counterOffer);
        setNegotiationPhase("counteroffer");
      } else {
        // Low savings - accept target price
        setFinalPrice(target);
        setNegotiationPhase("success");
      }
    }
  }, [timeLeft, negotiationPhase, targetPrice, originalPrice]);

  const handleStartNegotiation = () => {
    const target = parseInt(targetPrice);
    if (target && target < originalPrice && target > 0) {
      setNegotiationPhase("negotiating");
      setProgress(0);
      setTimeLeft(60);
    }
  };

  const handleAcceptOffer = () => {
    onBargainSuccess(finalPrice);
    onClose();
  };

  const handleBookOriginal = () => {
    onBargainSuccess(originalPrice);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-none m-0 rounded-none bg-white overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4 bg-[#003580] text-white -m-6 mb-0 p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">AI Price Negotiator</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {/* Ticket Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{ticketName}</h3>
            <p className="text-sm text-gray-600 mb-3">{venueName}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Current Price:</span>
              <span className="text-xl font-bold text-[#003580]">
                {formatPrice(originalPrice)}
              </span>
            </div>

            {/* Features */}
            <div className="space-y-1">
              {ticketFeatures.slice(0, 3).map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center text-xs text-gray-600"
                >
                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Input Phase */}
          {negotiationPhase === "input" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What's your target price?
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your ideal price and our AI will negotiate with{" "}
                  {venueName}!
                </p>

                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter your target price"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="pl-8 h-12 text-lg"
                      max={originalPrice - 1}
                      min={1}
                    />
                  </div>

                  {targetPrice && parseInt(targetPrice) >= originalPrice && (
                    <p className="text-sm text-red-600">
                      Target price must be lower than current price
                    </p>
                  )}

                  {targetPrice &&
                    parseInt(targetPrice) > 0 &&
                    parseInt(targetPrice) < originalPrice && (
                      <p className="text-sm text-green-600">
                        Potential savings:{" "}
                        {formatPrice(originalPrice - parseInt(targetPrice))}
                      </p>
                    )}
                </div>
              </div>

              <Button
                onClick={handleStartNegotiation}
                disabled={
                  !targetPrice ||
                  parseInt(targetPrice) >= originalPrice ||
                  parseInt(targetPrice) <= 0
                }
                className="w-full h-12 bg-[#febb02] hover:bg-[#e5a700] text-[#003580] font-bold text-base"
              >
                <TrendingDown className="w-5 h-5 mr-2" />
                Start Negotiation
              </Button>
            </div>
          )}

          {/* Negotiating Phase */}
          {negotiationPhase === "negotiating" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-[#003580] rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  AI Negotiating with {venueName}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Our AI is working to get you the best deal...
                </p>
              </div>

              <div className="space-y-2">
                <Progress value={progress} className="w-full h-2" />
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {timeLeft}s remaining
                </div>
              </div>
            </div>
          )}

          {/* Success Phase */}
          {negotiationPhase === "success" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Success! 🎉
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {venueName} accepted your exact price!
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatPrice(finalPrice)}
                </div>
                <div className="text-sm text-gray-600">
                  You saved {formatPrice(originalPrice - finalPrice)}!
                </div>
              </div>

              <Button
                onClick={handleAcceptOffer}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base"
              >
                Accept Deal & Continue
              </Button>
            </div>
          )}

          {/* Counter Offer Phase */}
          {negotiationPhase === "counteroffer" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Counter Offer!
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {venueName} couldn't match your price, but here's their best
                  offer!
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {formatPrice(finalPrice)}
                </div>
                <div className="text-sm text-gray-600">
                  You still save {formatPrice(originalPrice - finalPrice)}!
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAcceptOffer}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base"
                >
                  Accept Counter Offer
                </Button>
                <Button
                  onClick={handleBookOriginal}
                  variant="outline"
                  className="w-full h-12 font-bold text-base"
                >
                  Book at Original Price
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
