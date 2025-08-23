import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function PrivacyPolicy() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#003580] text-white px-8 py-6 rounded-t-lg">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-blue-200 mt-2">
              Faredown Bookings and Travels Pvt Ltd
            </p>
          </div>

          <div className="px-8 py-6 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. General Principles
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Protecting your privacy is very important to us. We have
                  developed this Privacy Policy to protect your personal
                  information and keep it confidential.
                </p>
                <p>
                  This website is published and maintained by{" "}
                  <strong>Faredown Bookings and Travels Pvt Ltd</strong>{" "}
                  ("Faredown"). The Privacy Policy is applicable to the websites
                  of Faredown including www.faredown.com, which also comprises
                  of the mobile site, Smartphone App Platforms such as iOS,
                  Android, Windows (all together referred to as "Site").
                </p>
                <p>
                  This privacy policy does not apply to the websites of our
                  business partners, corporate affiliates or to any other third
                  parties, even if their websites are linked to the site. We
                  recommend you to review the respective privacy statements of
                  the other parties with whom you interact.
                </p>
                <p>
                  By browsing, visiting, accessing and/or using the services on
                  this Site (or searching for any of the pages on this Site),
                  the customer ("You") explicitly consents and agrees to our
                  Privacy Policy laid out herein. You also agree that the
                  information furnished by you is lawful, true and correct and
                  does not violate or infringe any laws. In case of any
                  violations, infringement, furnishing of wrongful or
                  unauthorized information, Faredown shall not be liable for the
                  same.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Information Categories
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  We categorise information about you (collectively referred to
                  as "Personal Information") as follows:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Profiling Information
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li>• Personal identity information</li>
                        <li>• Financial information</li>
                        <li>• Contact details</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Payment Information
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li>• Account history</li>
                        <li>• Billing information</li>
                        <li>• Payment history</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Service Usage
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li>• Navigation information</li>
                        <li>• Website URLs visited</li>
                        <li>• Download requests</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Log Information
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li>• Web requests</li>
                        <li>• IP address</li>
                        <li>• Browser information</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Right To Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accepting the Terms you agree that we may collect and store
                  your Personal Information as long as you subscribe to or use
                  our Services subject to the limitations set out in this
                  Privacy Policy.
                </p>
                <p>
                  We collect your Profiling and Account Information for the
                  following reasons:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    We need your identity details, contact details, banking
                    information and account history to manage our relationship
                    with you and provide Services to you.
                  </li>
                  <li>
                    We use certain of your information in an aggregated form to
                    compile statistical and demographical profiles for our
                    business and marketing activities.
                  </li>
                  <li>
                    To determine and verify the Service Charges payable by you
                    and to administer our relationship with you.
                  </li>
                  <li>
                    To comply with any statutory or regulatory requirement.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Cookies
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Some of our own websites use "cookies" so that we can provide
                  you with more customized information when you return to our
                  website. "Cookies" are used to store user preferences and to
                  track user trends, so as to enhance your interactive
                  experience and generally improve our Services to you.
                </p>
                <p>
                  You can set your browser to notify you when you are sent a
                  "cookie", giving you the chance to decide whether or not to
                  accept it. If you do accept a "cookie", you thereby agree to
                  our use of any Personal Information collected by us using that
                  Cookie.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. General Exceptions
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  In order to ensure that all our Users comply with the User
                  Rules, we may monitor your Personal Information to the extent
                  that this may be required to determine compliance and/or to
                  identify instances of non-compliance.
                </p>
                <p>
                  To ensure that the security and integrity of our Services are
                  safeguarded, we may monitor your Personal Information. This
                  monitoring may include (without limitation) the filtering of
                  incoming and outgoing electronic data messages to identify,
                  limit and/or prevent the transmission of spam, viruses and/or
                  unlawful, defamatory, obscene or otherwise undesirable
                  material or content.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700">
                  If you are no longer interested in receiving e-mail
                  announcements and other marketing information from us, or you
                  want us to remove any PII that we have collected about you,
                  please contact us at{" "}
                  <Link
                    to="/support"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    www.faredown.com/support
                  </Link>
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                For any questions regarding this Privacy Policy, please contact
                our support team.
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
