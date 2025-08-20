/**
 * Phase 1 Bargain Modal Component
 * Now uses the new AI live chat negotiation system
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Sparkles,
  X,
} from "lucide-react";
import { formatPriceNoDecimals } from "@/lib/formatPrice";
import { AINegotiationChat } from "@/components/AINegotiationChat";
import {
  useAIBargain,
  createFlightBargainDetails,
  createHotelBargainDetails,
  createSightseeingBargainDetails
} from "@/hooks/useAIBargain";

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
  const [userOfferPrice, setUserOfferPrice] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);
  const bargainHook = useAIBargain();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserOfferPrice("");
      setShowAIChat(false);
      // Set suggested target price (80% of base price as default)
      const suggestedPrice = Math.round(itemDetails.basePrice * 0.8);
      setUserOfferPrice(suggestedPrice.toString());
    }
  }, [isOpen, itemDetails.basePrice]);

  // Setup success/failure callbacks
  useEffect(() => {
    bargainHook.setSuccessCallback((finalPrice: number, orderRef: string) => {
      console.log('Phase1 bargain success:', finalPrice, orderRef);
      onBookingConfirmed(finalPrice);
    });

    bargainHook.setFailureCallback(() => {
      console.log('Phase1 bargain failed');
      setShowAIChat(false);
    });
  }, [onBookingConfirmed]);

  const handleUserOffer = () => {
    const offerPrice = parseFloat(userOfferPrice);

    if (isNaN(offerPrice) || offerPrice <= 0) {
      return;
    }

    if (offerPrice >= itemDetails.basePrice) {
      return;
    }

    // Create appropriate product details based on item type
    let productDetails;

    switch (itemDetails.type) {
      case 'flight':
        productDetails = createFlightBargainDetails({
          id: itemDetails.itemId,
          totalPrice: itemDetails.basePrice,
          airline: itemDetails.airline,
          flightNumber: itemDetails.flightNo || '',
          departure: { iataCode: itemDetails.route?.from || '' },
          arrival: { iataCode: itemDetails.route?.to || '' }
        });
        break;
      case 'hotel':
        productDetails = createHotelBargainDetails({
          id: itemDetails.itemId,
          name: itemDetails.hotelName || itemDetails.title,
          totalPrice: itemDetails.basePrice,
          city: itemDetails.city || ''
        });
        break;
      case 'sightseeing':
        productDetails = createSightseeingBargainDetails({
          id: itemDetails.itemId,
          name: itemDetails.activityName || itemDetails.title,
          price: itemDetails.basePrice,
          location: itemDetails.location || itemDetails.city || ''
        });
        break;
      default:
        productDetails = {
          productRef: itemDetails.itemId,
          basePrice: itemDetails.basePrice,
        };
    }

    // Start AI bargain
    bargainHook.startBargain({
      module: itemDetails.type as 'flights' | 'hotels' | 'sightseeing',
      title: `${itemDetails.title} - AI Bargain`,
      productDetails,
      userOffer: offerPrice,
    });

    setShowAIChat(true);
  };

  const handleBookAtBasePrice = () => {
    onBookingConfirmed(itemDetails.basePrice);
    onClose();
  };

  return (
    <>
      {/* Price Input Modal */}
      <Dialog open={isOpen && !showAIChat} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                AI Bargaining Platform
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogDescription>
              {itemDetails.title} • Enter your target price to start AI negotiation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Price Display */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Price</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPriceNoDecimals(itemDetails.basePrice)}
              </p>
            </div>

            {/* Bargain Input */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="userOffer">Your Target Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="userOffer"
                    type="number"
                    value={userOfferPrice}
                    onChange={(e) => setUserOfferPrice(e.target.value)}
                    placeholder="Enter your desired price"
                    className="pl-10"
                    max={itemDetails.basePrice - 1}
                    min={1}
                  />
                </div>
              </div>

              {userOfferPrice && parseFloat(userOfferPrice) >= itemDetails.basePrice && (
                <p className="text-sm text-red-600">
                  Target price must be lower than current price
                </p>
              )}

              {userOfferPrice &&
                parseFloat(userOfferPrice) > 0 &&
                parseFloat(userOfferPrice) < itemDetails.basePrice && (
                  <p className="text-sm text-green-600">
                    Potential savings: {formatPriceNoDecimals(itemDetails.basePrice - parseFloat(userOfferPrice))}
                  </p>
                )}

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>AI Suggestion:</strong> Try offering around{" "}
                  {formatPriceNoDecimals(Math.round(itemDetails.basePrice * 0.8))}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleUserOffer}
                  disabled={
                    !userOfferPrice ||
                    parseFloat(userOfferPrice) >= itemDetails.basePrice ||
                    parseFloat(userOfferPrice) <= 0
                  }
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start AI Negotiation
                </Button>

                <Button
                  onClick={handleBookAtBasePrice}
                  variant="outline"
                  className="w-full"
                >
                  Book at Current Price
                </Button>
              </div>
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
}
