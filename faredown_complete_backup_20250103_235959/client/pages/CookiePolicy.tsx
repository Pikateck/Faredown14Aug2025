import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Settings, Shield, BarChart3, Target } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function CookiePolicy() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#003580] text-white px-8 py-6 rounded-t-lg">
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
            <p className="text-blue-200 mt-2">
              Faredown Bookings and Travels Pvt Ltd
            </p>
          </div>

          <div className="px-8 py-6 space-y-8">
            <section>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  This Cookie Policy explains how{" "}
                  <strong>Faredown Bookings and Travels Pvt Ltd</strong> ("we",
                  "us", or "our") uses cookies and similar technologies when you
                  visit our website www.faredown.com (the "Service"). It
                  explains what these technologies are and why we use them, as
                  well as your rights to control our use of them.
                </p>
                <p>
                  By continuing to use our website, you consent to our use of
                  cookies as described in this Cookie Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Are Cookies?
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Cookies are small text files that are stored on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and to provide
                  information to website owners.
                </p>
                <p>
                  Cookies allow us to recognize your device and store some
                  information about your preferences or past actions to enhance
                  your experience on our website.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Types of Cookies We Use
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Settings className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold">Essential Cookies</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies are necessary for the website to function
                      and cannot be switched off in our systems.
                    </p>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Login and authentication</li>
                      <li>• Shopping cart functionality</li>
                      <li>• Security features</li>
                      <li>• Load balancing</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Analytics Cookies</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies help us understand how visitors interact
                      with our website.
                    </p>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Google Analytics</li>
                      <li>• Page visit tracking</li>
                      <li>• User behavior analysis</li>
                      <li>• Performance monitoring</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Target className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold">Marketing Cookies</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies track your online activity to help
                      advertisers deliver more relevant advertising.
                    </p>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Targeted advertising</li>
                      <li>• Social media integration</li>
                      <li>• Retargeting campaigns</li>
                      <li>• Third-party advertising</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Shield className="w-5 h-5 text-orange-600 mr-2" />
                      <h3 className="font-semibold">Functional Cookies</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies enable enhanced functionality and
                      personalization.
                    </p>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Language preferences</li>
                      <li>• Currency selection</li>
                      <li>• Personalized content</li>
                      <li>• User preferences</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why We Use Cookies
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies for several important reasons:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Functionality:</strong> To make our website work
                    properly and provide essential features
                  </li>
                  <li>
                    <strong>User Experience:</strong> To remember your
                    preferences and provide personalized content
                  </li>
                  <li>
                    <strong>Analytics:</strong> To understand how our website is
                    used and improve our services
                  </li>
                  <li>
                    <strong>Security:</strong> To protect against fraud and
                    ensure secure transactions
                  </li>
                  <li>
                    <strong>Marketing:</strong> To show you relevant
                    advertisements and measure their effectiveness
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Cookies
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We also use cookies from third-party service providers to help
                  us deliver our services:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Third-Party Services:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <strong>Google Analytics:</strong> For website analytics
                      and performance monitoring
                    </li>
                    <li>
                      <strong>Google Ads:</strong> For advertising and
                      remarketing campaigns
                    </li>
                    <li>
                      <strong>Facebook Pixel:</strong> For social media
                      advertising and analytics
                    </li>
                    <li>
                      <strong>Payment Processors:</strong> For secure payment
                      processing
                    </li>
                    <li>
                      <strong>Customer Support:</strong> For live chat and
                      support services
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How to Control Cookies
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  You have several options to control or limit how we and our
                  partners use cookies:
                </p>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Browser Settings</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Most web browsers allow you to control cookies through
                      their settings:
                    </p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Block all cookies</li>
                      <li>• Block third-party cookies</li>
                      <li>• Delete cookies when you close your browser</li>
                      <li>• Receive notifications when cookies are set</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">
                      Cookie Consent Management
                    </h4>
                    <p className="text-sm text-gray-600">
                      You can manage your cookie preferences through our cookie
                      consent banner that appears when you first visit our
                      website.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Opt-Out Links</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>You can opt out of specific services:</p>
                      <ul className="space-y-1">
                        <li>
                          •{" "}
                          <a
                            href="https://tools.google.com/dlpage/gaoptout"
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Google Analytics Opt-out
                          </a>
                        </li>
                        <li>
                          •{" "}
                          <a
                            href="https://www.google.com/settings/ads"
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Google Ads Settings
                          </a>
                        </li>
                        <li>
                          •{" "}
                          <a
                            href="https://www.facebook.com/help/568137493302217"
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Facebook Ad Preferences
                          </a>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Impact of Disabling Cookies
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-yellow-700">
                  <strong>Please note:</strong> If you disable cookies, some
                  features of our website may not work properly. This may
                  include:
                </p>
                <ul className="list-disc list-inside mt-2 text-yellow-700 text-sm">
                  <li>Difficulty logging into your account</li>
                  <li>Loss of personalized settings</li>
                  <li>Inability to complete bookings</li>
                  <li>Reduced website functionality</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Retention
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Different types of cookies are stored for different periods:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Session Cookies:</strong> Deleted when you close
                    your browser
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Stored for a specific
                    period (usually 1-2 years)
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Typically stored for 24
                    months
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Usually stored for 12-24
                    months
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Updates to This Policy
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this Cookie Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons. We will notify you of any material changes
                  by posting the updated policy on our website.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have any questions about our use of cookies or this
                  Cookie Policy, please contact us:
                </p>
                <div className="text-gray-700 space-y-2">
                  <p>
                    <strong>Email:</strong> privacy@faredown.com
                  </p>
                  <p>
                    <strong>Address:</strong> Faredown Bookings and Travels Pvt
                    Ltd
                  </p>
                  <p>
                    <strong>Support:</strong>{" "}
                    <Link
                      to="/support"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Visit our Help Center
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This Cookie Policy is part of our{" "}
                <Link
                  to="/privacy-policy"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Privacy Policy
                </Link>
                .
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
