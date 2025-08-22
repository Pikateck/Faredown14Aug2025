import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plane, Building, MapPin, Car, Clock, Shield, Target, Zap, Star, TrendingUp, CheckCircle, Sparkles, Crown, ArrowLeft } from "lucide-react";
import copyPacks from "../../api/data/copy_packs.json";
import { useCurrency } from "@/contexts/CurrencyContext";
import { numberToWords, formatNumberWithCommas } from "@/lib/numberToWords";

interface ChatMessage {
  id: string;
  speaker: "supplier" | "agent" | "user";
  message: string;
  timestamp: number;
  isTyping?: boolean;
  price?: number;
}

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

interface Props {
  isOpen: boolean;
  flight: Flight | null;
  selectedFareType: FareType | null;
  onClose: () => void;
  onAccept: (finalPrice: number, orderRef: string) => void;
  onHold: (orderRef: string) => void;
  userName?: string;
  module?: "flights" | "hotels" | "sightseeing" | "transfers";
  onBackToResults?: () => void;
}

// Weighted random selection helper
const selectWeightedRandom = (options: Array<{ text: string; w: number }>) => {
  const totalWeight = options.reduce((sum, option) => sum + option.w, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    random -= option.w;
    if (random <= 0) {
      return option.text;
    }
  }
  return options[0].text;
};

// Template replacement helper
const replaceTemplates = (text: string, variables: Record<string, any>) => {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] || match;
  });
};

