import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Luggage,
  Utensils,
  Shield,
  Star,
  CheckCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Ancillaries = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<{ [key: string]: string }>(
    {},
  );
  const [selectedBaggage, setSelectedBaggage] = useState<{
    [key: string]: string;
  }>({});
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [baggageProtection, setBaggageProtection] = useState("");
  const [showMealModal, setShowMealModal] = useState(false);
  const [currentSegment, setCurrentSegment] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<{
    [key: string]: { seat: string; price: number };
  }>({});
  const [totalSeatPrice, setTotalSeatPrice] = useState(0);

  // Get flight details from URL parameters
  const flightId = searchParams.get("flight");
  const finalPrice = searchParams.get("price");
  const faredownBonus = searchParams.get("bonus");
  const fareType = searchParams.get("fare");

  const addExtra = (extra: string) => {
    if (!selectedExtras.includes(extra)) {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const removeExtra = (extra: string) => {
    setSelectedExtras(selectedExtras.filter((item) => item !== extra));
  };

  const openMealModal = (segment: string) => {
    setCurrentSegment(segment);
    setShowMealModal(true);
  };

  const selectMeal = (meal: string, price: number) => {
    setSelectedMeals({ ...selectedMeals, [currentSegment]: meal });
    addExtra(`meal-${currentSegment}-${meal}-${price}`);
    setShowMealModal(false);
  };

  const selectSeat = (segment: string, seat: string, price: number) => {
    setSelectedSeats({
      ...selectedSeats,
      [segment]: { seat, price },
    });
    setTotalSeatPrice((prev) => prev + price);
    addExtra(`seat-${segment}-${seat}-${price}`);
  };

  const mealOptions = [
    { name: "Fresh Cake Slice + Beverage of choice", price: 200 },
    { name: "Vegan Special + Beverage", price: 240 },
    {
      name: "All Less Choice Of The Day (Veg) + Beverage of choice",
      price: 340,
    },
    { name: "Veg Biryani + Beverage of choice", price: 400 },
    { name: "Paneer Tikka Sandwich + Beverage of choice", price: 350 },
  ];

  // Meal Selection Modal Component
  const MealModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">SELECT MEAL</h3>
          <button onClick={() => setShowMealModal(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {mealOptions.map((meal, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => selectMeal(meal.name, meal.price)}
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{meal.name}</div>
              </div>
              <div className="text-sm font-semibold">₹ {meal.price}</div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => setShowMealModal(false)}
          >
            Add Meal
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/flights")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                Enhance Your Journey
              </h1>
              <p className="text-sm text-gray-600">
                Add services to make your trip more comfortable
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Seat Selection with Seat Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Choose Your Seats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Flight Segments */}
                <div className="space-y-6">
                  {/* Mumbai → Dubai Segment */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Mumbai → Dubai
                    </h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          No seat selected
                        </span>
                        <button className="text-blue-600 text-sm hover:underline">
                          Select a seat from INR 175.00
                        </button>
                      </div>

                      {/* Seat Map */}
                      <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="text-center mb-4">
                          <div className="text-sm font-medium text-gray-600">
                            Boeing 777 - Choose Seat
                          </div>
                        </div>

                        {/* Seat Grid */}
                        <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
                          {/* Row Headers */}
                          <div className="text-center text-xs font-medium p-2">
                            A
                          </div>
                          <div className="text-center text-xs font-medium p-2">
                            B
                          </div>
                          <div className="text-center text-xs font-medium p-2">
                            C
                          </div>
                          <div className="text-center text-xs font-medium p-2"></div>
                          <div className="text-center text-xs font-medium p-2">
                            D
                          </div>
                          <div className="text-center text-xs font-medium p-2">
                            E
                          </div>
                          <div className="text-center text-xs font-medium p-2">
                            F
                          </div>
                          <div className="text-center text-xs font-medium p-2"></div>
                          <div className="text-center text-xs font-medium p-2">
                            G
                          </div>

                          {/* Seat Rows */}
                          {Array.from({ length: 40 }, (_, rowIndex) => {
                            const rowNumber = rowIndex + 1;
                            return Array.from({ length: 9 }, (_, seatIndex) => {
                              if (seatIndex === 3 || seatIndex === 7) {
                                return (
                                  <div
                                    key={`${rowNumber}-spacer-${seatIndex}`}
                                    className="p-1"
                                  >
                                    {seatIndex === 3 && (
                                      <div className="text-xs text-center text-gray-500">
                                        {rowNumber}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              const seatLetter = [
                                "A",
                                "B",
                                "C",
                                "D",
                                "E",
                                "F",
                                "G",
                              ][seatIndex > 3 ? seatIndex - 1 : seatIndex];
                              const isOccupied = Math.random() < 0.3;
                              const isPremium =
                                rowNumber <= 5 || Math.random() < 0.1;
                              const seatPrice = isPremium ? 500 : 175;

                              return (
                                <button
                                  key={`${rowNumber}${seatLetter}`}
                                  className={`w-8 h-8 text-xs border rounded ${
                                    isOccupied
                                      ? "bg-gray-400 text-white cursor-not-allowed"
                                      : selectedSeats[`mumbai-dubai`]?.seat ===
                                          `${rowNumber}${seatLetter}`
                                        ? "bg-blue-600 text-white border-blue-700"
                                        : "bg-white border-gray-300 hover:border-blue-500 text-gray-700"
                                  }`}
                                  disabled={isOccupied}
                                  onClick={() =>
                                    selectSeat(
                                      "mumbai-dubai",
                                      `${rowNumber}${seatLetter}`,
                                      seatPrice,
                                    )
                                  }
                                  title={`Seat ${rowNumber}${seatLetter} - ₹${seatPrice}`}
                                >
                                  ₹{seatPrice}
                                </button>
                              );
                            });
                          }).flat()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dubai → Mumbai Segment */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Dubai → Mumbai
                    </h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          No seat selected
                        </span>
                        <button className="text-blue-600 text-sm hover:underline">
                          Select a seat from INR 175.00
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Utensils className="w-5 h-5" />
                  <span>Select Meal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F8055dbdf9ac24c4e80c3769e5b7373b2?format=webp&width=800"
                    alt="Meal selection"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">From</span>
                        <span className="text-lg font-bold">₹ 0</span>
                      </div>
                      <div className="text-xs text-gray-500">Per Passenger</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Utensils className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">
                        Please Select Meals From List
                      </span>
                    </div>

                    <Button
                      onClick={() => openMealModal("mumbai-dubai")}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Add Meal
                    </Button>

                    {/* Selected Meals Display */}
                    {selectedMeals["mumbai-dubai"] && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          Mumbai → Dubai: {selectedMeals["mumbai-dubai"]}
                        </div>
                      </div>
                    )}
                    {selectedMeals["dubai-mumbai"] && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          Dubai → Mumbai: {selectedMeals["dubai-mumbai"]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Baggage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Luggage className="w-5 h-5" />
                  <span>Extra Baggage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { weight: "5kg", price: 1200 },
                    { weight: "10kg", price: 2400 },
                    { weight: "15kg", price: 3600 },
                    { weight: "20kg", price: 4800 },
                  ].map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto flex flex-col hover:border-blue-300"
                      onClick={() => addExtra(`baggage-${index}`)}
                    >
                      <div className="font-semibold">{option.weight}</div>
                      <div className="text-sm">₹{option.price}</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Blue Ribbon Bags Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Lost Baggage Protection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fcbb43b9396684714a690f4dbfa0ec701?format=webp&width=800"
                    alt="Blue Ribbon Bags"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    Get compensation in case your baggage is lost or delayed.
                  </p>
                </div>

                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      baggageProtection === "bronze"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setBaggageProtection("bronze");
                      addExtra("baggage-protection-bronze-500");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="baggageProtection"
                          checked={baggageProtection === "bronze"}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium">
                            Bronze Service (1000€ Bag Coverage)
                          </div>
                          <div className="text-sm text-gray-600">
                            Coverage up to ₹10,000
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">+₹500</div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      baggageProtection === "gold"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setBaggageProtection("gold");
                      addExtra("baggage-protection-gold-800");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="baggageProtection"
                          checked={baggageProtection === "gold"}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium">
                            GOLD SERVICE (3000€ Bag Coverage)
                          </div>
                          <div className="text-sm text-gray-600">
                            Coverage up to ₹25,000
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">+₹800</div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      baggageProtection === "none"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setBaggageProtection("none");
                      removeExtra("baggage-protection-bronze-500");
                      removeExtra("baggage-protection-gold-800");
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="baggageProtection"
                        checked={baggageProtection === "none"}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">
                          No, I will not buy baggage
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 text-xs text-gray-600">
                  <p>
                    By adding lost baggage protection you agree to{" "}
                    <a href="#" className="text-blue-600 underline">
                      Blue Ribbon Bags Terms & Conditions
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Travel Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>
                    Receive 100% refund if you cancel for any of the reasons
                    below
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Ff32213488a3a41d0b76d33f36c4a3932?format=webp&width=800"
                    alt="Travel Insurance"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Flight disruption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">
                        Injury / Illness (Including Covid)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">
                        Pre-existing Medical Condition
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Death of Immediate Family</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Public Transport Failure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Mechanical Breakdown</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Adverse Weather</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Home Emergency</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Theft of Documents</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Jury Service</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Court Summons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">Relocated for Work</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">
                        Changes to Examination Dates
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">
                        Armed Forces & Emergency Groups Result
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    Refund Protect has a 14 day period on TripSafe based on over
                    24,000 independent customer reviews
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-green-500 text-green-500"
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      Trustpilot
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedInsurance === "protected"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setSelectedInsurance("protected");
                      addExtra("travel-insurance-protected-297");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="insurance"
                          checked={selectedInsurance === "protected"}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium">
                            Yes, protect my booking
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">₹297.00</div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedInsurance === "not-protected"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setSelectedInsurance("not-protected");
                      removeExtra("travel-insurance-protected-297");
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="insurance"
                        checked={selectedInsurance === "not-protected"}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">
                          No, I don't want protection
                        </div>
                        <div className="text-sm text-red-600">
                          You are not covered
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travel Extras */}
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-600">Travel Extras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Select all to get
                    </span>
                  </label>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "Travel kit",
                      desc: "Security and privacy while traveling abroad",
                      price: "₹ 14",
                    },
                    {
                      name: "Lost Luggage Protection",
                      desc: "Track and replace the return of your lost luggage",
                      price: "₹ 5",
                    },
                    {
                      name: "Digital Magazines",
                      desc: "Newspaper with over 150 digital magazines",
                      price: "₹ 7",
                    },
                    {
                      name: "Flight Alerts",
                      desc: "Get essential notifications about any flight changes by email and SMS",
                      price: "₹ 3",
                    },
                    {
                      name: "Weather Updates",
                      desc: "Real time weather updates from your destination",
                      price: "₹ 3",
                    },
                    {
                      name: "Plant a Tree for Carbon Offset",
                      desc: "Help reduce carbon emissions impact by planting a tree for your trip",
                      price: "₹ 4",
                    },
                  ].map((extra, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {extra.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {extra.desc}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm">{extra.price}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Total Price:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹ 0
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">(0 Passenger)</div>
                </div>
              </CardContent>
            </Card>

            {/* Continue to Payment */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="text-lg font-semibold">
                    Selected Services: {selectedExtras.length}
                  </div>
                  {totalSeatPrice > 0 && (
                    <div className="text-sm text-green-600">
                      Total Seat Selection: ₹{totalSeatPrice}
                    </div>
                  )}
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold"
                    onClick={() =>
                      navigate(
                        `/booking?flight=${flightId}&price=${finalPrice}&bonus=${faredownBonus}&fare=${fareType}&ancillaries=${selectedExtras.join(",")}`,
                      )
                    }
                  >
                    Continue to Booking
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-3 rounded-lg"
                    onClick={() =>
                      navigate(
                        `/booking?flight=${flightId}&price=${finalPrice}&bonus=${faredownBonus}&fare=${fareType}`,
                      )
                    }
                  >
                    Skip Additional Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Flight Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-800">Flight Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">01 Aug 2025, 09:15</p>
                    <p className="text-xs text-gray-600">Mumbai → Dubai</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">08 Aug 2025, 15:45</p>
                    <p className="text-xs text-gray-600">Dubai → Mumbai</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Flight Price
                  </h4>
                  <div className="text-2xl font-bold text-slate-900">
                    ₹{finalPrice || "26,545"}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Includes all taxes & service charges
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trustpilot Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">
                  Trusted by Travelers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-5 h-5 fill-green-500 text-green-500"
                      />
                    ))}
                  </div>
                  <div className="text-lg font-semibold">4.8 out of 5</div>
                  <div className="text-sm text-gray-600">
                    Based on 24,000+ reviews
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-800">Trustpilot</div>
                    <div className="text-xs text-green-600">
                      "Excellent service and great prices"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Render Meal Modal */}
      {showMealModal && <MealModal />}
    </div>
  );
};

export default Ancillaries;
