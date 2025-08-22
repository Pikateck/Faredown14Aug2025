import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plane, Building, MapPin, Car, Clock, Shield, Target } from "lucide-react";
import copyPacks from "../../api/data/copy_packs.json";

interface ChatMessage {
  id: string;
  speaker: "supplier" | "agent";
  message: string;
  timestamp: number;
  isTyping?: boolean;
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
  // Modal phases: input -> negotiating -> offer -> holding -> expired -> max_rounds_reached -> timer_expired
  const [phase, setPhase] = useState<
    | "input"
    | "negotiating"
    | "offer"
    | "holding"
    | "expired"
    | "max_rounds_reached"
    | "timer_expired"
  >("input");
  const [userPrice, setUserPrice] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "supplier_check" | "agent_offer" | "supplier_counter" | "agent_confirm"
  >("supplier_check");
  const [round, setRound] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const MAX_ROUNDS = 3;

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
      setPhase("input");
      setUserPrice("");
      setMessages([]);
      setCurrentStep("supplier_check");
      setRound(1);
      setIsTyping(false);
      setTimerSeconds(30);
      setTimerActive(false);
      setShowConfirmButtons(false);
      setIsHolding(false);
      setIsExpired(false);
      setFinalPrice(0);
    }
  }, [isOpen, flight]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsExpired(true);
            setShowConfirmButtons(false);
            setPhase("timer_expired");
            // Add expired message
            setTimeout(() => {
              const expiredText = selectWeightedRandom(
                copyPacks.fallbacks.expired.agent,
              );
              addMessage("agent", expiredText);
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const addMessage = useCallback(
    (speaker: "supplier" | "agent", text: string) => {
      const messageId = `msg-${Date.now()}-${Math.random()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          speaker,
          message: text,
          timestamp: Date.now(),
        },
      ]);
    },
    [],
  );

  const startNegotiation = () => {
    if (!userPrice || !flight) return;

    setPhase("negotiating");
    setIsTyping(true);

    // Step 1: Supplier Check
    setTimeout(() => {
      const basePrice = selectedFareType?.price || flight.price;
      const supplierCheckText = selectWeightedRandom(
        moduleCopy.supplier_check.any,
      );
      const filledText = replaceTemplates(supplierCheckText, {
        base: basePrice,
      });

      addMessage("supplier", filledText);
      setIsTyping(false);

      // Move to agent offer
      setTimeout(() => moveToAgentOffer(), 1500);
    }, 1000);
  };

  const moveToAgentOffer = useCallback(() => {
    setCurrentStep("agent_offer");
    setIsTyping(true);

    setTimeout(() => {
      const agentOfferText = selectWeightedRandom(
        moduleCopy.agent_offer[round] || moduleCopy.agent_offer["1"],
      );
      const variables = {
        offer: userPrice,
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
      setTimeout(() => moveToSupplierCounter(), 2000);
    }, 1000);
  }, [round, userPrice, flight, moduleCopy, addMessage]);

  const moveToSupplierCounter = useCallback(() => {
    setCurrentStep("supplier_counter");
    setIsTyping(true);

    setTimeout(() => {
      // Decide if supplier accepts or counters based on round
      const userPriceNum = parseInt(userPrice) || 0;
      const basePrice = selectedFareType?.price || flight?.price || 0;
      const discount = userPriceNum / basePrice;

      // Higher acceptance chance if user price is reasonable (less than 20% off)
      const acceptChance = discount > 0.8 ? 0.8 : discount > 0.7 ? 0.6 : 0.4;
      const isAccepted = Math.random() < acceptChance;

      let counterText: string;
      let negPrice = userPriceNum;

      if (isAccepted) {
        counterText = selectWeightedRandom(
          moduleCopy.supplier_counter.accepted,
        );
      } else {
        counterText = selectWeightedRandom(moduleCopy.supplier_counter.counter);
        // Counter with price between user price and base (closer to user price in later rounds)
        const counterFactor = round === 1 ? 0.1 : round === 2 ? 0.05 : 0.02;
        negPrice = Math.round(
          userPriceNum + (basePrice - userPriceNum) * counterFactor,
        );
      }

      setFinalPrice(negPrice);
      const filledText = replaceTemplates(counterText, { counter: negPrice });

      addMessage("supplier", filledText);
      setIsTyping(false);

      // Move to agent confirmation
      setTimeout(() => moveToAgentConfirm(), 1500);
    }, 1000);
  }, [round, userPrice, flight, selectedFareType, moduleCopy, addMessage]);

  const moveToAgentConfirm = useCallback(() => {
    setCurrentStep("agent_confirm");
    setPhase("offer");
    setIsTyping(true);

    setTimeout(() => {
      const confirmOptions =
        moduleCopy.agent_user_confirm[round] ||
        moduleCopy.agent_user_confirm["1"] ||
        moduleCopy.agent_user_confirm.any;
      const confirmText = selectWeightedRandom(confirmOptions);
      const variables = {
        counter: finalPrice,
        user_name: userName,
        user_title: userName,
      };
      const filledText = replaceTemplates(confirmText, variables);

      addMessage("agent", filledText);
      setIsTyping(false);

      // Start timer and show buttons after message appears
      setTimeout(() => {
        setTimerActive(true);
        setShowConfirmButtons(true);
      }, 500);
    }, 1000);
  }, [round, finalPrice, userName, moduleCopy, addMessage]);

  const handleHold = useCallback(() => {
    if (isHolding || isExpired) return;

    setIsHolding(true);
    setTimerActive(false);
    setShowConfirmButtons(false);
    setPhase("holding");

    // Update the last message to show holding status
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.speaker === "agent") {
        lastMessage.message = "🔒 Price locked — completing your booking...";
      }
      return newMessages;
    });

    // Call parent handler
    setTimeout(() => {
      onHold(`ORDER-${Date.now()}`);
    }, 1000);
  }, [isHolding, isExpired, onHold]);

  const handleBargainAgain = useCallback(() => {
    if (isHolding) return;

    // Check if we've reached max rounds
    if (round >= MAX_ROUNDS) {
      setPhase("max_rounds_reached");
      setTimerActive(false);
      setShowConfirmButtons(false);
      return;
    }

    setTimerActive(false);
    setShowConfirmButtons(false);
    setRound((prev) => prev + 1);
    setPhase("input"); // Go back to input phase for new price
    setUserPrice(""); // Clear previous price
    // Keep messages but reset other states
    setIsTyping(false);
    setIsExpired(false);
    setFinalPrice(0);
  }, [isHolding, round, MAX_ROUNDS]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!flight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogTitle className="sr-only">AI Price Negotiation</DialogTitle>
        
        {/* Clean Professional Header */}
        <div className="relative bg-gradient-to-r from-[#003580] to-[#0071c2] p-6 rounded-t-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              {React.createElement(moduleIcons[module], {
                className: "h-6 w-6 text-white"
              })}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                AI Price Negotiation
              </h2>
              <p className="text-sm text-blue-100 font-medium">
                {module === "flights" &&
                  `${flight.airline} ${flight.flightNumber}`}
                {module === "hotels" && "Hotel Booking"}
                {module === "sightseeing" && "Tour Booking"}
                {module === "transfers" && "Transfer Booking"}
              </p>
              {round > 1 && (
                <p className="text-xs text-white/80 font-medium mt-1">
                  Round {round} of {MAX_ROUNDS}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Input Phase - Clean Design */}
        {phase === "input" && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#003580] to-[#0071c2] flex items-center justify-center shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#003580] mb-3">
                {round === 1
                  ? "What's your target price?"
                  : "Enter your new desired price"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {round === 1
                  ? `Our AI will negotiate with the ${supplierNames[module]} on your behalf, ${userName}`
                  : `Let's try a different price for round ${round}, ${userName}`}
              </p>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <label className="block text-base font-semibold text-[#003580] mb-3">
                  Enter your desired price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#003580]">₹</span>
                  <Input
                    type="number"
                    value={userPrice}
                    onChange={(e) => setUserPrice(e.target.value)}
                    placeholder=""
                    className="pl-12 text-xl h-14 bg-white border-2 border-gray-300 rounded-xl focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/20 transition-all font-semibold text-gray-900"
                    min="1"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-700 font-medium">
                  <span className="font-semibold text-[#003580]">Current price:</span> ₹
                  {(selectedFareType?.price || flight.price).toLocaleString()}
                </p>
              </div>

              <Button
                onClick={startNegotiation}
                disabled={!userPrice || parseInt(userPrice) <= 0}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002a5c] hover:to-[#005a9c] text-white rounded-full transition-all duration-200 shadow-lg"
              >
                {round === 1
                  ? "Start AI Negotiation"
                  : `Continue Round ${round}`}
              </Button>
              
              {/* Add Book Original Price button */}
              <Button
                variant="outline"
                onClick={() => onAccept(selectedFareType?.price || flight.price, `ORIGINAL-${Date.now()}`)}
                className="w-full h-12 text-base font-semibold border-2 border-[#003580] text-[#003580] hover:bg-blue-50 rounded-full transition-all"
              >
                Book Original Price
              </Button>

              {/* Round indicator */}
              {round > 1 && (
                <div className="text-center text-sm text-gray-500">
                  Attempt {round} of {MAX_ROUNDS}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Phase - Clean Messages */}
        {(phase === "negotiating" ||
          phase === "offer" ||
          phase === "holding") && (
          <div className="flex flex-col max-h-[65vh]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {messages.map((message, index) => {
                const isLastAgentMessage =
                  message.speaker === "agent" &&
                  index === messages.length - 1 &&
                  phase === "offer" &&
                  currentStep === "agent_confirm";

                return (
                  <div key={message.id} className="flex gap-3 items-start">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        message.speaker === "supplier"
                          ? "bg-gradient-to-br from-[#003580] to-[#0071c2] text-white"
                          : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                      }`}
                    >
                      {message.speaker === "supplier" ? (
                        React.createElement(moduleIcons[module], {
                          className: "h-5 w-5 text-white"
                        })
                      ) : (
                        <div className="text-xs font-bold">AI</div>
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-sm rounded-2xl px-4 py-3 shadow-sm border ${
                        message.speaker === "supplier"
                          ? "bg-blue-50 text-gray-800 border-blue-200"
                          : "bg-emerald-50 text-gray-800 border-emerald-200"
                      }`}
                    >
                      <div className="text-xs font-semibold opacity-70 mb-2 uppercase tracking-wide">
                        {message.speaker === "supplier"
                          ? supplierNames[module]
                          : copyPacks.brand.negotiatorTitle}
                      </div>
                      <div className="text-sm leading-relaxed">
                        {message.message}
                      </div>

                      {/* Timer and buttons inside the last Agent message */}
                      {isLastAgentMessage &&
                        showConfirmButtons &&
                        !isHolding &&
                        !isExpired && (
                          <div className="mt-5 pt-4 border-t border-emerald-200">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                Valid for:
                              </span>
                              <div
                                className={`px-3 py-1 rounded-lg font-mono text-sm font-bold transition-all ${
                                  timerSeconds <= 10
                                    ? "bg-red-50 text-red-600 border-2 border-red-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {formatTime(timerSeconds)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => onAccept(finalPrice, `ACCEPTED-${Date.now()}`)}
                                className="flex-1 bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002a5c] hover:to-[#005a9c] text-white font-semibold py-3 rounded-full transition-all text-sm"
                              >
                                Book Now
                              </Button>
                              {round < MAX_ROUNDS && (
                                <Button
                                  variant="outline"
                                  onClick={handleBargainAgain}
                                  className="flex-1 border-2 border-[#003580] text-[#003580] hover:bg-blue-50 font-semibold py-3 rounded-full transition-all text-sm"
                                >
                                  Bargain Again
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}

              {/* Timer expired message */}
              {phase === "timer_expired" && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#003580] mb-2">
                    Offer Expired
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The negotiated price offer has expired, {userName}.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onAccept(selectedFareType?.price || flight?.price || 0, `ORIGINAL-${Date.now()}`)}
                      className="flex-1 bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002a5c] hover:to-[#005a9c] text-white py-3 rounded-full font-semibold transition-all"
                    >
                      Book Original Price
                    </Button>
                    {round < MAX_ROUNDS && (
                      <Button
                        variant="outline"
                        onClick={handleBargainAgain}
                        className="flex-1 border-2 border-[#003580] text-[#003580] hover:bg-blue-50 py-3 rounded-full font-semibold transition-all"
                      >
                        Bargain Again
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Max rounds reached message */}
              {phase === "max_rounds_reached" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#003580] mb-2">
                    Bargain Limit Reached
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You've reached the maximum of {MAX_ROUNDS} bargain attempts, {userName}.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    You can still book at the original price or search for new deals.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onAccept(selectedFareType?.price || flight?.price || 0, `ORIGINAL-${Date.now()}`)}
                      className="flex-1 bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002a5c] hover:to-[#005a9c] text-white py-3 rounded-full font-semibold transition-all"
                    >
                      Book Original Price
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onClose();
                        if (onBackToResults) onBackToResults();
                      }}
                      className="flex-1 border-2 border-[#003580] text-[#003580] hover:bg-blue-50 py-3 rounded-full font-semibold transition-all"
                    >
                      Back to Results
                    </Button>
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center shadow-md">
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConversationalBargainModal;
