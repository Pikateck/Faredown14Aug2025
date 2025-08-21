import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Plane, Building, MapPin, Car } from "lucide-react";
import copyPacks from "../../api/data/copy_packs.json";

// Import the BargainButton
import { BargainButton } from "./ui/BargainButton";

interface ChatMessage {
  id: string;
  speaker: "supplier" | "agent";
  message: string;
  timestamp: number;
  isTyping?: boolean;
}

interface BargainOffer {
  price_now: number;
  was?: number;
  expiry_ts?: number;
  hold_seconds?: number;
  perks?: string[];
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<"init" | "supplier_check" | "agent_offer" | "supplier_counter" | "agent_confirm" | "complete">("init");
  const [round, setRound] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [offerPrice, setOfferPrice] = useState(0);
  const [counterPrice, setCounterPrice] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Get module-specific copy
  const moduleCopy = copyPacks.modules[module] || copyPacks.modules.flights;
  const supplierIcons = {
    flights: Plane,
    hotels: Building,
    sightseeing: MapPin,
    transfers: Car,
  };
  const SupplierIcon = supplierIcons[module];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && flight) {
      setMessages([]);
      setCurrentPhase("init");
      setRound(1);
      setIsTyping(false);
      setTimerSeconds(30);
      setTimerActive(false);
      setShowButtons(false);
      setIsHolding(false);
      setIsExpired(false);
      
      // Calculate offer price (5-15% off)
      const basePrice = selectedFareType?.price || flight.price;
      const discount = 0.05 + Math.random() * 0.10; // 5-15%
      setOfferPrice(Math.round(basePrice * (1 - discount)));
      
      // Start the conversation
      setTimeout(startConversation, 500);
    }
  }, [isOpen, flight, selectedFareType]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsExpired(true);
            setShowButtons(false);
            setTimeout(() => {
              addMessage("agent", copyPacks.fallbacks.expired.agent[0].text);
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const addMessage = useCallback((speaker: "supplier" | "agent", text: string, isTyping = false) => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, {
      id: messageId,
      speaker,
      message: text,
      timestamp: Date.now(),
      isTyping,
    }]);
  }, []);

  const startConversation = useCallback(() => {
    setCurrentPhase("supplier_check");
    setIsTyping(true);
    
    setTimeout(() => {
      const basePrice = selectedFareType?.price || flight?.price || 0;
      const supplierCheckText = selectWeightedRandom(moduleCopy.supplier_check.any);
      const filledText = replaceTemplates(supplierCheckText, { base: basePrice });
      
      addMessage("supplier", filledText);
      setIsTyping(false);
      
      // Move to agent offer after delay
      setTimeout(moveToAgentOffer, 1500);
    }, 1000);
  }, [flight, selectedFareType, moduleCopy, addMessage]);

  const moveToAgentOffer = useCallback(() => {
    setCurrentPhase("agent_offer");
    setIsTyping(true);
    
    setTimeout(() => {
      const agentOfferText = selectWeightedRandom(moduleCopy.agent_offer[round] || moduleCopy.agent_offer["1"]);
      const variables = {
        offer: offerPrice,
        airline: flight?.airline || "Airline",
        flight_no: flight?.flightNumber || "FL123",
        hotel_name: "Hotel Name",
        tour_name: "Tour Name",
        pickup: "Airport",
        dropoff: "City Center",
      };
      const filledText = replaceTemplates(agentOfferText, variables);
      
      addMessage("agent", filledText);
      setIsTyping(false);
      
      // Move to supplier counter after delay
      setTimeout(moveToSupplierCounter, 2000);
    }, 1000);
  }, [round, offerPrice, flight, moduleCopy, addMessage]);

  const moveToSupplierCounter = useCallback(() => {
    setCurrentPhase("supplier_counter");
    setIsTyping(true);
    
    setTimeout(() => {
      // Decide if supplier accepts or counters
      const acceptChance = round === 1 ? 0.7 : round === 2 ? 0.8 : 0.9;
      const isAccepted = Math.random() < acceptChance;
      
      let counterText: string;
      let finalPrice = offerPrice;
      
      if (isAccepted) {
        counterText = selectWeightedRandom(moduleCopy.supplier_counter.accepted);
      } else {
        counterText = selectWeightedRandom(moduleCopy.supplier_counter.counter);
        // Counter with slightly higher price
        finalPrice = offerPrice + Math.round(offerPrice * 0.02); // 2% higher
      }
      
      setCounterPrice(finalPrice);
      const filledText = replaceTemplates(counterText, { counter: finalPrice });
      
      addMessage("supplier", filledText);
      setIsTyping(false);
      
      // Move to agent confirmation
      setTimeout(moveToAgentConfirm, 1500);
    }, 1000);
  }, [round, offerPrice, moduleCopy, addMessage]);

  const moveToAgentConfirm = useCallback(() => {
    setCurrentPhase("agent_confirm");
    setIsTyping(true);
    
    setTimeout(() => {
      const confirmOptions = moduleCopy.agent_user_confirm[round] || 
                           moduleCopy.agent_user_confirm["1"] || 
                           moduleCopy.agent_user_confirm.any;
      const confirmText = selectWeightedRandom(confirmOptions);
      const variables = {
        counter: counterPrice,
        user_name: userName,
        user_title: userName,
      };
      const filledText = replaceTemplates(confirmText, variables);
      
      addMessage("agent", filledText);
      setIsTyping(false);
      
      // Start timer and show buttons
      setTimeout(() => {
        setTimerActive(true);
        setShowButtons(true);
      }, 500);
    }, 1000);
  }, [round, counterPrice, userName, moduleCopy, addMessage]);

  const handleHold = useCallback(() => {
    if (isHolding || isExpired) return;
    
    setIsHolding(true);
    setTimerActive(false);
    setShowButtons(false);
    
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
    setShowButtons(false);
    setRound(prev => prev + 1);
    
    // Calculate new offer price (slightly lower)
    const newOffer = Math.round(offerPrice * 0.97); // 3% lower
    setOfferPrice(newOffer);
    
    // Start new round
    setTimeout(moveToAgentOffer, 500);
  }, [isHolding, round, offerPrice, moveToAgentOffer]);

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

        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.speaker === "agent" ? "justify-start" : "justify-start"}`}
            >
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
                    ? module === "flights" ? "Airline" : module === "hotels" ? "Hotel" : module === "sightseeing" ? "Tour Operator" : "Transfer Provider"
                    : copyPacks.brand.negotiatorTitle
                  }
                </div>
                {message.message}
                
                {/* Timer and buttons for agent confirmation */}
                {message.speaker === "agent" && currentPhase === "agent_confirm" && showButtons && !isHolding && !isExpired && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-mono ${timerSeconds <= 10 ? 'text-red-600 font-bold animate-pulse' : 'text-green-700'}`}>
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
          ))}
          
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
      </DialogContent>
    </Dialog>
  );
};

export default ConversationalBargainModal;
