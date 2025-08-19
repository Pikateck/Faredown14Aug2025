import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plane,
  MapPin,
  Clock,
  Luggage,
  Utensils,
  Wifi,
  Gift,
  Star,
  Lock,
} from "lucide-react";

const MobileBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flight, searchData, bargainSuccess } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    passengers: [
      {
        title: "Mr",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      },
    ],
    contactEmail: "",
    contactPhone: "",
    paymentMethod: "card",
    cardNumber: "4111 1111 1111 1111",
    expiryDate: "12/30",
    cvv: "123",
    cardholderName: "Test User",
  });

  const steps = [
    { id: 1, title: "Passenger Details", icon: User },
    { id: 2, title: "Contact Info", icon: Mail },
    { id: 3, title: "Payment", icon: CreditCard },
    { id: 4, title: "Review", icon: CheckCircle },
  ];

  const handleInputChange = (section: string, field: string, value: string) => {
    if (section === "passenger") {
      setFormData((prev) => ({
        ...prev,
        passengers: prev.passengers.map((p, index) =>
          index === 0 ? { ...p, [field]: value } : p,
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = () => {
    // Complete booking and navigate to confirmation
    const bookingData = {
      bookingDetails: {
        bookingRef: `FD${Date.now().toString().slice(-6)}`,
        flight,
        searchData,
        passengers: formData.passengers,
        contactDetails: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
        totalAmount: flight.price,
        currency: { symbol: "₹", code: "INR" },
        paymentMethod: formData.paymentMethod,
        bargainSuccess: bargainSuccess || false,
      },
    };

    navigate("/mobile-confirmation", { state: bookingData });
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
      title={`Booking - Step ${currentStep} of ${steps.length}`}
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="font-semibold">{steps[currentStep - 1].title}</h2>
          </div>
        </div>

        {/* Flight Summary (Always Visible) */}
        {bargainSuccess && (
          <div className="mx-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Bargain Success!
              </span>
            </div>
            <p className="text-sm text-green-700">
              You saved ₹{(25000 - flight.price).toLocaleString()} with AI
              negotiation
            </p>
          </div>
        )}

        <Card className="mx-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">{flight.airline}</div>
                  <div className="text-sm text-gray-500">
                    {flight.flightNumber}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  ₹{flight.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">{flight.class}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {flight.departure} - {flight.arrival}
              </span>
              <span>
                {flight.duration} • {flight.stops}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="px-4">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Passenger Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={formData.passengers[0].title}
                    onChange={(e) =>
                      handleInputChange("passenger", "title", e.target.value)
                    }
                    className="border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                  </select>
                  <Input
                    placeholder="First Name"
                    value={formData.passengers[0].firstName}
                    onChange={(e) =>
                      handleInputChange(
                        "passenger",
                        "firstName",
                        e.target.value,
                      )
                    }
                    className="col-span-1"
                  />
                  <Input
                    placeholder="Last Name"
                    value={formData.passengers[0].lastName}
                    onChange={(e) =>
                      handleInputChange("passenger", "lastName", e.target.value)
                    }
                    className="col-span-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={formData.passengers[0].dateOfBirth}
                    onChange={(e) =>
                      handleInputChange(
                        "passenger",
                        "dateOfBirth",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Important Note
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Name must match your passport/ID exactly as it appears on
                    the document.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        handleInputChange("", "contactEmail", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        handleInputChange("", "contactPhone", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Booking Confirmation
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    E-tickets and booking updates will be sent to your email.
                    SMS updates to your phone.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-green-600" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        handleInputChange("", "cardNumber", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Expiry Date
                    </label>
                    <Input
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleInputChange("", "expiryDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      CVV
                    </label>
                    <Input
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) =>
                        handleInputChange("", "cvv", e.target.value)
                      }
                      maxLength={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cardholder Name
                  </label>
                  <Input
                    placeholder="Name on Card"
                    value={formData.cardholderName}
                    onChange={(e) =>
                      handleInputChange("", "cardholderName", e.target.value)
                    }
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      256-bit SSL Encryption
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment details are secured with bank-level encryption.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Base Fare</span>
                    <span>₹{(flight.price - 2000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxes & Fees</span>
                    <span>₹2,000</span>
                  </div>
                  {bargainSuccess && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Faredown Savings</span>
                      <span>-₹{(25000 - flight.price).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span className="text-green-600">
                        ₹{flight.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Included Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Luggage className="w-4 h-4 text-green-600" />
                      <span className="text-sm">23kg Baggage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Meals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span className="text-sm">WiFi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Priority Check-in</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="px-4 pb-8">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex-1 py-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleBooking}
                className="flex-1 bg-green-600 hover:bg-green-700 py-6 text-lg font-semibold"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Booking
              </Button>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileBooking;
