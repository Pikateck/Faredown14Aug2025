import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AlertCircle, Clock, CreditCard, RefreshCw } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function RefundPolicy() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#003580] text-white px-8 py-6 rounded-t-lg">
            <h1 className="text-3xl font-bold">Refund Policy</h1>
            <p className="text-blue-200 mt-2">
              Faredown Bookings and Travels Pvt Ltd
            </p>
          </div>

          <div className="px-8 py-6 space-y-8">
            <section>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
                  <p className="text-blue-700 font-medium">
                    Important: All refunds are subject to airline/hotel
                    cancellation policies and may take 45-90 days to process.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  This refund policy applies to all bookings made through{" "}
                  <strong>Faredown Bookings and Travels Pvt Ltd</strong> website
                  and mobile applications. Please read this policy carefully
                  before making any booking.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                General Refund Terms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold">Processing Time</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Refunds typically take 45-90 days to process depending on
                      the airline/hotel policy and payment method used.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Refund Method</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Refunds are processed back to the original payment method
                      used during booking.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <RefreshCw className="w-5 h-5 text-orange-600 mr-2" />
                      <h3 className="font-semibold">Force Majeure</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      No refunds are provided if tours cannot be conducted due
                      to Force Majeure events beyond our control.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <h3 className="font-semibold">Currency</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Foreign currency refunds are processed in Indian Rupees at
                      prevailing buying rates on refund date.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Flight Refunds
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Domestic Flights
              </h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Cancellation Charges</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>
                        Every booking is subject to airline cancellation charges
                        which vary by flight and booking class
                      </li>
                      <li>
                        Faredown charges an additional service fee per passenger
                        per sector for cancellations
                      </li>
                      <li>
                        Some booked fares may be non-refundable per airline
                        policy
                      </li>
                      <li>
                        No refund for 'no-shows' or partially unused flights
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Convenience Charges</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Non-refundable convenience charges apply:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>One-way flights: ₹150 per passenger</li>
                      <li>Round-trip flights: ₹300 per passenger</li>
                      <li>These charges are deducted from any refund amount</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                International Flights
              </h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">
                      Additional Requirements
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>
                        All cancellations must be done at least 48 hours prior
                        to departure
                      </li>
                      <li>
                        Faredown service fee of ₹500 per passenger per sector
                        applies
                      </li>
                      <li>
                        Refund for partially utilized tickets may take 25-30
                        working days up to 6 months
                      </li>
                      <li>Name changes are not allowed after booking</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Hotel Refunds
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Cancellation Policy</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>
                        Hotel cancellation charges vary by property and booking
                        type
                      </li>
                      <li>
                        Free cancellation periods vary by hotel (typically 24-48
                        hours before check-in)
                      </li>
                      <li>
                        Peak season bookings may have stricter cancellation
                        policies
                      </li>
                      <li>No refund for no-shows or unused services</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Promotional Bookings</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>
                        Additional Faredown cancellation charge of 5% or ₹500
                        (whichever is minimum)
                      </li>
                      <li>
                        Hotel cancellation charges calculated on total price
                        before discount
                      </li>
                      <li>
                        Promotional discounts may be forfeited on cancellation
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Holiday Package Refunds
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Special Terms</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>
                        Refund quantum decided based on supplier policies and
                        participant numbers
                      </li>
                      <li>Company decision on refund amount is final</li>
                      <li>
                        No refund if client cannot utilize services due to
                        personal reasons
                      </li>
                      <li>
                        Services include hotels, sightseeing, rides, cruises,
                        meals, entrance fees
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                FDCash Terms
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">FDCash Refunds</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>
                        Customers may receive bonus FDCash for refunds based on
                        promotional offers
                      </li>
                      <li>One FDCash credit equals one Rupee</li>
                      <li>FDCash redeemable on any products on Faredown</li>
                      <li>Redemption on First In First Out basis</li>
                      <li>
                        Bonus FDCash redeemed only after regular FDCash is
                        exhausted
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Unutilized Bookings
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-yellow-700">
                  <strong>Important:</strong> Refund requests for unutilized or
                  'no show' bookings must be made within 90 days from:
                </p>
                <ul className="list-disc list-inside mt-2 text-yellow-700">
                  <li>Date of departure for air tickets</li>
                  <li>Date of check-in for hotel bookings</li>
                </ul>
                <p className="text-yellow-700 mt-2">
                  No refund will be payable for requests made after 90 days, and
                  all unclaimed amounts shall be deemed forfeited.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How to Request a Refund
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Contact Methods</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>Online cancellation through customer support page</li>
                      <li>Phone: Call our 24x7 customer care numbers</li>
                      <li>
                        Email: Send request with booking details (travel date
                        must be more than 48 hours)
                      </li>
                      <li>
                        It is mandatory to contact Faredown for all refunds
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Required Information</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>Booking reference number</li>
                      <li>Passenger/guest names</li>
                      <li>Reason for cancellation</li>
                      <li>
                        Valid documentation if cancelled directly with
                        airline/hotel
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Important Notes
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <ul className="list-disc list-inside space-y-2 text-red-700">
                  <li>
                    Faredown is a facilitation platform - refunds are subject to
                    airline/hotel policies
                  </li>
                  <li>
                    If an airline discontinues operations, Faredown cannot
                    process refunds not provided by the airline
                  </li>
                  <li>
                    Meal amounts are non-refundable except if flight is
                    cancelled by airline
                  </li>
                  <li>
                    Insurance amounts may be refundable based on third-party
                    provider terms
                  </li>
                  <li>
                    Web/Tele check-in passengers must contact airline directly
                    for cancellations
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                For any questions regarding refunds, please contact our support
                team at{" "}
                <Link
                  to="/support"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  support@faredown.com
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Faredown</h3>
              <p className="text-gray-400 text-sm">
                The world's first travel portal where you control the price.
                Bargain for better deals on flights and hotels.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-400 hover:text-white cursor-pointer">
                  About Us
                </div>
                <div className="text-gray-400 hover:text-white cursor-pointer">
                  How It Works
                </div>
                <div className="text-gray-400 hover:text-white cursor-pointer">
                  Contact
                </div>
                <div className="text-gray-400 hover:text-white cursor-pointer">
                  Help Center
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/flights"
                  className="text-gray-400 hover:text-white cursor-pointer block"
                >
                  Flights
                </Link>
                <Link
                  to="/hotels"
                  className="text-gray-400 hover:text-white cursor-pointer block"
                >
                  Hotels
                </Link>
                <div className="text-gray-400 hover:text-white cursor-pointer">
                  Car Rentals
                </div>
                <div className="text-gray-400 hover:text-white cursor-pointer">
                  Travel Insurance
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-white cursor-pointer block"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms-conditions"
                  className="text-gray-400 hover:text-white cursor-pointer block"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/cookie-policy"
                  className="text-gray-400 hover:text-white cursor-pointer block"
                >
                  Cookie Policy
                </Link>
                <Link
                  to="/refund-policy"
                  className="text-gray-400 hover:text-white cursor-pointer block"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Faredown.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
