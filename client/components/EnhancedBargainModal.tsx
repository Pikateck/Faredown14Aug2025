import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AgentOfferBubble from "./AgentOfferBubble";
import { X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureCode: string;
  arrivalCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  price: number;
}

interface FareType {
  name: string;
  price: number;
  features: string[];
  baggage: string;
  refundability: string;
}

interface BargainOffer {
  price_now: number;
  was?: number;
  expiry_ts?: number;
  hold_seconds?: number;
  perks?: string[];
}

interface BargainState {
  negotiation_id: string;
  round: number;
  offer: BargainOffer;
  phase: "input" | "negotiating" | "offer" | "holding" | "expired";
}

interface Props {
  isOpen: boolean;
  flight: Flight | null;
  selectedFareType: FareType | null;
  onClose: () => void;
  onAccept: (finalPrice: number, orderRef: string) => void;
  onHold: (orderRef: string) => void;
  userName?: string;
}

export default function EnhancedBargainModal({
  isOpen,
  flight,
  selectedFareType,
  onClose,
  onAccept,
  onHold,
  userName = "Mr. Zubin",
}: Props) {
  const { selectedCurrency } = useCurrency();
  const [userPrice, setUserPrice] = useState("");
  const [bargainState, setBargainState] = useState<BargainState | null>(null);

  const startNegotiation = useCallback(async () => {
    if (!flight || !selectedFareType || !userPrice) return;

    setBargainState({
      negotiation_id: `neg_${Date.now()}`,
      round: 1,
      offer: {
        price_now: parseInt(userPrice),
        was: selectedFareType.price,
        expiry_ts: Date.now() + 30000, // 30 seconds from now
        hold_seconds: 30,
      },
      phase: "offer",
    });
  }, [flight, selectedFareType, userPrice]);

  const handleCounter = useCallback(async () => {
    if (!bargainState) return;

    setBargainState((prev) =>
      prev ? { ...prev, phase: "negotiating" } : null,
    );

    // Simulate API call delay
    setTimeout(() => {
      const newPrice = Math.max(
        parseInt(userPrice),
        bargainState.offer.price_now - Math.floor(Math.random() * 2000),
      );

      setBargainState((prev) =>
        prev
          ? {
              ...prev,
              round: prev.round + 1,
              offer: {
                ...prev.offer,
                price_now: newPrice,
                expiry_ts: Date.now() + 30000, // New 30s timer
              },
              phase: "offer",
            }
          : null,
      );
    }, 2000);
  }, [bargainState, userPrice]);

  const handleHold = useCallback(async () => {
    if (!bargainState) return;

    setBargainState((prev) => (prev ? { ...prev, phase: "holding" } : null));

    // Simulate hold placement
    setTimeout(() => {
      onHold(`hold_${bargainState.negotiation_id}`);
    }, 1000);
  }, [bargainState, onHold]);

  const handleRefreshAfterExpiry = useCallback(async () => {
    if (!bargainState || !selectedFareType) return;

    // Generate a new offer after expiry
    const refreshedPrice =
      selectedFareType.price - Math.floor(Math.random() * 1000);

    setBargainState((prev) =>
      prev
        ? {
            ...prev,
            offer: {
              ...prev.offer,
              price_now: refreshedPrice,
              expiry_ts: Date.now() + 30000,
            },
            phase: "offer",
          }
        : null,
    );
  }, [bargainState, selectedFareType]);

  const resetModal = () => {
    setUserPrice("");
    setBargainState(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!flight || !selectedFareType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            AI Price Negotiation
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flight Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{flight.airline}</h3>
                <p className="text-gray-600">
                  {selectedFareType.name} • {flight.flightNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {flight.departureCode} → {flight.arrivalCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedCurrency.symbol}{selectedFareType.price.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500">Original Price</p>
              </div>
            </div>
          </div>

          {/* Negotiation Flow */}
          {!bargainState ? (
            /* Input Phase */
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <p className="text-emerald-800">
                    <strong>Faredown Agent:</strong> I'll negotiate with{" "}
                    {flight.airline} for you. What price would you like to pay?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Your target price ({selectedCurrency.symbol}):
                </label>
                <input
                  type="number"
                  value={userPrice}
                  onChange={(e) => setUserPrice(e.target.value)}
                  placeholder="Enter your desired price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max={selectedFareType.price - 1}
                />
                <Button
                  onClick={startNegotiation}
                  disabled={
                    !userPrice || parseInt(userPrice) >= selectedFareType.price
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Start AI Negotiation
                </Button>
              </div>
            </div>
          ) : (
            /* Negotiation Phase */
            <div className="space-y-4">
              {bargainState.phase === "negotiating" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <p className="text-blue-800">
                      <strong>Faredown Agent:</strong> Negotiating with{" "}
                      {flight.airline}...
                    </p>
                  </div>
                </div>
              )}

              {bargainState.phase === "offer" && (
                <AgentOfferBubble
                  userName={userName}
                  negotiationId={bargainState.negotiation_id}
                  offer={bargainState.offer}
                  onHold={handleHold}
                  onCounter={handleCounter}
                  onRefreshAfterExpiry={handleRefreshAfterExpiry}
                />
              )}

              {bargainState.phase === "holding" && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🔒</span>
                    </div>
                    <p className="text-green-800">
                      <strong>Price locked</strong> — completing your booking...
                      (Hold expires in 30s)
                    </p>
                  </div>
                </div>
              )}

              {/* Negotiation Stats */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Round: {bargainState.round}</span>
                  <span>
                    Current Offer: ₹
                    {bargainState.offer.price_now.toLocaleString("en-IN")}
                  </span>
                  <span>
                    Savings: ₹
                    {(
                      (bargainState.offer.was || selectedFareType.price) -
                      bargainState.offer.price_now
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
