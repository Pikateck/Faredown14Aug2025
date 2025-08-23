import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Shield,
  Users,
  Bell,
  Lock,
  ChevronDown,
} from "lucide-react";

export default function PersonalDetails() {
  const [displayName, setDisplayName] = useState("Display name *");

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
        <span>Personal details</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Sidebar */}
          <div className="space-y-2 lg:order-1 order-2">
            <Link
              to="/account/personal"
              className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Personal details</span>
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
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span>Customization preferences</span>
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
          <div className="lg:col-span-3 lg:order-2 order-1">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Personal details
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Update your info and find out how it's used.
                </p>
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-lg md:text-2xl font-bold text-black">
                  Z
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {/* Name */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Name
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">Zubin A</span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Display name
                  </label>
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name *"
                  />
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email address
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">zubin@gmail.com</span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Verified
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    This is the email address you use to sign in. It's also
                    where we send your booking confirmations.
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Phone number
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">🇮🇳 +91 98048 13331</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Properties or attractions you book will use this number if
                    they need to contact you.
                  </p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Date of birth
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">05/04/1978</span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Nationality */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Nationality
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">India</span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Gender
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">I'm a man</span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">India</span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Passport Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Passport details
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Not provided</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600"
                    >
                      Add passport
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
