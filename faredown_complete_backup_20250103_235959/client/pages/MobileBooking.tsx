import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Minus,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

const MobileBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedFlight = location.state?.selectedFlight;
  const searchData = location.state?.searchData;

  const [currentStep, setCurrentStep] = useState(1);
  const [expandedSection, setExpandedSection] = useState("travellers");
  const [travellers, setTravellers] = useState([
    {
      id: 1,
      type: "Adult",
      title: "",
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      email: "",
      phone: "",
    },
  ]);

  const [addOns, setAddOns] = useState({
    meals: { selected: false, price: 1500 },
    baggage: { selected: false, price: 2000 },
    insurance: { selected: false, price: 899 },
    priorityBoarding: { selected: false, price: 500 },
  });

  const [seatSelection, setSeatSelection] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");

  const steps = [
    { id: 1, name: "Travellers", icon: User },
    { id: 2, name: "Add-ons", icon: Plus },
    { id: 3, name: "Seats", icon: Calendar },
    { id: 4, name: "Payment", icon: CreditCard },
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleAddOn = (addOnKey) => {
    setAddOns((prev) => ({
      ...prev,
      [addOnKey]: {
        ...prev[addOnKey],
        selected: !prev[addOnKey].selected,
      },
    }));
  };

  const calculateTotal = () => {
    const flightPrice = selectedFlight?.price || 0;
    const addOnTotal = Object.values(addOns).reduce((total, addOn) => {
      return total + (addOn.selected ? addOn.price : 0);
    }, 0);
    return flightPrice + addOnTotal;
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      // Auto-expand next section
      const sections = ["travellers", "addons", "seats", "payment"];
      setExpandedSection(sections[currentStep]);
    } else {
      // Navigate to confirmation
      navigate("/mobile-confirmation", {
        state: {
          selectedFlight,
          travellers,
          addOns,
          total: calculateTotal(),
        },
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-px mx-2 ${
                currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1 text-center">
          <div className="font-semibold text-gray-800">Complete Booking</div>
          <div className="text-xs text-gray-500">
            {selectedFlight?.airline} • {selectedFlight?.from} →{" "}
            {selectedFlight?.to}
          </div>
        </div>

        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Flight Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{selectedFlight?.logo}</div>
              <div>
                <div className="font-semibold text-gray-800">
                  {selectedFlight?.airline}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedFlight?.duration} • {selectedFlight?.stops}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(selectedFlight?.price || 0)}
              </div>
              <div className="text-xs text-gray-500">per person</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{selectedFlight?.departure}</div>
              <div className="text-gray-500">{selectedFlight?.from}</div>
            </div>
            <div className="text-center text-gray-400">→</div>
            <div className="text-right">
              <div className="font-medium">{selectedFlight?.arrival}</div>
              <div className="text-gray-500">{selectedFlight?.to}</div>
            </div>
          </div>
        </div>

        {/* Traveller Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <button
            onClick={() => toggleSection("travellers")}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
              </div>
              <span className="font-medium">Traveller Details</span>
            </div>
            {expandedSection === "travellers" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSection === "travellers" && (
            <div className="p-4 space-y-4">
              {travellers.map((traveller, index) => (
                <div key={traveller.id} className="space-y-3">
                  <h4 className="font-medium text-gray-800">
                    {traveller.type} {index + 1}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={traveller.title}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[index].title = e.target.value;
                        setTravellers(updated);
                      }}
                    >
                      <option value="">Title</option>
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                    </select>

                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={traveller.gender}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[index].gender = e.target.value;
                        setTravellers(updated);
                      }}
                    >
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={traveller.firstName}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[index].firstName = e.target.value;
                        setTravellers(updated);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={traveller.lastName}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[index].lastName = e.target.value;
                        setTravellers(updated);
                      }}
                    />
                  </div>

                  <input
                    type="date"
                    placeholder="Date of Birth"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={traveller.dob}
                    onChange={(e) => {
                      const updated = [...travellers];
                      updated[index].dob = e.target.value;
                      setTravellers(updated);
                    }}
                  />

                  {index === 0 && (
                    <>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={traveller.email}
                        onChange={(e) => {
                          const updated = [...travellers];
                          updated[index].email = e.target.value;
                          setTravellers(updated);
                        }}
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={traveller.phone}
                        onChange={(e) => {
                          const updated = [...travellers];
                          updated[index].phone = e.target.value;
                          setTravellers(updated);
                        }}
                      />
                    </>
                  )}

                  {index < travellers.length - 1 && (
                    <hr className="border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add-ons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <button
            onClick={() => toggleSection("addons")}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
              </div>
              <span className="font-medium">Add-ons & Extras</span>
            </div>
            {expandedSection === "addons" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSection === "addons" && (
            <div className="p-4 space-y-4">
              {[
                {
                  key: "meals",
                  icon: "🍽️",
                  title: "Meals",
                  desc: "Pre-order your meal",
                },
                {
                  key: "baggage",
                  icon: "🧳",
                  title: "Extra Baggage",
                  desc: "Additional 15kg checked baggage",
                },
                {
                  key: "insurance",
                  icon: "🛡️",
                  title: "Travel Insurance",
                  desc: "Comprehensive coverage",
                },
                {
                  key: "priorityBoarding",
                  icon: "🚀",
                  title: "Priority Boarding",
                  desc: "Board first and skip queues",
                },
              ].map(({ key, icon, title, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{icon}</div>
                    <div>
                      <div className="font-medium text-gray-800">{title}</div>
                      <div className="text-sm text-gray-500">{desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-blue-600">
                      {formatCurrency(addOns[key].price)}
                    </span>
                    <button
                      onClick={() => toggleAddOn(key)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        addOns[key].selected ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          addOns[key].selected
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seat Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <button
            onClick={() => toggleSection("seats")}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 3 ? <Check className="w-3 h-3" /> : "3"}
              </div>
              <span className="font-medium">Select Seats</span>
            </div>
            {expandedSection === "seats" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSection === "seats" && (
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">✈️</div>
                <p>Seat selection will be available on next screen</p>
                <p className="text-sm">
                  Continue to choose your preferred seats
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <button
            onClick={() => toggleSection("payment")}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep >= 4 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 4 ? <Check className="w-3 h-3" /> : "4"}
              </div>
              <span className="font-medium">Payment Method</span>
            </div>
            {expandedSection === "payment" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSection === "payment" && currentStep >= 4 && (
            <div className="p-4 space-y-3 border-t border-gray-100">
              {[
                { id: "card", name: "Credit/Debit Card", icon: "💳" },
                { id: "upi", name: "UPI Payment", icon: "📱" },
                { id: "netbanking", name: "Net Banking", icon: "🏦" },
                { id: "wallet", name: "Digital Wallet", icon: "👛" },
              ].map((method) => (
                <label
                  key={method.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-xl">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Summary & Continue Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-xl font-bold text-gray-800">
            {formatCurrency(calculateTotal())}
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
        >
          {currentStep < 4
            ? `Continue to ${steps[currentStep]?.name}`
            : "Complete Booking"}
        </button>
      </div>
    </div>
  );
};

export default MobileBooking;
