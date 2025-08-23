import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  MapPin,
  Clock,
  Info,
} from "lucide-react";
import {
  flightsService,
  Flight,
  Passenger,
  ContactInfo,
} from "@/services/flightsService";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";

interface FlightBookingProps {
  flight?: Flight;
}

export default function FlightBooking({
  flight: providedFlight,
}: FlightBookingProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { selectedCurrency } = useCurrency();
  const { user, isLoggedIn } = useAuth();

  // Flight data
  const [flight, setFlight] = useState<Flight | null>(
    providedFlight || location.state?.flight || null,
  );

  // Booking form states
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      id: "pax_1",
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "M",
      nationality: "IN",
      passportNumber: "",
      passportExpiry: "",
      email: "",
      phone: "",
    },
  ]);

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: user?.email || "",
    phone: user?.phone || "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
  });

  const [seatSelections, setSeatSelections] = useState<Record<string, string>>(
    {},
  );
  const [addOns, setAddOns] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!flight) {
      // If no flight data, redirect back to search
      navigate("/flights");
    }
  }, [flight, navigate]);

  const formatPrice = (amount: number) => {
    return `${selectedCurrency.symbol}${amount.toLocaleString("en-IN")}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate passengers
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        newErrors[`passenger_${index}_firstName`] = "First name is required";
      }
      if (!passenger.lastName.trim()) {
        newErrors[`passenger_${index}_lastName`] = "Last name is required";
      }
      if (!passenger.dateOfBirth) {
        newErrors[`passenger_${index}_dateOfBirth`] =
          "Date of birth is required";
      }
    });

    // Validate contact info
    if (!contactInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!contactInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      newErrors.terms = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePassengerChange = (
    index: number,
    field: keyof Passenger,
    value: string,
  ) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    };
    setPassengers(updatedPassengers);

    // Clear error when user starts typing
    if (errors[`passenger_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`passenger_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const bookingData = {
        flightId: flight!.id,
        passengers: passengers.map((p) => ({
          ...p,
          email: p.email || contactInfo.email,
          phone: p.phone || contactInfo.phone,
        })),
        contactInfo,
        seatSelections,
        addOns: addOns.map((addon) => ({
          type: addon as any,
          id: addon,
          quantity: 1,
        })),
      };

      console.log("🚀 Submitting booking:", bookingData);

      const booking = await flightsService.bookFlight(bookingData);

      console.log("✅ Booking successful:", booking);

      // Navigate to confirmation page
      navigate("/booking-confirmation", {
        state: {
          booking,
          flight,
          isFlightBooking: true,
        },
      });
    } catch (error) {
      console.error("❌ Booking failed:", error);
      setBookingError(
        error.message || "Failed to complete booking. Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  };

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Plane className="w-8 h-8 mx-auto text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Flight Not Found
            </h3>
            <p className="text-gray-600">
              Please select a flight to continue with booking.
            </p>
            <Button onClick={() => navigate("/flights")} className="mt-4">
              Search Flights
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Complete Your Booking
                </h1>
                <p className="text-sm text-gray-600">
                  {flight.flightNumber} • {flight.airline}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(flight.price.amount)}
              </div>
              <div className="text-sm text-gray-500">per person</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5" />
                  <span>Flight Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {flight.departureTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      {flight.departure.code}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flight.departure.city}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-sm text-gray-600">
                      {flight.duration}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flight.stops === 0
                        ? "Direct"
                        : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {flight.arrivalTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      {flight.arrival.code}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flight.arrival.city}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Passenger Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">
                        Passenger {index + 1}{" "}
                        {index === 0 && "(Lead Passenger)"}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`title_${index}`}>Title *</Label>
                        <Select
                          value={passenger.title}
                          onValueChange={(value) =>
                            handlePassengerChange(index, "title", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Dr">Dr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`firstName_${index}`}>
                          First Name *
                        </Label>
                        <Input
                          id={`firstName_${index}`}
                          value={passenger.firstName}
                          onChange={(e) =>
                            handlePassengerChange(
                              index,
                              "firstName",
                              e.target.value,
                            )
                          }
                          className={
                            errors[`passenger_${index}_firstName`]
                              ? "border-red-500"
                              : ""
                          }
                          placeholder="Enter first name"
                        />
                        {errors[`passenger_${index}_firstName`] && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors[`passenger_${index}_firstName`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`lastName_${index}`}>Last Name *</Label>
                        <Input
                          id={`lastName_${index}`}
                          value={passenger.lastName}
                          onChange={(e) =>
                            handlePassengerChange(
                              index,
                              "lastName",
                              e.target.value,
                            )
                          }
                          className={
                            errors[`passenger_${index}_lastName`]
                              ? "border-red-500"
                              : ""
                          }
                          placeholder="Enter last name"
                        />
                        {errors[`passenger_${index}_lastName`] && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors[`passenger_${index}_lastName`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`dateOfBirth_${index}`}>
                          Date of Birth *
                        </Label>
                        <Input
                          id={`dateOfBirth_${index}`}
                          type="date"
                          value={passenger.dateOfBirth}
                          onChange={(e) =>
                            handlePassengerChange(
                              index,
                              "dateOfBirth",
                              e.target.value,
                            )
                          }
                          className={
                            errors[`passenger_${index}_dateOfBirth`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors[`passenger_${index}_dateOfBirth`] && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors[`passenger_${index}_dateOfBirth`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`gender_${index}`}>Gender *</Label>
                        <Select
                          value={passenger.gender}
                          onValueChange={(value) =>
                            handlePassengerChange(
                              index,
                              "gender",
                              value as "M" | "F",
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Male</SelectItem>
                            <SelectItem value="F">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`nationality_${index}`}>
                          Nationality *
                        </Label>
                        <Select
                          value={passenger.nationality}
                          onValueChange={(value) =>
                            handlePassengerChange(index, "nationality", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IN">Indian</SelectItem>
                            <SelectItem value="US">American</SelectItem>
                            <SelectItem value="GB">British</SelectItem>
                            <SelectItem value="CA">Canadian</SelectItem>
                            <SelectItem value="AU">Australian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* International flight passport fields */}
                    {flight.departure.country !== flight.arrival.country && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <Label htmlFor={`passport_${index}`}>
                            Passport Number
                          </Label>
                          <Input
                            id={`passport_${index}`}
                            value={passenger.passportNumber || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "passportNumber",
                                e.target.value,
                              )
                            }
                            placeholder="Enter passport number"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`passportExpiry_${index}`}>
                            Passport Expiry
                          </Label>
                          <Input
                            id={`passportExpiry_${index}`}
                            type="date"
                            value={passenger.passportExpiry || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "passportExpiry",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) =>
                        handleContactChange("email", e.target.value)
                      }
                      className={errors.email ? "border-red-500" : ""}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        handleContactChange("phone", e.target.value)
                      }
                      className={errors.phone ? "border-red-500" : ""}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label
                      htmlFor="card"
                      className="flex items-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit/Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label
                      htmlFor="upi"
                      className="flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>UPI</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label
                      htmlFor="netbanking"
                      className="flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Net Banking</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className={errors.terms ? "border-red-500" : ""}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="terms"
                      className={`text-sm ${errors.terms ? "text-red-600" : "text-gray-700"}`}
                    >
                      I accept the{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600"
                      >
                        Terms and Conditions
                      </Button>{" "}
                      and{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600"
                      >
                        Privacy Policy
                      </Button>
                    </Label>
                    {errors.terms && (
                      <p className="text-sm text-red-600">{errors.terms}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Error */}
            {bookingError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      Booking Failed
                    </span>
                  </div>
                  <p className="text-red-700 mt-2">{bookingError}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base fare:</span>
                      <span>
                        {formatPrice(flight.price.breakdown.baseFare)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & fees:</span>
                      <span>
                        {formatPrice(
                          flight.price.breakdown.taxes +
                            flight.price.breakdown.fees,
                        )}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">
                          {formatPrice(flight.price.breakdown.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Price locked for 10 minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Secure SSL encryption</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isBooking
                      ? "Processing..."
                      : `Pay ${formatPrice(flight.price.breakdown.total)}`}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    You will be redirected to secure payment gateway
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
