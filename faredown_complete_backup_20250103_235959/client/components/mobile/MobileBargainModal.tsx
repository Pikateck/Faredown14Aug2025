import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingDown, X, CheckCircle, Clock, Sparkles } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AINegotiationChat } from "@/components/AINegotiationChat";
import {
  useAIBargain,
  createSightseeingBargainDetails,
} from "@/hooks/useAIBargain";

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
  const bargainHook = useAIBargain();

  const [targetPrice, setTargetPrice] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetPrice("");
      setShowAIChat(false);
    }
  }, [isOpen]);

  // Setup success/failure callbacks
  useEffect(() => {
    bargainHook.setSuccessCallback((finalPrice: number, orderRef: string) => {
      console.log("Mobile bargain success:", finalPrice, orderRef);
      onBargainSuccess(finalPrice);
    });

    bargainHook.setFailureCallback(() => {
      console.log("Mobile bargain failed");
      setShowAIChat(false);
    });
  }, [onBargainSuccess]);

  const handleStartNegotiation = () => {
    const target = parseInt(targetPrice);
    if (target && target < originalPrice && target > 0) {
      // Create product details for AI bargain
      const productDetails = createSightseeingBargainDetails({
        id: "sightseeing-" + Date.now(),
        name: ticketName,
        location: venueName,
        price: originalPrice,
      });

      // Start AI bargain
      bargainHook.startBargain({
        module: "sightseeing",
        title: `${ticketName} - AI Price Negotiator`,
        productDetails,
        userOffer: target,
      });

      setShowAIChat(true);
    }
  };

  const handleBookOriginal = () => {
    onBargainSuccess(originalPrice);
    onClose();
  };

  return (
    <>
      {/* Price Input Modal */}
      <Dialog open={isOpen && !showAIChat} onOpenChange={onClose}>
        <DialogContent className="w-full h-full max-w-none m-0 rounded-none bg-white overflow-y-auto">
          <DialogHeader className="border-b border-gray-200 pb-4 bg-[#003580] text-white -m-6 mb-0 p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">
                  AI Price Negotiator
                </span>
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
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What's your target price?
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your ideal price and our AI will negotiate with{" "}
                  {venueName} in real-time!
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
                <Sparkles className="w-5 h-5 mr-2" />
                Start AI Negotiation
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
        </DialogContent>
      </Dialog>

      {/* AI Negotiation Chat Modal */}
      {bargainHook.session && (
        <AINegotiationChat
          isOpen={bargainHook.session.isOpen}
          onClose={() => {
            bargainHook.closeBargain();
            setShowAIChat(false);
            onClose();
          }}
          title={bargainHook.session.title}
          module={bargainHook.session.module}
          productDetails={bargainHook.session.productDetails}
          userOffer={bargainHook.session.userOffer}
          onBargainSuccess={bargainHook.onBargainSuccess}
          onBargainFailed={() => {
            bargainHook.onBargainFailed();
            setShowAIChat(false);
          }}
        />
      )}
    </>
  );
};