const ConversationalBargainModal: React.FC<Props> = ({
  isOpen,
  flight,
  selectedFareType,
  onClose,
  onAccept,
  onHold,
  userName = "traveler",
  module = "flights",
  onBackToResults,
}) => {
  // Get currency context
  const { selectedCurrency, formatPrice } = useCurrency();

  // Unified state management
  const [currentPrice, setCurrentPrice] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [round, setRound] = useState(1);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [finalOffer, setFinalOffer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [showOfferActions, setShowOfferActions] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const MAX_ROUNDS = 3;
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get module-specific copy and icons
  const moduleCopy = copyPacks.modules[module] || copyPacks.modules.flights;
  
  const moduleIcons = {
    flights: Plane,
    hotels: Building,
    sightseeing: MapPin,
    transfers: Car,
  };

  const supplierNames = {
    flights: "Airline",
    hotels: "Hotel",
    sightseeing: "Tour Operator",
    transfers: "Transfer Provider",
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && flight) {
      setCurrentPrice("");
      setMessages([
        {
          id: "welcome",
          speaker: "agent",
          message: `Hi ${userName}! I'm here to help you get the best price. What's your target price for this ${module === "flights" ? "flight" : module.slice(0, -1)}?`,
          timestamp: Date.now(),
        }
      ]);
      setRound(1);
      setIsNegotiating(false);
      setIsTyping(false);
      setFinalOffer(null);
      setTimerSeconds(30);
      setTimerActive(false);
      setShowOfferActions(false);
      setIsComplete(false);
      setTimerExpired(false);
    }
  }, [isOpen, flight, userName, module]);

  // Auto-scroll to last message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setShowOfferActions(false);
            setTimerExpired(true);
            // Add expired message with intuitive options
            setTimeout(() => {
              addMessage("agent", "⏰ Time's up! Your negotiated price has expired. You can go back to results to search for new deals or try negotiating again.");
              setIsNegotiating(false);
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, addMessage]);

  const addMessage = useCallback((speaker: "supplier" | "agent" | "user", text: string, price?: number) => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        speaker,
        message: text,
        timestamp: Date.now(),
        price,
      },
    ]);
  }, []);

  const startNegotiation = async () => {
    if (!currentPrice || !flight || isNegotiating) return;

    const userPriceNum = parseInt(currentPrice);
    if (userPriceNum <= 0) return;

    setIsNegotiating(true);
    setIsTyping(true);

    // Add user message
    addMessage("user", `I'd like to pay ${selectedCurrency.symbol}${userPriceNum.toLocaleString()}`, userPriceNum);

    // Simulate negotiation flow
    setTimeout(() => {
      const basePrice = selectedFareType?.price || flight.price;
      const supplierCheckText = selectWeightedRandom(moduleCopy.supplier_check.any);
      const filledText = replaceTemplates(supplierCheckText, { base: basePrice });
      
      addMessage("supplier", filledText);
      setIsTyping(false);

      // Move to agent offer
      setTimeout(() => moveToAgentOffer(userPriceNum), 1500);
    }, 1000);
  };

  const moveToAgentOffer = useCallback((userPriceNum: number) => {
    setIsTyping(true);

    setTimeout(() => {
      const agentOfferText = selectWeightedRandom(
        moduleCopy.agent_offer[round] || moduleCopy.agent_offer["1"],
      );
      const variables = {
        offer: userPriceNum,
        airline: flight?.airline || "Airline",
        flight_no: flight?.flightNumber || "FL123",
        hotel_name: flight?.airline || "Hotel Name",
        tour_name: "Tour Name",
        pickup: "Airport",
        dropoff: "City Center",
      };
      const filledText = replaceTemplates(agentOfferText, variables);

      addMessage("agent", filledText);
      setIsTyping(false);

      // Move to supplier counter
      setTimeout(() => moveToSupplierCounter(userPriceNum), 2000);
    }, 1000);
  }, [round, flight, moduleCopy, addMessage]);

  const moveToSupplierCounter = useCallback((userPriceNum: number) => {
    setIsTyping(true);

    setTimeout(() => {
      const basePrice = selectedFareType?.price || flight?.price || 0;
      const discount = userPriceNum / basePrice;

      // Higher acceptance chance if user price is reasonable
      const acceptChance = discount > 0.8 ? 0.8 : discount > 0.7 ? 0.6 : 0.4;
      const isAccepted = Math.random() < acceptChance;

      let counterText: string;
      let negPrice = userPriceNum;

      if (isAccepted) {
        counterText = selectWeightedRandom(moduleCopy.supplier_counter.accepted);
        setFinalOffer(userPriceNum);
      } else {
        counterText = selectWeightedRandom(moduleCopy.supplier_counter.counter);
        const counterFactor = round === 1 ? 0.1 : round === 2 ? 0.05 : 0.02;
        negPrice = Math.round(userPriceNum + (basePrice - userPriceNum) * counterFactor);
        setFinalOffer(negPrice);
      }

      const filledText = replaceTemplates(counterText, { counter: negPrice });
      addMessage("supplier", filledText);
      setIsTyping(false);

      // Move to final confirmation
      setTimeout(() => showFinalOffer(negPrice), 1500);
    }, 1000);
  }, [round, flight, selectedFareType, moduleCopy, addMessage]);

  const showFinalOffer = useCallback((offerPrice: number) => {
    setIsTyping(true);

    setTimeout(() => {
      const confirmOptions = moduleCopy.agent_user_confirm[round] || moduleCopy.agent_user_confirm["1"] || moduleCopy.agent_user_confirm.any;
      const confirmText = selectWeightedRandom(confirmOptions);
      const variables = {
        counter: offerPrice,
        user_name: userName,
        user_title: userName,
      };
      const filledText = replaceTemplates(confirmText, variables);

      addMessage("agent", filledText);
      setIsTyping(false);
      setIsNegotiating(false);

      // Start timer and show actions
      setTimeout(() => {
        setTimerActive(true);
        setShowOfferActions(true);
        setTimerSeconds(30);
      }, 500);
    }, 1000);
  }, [round, userName, moduleCopy, addMessage]);

  const handleBookNow = () => {
    if (finalOffer) {
      onAccept(finalOffer, `NEGOTIATED-${Date.now()}`);
    }
  };

  const handleTryAgain = () => {
    if (round >= MAX_ROUNDS) {
      setIsComplete(true);
      addMessage("agent", `You've reached the maximum of ${MAX_ROUNDS} attempts, ${userName}. You can still book at the original price or return to search results.`);
      return;
    }

    setTimerActive(false);
    setShowOfferActions(false);
    setTimerExpired(false);
    setRound(prev => prev + 1);
    setCurrentPrice("");
    setFinalOffer(null);
    addMessage("agent", `Let's try round ${round + 1}! What's your new target price, ${userName}?`);
  };

  // Handle enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showOfferActions && finalOffer) {
        handleBookNow();
      } else if (!showOfferActions && !isComplete && !isNegotiating && currentPrice && parseInt(currentPrice) > 0) {
        startNegotiation();
      }
    }
  }, [showOfferActions, finalOffer, isComplete, isNegotiating, currentPrice]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!flight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-0 gap-0 max-h-[95vh] flex flex-col">
        <DialogTitle className="sr-only">AI Price Negotiation</DialogTitle>
        
        {/* Elegant Header */}
        <div className="relative bg-gradient-to-r from-[#003580] to-[#0071c2] p-5 rounded-t-2xl border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 p-0 rounded-lg hover:bg-white/10 transition-colors z-10"
          >
            <X className="h-4 w-4 text-white" />
          </Button>

          <div className="flex items-center gap-3 pr-12">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg relative">
              {React.createElement(moduleIcons[module], {
                className: "h-6 w-6 text-white"
              })}
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">
                AI Price Negotiation
              </h2>
              <p className="text-sm text-blue-100">
                {module === "flights" && `${flight.airline} ${flight.flightNumber}`}
                {module === "hotels" && "Hotel Booking"}
                {module === "sightseeing" && "Tour Booking"}
                {module === "transfers" && "Transfer Booking"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/80 font-bold">Round</div>
              <div className="text-lg font-bold text-white">{round}/{MAX_ROUNDS}</div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] scroll-smooth">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.speaker === "user" ? "justify-end" : "justify-start"}`}>
                {message.speaker !== "user" && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                    message.speaker === "supplier"
                      ? "bg-gradient-to-br from-[#003580] to-[#0071c2] text-white border border-white/20"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border border-white/20"
                  }`}>
                    {message.speaker === "supplier" ? (
                      <div className="relative">
                        {React.createElement(moduleIcons[module], { className: "h-4 w-4" })}
                        <Crown className="h-2 w-2 absolute -top-1 -right-1 text-yellow-300" />
                      </div>
                    ) : (
                      <div className="relative">
                        <Sparkles className="h-4 w-4" />
                        <Star className="h-2 w-2 absolute -top-1 -right-1 text-yellow-300" />
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm ${
                  message.speaker === "user"
                    ? "bg-gradient-to-br from-[#003580] to-[#0071c2] text-white ml-auto"
                    : message.speaker === "supplier"
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 border border-blue-200"
                    : "bg-gradient-to-br from-emerald-50 to-emerald-100 text-gray-800 border border-emerald-200"
                }`}>
                  <div className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wide">
                    {message.speaker === "supplier" ? supplierNames[module] : 
                     message.speaker === "agent" ? "AI Agent" : "You"}
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.message}
                    {message.price && (
                      <div className="mt-2 text-xs font-semibold">
                        {selectedCurrency.symbol}{formatNumberWithCommas(message.price)}
                      </div>
                    )}
                  </div>
                </div>

                {message.speaker === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#003580] to-[#0071c2] flex items-center justify-center text-white shadow-md border border-white/20">
                    <div className="text-xs font-bold">{userName.charAt(0)}</div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
                  <Sparkles className="w-3 h-3 text-white animate-pulse" />
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl px-4 py-3 border border-gray-300 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gradient-to-br from-[#003580] to-[#0071c2] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gradient-to-br from-[#003580] to-[#0071c2] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gradient-to-br from-[#003580] to-[#0071c2] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Offer Actions */}
          {showOfferActions && timerActive && finalOffer && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-200" onKeyDown={handleKeyPress}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">
                    Negotiated Price: {selectedCurrency.symbol}{formatNumberWithCommas(finalOffer)}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-mono font-bold shadow-sm ${
                  timerSeconds <= 10
                    ? "bg-red-100 text-red-600 border border-red-200 animate-pulse"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}>
                  {formatTime(timerSeconds)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBookNow}
                  className="flex-1 bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002a5c] hover:to-[#005a9c] text-white font-semibold py-3 rounded-full text-sm shadow-lg"
                  autoFocus
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Book Now (Enter)
                </Button>
                {round < MAX_ROUNDS && (
                  <Button
                    variant="outline"
                    onClick={handleTryAgain}
                    className="flex-1 border-2 border-[#003580] text-[#003580] hover:bg-blue-50 font-semibold py-3 rounded-full text-sm shadow-lg"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Try Again
                  </Button>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to book now or click Try Again for another round
              </div>
            </div>
          )}

          {/* Timer Expired State */}
          {timerExpired && !isComplete && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-200">
              <div className="text-center mb-4">
                <Clock className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <h3 className="text-lg font-bold text-gray-900">Offer Expired</h3>
                <p className="text-sm text-gray-600">
                  Your negotiated price has expired. Try again or go back to find new deals.
                </p>
              </div>
              <div className="flex gap-2">
                {round < MAX_ROUNDS && (
                  <Button
                    onClick={handleTryAgain}
                    className="flex-1 bg-gradient-to-r from-[#003580] to-[#0071c2] text-white font-semibold py-3 rounded-full shadow-lg"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Try Again
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    if (onBackToResults) onBackToResults();
                  }}
                  className="flex-1 border-2 border-[#003580] text-[#003580] hover:bg-blue-50 font-semibold py-3 rounded-full shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Results
                </Button>
              </div>
            </div>
          )}

          {/* Completion State */}
          {isComplete && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-center mb-4">
                <Clock className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <h3 className="text-lg font-bold text-gray-900">Negotiation Complete</h3>
                <p className="text-sm text-gray-600">
                  You can book at the original price or search for new deals.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onAccept(selectedFareType?.price || flight.price, `ORIGINAL-${Date.now()}`)}
                  className="flex-1 bg-gradient-to-r from-[#003580] to-[#0071c2] text-white font-semibold py-3 rounded-full shadow-lg"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Book Original Price
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    if (onBackToResults) onBackToResults();
                  }}
                  className="flex-1 border-2 border-[#003580] text-[#003580] hover:bg-blue-50 font-semibold py-3 rounded-full shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Results
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          {!showOfferActions && !isComplete && !timerExpired && (
            <div className="p-4 bg-white border-t border-gray-200" onKeyDown={handleKeyPress}>
              <div className="mb-3">
                <div className="text-xs font-bold text-gray-700 mb-2">
                  <strong>Current Price:</strong> {selectedCurrency.symbol}{formatNumberWithCommas(selectedFareType?.price || flight.price)}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-[#003580]">{selectedCurrency.symbol}</span>
                  <Input
                    ref={inputRef}
                    type="number"
                    value={currentPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove any non-digit characters except decimal point
                      const cleanValue = value.replace(/[^\d]/g, '');
                      setCurrentPrice(cleanValue);
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter your target price"
                    className="pl-8 pr-12 h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/20 transition-all font-semibold text-gray-900"
                    min="1"
                    disabled={isNegotiating}
                    autoComplete="off"
                  />
                  <Button
                    onClick={startNegotiation}
                    disabled={!currentPrice || parseInt(currentPrice) <= 0 || isNegotiating}
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002a5c] hover:to-[#005a9c] rounded-lg shadow-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>

                {/* Amount in words display */}
                {currentPrice && parseInt(currentPrice) > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium">
                      Amount in words:
                    </div>
                    <div className="text-sm text-blue-800 font-semibold">
                      {selectedCurrency.symbol}{formatNumberWithCommas(parseInt(currentPrice))} ({numberToWords(parseInt(currentPrice))})
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Enter your target price and press Enter or click the sparkle button
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationalBargainModal;
