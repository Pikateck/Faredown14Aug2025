import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane, Building, MapPin, Car, Sparkles } from "lucide-react";
import { AINegotiationChat } from "./AINegotiationChat";
import {
  useAIBargain,
  createFlightBargainDetails,
  createHotelBargainDetails,
} from "@/hooks/useAIBargain";
import { formatPriceNoDecimals } from "@/lib/formatPrice";
import { useCurrency } from "@/contexts/CurrencyContext";

export function AIBargainDemo() {
  const { selectedCurrency } = useCurrency();
  const bargainHook = useAIBargain();

  // Set up success/failure callbacks
  React.useEffect(() => {
    bargainHook.setSuccessCallback((finalPrice, orderRef) => {
      console.log(
        `🎉 Bargain successful! Final price: ${finalPrice}, Order: ${orderRef}`,
      );
      // Navigate to booking confirmation or update state
    });

    bargainHook.setFailureCallback(() => {
      console.log("❌ Bargain failed - redirecting to search");
      // Redirect to search or show error
    });
  }, []);

  // Demo data
  const demoFlight = {
    airline: "IndiGo",
    flightNumber: "6E-123",
    origin: "BOM",
    destination: "DEL",
    totalPrice: 8500,
    departure: { iataCode: "BOM" },
    arrival: { iataCode: "DEL" },
  };

  const demoHotel = {
    id: "hotel-123",
    name: "The Taj Hotel",
    location: "Mumbai",
    totalPrice: 12000,
  };

  const startFlightBargain = () => {
    const productDetails = createFlightBargainDetails(
      demoFlight,
      "flight-demo-123",
    );

    bargainHook.startBargain({
      module: "flights",
      title: "AI Price Negotiator",
      productDetails,
      userOffer: 7500, // User wants to pay 7500 instead of 8500
    });
  };

  const startHotelBargain = () => {
    const productDetails = createHotelBargainDetails(demoHotel);

    bargainHook.startBargain({
      module: "hotels",
      title: "AI Hotel Negotiator",
      productDetails,
      userOffer: 10000, // User wants to pay 10000 instead of 12000
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-500" />
          AI Emotional-Intelligence Bargain Demo
        </h1>
        <p className="text-gray-600">
          Experience live chat negotiation with our AI that understands emotions
          and adapts its strategy
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Flight Bargain Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-500" />
              Flight Bargain
            </CardTitle>
            <CardDescription>
              Negotiate flight prices with AI emotional intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-semibold text-blue-900">
                {demoFlight.airline} {demoFlight.flightNumber}
              </div>
              <div className="text-blue-700">
                {demoFlight.origin} → {demoFlight.destination}
              </div>
              <div className="text-lg font-bold text-blue-900 mt-2">
                Listed:{" "}
                {formatPriceNoDecimals(demoFlight.totalPrice, selectedCurrency)}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Your offer: {formatPriceNoDecimals(7500, selectedCurrency)}
              </div>
            </div>

            <Button onClick={startFlightBargain} className="w-full">
              Start AI Flight Negotiation
            </Button>
          </CardContent>
        </Card>

        {/* Hotel Bargain Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-green-500" />
              Hotel Bargain
            </CardTitle>
            <CardDescription>
              Negotiate hotel rates with personalized AI responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-semibold text-green-900">
                {demoHotel.name}
              </div>
              <div className="text-green-700">{demoHotel.location}</div>
              <div className="text-lg font-bold text-green-900 mt-2">
                Listed:{" "}
                {formatPriceNoDecimals(demoHotel.totalPrice, selectedCurrency)}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Your offer: {formatPriceNoDecimals(10000, selectedCurrency)}
              </div>
            </div>

            <Button
              onClick={startHotelBargain}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Start AI Hotel Negotiation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
          <CardDescription>
            What makes our AI bargaining system unique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Emotional Intelligence</h3>
              <p className="text-sm text-gray-600">
                AI adapts its negotiation style based on your offer pattern and
                emotional cues
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Never-Loss Pricing</h3>
              <p className="text-sm text-gray-600">
                Advanced algorithms ensure profitability while maximizing
                customer satisfaction
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat Experience</h3>
              <p className="text-sm text-gray-600">
                Real-time negotiation with timed beats and authentic supplier
                interactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Negotiation Chat Component */}
      {bargainHook.session && (
        <AINegotiationChat
          isOpen={bargainHook.session.isOpen}
          onClose={bargainHook.closeBargain}
          title={bargainHook.session.title}
          module={bargainHook.session.module}
          productDetails={bargainHook.session.productDetails}
          userOffer={bargainHook.session.userOffer}
          onBargainSuccess={bargainHook.onBargainSuccess}
          onBargainFailed={bargainHook.onBargainFailed}
        />
      )}
    </div>
  );
}
