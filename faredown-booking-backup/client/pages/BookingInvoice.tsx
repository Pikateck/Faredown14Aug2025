import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Printer,
  Share2,
  Receipt,
  Building,
  User,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceWithSymbol } from "@/lib/pricing";

export default function BookingInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const bookingId = searchParams.get("bookingId") || "HTL" + Date.now();
  const invoiceNumber = "INV-" + Date.now().toString().slice(-8);

  // Mock invoice data (would be fetched from API)
  const invoiceData = {
    invoice: {
      number: invoiceNumber,
      issueDate: new Date().toISOString(),
      dueDate: new Date().toISOString(), // Immediate payment
      paymentDate: new Date().toISOString(),
      status: "Paid",
    },

    company: {
      name: "Faredown Travel Solutions",
      address: "1234 Business Avenue",
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      zipCode: "12345",
      phone: "+971 4 123 4567",
      email: "billing@faredown.com",
      website: "www.faredown.com",
      taxId: "TRN: 123456789012345",
      license: "DTCM License: 987654321",
    },

    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
      address: "456 Customer Street",
      city: "New York",
      state: "NY",
      country: "United States",
      zipCode: "10001",
    },

    booking: {
      id: bookingId,
      confirmationCode:
        "CONF-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      serviceType: "Hotel Accommodation",
      supplier: "Grand Plaza Hotel",
      supplierAddress: "123 Sheikh Zayed Road, Downtown Dubai, Dubai, UAE",
    },

    service: {
      hotelName: "Grand Plaza Hotel",
      roomType: "Deluxe Suite",
      checkIn: "2024-07-25",
      checkOut: "2024-07-28",
      nights: 3,
      guests: 2,
      rooms: 1,
      bedType: "King Bed",
      boardType: "Room Only",
      cancellationPolicy: "Free cancellation until 24 hours before check-in",
    },

    billing: {
      items: [
        {
          description: "Hotel Accommodation - Deluxe Suite",
          details: "3 nights × 1 room × $259.00 per night",
          quantity: 3,
          unitPrice: 259.0,
          total: 777.0,
          taxRate: 0.12,
          taxAmount: 93.24,
        },
        {
          description: "Booking Service Fee",
          details: "Processing and customer service",
          quantity: 1,
          unitPrice: 50.0,
          total: 50.0,
          taxRate: 0.0,
          taxAmount: 0.0,
        },
        {
          description: "City Tax",
          details: "Dubai Tourism Dirham",
          quantity: 3,
          unitPrice: 5.0,
          total: 15.0,
          taxRate: 0.0,
          taxAmount: 0.0,
        },
      ],
      subtotal: 842.0,
      totalTax: 93.24,
      total: 935.24,
      amountPaid: 935.24,
      amountDue: 0.0,
      currency: "USD",
    },

    payment: {
      method: "Credit Card",
      cardNumber: "**** **** **** 1234",
      cardType: "Visa",
      transactionId: "TXN" + Date.now().toString().slice(-10),
      paymentProcessor: "Secure Payment Gateway",
      processingFee: 0.0,
      authorizationCode: "AUTH" + Math.random().toString(36).substr(2, 6),
    },

    terms: [
      "Payment is due immediately upon booking confirmation.",
      "Cancellation policy varies by hotel and rate type.",
      "Check-in and check-out times are subject to hotel policies.",
      "Additional charges may apply for extra services not included in the booking.",
      "Valid government-issued photo ID required at check-in.",
      "Credit card may be required for incidental charges.",
      "Rates are quoted in USD and subject to currency conversion if paying in local currency.",
      "This invoice serves as your receipt for tax and accounting purposes.",
    ],

    notes:
      "Thank you for choosing Faredown for your travel needs. For any questions regarding this invoice, please contact our billing department.",
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate invoice content for download
      const invoiceContent = `
HOTEL BOOKING INVOICE
faredown.com

Invoice #: INV-${Date.now()}
Date: ${new Date().toLocaleDateString()}

Bill To:
John Doe
john@example.com
+1 (555) 123-4567

Service Details:
Hotel: ${invoiceData.service.hotelName}
Check-in: ${invoiceData.service.checkIn}
Check-out: ${invoiceData.service.checkOut}
Room: ${invoiceData.service.roomType}
Guests: ${invoiceData.service.guests}

Amount: ${invoiceData.service.amount}
Taxes: ${invoiceData.service.taxes}
Total: ${invoiceData.service.total}

Payment Status: Paid
Payment Method: Credit Card

Thank you for your business!
      `;

      // Create and download the file
      const blob = new Blob([invoiceContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hotel-invoice-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again or use the print option.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hotel Booking Invoice",
          text: `Invoice for booking at ${invoiceData.service.hotelName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Invoice link copied to clipboard!");
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        .print-full-width { width: 100% !important; max-width: none !important; }
        body { font-size: 12px; }
        .invoice-container { box-shadow: none !important; border: 1px solid #000 !important; }
        table { border-collapse: collapse; }
        table, th, td { border: 1px solid #000; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print">
        <Header />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 print-full-width">
        {/* Action Buttons */}
        <div className="no-print mb-6 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Invoice Content */}
        <Card
          id="invoice-content"
          className="invoice-container bg-white shadow-lg"
        >
          <CardContent className="p-8">
            {/* Header */}
            <div className="border-b-2 border-blue-600 pb-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-blue-600 mb-2">
                    INVOICE
                  </h1>
                  <div className="text-gray-600">
                    <div className="text-sm">Invoice Number</div>
                    <div className="text-xl font-bold">
                      {invoiceData.invoice.number}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {invoiceData.company.name}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{invoiceData.company.address}</div>
                    <div>
                      {invoiceData.company.city}, {invoiceData.company.state}
                    </div>
                    <div>
                      {invoiceData.company.country}{" "}
                      {invoiceData.company.zipCode}
                    </div>
                    <div>{invoiceData.company.phone}</div>
                    <div>{invoiceData.company.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Invoice Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span>
                      {new Date(
                        invoiceData.invoice.issueDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span>
                      {new Date(
                        invoiceData.invoice.dueDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span>
                      {new Date(
                        invoiceData.invoice.paymentDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="flex items-center text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {invoiceData.invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Bill To
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{invoiceData.customer.name}</div>
                  <div>{invoiceData.customer.email}</div>
                  <div>{invoiceData.customer.phone}</div>
                  <div>{invoiceData.customer.address}</div>
                  <div>
                    {invoiceData.customer.city}, {invoiceData.customer.state}
                  </div>
                  <div>
                    {invoiceData.customer.country}{" "}
                    {invoiceData.customer.zipCode}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Service Provider
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    {invoiceData.booking.supplier}
                  </div>
                  <div>{invoiceData.booking.supplierAddress}</div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-gray-600">Booking Reference:</div>
                    <div className="font-medium">
                      {invoiceData.booking.confirmationCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Service Details
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Hotel:</strong> {invoiceData.service.hotelName}
                  </div>
                  <div>
                    <strong>Room Type:</strong> {invoiceData.service.roomType}
                  </div>
                  <div>
                    <strong>Check-in:</strong>{" "}
                    {new Date(invoiceData.service.checkIn).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Check-out:</strong>{" "}
                    {new Date(
                      invoiceData.service.checkOut,
                    ).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Duration:</strong> {invoiceData.service.nights}{" "}
                    {invoiceData.service.nights === 1 ? "night" : "nights"}
                  </div>
                  <div>
                    <strong>Guests:</strong> {invoiceData.service.guests}
                  </div>
                  <div>
                    <strong>Rooms:</strong> {invoiceData.service.rooms}
                  </div>
                  <div>
                    <strong>Bed Type:</strong> {invoiceData.service.bedType}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Items */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Billing Details
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                        Qty
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">
                        Unit Price
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">
                        Amount
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">
                        Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.billing.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-gray-600">
                            {item.details}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right">
                          {formatPriceWithSymbol(
                            item.unitPrice,
                            selectedCurrency.code,
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                          {formatPriceWithSymbol(
                            item.total,
                            selectedCurrency.code,
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right">
                          {formatPriceWithSymbol(
                            item.taxAmount,
                            selectedCurrency.code,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 flex justify-end">
                <div className="w-80">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        {formatPriceWithSymbol(
                          invoiceData.billing.subtotal,
                          selectedCurrency.code,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span>
                        {formatPriceWithSymbol(
                          invoiceData.billing.totalTax,
                          selectedCurrency.code,
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span>
                        {formatPriceWithSymbol(
                          invoiceData.billing.total,
                          selectedCurrency.code,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Amount Paid:</span>
                      <span>
                        {formatPriceWithSymbol(
                          invoiceData.billing.amountPaid,
                          selectedCurrency.code,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Amount Due:</span>
                      <span>
                        {formatPriceWithSymbol(
                          invoiceData.billing.amountDue,
                          selectedCurrency.code,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </h2>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Payment Method:</strong>{" "}
                    {invoiceData.payment.method}
                  </div>
                  <div>
                    <strong>Card Number:</strong>{" "}
                    {invoiceData.payment.cardNumber}
                  </div>
                  <div>
                    <strong>Card Type:</strong> {invoiceData.payment.cardType}
                  </div>
                  <div>
                    <strong>Transaction ID:</strong>{" "}
                    {invoiceData.payment.transactionId}
                  </div>
                  <div>
                    <strong>Authorization Code:</strong>{" "}
                    {invoiceData.payment.authorizationCode}
                  </div>
                  <div>
                    <strong>Processor:</strong>{" "}
                    {invoiceData.payment.paymentProcessor}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Terms and Conditions</h2>
              <div className="text-xs space-y-2">
                {invoiceData.terms.map((term, index) => (
                  <div key={index}>
                    {index + 1}. {term}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {invoiceData.notes && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3">Notes</h2>
                <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                  {invoiceData.notes}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-4 text-center text-xs text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="font-semibold">Tax Information</div>
                  <div>{invoiceData.company.taxId}</div>
                  <div>{invoiceData.company.license}</div>
                </div>
                <div>
                  <div className="font-semibold">Contact Information</div>
                  <div>{invoiceData.company.phone}</div>
                  <div>{invoiceData.company.email}</div>
                  <div>{invoiceData.company.website}</div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <p>
                  This is a computer-generated invoice and is valid without
                  signature.
                </p>
                <p>Generated on: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="no-print mt-6 text-center">
          <Button
            onClick={() => navigate("/hotels")}
            variant="outline"
            className="mr-4"
          >
            Book Another Hotel
          </Button>
          <Button onClick={() => navigate("/account/bookings")}>
            View All Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
