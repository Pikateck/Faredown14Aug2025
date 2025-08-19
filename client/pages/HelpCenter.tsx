import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Plane,
  CreditCard,
  Luggage,
  User,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Shield,
  BookOpen,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Settings,
} from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  const helpCategories = [
    {
      icon: Plane,
      title: "Flight reservations and confirmations",
      description: "Booking, changes, cancellations, and confirmations",
      color: "bg-blue-500",
      items: [
        "How to book a flight",
        "Change or cancel booking",
        "Flight confirmations",
        "Seat selection",
      ],
    },
    {
      icon: CreditCard,
      title: "Payment methods and charges",
      description: "Payment options, refunds, and billing inquiries",
      color: "bg-green-500",
      items: [
        "Payment methods",
        "Refund process",
        "Additional charges",
        "Billing issues",
      ],
    },
    {
      icon: Luggage,
      title: "Baggage and seats",
      description: "Baggage allowance, extra bags, and seat upgrades",
      color: "bg-purple-500",
      items: [
        "Baggage allowance",
        "Extra baggage",
        "Seat upgrades",
        "Special assistance",
      ],
    },
    {
      icon: User,
      title: "Passenger and flight details",
      description:
        "Passenger information, flight changes, and special requests",
      color: "bg-orange-500",
      items: [
        "Passenger details",
        "Flight information",
        "Special requests",
        "Travel documents",
      ],
    },
    {
      icon: MapPin,
      title: "Check-in information",
      description: "Online check-in, boarding passes, and airport procedures",
      color: "bg-red-500",
      items: [
        "Online check-in",
        "Boarding passes",
        "Airport check-in",
        "Security procedures",
      ],
    },
    {
      icon: HelpCircle,
      title: "General support",
      description: "FAQs, contact information, and general inquiries",
      color: "bg-gray-500",
      items: [
        "Frequently asked questions",
        "Contact support",
        "Travel tips",
        "Terms & conditions",
      ],
    },
  ];

  const quickActions = [
    {
      title: "How do I get my flight confirmation?",
      description: "Find your booking confirmation email and e-tickets",
    },
    {
      title: "I have a spelling mistake on a passenger name",
      description: "Learn how to correct passenger name errors",
    },
    {
      title: "My child will be flying alone",
      description: "Information about unaccompanied minor services",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-[#003580] to-[#0071c2] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            What can we help you with?
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Search our help center or manage your booking below
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search our help center..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg rounded-full border-0 bg-white shadow-lg"
              />
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm hover:bg-white/30 transition-all duration-200"
              >
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}
                    >
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description}
                      </p>
                      <div className="space-y-1">
                        {category.items.slice(0, 2).map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            • {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Manage Booking Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Manage your booking
              </h2>
              <p className="text-gray-600 mb-6">
                If you have an existing booking with us please enter your
                booking details below to get tailored advice
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking reference
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter booking reference"
                    value={bookingReference}
                    onChange={(e) => setBookingReference(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button className="w-full bg-[#003580] hover:bg-[#0071c2] text-white py-3 text-lg font-semibold">
                  Login
                </Button>

                <div className="text-center pt-4">
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Don't have an account? Create one here
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="bg-gradient-to-br from-[#003580] to-[#0071c2] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">
                Benefits of manage my booking
              </h3>

              <div className="space-y-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-medium">Download your e-tickets</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    Access and download your booking confirmation and e-tickets
                    for your trip
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-medium">Select your seat</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    Choose the best seat on the plane for your booking your seat
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-medium">Add extras & upgrades</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    Enhance your journey with extra baggage, meals, and seat
                    upgrades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still looking for help?
            </h2>
            <p className="text-gray-600 text-lg">
              Our support team is here to assist you 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Live Chat */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chat with our support team in real-time
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">Online now</span>
                </div>
              </CardContent>
            </Card>

            {/* Phone Support */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  +44 1543 234258
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Speak directly with our support team
                </p>
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">24/7 Available</span>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chat with our team on WhatsApp
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">Available</span>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Email Support
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send us an email for detailed support
                </p>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">24hr response</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How do I change my flight booking?",
                answer:
                  "You can change your flight booking through our Manage Booking section or by contacting our support team.",
              },
              {
                question: "What is the baggage allowance for my flight?",
                answer:
                  "Baggage allowance varies by airline and ticket type. Check your booking confirmation for specific details.",
              },
              {
                question: "How do I check in for my flight?",
                answer:
                  "You can check in online 24 hours before departure through our website or the airline's website.",
              },
              {
                question: "Can I get a refund for my booking?",
                answer:
                  "Refund eligibility depends on your ticket type and cancellation timing. Contact our support for specific details.",
              },
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Faredown</h3>
              <p className="text-gray-400 text-sm">
                Your trusted travel partner for smart bookings and great deals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/help"
                  className="text-gray-400 hover:text-white block"
                >
                  Help Center
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white block"
                >
                  Contact Us
                </Link>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-white block"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/flights"
                  className="text-gray-400 hover:text-white block"
                >
                  Flights
                </Link>
                <Link
                  to="/hotels"
                  className="text-gray-400 hover:text-white block"
                >
                  Hotels
                </Link>
                <Link
                  to="/manage"
                  className="text-gray-400 hover:text-white block"
                >
                  Manage Booking
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white block"
                >
                  About Us
                </Link>
                <Link
                  to="/careers"
                  className="text-gray-400 hover:text-white block"
                >
                  Careers
                </Link>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white block"
                >
                  Privacy Policy
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
