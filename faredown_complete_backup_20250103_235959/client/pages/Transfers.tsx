import React from "react";
import { Header } from "@/components/Header";
import { TransfersSearchForm } from "@/components/TransfersSearchForm";
import {
  Shield,
  Clock,
  Star,
  Users,
  Globe,
  Headphones,
  ArrowRight,
  Car,
  MapPin,
  TrendingUp,
  DollarSign,
  Zap,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function Transfers() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile Search Section */}
      <div className="pb-8 pt-4" style={{ backgroundColor: "#003580" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Upgrade. Bargain. Book.
            </h1>
            <p className="text-blue-200 text-sm md:text-base">
              Ride in comfort for less — AI secures your best deal on every
              trip.
            </p>
          </div>
          <TransfersSearchForm />
        </div>
      </div>

      {/* Why Faredown Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Why book transfers with Faredown?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Reliable Service
                  </h4>
                  <p className="text-sm text-gray-600">
                    Professional drivers and well-maintained vehicles
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    On-Time Guarantee
                  </h4>
                  <p className="text-sm text-gray-600">
                    Flight monitoring and punctual pickup service
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Best Prices</h4>
                  <p className="text-sm text-gray-600">
                    Competitive rates with no hidden fees
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade & Add-ons Section */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Enhance Your Transfer Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <Car className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Premium Vehicles
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Upgrade to luxury cars with premium amenities
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                Learn more →
              </button>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <MapPin className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Multiple Stops
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Add extra stops to your journey
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                Learn more →
              </button>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Group Transfers
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Large vehicles for groups and families
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                Learn more →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Faredown Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why millions choose Faredown
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make travel simple and rewarding with unbeatable prices, 24/7
              support, and seamless booking experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Best Price Guarantee
              </h3>
              <p className="text-gray-600 text-sm">
                Find a lower price? We'll match it and give you an extra 10%
                off.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Secure Booking
              </h3>
              <p className="text-gray-600 text-sm">
                Your data is protected with bank-level security and encryption.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">
                Get help anytime, anywhere with our round-the-clock customer
                service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Instant Confirmation
              </h3>
              <p className="text-gray-600 text-sm">
                Get immediate booking confirmation and peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by millions worldwide
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50M+</div>
                <div className="text-gray-600 text-sm">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1M+</div>
                <div className="text-gray-600 text-sm">Transfer Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">200+</div>
                <div className="text-gray-600 text-sm">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600 text-sm">Customer Support</div>
              </div>
            </div>

            {/* Customer Support Section */}
            <div className="text-center mb-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Need help? We're here for you
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <Headphones className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      24/7 Phone Support
                    </div>
                    <div className="text-gray-600 text-sm">+1-800-FAREDOWN</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Live Chat</div>
                    <div className="text-gray-600 text-sm">
                      Available in 20+ languages
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Help Center</div>
                    <div className="text-gray-600 text-sm">
                      Self-service options
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 bg-[#003580] text-white">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Book on the go with our mobile app
          </h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Download the Faredown app for exclusive mobile deals, instant
            notifications, and seamless booking experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Exclusive Mobile Deals</h3>
              <p className="text-blue-200 text-sm">
                Get special discounts only available on mobile
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Instant Notifications</h3>
              <p className="text-blue-200 text-sm">
                Get real-time updates on your bookings
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Seamless Experience</h3>
              <p className="text-blue-200 text-sm">
                Book transfers in just a few taps
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Download on App Store
            </button>
            <button className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Get it on Google Play
            </button>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get exclusive deals and travel tips
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about special
            offers, new destinations, and travel insights.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Faredown</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted travel companion for seamless journeys worldwide.
              </p>
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/flights" className="hover:text-white">
                    Flights
                  </a>
                </li>
                <li>
                  <a href="/hotels" className="hover:text-white">
                    Hotels
                  </a>
                </li>
                <li>
                  <a href="/transfers" className="hover:text-white">
                    Transfers
                  </a>
                </li>
                <li>
                  <a href="/sightseeing" className="hover:text-white">
                    Sightseeing
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>
              &copy; 2024 Faredown. All rights reserved. | Made with ❤️ for
              travelers worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
