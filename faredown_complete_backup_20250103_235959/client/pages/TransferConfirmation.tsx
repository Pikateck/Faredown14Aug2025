import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransferVoucher } from "@/components/vouchers/TransferVoucher";
import { TransferInvoice } from "@/components/invoices/TransferInvoice";
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  Star,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TransferConfirmation() {
  const location = useLocation();
  const { transfer, bookingData, bookingRef } = location.state || {};
  const [showVoucher, setShowVoucher] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const handleDownloadVoucher = () => {
    setShowVoucher(true);
    // Print voucher after a short delay to ensure it's rendered
    setTimeout(() => {
      window.print();
      setShowVoucher(false);
    }, 500);
  };

  const handleDownloadInvoice = () => {
    setShowInvoice(true);
    // Print invoice after a short delay to ensure it's rendered
    setTimeout(() => {
      window.print();
      setShowInvoice(false);
    }, 500);
  };

  if (!transfer || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Booking information not found
          </h1>
          <Link to="/transfers">
            <Button>Return to Transfers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              faredown.com
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/flights"
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
              >
                <span>✈️</span>
                <span>Flights</span>
              </Link>
              <Link
                to="/hotels"
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
              >
                <span>🏨</span>
                <span>Hotels</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-sm hover:text-blue-200">
                  <span>🌐</span>
                  <span>English (UK)</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>🇬🇧 English (UK)</DropdownMenuItem>
                  <DropdownMenuItem>🇺🇸 English (US)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-sm hover:text-blue-200">
                  <span>INR</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>₹ INR - Indian Rupee</DropdownMenuItem>
                  <DropdownMenuItem>$ USD - US Dollar</DropdownMenuItem>
                  <DropdownMenuItem>€ EUR - Euro</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your transfer has been successfully booked.
          </p>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Booking Reference: </span>
            <span className="font-mono font-semibold text-blue-600 text-lg">
              {bookingRef}
            </span>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Transfer Details
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfer Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={transfer.image}
                    alt={transfer.vehicle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {transfer.type} - {transfer.vehicle}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {transfer.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Up to {transfer.maxPassengers} passengers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{transfer.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="font-medium text-gray-900">
                      {transfer.from ||
                        transfer.pickupLocation ||
                        "Pickup location to be confirmed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Drop-off</p>
                    <p className="font-medium text-gray-900">
                      {transfer.to ||
                        transfer.dropoffLocation ||
                        "Drop-off location to be confirmed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {transfer.pickupDate && transfer.pickupTime
                        ? `${new Date(transfer.pickupDate).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )} at ${transfer.pickupTime}`
                        : "Date and time to be confirmed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Guest Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Primary Guest</p>
                  <p className="font-medium text-gray-900">
                    {bookingData.primaryGuest.title}{" "}
                    {bookingData.primaryGuest.firstName}{" "}
                    {bookingData.primaryGuest.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {bookingData.primaryGuest.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {bookingData.primaryGuest.countryCode}{" "}
                    {bookingData.primaryGuest.phone}
                  </p>
                </div>
                {bookingData.flightDetails.flightNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Flight Details</p>
                    <p className="font-medium text-gray-900">
                      {bookingData.flightDetails.flightNumber}
                      {bookingData.flightDetails.airline &&
                        ` - ${bookingData.flightDetails.airline}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border-t pt-6 mt-6">
            <div className="max-w-md ml-auto">
              <h3 className="font-semibold text-gray-900 mb-3">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transfer Fare</span>
                  <span>
                    ₹{transfer.originalPrice || transfer.totalPrice || "0"}
                  </span>
                </div>
                {(transfer.originalPrice || transfer.totalPrice) &&
                  (transfer.originalPrice || transfer.totalPrice) >
                    (transfer.price || transfer.finalPrice) && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>
                        -₹
                        {(transfer.originalPrice || transfer.totalPrice) -
                          (transfer.price || transfer.finalPrice)}
                      </span>
                    </div>
                  )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-lg">
                      ₹
                      {transfer.price ||
                        transfer.finalPrice ||
                        transfer.totalPrice ||
                        "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">
                Confirmation Email
              </h4>
              <p className="text-sm text-gray-600">
                Sent to {bookingData.primaryGuest.email}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Driver Contact</h4>
              <p className="text-sm text-gray-600">
                Details will be sent 24hrs before pickup
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Car className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Track Transfer</h4>
              <p className="text-sm text-gray-600">
                Real-time tracking available on pickup day
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={handleDownloadVoucher}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Voucher
            </Button>

            <Button
              variant="outline"
              className="flex items-center"
              onClick={handleDownloadInvoice}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>

            <Link to="/my-trips">
              <Button>View My Bookings</Button>
            </Link>

            <Link to="/transfers">
              <Button variant="outline">Book Another Transfer</Button>
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need help? Contact our support team
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <a
              href="tel:+91-1234567890"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Phone className="w-4 h-4 mr-1" />
              +91-1234567890
            </a>
            <a
              href="mailto:support@faredown.com"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Mail className="w-4 h-4 mr-1" />
              support@faredown.com
            </a>
          </div>
        </div>
      </div>

      {/* Transfer Voucher Modal */}
      {showVoucher && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <TransferVoucher
            booking={{
              id: transfer?.id || "N/A",
              transferType: transfer?.type || "Transfer",
              vehicleName:
                transfer?.vehicle || transfer?.vehicleName || "Vehicle",
              vehicleClass: transfer?.vehicleClass || "Standard",
              pickupLocation:
                transfer?.from || transfer?.pickupLocation || "Pickup Location",
              dropoffLocation:
                transfer?.to ||
                transfer?.dropoffLocation ||
                "Drop-off Location",
              pickupDate:
                transfer?.pickupDate || new Date().toISOString().split("T")[0],
              pickupTime: transfer?.pickupTime || "10:00",
              returnDate: transfer?.returnDate,
              returnTime: transfer?.returnTime,
              bookingRef: bookingRef || "FAREDOWN-TXF-001",
              passengers: transfer?.maxPassengers || 2,
              totalAmount: `₹${transfer?.price || transfer?.finalPrice || transfer?.totalPrice || "0"}`,
              guestName: bookingData?.primaryGuest
                ? `${bookingData.primaryGuest.title} ${bookingData.primaryGuest.firstName} ${bookingData.primaryGuest.lastName}`
                : "Guest Name",
              phone:
                bookingData?.primaryGuest?.countryCode &&
                bookingData?.primaryGuest?.phone
                  ? `${bookingData.primaryGuest.countryCode} ${bookingData.primaryGuest.phone}`
                  : undefined,
              email: bookingData?.primaryGuest?.email,
              providerName: transfer?.providerName || "Faredown Transfers",
              duration:
                transfer?.duration || transfer?.estimatedDuration
                  ? `${transfer.estimatedDuration} min`
                  : undefined,
              distance: transfer?.distance,
              isRoundTrip: !!transfer?.returnDate,
              specialRequests: bookingData?.specialRequests,
              flightNumber: bookingData?.flightDetails?.flightNumber,
            }}
            onPrint={() => setShowVoucher(false)}
          />
        </div>
      )}

      {/* Transfer Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <TransferInvoice
            booking={{
              id: transfer?.id || "TXF-001",
              invoiceNumber: `INV-${bookingRef || "FAREDOWN-001"}`,
              bookingRef: bookingRef || "FAREDOWN-TXF-001",
              transferType: transfer?.type || "Transfer",
              vehicleName:
                transfer?.vehicle || transfer?.vehicleName || "Vehicle",
              vehicleClass: transfer?.vehicleClass || "Standard",
              pickupLocation:
                transfer?.from || transfer?.pickupLocation || "Pickup Location",
              dropoffLocation:
                transfer?.to ||
                transfer?.dropoffLocation ||
                "Drop-off Location",
              pickupDate:
                transfer?.pickupDate || new Date().toISOString().split("T")[0],
              pickupTime: transfer?.pickupTime || "10:00",
              returnDate: transfer?.returnDate,
              returnTime: transfer?.returnTime,
              passengers: transfer?.maxPassengers || 2,
              baseAmount: `₹${Math.round(parseFloat(transfer?.price || transfer?.finalPrice || transfer?.totalPrice || "0") * 0.85)}`,
              taxAmount: `₹${Math.round(parseFloat(transfer?.price || transfer?.finalPrice || transfer?.totalPrice || "0") * 0.18)}`,
              discountAmount:
                transfer?.originalPrice && transfer?.price
                  ? `₹${parseFloat(transfer.originalPrice) - parseFloat(transfer.price)}`
                  : undefined,
              totalAmount: `₹${transfer?.price || transfer?.finalPrice || transfer?.totalPrice || "0"}`,
              guestName: bookingData?.primaryGuest
                ? `${bookingData.primaryGuest.title} ${bookingData.primaryGuest.firstName} ${bookingData.primaryGuest.lastName}`
                : "Guest Name",
              phone:
                bookingData?.primaryGuest?.countryCode &&
                bookingData?.primaryGuest?.phone
                  ? `${bookingData.primaryGuest.countryCode} ${bookingData.primaryGuest.phone}`
                  : undefined,
              email: bookingData?.primaryGuest?.email,
              providerName: transfer?.providerName || "Faredown Transfers",
              duration:
                transfer?.duration || transfer?.estimatedDuration
                  ? `${transfer.estimatedDuration} min`
                  : undefined,
              distance: transfer?.distance,
              isRoundTrip: !!transfer?.returnDate,
              paymentMethod: "Online Payment",
              transactionId: `TXN${bookingRef || Date.now()}`,
              invoiceDate: new Date().toISOString().split("T")[0],
            }}
            onPrint={() => setShowInvoice(false)}
          />
        </div>
      )}
    </div>
  );
}
