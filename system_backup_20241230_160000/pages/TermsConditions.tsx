import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function TermsConditions() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#003580] text-white px-8 py-6 rounded-t-lg">
            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
            <p className="text-blue-200 mt-2">
              Faredown Bookings and Travels Pvt Ltd
            </p>
          </div>

          <div className="px-8 py-6 space-y-8">
            <section>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  The website www.faredown.com (the "Site") is published and
                  maintained by{" "}
                  <strong>Faredown Bookings and Travels Pvt Ltd</strong>{" "}
                  ("Company"), a company incorporated and existing in accordance
                  with the laws of India. When you access, browse or use this
                  Site, you accept, without limitation or qualification, the
                  terms and conditions set forth herein.
                </p>
                <p>
                  These Terms and Conditions of use and any additional terms
                  posted on this Site together constitute the entire agreement
                  between Company and you with respect to your use of this Site.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Site And Its Contents
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    This Site is only for your personal use. You shall not
                    distribute exchange, modify, sell or transmit anything you
                    copy from this Site, including but not limited to any text,
                    images, audio and video, for any business, commercial or
                    public purpose.
                  </li>
                  <li>
                    As long as you comply with the terms of these Terms and
                    Conditions of Use, Company grants you a non-exclusive,
                    non-transferable, limited right to enter, view and use this
                    Site.
                  </li>
                  <li>
                    Access to certain areas of the Site may only be available to
                    registered members.
                  </li>
                  <li>
                    This site is for consumer use only. Any travel agent/tour
                    operator/consolidator/aggregator should not use this site
                    for individual/group bookings.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ownership
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  All materials on this Site, including but not limited to
                  audio, images, software, text, icons and such like (the
                  "Content"), are protected by copyright under international
                  conventions and copyright laws. You cannot use the Content for
                  any purpose, except as specified herein.
                </p>
                <p>
                  There are a number of proprietary logos, service marks and
                  trademarks found on this Site whether owned/used by Company or
                  any other third party. By displaying them on this Site,
                  Company is not granting you any license to utilize those
                  proprietary logos, service marks, or trademarks.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Disclaimer
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The materials on this Site are provided on an "As Is" basis,
                  without warranties of any kind either expressed or implied. To
                  the fullest extent permissible pursuant to applicable law,
                  Company disclaims all warranties of merchantability and
                  fitness for a particular purpose.
                </p>
                <p>
                  Company does not warrant that the functions contained in this
                  Site will be uninterrupted or error free, that defects will be
                  corrected, or that this Site or the servers that make it
                  available are free of viruses or other harmful components.
                </p>
                <p>
                  You acknowledge that through this Site, Company merely
                  provides intermediary services in order to facilitate booking
                  of tickets and hotel services to you. Company is not the
                  last-mile service provider to you and therefore, Company shall
                  not be or deemed to be responsible for any lack or deficiency
                  of services provided by any person.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Flight Booking Terms
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Domestic Flight Booking
              </h3>
              <div className="space-y-4 text-gray-700">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">General Terms</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>
                        The total price displayed includes all applicable
                        government taxes
                      </li>
                      <li>
                        You are required to pay the entire amount prior to
                        confirmation
                      </li>
                      <li>
                        There will be no refund for 'no-shows' or partially
                        unused flights
                      </li>
                      <li>
                        Infants must be under 24 months throughout the entire
                        itinerary
                      </li>
                      <li>
                        Faredown charges a non-refundable convenience charge per
                        passenger
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">
                      Check-in Requirements
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>
                        Standard check-in time begins 2 hours before departure
                        for domestic flights
                      </li>
                      <li>
                        For International flights, check-in time is 3 hours
                        before departure
                      </li>
                      <li>
                        Passengers must check-in at least 2 hrs prior departure
                        for Air India flights
                      </li>
                      <li>Infants must have valid proof-of-age documents</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">
                      Amendments & Cancellations
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>
                        Amendment charges vary by flight and booking class
                      </li>
                      <li>
                        Faredown charges an amendment handling fee per passenger
                        per sector
                      </li>
                      <li>
                        Some booked fares may be non-refundable per airline
                        policy
                      </li>
                      <li>
                        Online cancellations available through customer support
                      </li>
                      <li>
                        Cancellation requests less than 4 hours before departure
                        require airline contact
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-8">
                International Flight Booking
              </h3>
              <div className="space-y-4 text-gray-700">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">
                      Additional Requirements
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>
                        Name must be exactly as per passport - no changes
                        allowed after booking
                      </li>
                      <li>
                        Ensure relevant visa, transit visa, and immigration
                        clearance
                      </li>
                      <li>Passport validity of at least 6 months required</li>
                      <li>Check-in required 3 hours prior to departure</li>
                      <li>
                        All amendments should be done at least 48 hours prior to
                        departure
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Holiday Booking Terms
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Apart from the general terms and conditions, the below
                  mentioned are the specific holiday booking terms:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Pictures of holiday packages shown on the Site are
                    indicative and may not be representative of actual products
                  </li>
                  <li>
                    Rates/prices shown are quotations only and no blocking has
                    been made
                  </li>
                  <li>
                    Booking is subject to availability and confirmation from the
                    supplier
                  </li>
                  <li>
                    We act only as an intermediary agent with the role of a
                    mediator
                  </li>
                  <li>The contract will be between the supplier and you</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Promotion Codes
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Faredown generates promotion codes from time to time which may
                  be availed on the Site as a discount coupon:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Promotional offers can be availed only if correct details
                    are filled at booking time
                  </li>
                  <li>Only one promotional offer can be availed at a time</li>
                  <li>
                    Promotional discounts are applied only on the base amount
                    for Hotels
                  </li>
                  <li>
                    On cancellation, hotel charges are calculated on total price
                    before discount
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Disputes
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If any dispute arises between you and Company during your use
                  of the Site or thereafter, the dispute shall be referred to
                  arbitration. The place of arbitration shall be Delhi. The
                  arbitration proceedings shall be in the English language.
                </p>
                <p>
                  These terms and conditions are governed by and shall be
                  construed in accordance with the laws of the Republic of India
                  and any dispute shall exclusively be subject to the
                  jurisdiction of the appropriate Courts situated at Mumbai,
                  India.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                General Provisions
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Company may add to, modify or remove any part of these Terms
                  and Conditions of Use at any time as it may deem fit, without
                  notice. Any changes apply as soon as they are posted.
                </p>
                <p>
                  Company reserves the right to undertake all necessary steps to
                  ensure that the security, safety and integrity of Company's
                  systems as well as its clients and users interests are
                  well-protected.
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                For any questions regarding these Terms & Conditions, please
                contact our support team.
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
