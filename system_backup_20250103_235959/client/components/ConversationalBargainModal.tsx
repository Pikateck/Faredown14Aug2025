import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plane, Building, MapPin, Car } from "lucide-react";
import copyPacks from "../../api/data/copy_packs.json";
import { BargainButton } from "./ui/BargainButton";

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
}) => {
  // Modal phases: input -> negotiating -> offer -> holding -> expired -> max_rounds_reached
  const [phase, setPhase] = useState<
    | "input"
    | "negotiating"
    | "offer"
    | "holding"
    | "expired"
    | "max_rounds_reached"
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
  const supplierIcons = {
    flights: Plane,
    hotels: Building,
    sightseeing: MapPin,
    transfers: Car,
  };
  const SupplierIcon = supplierIcons[module];

  const moduleIcons = {
    flights: "✈️",
    hotels: "🏨",
    sightseeing: "📍",
    transfers: "🚖",
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
    if (isHolding || round >= MAX_ROUNDS) return;

    // Check if we've reached max rounds
    if (round >= MAX_ROUNDS) {
      setPhase("max_rounds_reached");
      setTimerActive(false);
      setShowConfirmButtons(false);

      addMessage(
        "agent",
        "Your bargain window has expired. Please search again for fresh deals.",
      );
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
  }, [isHolding, round, MAX_ROUNDS, addMessage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!flight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border-0 p-0 gap-0 max-h-[90vh] overflow-hidden">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-t-3xl border-b border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full hover:bg-white/60 transition-all duration-200 backdrop-blur-sm"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <span className="text-2xl">{moduleIcons[module]}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                AI Price Negotiation
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                {module === "flights" &&
                  `${flight.airline} ${flight.flightNumber}`}
                {module === "hotels" && "Hotel Booking"}
                {module === "sightseeing" && "Tour Booking"}
                {module === "transfers" && "Transfer Booking"}
              </p>
              {round > 1 && (
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  Round {round} of {MAX_ROUNDS}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Input Phase - Premium Design */}
        {phase === "input" && (
          <div className="p-8 space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 flex items-center justify-center shadow-xl">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {round === 1
                  ? "What's your target price?"
                  : "Enter your new desired price"}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {round === 1
                  ? `Our AI will negotiate with the ${supplierNames[module]} on your behalf`
                  : "Let's try a different price for round " + round}
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Enter your desired price
                </label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={userPrice}
                    onChange={(e) => setUserPrice(e.target.value)}
                    placeholder="25,000"
                    className="pl-12 text-2xl h-16 bg-gray-50 border-3 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all duration-300 group-hover:border-gray-300"
                    min="1"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 text-center border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">
                  <span className="font-bold">Current price:</span> ₹
                  {(selectedFareType?.price || flight.price).toLocaleString()}
                </p>
              </div>

              <BargainButton
                onClick={startNegotiation}
                disabled={!userPrice || parseInt(userPrice) <= 0}
                className="w-full h-16 text-xl font-bold mt-8 shadow-xl"
                size="lg"
              >
                🤖{" "}
                {round === 1
                  ? "Start AI Negotiation"
                  : `Continue Round ${round}`}
              </BargainButton>
            </div>
          </div>
        )}

        {/* Chat Phase - Premium Messages */}
        {(phase === "negotiating" ||
          phase === "offer" ||
          phase === "holding") && (
          <div className="flex flex-col max-h-[65vh]">
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth">
              {messages.map((message, index) => {
                const isLastAgentMessage =
                  message.speaker === "agent" &&
                  index === messages.length - 1 &&
                  phase === "offer" &&
                  currentStep === "agent_confirm";

                return (
                  <div key={message.id} className="flex gap-4 items-start">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        message.speaker === "supplier"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-br from-green-500 to-green-600 text-white"
                      }`}
                    >
                      {message.speaker === "supplier" ? (
                        <span className="text-lg">{moduleIcons[module]}</span>
                      ) : (
                        <span className="text-sm font-bold">AI</span>
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-sm rounded-3xl px-6 py-5 shadow-lg border ${
                        message.speaker === "supplier"
                          ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border-blue-200"
                          : "bg-gradient-to-br from-green-50 to-green-100 text-green-900 border-green-200"
                      }`}
                    >
                      <div className="text-xs font-bold opacity-70 mb-3 uppercase tracking-wider">
                        {message.speaker === "supplier"
                          ? supplierNames[module]
                          : copyPacks.brand.negotiatorTitle}
                      </div>
                      <div className="text-sm leading-relaxed font-medium">
                        {message.message}
                      </div>

                      {/* Timer and buttons inside the last Agent message */}
                      {isLastAgentMessage &&
                        showConfirmButtons &&
                        !isHolding &&
                        !isExpired && (
                          <div className="mt-6 pt-5 border-t border-green-300">
                            <div className="flex items-center justify-between mb-5">
                              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                Valid for:
                              </span>
                              <div
                                className={`px-4 py-2 rounded-2xl font-mono text-lg font-bold shadow-lg transition-all duration-300 ${
                                  timerSeconds <= 10
                                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-300 scale-110"
                                    : "bg-white text-green-700 border-2 border-green-300"
                                }`}
                              >
                                {formatTime(timerSeconds)}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                onClick={handleHold}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 text-sm"
                              >
                                🔒 Place 30s Hold
                              </Button>
                              {round < MAX_ROUNDS && (
                                <Button
                                  variant="outline"
                                  onClick={handleBargainAgain}
                                  className="flex-1 border-3 border-green-600 text-green-700 hover:bg-green-50 font-bold py-4 rounded-2xl transition-all hover:scale-105 text-sm"
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

              {/* Max rounds reached message */}
              {phase === "max_rounds_reached" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Bargain Window Expired
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You've reached the maximum of {MAX_ROUNDS} bargain attempts.
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Search Again for Fresh Deals
                  </Button>
                </div>
              )}

              {isTyping && (
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl px-6 py-5 border border-gray-300 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
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
