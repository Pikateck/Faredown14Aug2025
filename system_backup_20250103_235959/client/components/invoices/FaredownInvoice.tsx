import React, { useEffect } from "react";
import {
  Calendar,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
} from "lucide-react";
import { preparePrintDocument } from "@/utils/printUtils";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TaxBreakdown {
  name: string;
  rate: number;
  amount: number;
}

interface FaredownInvoiceProps {
  booking: {
    id: string;
    bookingRef: string;
    type: "flight" | "hotel" | "sightseeing";
    bookingDate: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    serviceName: string;
    serviceDetails: string;
    totalAmount: string;
    currency?: string;
  };
  items: InvoiceItem[];
  taxes?: TaxBreakdown[];
  subtotal: number;
  total: number;
  onPrint?: () => void;
}

export const FaredownInvoice: React.FC<FaredownInvoiceProps> = ({
  booking,
  items,
  taxes = [],
  subtotal,
  total,
  onPrint,
}) => {
  const invoiceNumber = `FD-${booking.bookingRef}`;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const cleanup = preparePrintDocument("invoice");
    return cleanup;
  }, []);

  const getServiceIcon = () => {
    switch (booking.type) {
      case "flight":
        return "✈️";
      case "hotel":
        return "🏨";
      case "sightseeing":
        return "📷";
      default:
        return "🎫";
    }
  };

  return (
    <div className="bg-white text-black print:shadow-none print:border-none w-full mx-auto">
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
          .print-header {
            background-color: #003580 !important;
          }
        }
      `}</style>

      {/* Mobile-Responsive Header */}
      <div className="print-header bg-gradient-to-r from-[#003580] to-[#0071c2] text-white p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              FAREDOWN
            </h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-3 lg:mb-4">
              Travel Booking Platform
            </p>
            <div className="space-y-1 text-blue-100 text-xs sm:text-sm">
              <div className="flex items-center">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="break-all">www.faredown.com</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="break-all">support@faredown.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span>+971 4 123 4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">INVOICE</h2>
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="break-words">
                <span className="font-semibold">Invoice #:</span>{" "}
                <span className="break-all">{invoiceNumber}</span>
              </p>
              <p>
                <span className="font-semibold">Date:</span> {currentDate}
              </p>
              <p>
                <span className="font-semibold">Due Date:</span> Paid
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-8">
        {/* Mobile-Responsive Bill To Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#003580] flex-shrink-0" />
              Bill To
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg break-words">
                {booking.customerName}
              </p>
              <p className="text-gray-600 text-sm break-all">
                {booking.customerEmail}
              </p>
              {booking.customerPhone && (
                <p className="text-gray-600 text-sm">{booking.customerPhone}</p>
              )}
              {booking.customerAddress && (
                <p className="text-gray-600 mt-2 text-sm break-words">
                  {booking.customerAddress}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
              Service Details
            </h3>
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <div className="flex items-start mb-2">
                <span className="text-xl sm:text-2xl mr-2 flex-shrink-0">
                  {getServiceIcon()}
                </span>
                <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                  {booking.serviceName}
                </p>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm break-words">
                {booking.serviceDetails}
              </p>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Booking Reference:</span>{" "}
                  <span className="break-all">{booking.bookingRef}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Booking Date:</span>{" "}
                  {booking.bookingDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Responsive Invoice Items */}
        <div className="mb-6 lg:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Invoice Details
          </h3>

          {/* Mobile Card Layout */}
          <div className="lg:hidden space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900 text-sm flex-1 pr-2 break-words">
                    {item.description}
                  </p>
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {booking.currency || "₹"}
                    {item.total.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Qty:</span> {item.quantity}
                  </div>
                  <div className="text-right">
                    <span className="font-medium">Unit:</span>{" "}
                    {booking.currency || "₹"}
                    {item.unitPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#003580] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {booking.currency || "₹"}
                      {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {booking.currency || "₹"}
                      {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile-Responsive Totals Section */}
        <div className="flex justify-center lg:justify-end mb-6 lg:mb-8">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Invoice Summary
              </h4>

              {/* Subtotal */}
              <div className="flex justify-between py-2">
                <span className="text-gray-600 text-sm">Subtotal:</span>
                <span className="font-medium text-gray-900 text-sm">
                  {booking.currency || "₹"}
                  {subtotal.toLocaleString()}
                </span>
              </div>

              {/* Taxes */}
              {taxes.map((tax, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span className="text-gray-600 text-sm">
                    {tax.name} ({tax.rate}%):
                  </span>
                  <span className="font-medium text-gray-900 text-sm">
                    {booking.currency || "₹"}
                    {tax.amount.toLocaleString()}
                  </span>
                </div>
              ))}

              {/* Service Fees */}
              <div className="flex justify-between py-2">
                <span className="text-gray-600 text-sm">Service Fees:</span>
                <span className="font-medium text-gray-900 text-sm">
                  Included
                </span>
              </div>

              {/* Total */}
              <div className="border-t border-gray-300 mt-4 pt-4">
                <div className="flex justify-between">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[#003580]">
                    {booking.currency || "₹"}
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="font-medium text-xs sm:text-sm">
                    Payment Status: PAID
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Responsive Terms and Conditions */}
        <div className="border-t border-gray-200 pt-6 lg:pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                Terms & Conditions
              </h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• All bookings are subject to availability</li>
                <li>• Cancellation policies vary by service provider</li>
                <li>
                  • Refunds will be processed as per the original payment method
                </li>
                <li>• Service fees are non-refundable</li>
                <li>• Prices are subject to change without notice</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                Payment Information
              </h4>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Payment Method:</span> Online
                  Payment
                </p>
                <p className="break-words">
                  <span className="font-medium">Transaction ID:</span> TXN-
                  {booking.bookingRef}
                </p>
                <p>
                  <span className="font-medium">Payment Date:</span>{" "}
                  {booking.bookingDate}
                </p>
                <p>
                  <span className="font-medium">Currency:</span>{" "}
                  {booking.currency || "INR"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Responsive Footer */}
        <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200 text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Thank you for choosing Faredown for your travel needs!
          </p>
          <p className="text-xs text-gray-500">
            This is a computer-generated invoice and does not require a
            signature.
          </p>
          <div className="mt-3 lg:mt-4">
            <p className="text-xs text-gray-400 break-words">
              For any queries regarding this invoice, please contact our support
              team at support@faredown.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
