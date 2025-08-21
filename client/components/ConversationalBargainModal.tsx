import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  // Modal phases: input -> negotiating -> offer -> holding -> expired
  const [phase, setPhase] = useState<"input" | "negotiating" | "offer" | "holding" | "expired">("input");
  const [userPrice, setUserPrice] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<"supplier_check" | "agent_offer" | "supplier_counter" | "agent_confirm">("supplier_check");
  const [round, setRound] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Get module-specific copy and icons
  const moduleCopy = copyPacks.modules[module] || copyPacks.modules.flights;
  const supplierIcons = {
    flights: Plane,
    hotels: Building,
    sightseeing: MapPin,
    transfers: Car,
  };
  const SupplierIcon = supplierIcons[module];

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
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsExpired(true);
            setShowConfirmButtons(false);
            // Add expired message
            setTimeout(() => {
              const expiredText = selectWeightedRandom(copyPacks.fallbacks.expired.agent);
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

  const addMessage = useCallback((speaker: "supplier" | "agent", text: string) => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, {
      id: messageId,
      speaker,
      message: text,
      timestamp: Date.now(),
    }]);
  }, []);

  const startNegotiation = () => {
    if (!userPrice || !flight) return;
    
    setPhase("negotiating");
    setIsTyping(true);
    
    // Step 1: Supplier Check
    setTimeout(() => {
      const basePrice = selectedFareType?.price || flight.price;
      const supplierCheckText = selectWeightedRandom(moduleCopy.supplier_check.any);
      const filledText = replaceTemplates(supplierCheckText, { base: basePrice });
      
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
      const agentOfferText = selectWeightedRandom(moduleCopy.agent_offer[round] || moduleCopy.agent_offer["1"]);
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
        counterText = selectWeightedRandom(moduleCopy.supplier_counter.accepted);
      } else {
        counterText = selectWeightedRandom(moduleCopy.supplier_counter.counter);
        // Counter with price between user price and base (closer to user price in later rounds)
        const counterFactor = round === 1 ? 0.1 : round === 2 ? 0.05 : 0.02;
        negPrice = Math.round(userPriceNum + (basePrice - userPriceNum) * counterFactor);
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
      const confirmOptions = moduleCopy.agent_user_confirm[round] || 
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
    setMessages(prev => {
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
    if (isHolding || round >= 3) return;
    
    setTimerActive(false);
    setShowConfirmButtons(false);
    setRound(prev => prev + 1);
    setPhase("negotiating");
    
    // Start new round
    setTimeout(() => moveToAgentOffer(), 500);
  }, [isHolding, round, moveToAgentOffer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!flight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-xl border-0 p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              AI Price Negotiation
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {module === "flights" && `${flight.airline} ${flight.flightNumber}`}
            {module === "hotels" && "Hotel Booking"}
            {module === "sightseeing" && "Tour Booking"}
            {module === "transfers" && "Transfer Booking"}
          </div>
        </DialogHeader>

        {/* Input Phase */}
        {phase === "input" && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's your target price?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Our AI will negotiate with the {supplierNames[module]} on your behalf
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your desired price (₹)
                </label>
                <Input
                  type="number"
                  value={userPrice}
                  onChange={(e) => setUserPrice(e.target.value)}
                  placeholder="e.g. 25000"
                  className="text-lg text-center"
                  min="1"
                />
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Current price: ₹{(selectedFareType?.price || flight.price).toLocaleString()}
              </div>
              
              <BargainButton
                onClick={startNegotiation}
                disabled={!userPrice || parseInt(userPrice) <= 0}
                className="w-full mt-4"
              >
                🤖 Start AI Negotiation
              </BargainButton>
            </div>
          </div>
        )}

        {/* Chat Phase */}
        {(phase === "negotiating" || phase === "offer" || phase === "holding") && (
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => {
              const isLastAgentMessage = message.speaker === "agent" && 
                                       index === messages.length - 1 && 
                                       phase === "offer" && 
                                       currentStep === "agent_confirm";
              
              return (
                <div key={message.id} className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.speaker === "supplier" 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-green-100 text-green-600"
                  }`}>
                    {message.speaker === "supplier" ? (
                      <SupplierIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">AI</span>
                    )}
                  </div>
                  <div className={`flex-1 max-w-xs rounded-2xl px-4 py-2 text-sm ${
                    message.speaker === "supplier"
                      ? "bg-blue-50 text-blue-900"
                      : "bg-green-50 text-green-900"
                  }`}>
                    <div className="text-xs opacity-70 mb-1">
                      {message.speaker === "supplier" 
                        ? supplierNames[module]
                        : copyPacks.brand.negotiatorTitle
                      }
                    </div>
                    {message.message}
                    
                    {/* Timer and buttons inside the last Agent message */}
                    {isLastAgentMessage && showConfirmButtons && !isHolding && !isExpired && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-green-700 font-medium">Valid for:</span>
                          <span className={`text-sm font-mono px-2 py-1 rounded-md ${
                            timerSeconds <= 10 
                              ? 'bg-red-100 text-red-700 font-bold animate-pulse' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {formatTime(timerSeconds)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <BargainButton
                            size="sm"
                            onClick={handleHold}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            🔒 Place 30s Hold
                          </BargainButton>
                          {round < 3 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleBargainAgain}
                              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
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
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                </div>
                <div className="bg-gray-50 rounded-2xl px-4 py-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConversationalBargainModal;
