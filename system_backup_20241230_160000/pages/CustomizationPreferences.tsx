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
  Shield,
  Users,
  Bell,
  Lock,
  ChevronDown,
} from "lucide-react";

export default function CustomizationPreferences() {
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
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    My account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Bookings & Trips
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Award className="w-4 h-4 mr-2" />
                    Loyalty program
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Rewards & Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="w-4 h-4 mr-2" />
                    Saved
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

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600">
        <Link to="/account" className="hover:underline">
          My account
        </Link>
        <span className="mx-2">&gt;</span>
        <span>Customization preferences</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            <Link
              to="/account/personal"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>Personal details</span>
            </Link>
            <Link
              to="/account/security"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Shield className="w-5 h-5 text-gray-600" />
              <span>Security settings</span>
            </Link>
            <Link
              to="/account/travelers"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span>Other travelers</span>
            </Link>
            <Link
              to="/account/preferences"
              className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Customization preferences</span>
            </Link>
            <Link
              to="/account/payment"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span>Payment methods</span>
            </Link>
            <Link
              to="/account/privacy"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Lock className="w-5 h-5 text-gray-600" />
              <span>Privacy and data management</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Customization preferences
              </h1>
              <p className="text-gray-600">
                Personalize your account to meet your needs.
              </p>
            </div>

            <div className="space-y-8">
              {/* Currency */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Currency
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">₹. Indian rupee</span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Language
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                        🇬🇧
                      </span>
                      <span className="text-gray-900">English</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <Link to="#" className="hover:underline">
              About Faredown.com
            </Link>
            <Link to="#" className="hover:underline">
              Terms & conditions
            </Link>
            <Link to="#" className="hover:underline">
              How We Work
            </Link>
            <Link to="#" className="hover:underline">
              Privacy & Cookie Statement
            </Link>
            <Link to="#" className="hover:underline">
              Help Center
            </Link>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            Copyright © 2024 Faredown.com™. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
