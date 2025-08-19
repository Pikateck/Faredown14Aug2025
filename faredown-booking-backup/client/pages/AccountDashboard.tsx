import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  ChevronDown,
  MapPin,
  CreditCard,
  Settings,
  BookOpen,
  Heart,
  LogOut,
  Award,
  Calendar,
  Percent,
  Car,
  Home,
  Gift,
} from "lucide-react";

export default function AccountDashboard() {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              faredown.com
            </Link>

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
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem>₹ INR - Indian Rupee</DropdownMenuItem>
                  <DropdownMenuItem>$ USD - US Dollar</DropdownMenuItem>
                  <DropdownMenuItem>€ EUR - Euro</DropdownMenuItem>
                  <DropdownMenuItem>£ GBP - British Pound</DropdownMenuItem>
                  <DropdownMenuItem>¥ JPY - Japanese Yen</DropdownMenuItem>
                  <DropdownMenuItem>C$ CAD - Canadian Dollar</DropdownMenuItem>
                  <DropdownMenuItem>
                    A$ AUD - Australian Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>CHF - Swiss Franc</DropdownMenuItem>
                  <DropdownMenuItem>¥ CNY - Chinese Yuan</DropdownMenuItem>
                  <DropdownMenuItem>kr SEK - Swedish Krona</DropdownMenuItem>
                  <DropdownMenuItem>kr NOK - Norwegian Krone</DropdownMenuItem>
                  <DropdownMenuItem>kr DKK - Danish Krone</DropdownMenuItem>
                  <DropdownMenuItem>₩ KRW - South Korean Won</DropdownMenuItem>
                  <DropdownMenuItem>S$ SGD - Singapore Dollar</DropdownMenuItem>
                  <DropdownMenuItem>
                    HK$ HKD - Hong Kong Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    NZ$ NZD - New Zealand Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>₽ RUB - Russian Ruble</DropdownMenuItem>
                  <DropdownMenuItem>
                    R ZAR - South African Rand
                  </DropdownMenuItem>
                  <DropdownMenuItem>₺ TRY - Turkish Lira</DropdownMenuItem>
                  <DropdownMenuItem>R$ BRL - Brazilian Real</DropdownMenuItem>
                  <DropdownMenuItem>Mex$ MXN - Mexican Peso</DropdownMenuItem>
                  <DropdownMenuItem>₪ ILS - Israeli Shekel</DropdownMenuItem>
                  <DropdownMenuItem>₦ NGN - Nigerian Naira</DropdownMenuItem>
                  <DropdownMenuItem>EGP - Egyptian Pound</DropdownMenuItem>
                  <DropdownMenuItem>₨ PKR - Pakistani Rupee</DropdownMenuItem>
                  <DropdownMenuItem>৳ BDT - Bangladeshi Taka</DropdownMenuItem>
                  <DropdownMenuItem>₨ LKR - Sri Lankan Rupee</DropdownMenuItem>
                  <DropdownMenuItem>
                    Rp IDR - Indonesian Rupiah
                  </DropdownMenuItem>
                  <DropdownMenuItem>₱ PHP - Philippine Peso</DropdownMenuItem>
                  <DropdownMenuItem>₫ VND - Vietnamese Dong</DropdownMenuItem>
                  <DropdownMenuItem>฿ THB - Thai Baht</DropdownMenuItem>
                  <DropdownMenuItem>
                    RM MYR - Malaysian Ringgit
                  </DropdownMenuItem>
                  <DropdownMenuItem>AED - UAE Dirham</DropdownMenuItem>
                  <DropdownMenuItem>SAR - Saudi Riyal</DropdownMenuItem>
                  <DropdownMenuItem>QAR - Qatari Riyal</DropdownMenuItem>
                  <DropdownMenuItem>KWD - Kuwaiti Dinar</DropdownMenuItem>
                  <DropdownMenuItem>BHD - Bahraini Dinar</DropdownMenuItem>
                  <DropdownMenuItem>OMR - Omani Rial</DropdownMenuItem>
                  <DropdownMenuItem>zł PLN - Polish Zloty</DropdownMenuItem>
                  <DropdownMenuItem>Kč CZK - Czech Koruna</DropdownMenuItem>
                  <DropdownMenuItem>Ft HUF - Hungarian Forint</DropdownMenuItem>
                  <DropdownMenuItem>RON - Romanian Leu</DropdownMenuItem>
                  <DropdownMenuItem>BGN - Bulgarian Lev</DropdownMenuItem>
                  <DropdownMenuItem>kn HRK - Croatian Kuna</DropdownMenuItem>
                  <DropdownMenuItem>₴ UAH - Ukrainian Hryvnia</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-sm">?</span>

              <DropdownMenu
                open={showAccountMenu}
                onOpenChange={setShowAccountMenu}
              >
                <DropdownMenuTrigger className="flex items-center space-x-2 bg-blue-600 rounded-full px-3 py-2 hover:bg-blue-800">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">Z</span>
                  </div>
                  <span className="text-sm">Zubin A</span>
                  <span className="text-xs text-yellow-300">
                    Loyalty Level 1
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <User className="w-4 h-4 mr-2" />
                      My account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/trips">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Bookings & Trips
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <Award className="w-4 h-4 mr-2" />
                      Loyalty program
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Rewards & Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <Settings className="w-4 h-4 mr-2" />
                      Reviews
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <Heart className="w-4 h-4 mr-2" />
                      Saved
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="bg-blue-700 text-white rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-black">Z</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Hi, Zubin</h1>
                  <p className="text-blue-200">Loyalty Level 1</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  You have 5 Loyalty rewards
                </h2>
                <p className="text-blue-200 text-sm">
                  Enjoy rewards and discounts plus instant travel benefits
                </p>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Level 2
                  </Badge>
                  <p className="text-xs mt-1">10% off stays</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs">VIP discounts on selected cars</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs">Flight price alerts</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs">10-20% off stays</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs">Free upgrade on rental cars</p>
                </div>
              </div>

              <div className="mt-6">
                <Link to="#" className="text-blue-200 hover:underline text-sm">
                  Learn more about your rewards
                </Link>
              </div>
            </div>

            {/* Complete Profile */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Complete your profile</h3>
                <span className="text-blue-600 text-2xl">?</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Complete your profile and use this information for your next
                booking
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Complete now
              </Button>
              <span className="text-blue-600 hover:underline cursor-pointer ml-4 text-sm">
                Not now
              </span>
            </div>

            {/* Account Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <h4 className="font-semibold mb-4">Payment info</h4>
                <div className="space-y-3">
                  <Link
                    to="/account/payment"
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Rewards & Wallet</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                  </Link>
                  <Link
                    to="/account/payment"
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Payment methods</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Manage account</h4>
                <div className="space-y-3">
                  <Link
                    to="/account/personal"
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Personal details</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                  </Link>
                  <Link
                    to="/account/security"
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Security settings</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                  </Link>
                  <Link
                    to="/account/travelers"
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Other travelers</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Preferences</h4>
                <div className="space-y-3">
                  <Link
                    to="/account/preferences"
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Customization preferences</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                  </Link>
                  <Link
                    to="/account/email"
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Email preferences</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Bookings Away */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">5</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">
                    You're 5 bookings away
                  </h4>
                  <p className="text-sm text-blue-700">from Loyalty Level 2</p>
                </div>
              </div>
              <Link to="#" className="text-blue-600 hover:underline text-sm">
                Check your progress
              </Link>
            </div>

            {/* No Credits */}
            <div className="border rounded-lg p-4 text-center">
              <h4 className="font-semibold mb-2">No Credits or vouchers yet</h4>
              <span className="text-blue-600 text-2xl">💳</span>
            </div>

            {/* Travel Activity */}
            <div>
              <h4 className="font-semibold mb-4">Travel activity</h4>
              <div className="space-y-3">
                <Link
                  to="/account/trips"
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">Trips and bookings</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                </Link>
                <Link
                  to="/account/saved"
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">Saved lists</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                </Link>
                <Link
                  to="/account/reviews"
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">My reviews</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="bg-white border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <Link to="#" className="hover:underline">
              Contact Customer Service
            </Link>
            <Link to="#" className="hover:underline">
              Privacy & cookies
            </Link>
            <Link to="#" className="hover:underline">
              Modern Slavery Statement
            </Link>
            <Link to="#" className="hover:underline">
              Human Rights Statement
            </Link>
            <Link to="#" className="hover:underline">
              Terms & conditions
            </Link>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            Copyright © 2024 Faredown.com™. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
