import React, { useEffect } from "react";
import {
  Download,
  Calendar,
  Clock,
  Users,
  MapPin,
  Car,
  Receipt,
  Building2,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ArrowRight,
} from "lucide-react";
import { preparePrintDocument } from "@/utils/printUtils";

interface TransferInvoiceProps {
  booking: {
    id: string;
    invoiceNumber: string;
    bookingRef: string;
    transferType: string;
    vehicleName: string;
    vehicleClass: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    returnDate?: string;
    returnTime?: string;
    passengers: number;
    baseAmount: string;
    taxAmount: string;
    discountAmount?: string;
    totalAmount: string;
    guestName?: string;
    address?: string;
    phone?: string;
    email?: string;
    gstNumber?: string;
    providerName?: string;
    duration?: string;
    distance?: string;
    isRoundTrip?: boolean;
    paymentMethod?: string;
    transactionId?: string;
    invoiceDate: string;
  };
  onPrint?: () => void;
}

export const TransferInvoice: React.FC<TransferInvoiceProps> = ({
  booking,
  onPrint,
}) => {
  useEffect(() => {
    const cleanup = preparePrintDocument("invoice");
    return cleanup;
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date TBD";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const parseAmount = (amount: string) => {
    return parseFloat(amount.replace(/[₹,]/g, "")) || 0;
  };

  const baseAmount = parseAmount(booking.baseAmount);
  const taxAmount = parseAmount(booking.taxAmount);
  const discountAmount = booking.discountAmount
    ? parseAmount(booking.discountAmount)
    : 0;
  const totalAmount = parseAmount(booking.totalAmount);

  return (
    <div className="bg-white text-black print:shadow-none print:border-none max-w-4xl mx-auto">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .page-content {
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>

      <div className="page-content">
        {/* Header */}
        <div className="border-b-2 border-[#003580] pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#003580] mb-2">
                FAREDOWN
              </h1>
              <p className="text-gray-600 mb-1">Travel Booking Platform</p>
              <p className="text-sm text-gray-500">GST No: 27AAECF0000A1Z5</p>
              <p className="text-sm text-gray-500">PAN: AAECF0000A</p>
            </div>
            <div className="text-right">
              <div className="bg-[#003580] text-white px-4 py-2 rounded-lg mb-2">
                <h2 className="text-xl font-bold">TAX INVOICE</h2>
              </div>
              <p className="text-sm text-gray-600">
                Invoice No: {booking.invoiceNumber}
              </p>
              <p className="text-sm text-gray-600">
                Date: {formatDate(booking.invoiceDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Company & Customer Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Billed From */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-[#003580]" />
              Billed From
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">
                Faredown Technologies Pvt. Ltd.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                123 Business Park, Electronic City
                <br />
                Bangalore, Karnataka - 560100
                <br />
                India
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  +91-1234567890
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  billing@faredown.com
                </p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-[#003580]" />
              Billed To
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">
                {booking.guestName || "Guest Name"}
              </p>
              {booking.address && (
                <p className="text-gray-600 text-sm mt-1">{booking.address}</p>
              )}
              {booking.gstNumber && (
                <p className="text-sm text-gray-600 mt-2">
                  GST No: {booking.gstNumber}
                </p>
              )}
              <div className="mt-3 space-y-1">
                {booking.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {booking.phone}
                  </p>
                )}
                {booking.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {booking.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-[#003580]" />
            Transfer Details
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                <p className="font-semibold text-lg text-[#003580]">
                  {booking.bookingRef}
                </p>

                <p className="text-sm text-gray-600 mb-1 mt-3">Vehicle</p>
                <p className="font-semibold">{booking.vehicleName}</p>
                <p className="text-sm text-gray-600">
                  {booking.vehicleClass} • {booking.transferType}
                </p>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Route</p>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm">
                      <div className="flex items-center space-x-1 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">
                          {booking.pickupLocation}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-medium">
                          {booking.dropoffLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pickup Date</p>
                    <p className="font-semibold">
                      {formatDate(booking.pickupDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pickup Time</p>
                    <p className="font-semibold">{booking.pickupTime}</p>
                  </div>
                </div>

                {booking.isRoundTrip && booking.returnDate && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Return Date</p>
                      <p className="font-semibold">
                        {formatDate(booking.returnDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Return Time</p>
                      <p className="font-semibold">
                        {booking.returnTime || "TBD"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span>
                        {booking.passengers} passenger
                        {booking.passengers !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {booking.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span>{booking.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#003580]" />
            Invoice Details
          </h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    #
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Qty
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Rate
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">
                        {booking.transferType} - {booking.vehicleName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.pickupLocation} → {booking.dropoffLocation}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.pickupDate)} at {booking.pickupTime}
                      </p>
                      {booking.isRoundTrip && (
                        <p className="text-sm text-gray-600">
                          Return: {formatDate(booking.returnDate || "")} at{" "}
                          {booking.returnTime || "TBD"}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">1</td>
                  <td className="py-3 px-4 text-right">
                    ₹{baseAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    ₹{baseAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#003580]" />
              Payment Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {booking.paymentMethod || "Online Payment"}
                  </span>
                </div>
                {booking.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium text-sm">
                      {booking.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium text-green-600">Paid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Amount Summary
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">
                    ₹{baseAmount.toLocaleString()}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">
                      -₹{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700">CGST (9%):</span>
                  <span className="font-medium">
                    ₹{(taxAmount / 2).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">SGST (9%):</span>
                  <span className="font-medium">
                    ₹{(taxAmount / 2).toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-[#003580]">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Amount in words: {numberToWords(totalAmount)} Rupees Only
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Terms & Conditions
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Payment is due immediately upon booking confirmation.</li>
              <li>
                Cancellation charges apply as per our cancellation policy.
              </li>
              <li>
                Free waiting time is included as specified in the booking.
              </li>
              <li>
                Driver contact details will be shared 24 hours before pickup.
              </li>
              <li>
                Any tolls or parking charges are additional unless specified.
              </li>
              <li>
                This is a computer-generated invoice and does not require a
                signature.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-sm text-gray-500">
          <p className="mb-2">Thank you for choosing Faredown!</p>
          <p>
            For support, contact us at support@faredown.com or +91-1234567890
          </p>
          <p className="mt-2">
            Invoice generated on {new Date().toLocaleDateString()} | Booking ID:{" "}
            {booking.id}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert numbers to words (simplified version)
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100)
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000)
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " " + numberToWords(num % 100) : "")
    );
  if (num < 100000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 ? " " + numberToWords(num % 1000) : "")
    );

  return num.toLocaleString(); // Fallback for very large numbers
}
