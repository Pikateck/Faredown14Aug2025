import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  BookOpen,
  Award,
  CreditCard,
  Settings,
  Heart,
  LogOut,
  MapPin,
  ChevronDown,
} from "lucide-react";

export default function BookingsTrips() {
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

              <DropdownMenu>
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
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Bookings & Trips
          </h1>
          <Link to="#" className="text-blue-600 hover:underline text-sm">
            Can't find a booking?
          </Link>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          {/* Globe Icon */}
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center relative overflow-hidden">
              {/* Globe continents */}
              <div className="absolute inset-0">
                <div className="w-16 h-8 bg-orange-600 rounded-full absolute top-6 left-8 opacity-80"></div>
                <div className="w-12 h-6 bg-orange-600 rounded-full absolute top-12 right-6 opacity-80"></div>
                <div className="w-10 h-10 bg-orange-600 rounded-full absolute bottom-8 left-6 opacity-80"></div>
              </div>
              {/* Airplane */}
              <div className="absolute top-4 right-4 transform rotate-45">
                <div className="w-8 h-2 bg-blue-600 rounded-full relative">
                  <div className="w-3 h-1 bg-blue-600 absolute -top-0.5 left-2"></div>
                  <div className="w-2 h-3 bg-blue-600 absolute -bottom-1 right-1"></div>
                </div>
              </div>
            </div>
            {/* Stand */}
            <div className="w-4 h-8 bg-blue-600 mx-auto mt-2"></div>
            <div className="w-12 h-2 bg-blue-800 rounded mx-auto"></div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Where to next?
          </h2>
          <p className="text-gray-600 mb-8">
            You haven't started any trip yet. Once you make a booking, it'll
            appear here.
          </p>

          {/* Filter Tabs */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant="outline"
              className="px-6 py-2 bg-blue-600 text-white border-blue-600"
            >
              Trips
            </Button>
            <Button variant="outline" className="px-6 py-2">
              Cancelled
            </Button>
          </div>

          {/* Past Trip Example */}
          <div className="max-w-sm mx-auto">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <img
                  src="/api/placeholder/60/40"
                  alt="Mumbai"
                  className="w-15 h-10 object-cover rounded"
                />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Mumbai</h3>
                  <p className="text-sm text-gray-600">
                    1 Oct 2017 - 16 Oct 2017
                  </p>
                  <p className="text-xs text-gray-500">1 room</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Mobile version</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:underline">
                    Faredown for iOS
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Faredown for Android
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Manage your bookings</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:underline">
                    Apartments
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Resorts
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Villas
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Hostels
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Customer Service Help</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:underline">
                    Coronavirus (COVID-19) FAQs
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Manage your trips
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Contact Customer Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Become an affiliate</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:underline">
                    Faredown.com for Business
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">About Faredown.com</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:underline">
                    About Faredown.com
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    How We Work
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Press Centre
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Investor Relations
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    Privacy & Cookie Statement
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-600 mt-8 pt-4 text-center">
            <p className="text-sm">
              Copyright © 2024 Faredown.com™. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
