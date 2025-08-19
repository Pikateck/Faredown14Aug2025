import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Plane,
  Clock,
  CheckCircle,
  X,
  TrendingDown,
  DollarSign,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  Target,
} from "lucide-react";

const MobileBargain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flight, searchData } = location.state || {};

  const [step, setStep] = useState<"input" | "negotiating" | "result">("input");
  const [bargainPrice, setBargainPrice] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<
    "accepted" | "counter" | "rejected" | null
  >(null);
  const [counterOffer, setCounterOffer] = useState<number | null>(null);
  const [timer, setTimer] = useState(30);
  const [messages, setMessages] = useState<
    Array<{ type: "ai" | "user"; message: string; time: string }>
  >([]);

  const minPrice = Math.round(flight?.price * 0.7);
  const maxSavings = flight?.price - minPrice;

  useEffect(() => {
    if (step === "negotiating") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            simulateResult();
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (step === "result" && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [step, timer]);

  const simulateResult = () => {
    const targetPrice = parseInt(bargainPrice);
    const acceptance = Math.random();

    if (acceptance > 0.7 || targetPrice >= flight.price * 0.85) {
      setResult("accepted");
      addMessage(
        "ai",
        `Great news! ${flight.airline} accepted your offer of ₹${targetPrice.toLocaleString()}!`,
      );
    } else if (acceptance > 0.3) {
      const counter = Math.round(
        targetPrice + (flight.price - targetPrice) * 0.4,
      );
      setCounterOffer(counter);
      setResult("counter");
      addMessage(
        "ai",
        `${flight.airline} countered with ₹${counter.toLocaleString()}. This is still ₹${(flight.price - counter).toLocaleString()} savings!`,
      );
    } else {
      setResult("rejected");
      addMessage(
        "ai",
        `Sorry, ${flight.airline} couldn't match ₹${targetPrice.toLocaleString()}. Try a higher amount for better chances.`,
      );
    }
    setStep("result");
  };

  const addMessage = (type: "ai" | "user", message: string) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [...prev, { type, message, time }]);
  };

  const startBargaining = () => {
    if (!bargainPrice || parseInt(bargainPrice) <= 0) return;

    setStep("negotiating");
    setProgress(0);
    addMessage(
      "user",
      `I'd like to pay ₹${parseInt(bargainPrice).toLocaleString()} for this flight.`,
    );
    addMessage(
      "ai",
      `Let me negotiate with ${flight.airline} for you. This might take a moment...`,
    );
  };

  const acceptCounter = () => {
    navigate("/mobile-booking", {
      state: {
        flight: { ...flight, price: counterOffer },
        searchData,
        bargainSuccess: true,
      },
    });
  };

  const rejectCounter = () => {
    setStep("input");
    setResult(null);
    setCounterOffer(null);
    setProgress(0);
    setBargainPrice("");
    setMessages([]);
  };

  const bookOriginal = () => {
    navigate("/mobile-booking", { state: { flight, searchData } });
  };

  if (!flight) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <p>Flight data not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showBack={true}
      onBack={() => navigate(-1)}
      title="AI Bargaining"
    >
      <div className="space-y-4">
        {/* Flight Summary Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 m-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">{flight.airline}</div>
                <div className="text-blue-100 text-sm">
                  {flight.flightNumber}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ₹{flight.price.toLocaleString()}
              </div>
              <div className="text-blue-100 text-sm">Current Price</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>
              {flight.departure} - {flight.arrival}
            </span>
            <span>
              {flight.duration} • {flight.stops}
            </span>
          </div>
        </div>

        {/* Bargaining Interface */}
        <div className="px-4">
          {step === "input" && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Let's Bargain!</h2>
                  <p className="text-gray-600 text-sm">
                    Enter your target price and let our AI negotiate with{" "}
                    {flight.airline}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Bargain Tips
                    </span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Minimum possible: ₹{minPrice.toLocaleString()}</li>
                    <li>• Max savings: ₹{maxSavings.toLocaleString()}</li>
                    <li>
                      • Sweet spot: ₹
                      {Math.round(flight.price * 0.8).toLocaleString()} - ₹
                      {Math.round(flight.price * 0.9).toLocaleString()}
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Target Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="number"
                      value={bargainPrice}
                      onChange={(e) => setBargainPrice(e.target.value)}
                      placeholder="Enter your target price"
                      className="pl-10 text-lg font-semibold py-6"
                      min={minPrice}
                      max={flight.price}
                    />
                  </div>
                  {bargainPrice && (
                    <div className="mt-2 text-sm">
                      {parseInt(bargainPrice) < minPrice ? (
                        <span className="text-red-600">
                          Too low - minimum is ₹{minPrice.toLocaleString()}
                        </span>
                      ) : parseInt(bargainPrice) >= flight.price ? (
                        <span className="text-yellow-600">
                          Why not just book at current price?
                        </span>
                      ) : (
                        <span className="text-green-600">
                          Potential savings: ₹
                          {(
                            flight.price - parseInt(bargainPrice)
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={startBargaining}
                  disabled={
                    !bargainPrice ||
                    parseInt(bargainPrice) < minPrice ||
                    parseInt(bargainPrice) >= flight.price
                  }
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-6 text-lg font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start AI Negotiation
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "negotiating" && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Bot className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">AI Negotiating...</h2>
                  <p className="text-gray-600 text-sm">
                    Our AI is discussing your offer with {flight.airline}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Chat Messages */}
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="text-sm">{msg.message}</div>
                        <div
                          className={`text-xs mt-1 ${msg.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                        >
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === "result" && (
            <Card>
              <CardContent className="p-6 space-y-6">
                {result === "accepted" && (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold text-green-800 mb-2">
                        Success! Offer Accepted
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {flight.airline} accepted your bargain price!
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-800">Your Price:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{parseInt(bargainPrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-700">You Saved:</span>
                        <span className="text-lg font-semibold text-green-600">
                          ₹
                          {(
                            flight.price - parseInt(bargainPrice)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Offer expires in {timer}s</span>
                    </div>

                    <Button
                      onClick={() =>
                        navigate("/mobile-booking", {
                          state: {
                            flight: {
                              ...flight,
                              price: parseInt(bargainPrice),
                            },
                            searchData,
                            bargainSuccess: true,
                          },
                        })
                      }
                      className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-semibold"
                    >
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Book This Deal
                    </Button>
                  </>
                )}

                {result === "counter" && (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingDown className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h2 className="text-xl font-bold text-yellow-800 mb-2">
                        Counter Offer!
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {flight.airline} made a counter offer
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-yellow-800">Counter Offer:</span>
                        <span className="text-2xl font-bold text-yellow-600">
                          ₹{counterOffer?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-700">You Still Save:</span>
                        <span className="text-lg font-semibold text-yellow-600">
                          ₹
                          {(
                            flight.price - (counterOffer || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Counter offer expires in {timer}s</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={acceptCounter}
                        className="bg-green-600 hover:bg-green-700 py-6"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={rejectCounter}
                        variant="outline"
                        className="py-6"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </>
                )}

                {result === "rejected" && (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                      </div>
                      <h2 className="text-xl font-bold text-red-800 mb-2">
                        Offer Declined
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {flight.airline} couldn't match your target price
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700 text-center">
                        Try a higher amount for better success chances, or book
                        at the current price.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => {
                          setStep("input");
                          setResult(null);
                          setBargainPrice("");
                          setMessages([]);
                        }}
                        variant="outline"
                        className="py-6"
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={bookOriginal}
                        className="bg-blue-600 hover:bg-blue-700 py-6"
                      >
                        Book Original
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileBargain;
